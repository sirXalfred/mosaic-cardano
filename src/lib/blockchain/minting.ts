import { MeshWallet, BlockfrostProvider, ForgeScript, stringToHex, CIP68_100, CIP68_222, metadataToCip68, Transaction, resolveScriptHash } from '@meshsdk/core';

// This is the App Wallet that will hold the Reference Tokens and have minting authority.
export const getAppWallet = () => {
    const provider = new BlockfrostProvider(process.env.BLOCKFROST_PROJECT_ID!);
    
    // In production, you would fetch this securely. For this MVP, we use the env variable.
    const mnemonic = process.env.APP_WALLET_MNEMONIC;
    if (!mnemonic) throw new Error("APP_WALLET_MNEMONIC is not set");

    return new MeshWallet({
        networkId: process.env.NEXT_PUBLIC_IS_LIVE === 'true' ? 1 : 0,
        fetcher: provider,
        submitter: provider,
        key: {
            type: 'mnemonic',
            words: mnemonic.split(' ')
        }
    });
};

export const getBadgePolicy = (walletAddress: string) => {
    return ForgeScript.withOneSignature(walletAddress);
};

export interface BadgeMetadata {
    name: string;
    image: string;
    description: string;
    villagesCreated: number;
    projectsJoined: number;
    totalDonations: number;
    unlockedAt: string;
    badgeType: string;
}

export const mintCIP68Badge = async (
    userAddress: string,
    badgeType: string,
    badgeId: string, // Unique ID per user/badge
    metadata: BadgeMetadata
) => {
    const appWallet = getAppWallet();
    const appWalletAddress = await appWallet.getChangeAddress();

    const forgeScript = getBadgePolicy(appWalletAddress);
    const policyId = resolveScriptHash(forgeScript);

    // The asset name base (e.g. "MosaicBadge_userId")
    const assetNameBase = `MosaicBadge_${badgeId}`;
    const assetNameHex = stringToHex(assetNameBase);

    const referenceAssetName = `${CIP68_100(assetNameHex)}`;
    const userAssetName = `${CIP68_222(assetNameHex)}`;

    const cip68Datum = metadataToCip68(metadata);

    const tx = new Transaction({ initiator: appWallet });

    // Mint Reference Token
    tx.mintAsset(forgeScript, {
        assetName: referenceAssetName,
        assetQuantity: '1'
    });

    // Mint User Token
    tx.mintAsset(forgeScript, {
        assetName: userAssetName,
        assetQuantity: '1'
    });

    // Send Reference Token with inline Datum to AppWallet
    tx.sendAssets(
        {
            address: appWalletAddress,
            datum: {
                value: cip68Datum,
                inline: true
            }
        },
        [
            {
                unit: policyId + referenceAssetName,
                quantity: '1'
            }
        ]
    );

    // Send User Token to the user
    tx.sendAssets(
        { address: userAddress },
        [
            {
                unit: policyId + userAssetName,
                quantity: '1'
            }
        ]
    );

    const unsignedTx = await tx.build();
    const signedTx = await appWallet.signTx(unsignedTx);
    const txHash = await appWallet.submitTx(signedTx);

    return { txHash, policyId, assetNameHex, assetNameBase };
};

export const updateBadgeMetadata = async (
    badgeId: string,
    policyId: string,
    metadata: BadgeMetadata
) => {
    const appWallet = getAppWallet();
    const appWalletAddress = await appWallet.getChangeAddress();
    
    const assetNameBase = `MosaicBadge_${badgeId}`;
    const assetNameHex = stringToHex(assetNameBase);
    const referenceAssetName = `${CIP68_100(assetNameHex)}`;
    const unit = policyId + referenceAssetName;

    const cip68Datum = metadataToCip68(metadata);

    const tx = new Transaction({ initiator: appWallet });
    tx.sendAssets(
        {
            address: appWalletAddress,
            datum: {
                value: cip68Datum,
                inline: true
            }
        },
        [
            {
                unit: unit,
                quantity: '1'
            }
        ]
    );

    const unsignedTx = await tx.build();
    const signedTx = await appWallet.signTx(unsignedTx);
    const txHash = await appWallet.submitTx(signedTx);

    return txHash;
};
