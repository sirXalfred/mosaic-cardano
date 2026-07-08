import { BlockfrostProvider } from '@meshsdk/core';
import { runWrite, runRead } from './shared';

const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;

const PLAN_PRICES: Record<string, number> = {
  'BASIC': 8,
  'PRO': 60
};

export async function verifyPaymentAndUpdatePlan(userId: string, txHash: string, planType: string): Promise<boolean> {
  if (!TREASURY_ADDRESS || !BLOCKFROST_PROJECT_ID) {
    throw new Error('Missing critical environment variables.');
  }

  const expectedUsdPrice = PLAN_PRICES[planType?.toUpperCase()];
  if (!expectedUsdPrice) {
    throw new Error('Invalid plan type.');
  }

  try {
    // 1. Check if Tx is already consumed to prevent replay attacks
    const checkQuery = `
      MATCH (s:Mosaic_Subscription {lastPaymentTxHash: $txHash})
      RETURN s
    `;
    const existing = await runRead(checkQuery, { txHash }, row => row.s);
    if (existing && existing.length > 0) {
      throw new Error('Transaction hash has already been consumed.');
    }

    // 2. Fetch live ADA price from CoinGecko
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
    const data = await res.json();
    const liveAdaPrice = data.cardano.usd;
    
    const requiredAda = expectedUsdPrice / liveAdaPrice;
    const requiredLovelace = Math.ceil(requiredAda * 1_000_000);
    const minAcceptableLovelace = Math.floor(requiredLovelace * 0.95); // 5% slippage

    
    const provider = new BlockfrostProvider(BLOCKFROST_PROJECT_ID);

    // 3. Verify transaction metadata (CIP-20) to prevent hash stealing
    const metadataArr = await provider.get(`/txs/${txHash}/metadata`) as Array<{ label: string; json_metadata?: { msg?: string[] } }>;
    
    // Look for label "674"
    const targetMeta = metadataArr.find((m) => m.label === '674');
    if (!targetMeta || !targetMeta.json_metadata || !targetMeta.json_metadata.msg) {
      throw new Error("Transaction is missing required verification metadata.");
    }
    
    const msgArr = targetMeta.json_metadata.msg;
    if (!msgArr.includes(`User: ${userId}`)) {
      throw new Error("Transaction metadata does not match the authenticated user.");
    }

    // 4. Verify received UTXO via Blockfrost
    const outputs = await provider.fetchUTxOs(txHash);
    
    let totalLovelaceReceived = 0;

    for (const out of outputs) {
       const address = out.output.address;

       if (address === TREASURY_ADDRESS) {
           const amountArr = out.output.amount;
           const lovelaceObj = amountArr.find(a => a.unit === 'lovelace');
           if (lovelaceObj) {
               totalLovelaceReceived += parseInt(lovelaceObj.quantity, 10);
           }
       }
    }

    if (totalLovelaceReceived < minAcceptableLovelace) {
      throw new Error(`Insufficient payment. Expected ~${requiredLovelace} lovelace, but found ${totalLovelaceReceived}.`);
    }

    // 5 & 6. Mark payment UTXO as consumed and Extend subscription period in db
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days subscription
    
    // Determine if on mainnet by checking Blockfrost project ID prefix (mainnet... or preprod...)
    const isMainnet = BLOCKFROST_PROJECT_ID.startsWith('mainnet') ? 1 : 0;
    const expectedAda = requiredLovelace / 1_000_000;

    const updateQuery = `
      MATCH (u:Mosaic_User {id: $userId})
      MERGE (u)-[:HAS_SUBSCRIPTION]->(s:Mosaic_Subscription)
      ON CREATE SET s.createdAt = datetime().toString()
      SET s.expiresAt = $expiresAt,
          s.lastPaymentTxHash = $txHash,
          s.status = 'ACTIVE',
          s.planType = $planType,
          s.isMainnet = $isMainnet,
          s.expectedAda = $expectedAda,
          u.planType = $planType
      RETURN u, s
    `;

    const result = await runWrite(updateQuery, { 
      userId, 
      planType: planType.toUpperCase(),
      txHash,
      expiresAt: expiresAt.toISOString(),
      isMainnet,
      expectedAda
    }, row => row);

    if (!result || result.length === 0) {
      throw new Error('User not found or plan update failed.');
    }

    return true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error; // Rethrow to let the route handler capture the specific message
  }
}
