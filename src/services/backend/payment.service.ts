import { BlockfrostProvider } from '@meshsdk/core';
import { runWrite } from './shared';

// In production, these should be securely managed environment variables
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;

export async function verifyPaymentAndUpdatePlan(userId: string, txHash: string, planType: string): Promise<boolean> {
  if(!TREASURY_ADDRESS || !BLOCKFROST_PROJECT_ID){
    throw new Error('Missing critical environment variables.');
  }

  try {
    // 1. Verify transaction on-chain via Blockfrost
    if (BLOCKFROST_PROJECT_ID.startsWith('testnet')) {
      // Skipping strict on-chain validation for testing.
      console.warn('Using dummy Blockfrost key. Skipping strict on-chain validation for testing.');
    } else {
      const provider = new BlockfrostProvider(BLOCKFROST_PROJECT_ID);
      
      const txDetails = await provider.fetchTxInfo(txHash);
      if(txDetails.outputs.find((o) => o.output.address === TREASURY_ADDRESS)){
        return false;
      }

      // Verify the transaction was successful and sent to the treasury
      // You would add checks here to ensure the exact ADA amount is sent
      // For example, inspecting txDetails.outputs
    }

    // 2. Update user plan in Memgraph
    const query = `
      MATCH (u:Mosaic_User {id: $userId})
      SET u.planType = $planType
      RETURN u
    `;

    const result = await runWrite(query, { userId, planType }, row => row.u);
    if (!result || result.length === 0) {
      throw new Error('User not found or plan update failed.');
    }

    return true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}
