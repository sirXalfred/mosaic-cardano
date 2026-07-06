import { Transaction, MeshWallet, BlockfrostProvider } from '@meshsdk/core';
import { uploadJSONToIPFS } from '../ipfs';

export interface ContributionManifest {
  title: string;
  contentHash: string; // IPFS URI of the raw document
  communityId: string;
  contributors: {
    userId: string;
    name: string;
    role: string;
    weight: number;
    signature: string;
  }[];
  timestamp: number;
}

/**
 * Anchors the contribution manifest to the Cardano blockchain via a metadata transaction.
 * Returns the transaction hash.
 */
export async function anchorContributionManifest(
  manifest: ContributionManifest
): Promise<string> {
  // 1. Upload the manifest JSON to IPFS first to get a permanent CID for the metadata
  const manifestIpfsUri = await uploadJSONToIPFS(manifest as unknown as Record<string, unknown>, `${manifest.title} - Manifest`);

  // 2. We use MeshWallet since this is a backend-driven minting process (or we could use BrowserWallet on frontend)
  // For this architecture, since we don't have the user's keys on the backend, 
  // normally the user's browser wallet would sign the tx.
  // But for the "Village Treasury" or "App Wallet" anchoring:
  const mnemonic = process.env.APP_WALLET_MNEMONIC;
  if (!mnemonic) {
    console.warn('APP_WALLET_MNEMONIC is not set.');
    throw new Error("APP_WALLET_MNEMONIC env variable not set!")
  }

  const blockfrostApiKey = process.env.BLOCKFROST_PROJECT_ID;
  if (!blockfrostApiKey) {
    console.warn('BLOCKFROST_PROJECT_ID is not set.');
    throw new Error("BLOCKFROST_PROJECT_ID env variable not set!");
  }

  const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true';
  const expectedNetworkId = isLive ? 1 : 0;

  try {
    const provider = new BlockfrostProvider(blockfrostApiKey);

    const wallet = new MeshWallet({
      networkId: expectedNetworkId,
      fetcher: provider,
      submitter: provider,
      key: {
        type: 'mnemonic',
        words: mnemonic.split(' '),
      },
    });

    const tx = new Transaction({ initiator: wallet });

    const splitString = (str: string) => {
      if (!str) return str;
      if (str.length <= 64) return str;
      return str.match(/.{1,64}/g) || [];
    };

    // We attach the manifest CID as transaction metadata (label 721 or custom)
    // Using a custom label 2026 for Mosaic Contributions
    tx.setMetadata(2026, {
      type: 'MosaicContribution',
      manifestUri: splitString(manifestIpfsUri),
      title: splitString(manifest.title),
      communityId: splitString(manifest.communityId)
    });

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return txHash;
  } catch (error) {
    console.error('Failed to anchor to Cardano:', error);
    throw new Error("Failed to anchor contribution to Cardano!")
  }
}
