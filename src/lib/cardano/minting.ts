import { Transaction, MeshWallet, BlockfrostProvider } from '@meshsdk/core';
import { uploadJSONToIPFS } from '../ipfs';
import { Resend } from 'resend';

export interface ContributionManifest {
  title: string;
  contentHash: string; // IPFS URI of the raw document
  communityId: string;
  communityName?: string;
  contributors: {
    userId: string;
    name: string;
    role: string;
    weight: number;
    signature: string;
    walletAddress: string;
  }[];
  timestamp: number;
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendTreasuryLowAlert(balance: number) {
  try {
    const toEmail = process.env.RESEND_TO_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_MAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    if (!resend || !toEmail || !fromEmail) {
      console.warn('RESEND environment not fully configured, skipping email.');
      return;
    }      

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `[WARNING] Mosaic App Treasury Balance Low`,
      html: `
        <h1>Mosaic App Treasury Wallet Alert</h1>
        <p>The app treasury wallet balance is currently low: <strong>${balance.toFixed(2)} ADA</strong>.</p>
        <p>Please top up the wallet as soon as possible to ensure document publishing and badge claiming continue to function correctly.</p>
      `,
    });
    console.log(`Low balance alert email sent. Balance: ${balance.toFixed(2)} ADA`);
  } catch (error) {
    console.error('Failed to send treasury balance alert email:', error);
  }
}

export async function getAppWalletBalance(): Promise<number> {
  const mnemonic = process.env.APP_WALLET_MNEMONIC;
  const blockfrostApiKey = process.env.BLOCKFROST_PROJECT_ID;
  if (!mnemonic || !blockfrostApiKey) {
    console.warn('APP_WALLET_MNEMONIC or BLOCKFROST_PROJECT_ID not set.');
    return 0;
  }
  const isLive = process.env.NEXT_PUBLIC_IS_LIVE === 'true';
  const expectedNetworkId = isLive ? 1 : 0;
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
  const lovelace = await wallet.getLovelace();
  return parseFloat(lovelace) / 1000000;
}

/**
 * Anchors the contribution manifest to the Cardano blockchain via a metadata transaction.
 * Returns the transaction hash.
 */
export async function anchorContributionManifest(
  manifest: ContributionManifest
): Promise<{ txHash: string; manifestUri: string }> {
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

  // Pre-transaction treasury balance check
  try {
    const lovelace = await wallet.getLovelace();
    const balanceAda = parseFloat(lovelace) / 1000000;
    
    if (balanceAda < 1.5) {
      throw new Error(`Insufficient treasury wallet balance: ${balanceAda.toFixed(2)} ADA. Minimum required is 1.5 ADA.`);
    }

    if (balanceAda < 10) {
      // Send Resend email alert asynchronously
      sendTreasuryLowAlert(balanceAda).catch(err => console.error("Failed to send treasury alert:", err));
    }
  } catch (error) {
    console.error('Pre-transaction balance check failed:', error);
    throw error;
  }

  // 1. Upload the manifest JSON to IPFS first to get a permanent CID for the metadata
  const manifestIpfsUri = await uploadJSONToIPFS(manifest as unknown as Record<string, unknown>, `${manifest.title} - Manifest`);

  try {
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
      communityId: splitString(manifest.communityId),
      communityName: manifest.communityName ? splitString(manifest.communityName) : undefined
    });

    const unsignedTx = await tx.build();
    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return { txHash, manifestUri: manifestIpfsUri };
  } catch (error) {
    console.error('Failed to anchor to Cardano:', error);
    throw new Error("Failed to anchor contribution to Cardano!")
  }
}
