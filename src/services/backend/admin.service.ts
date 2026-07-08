import { runRead } from './shared';
import { BlockfrostProvider } from '@meshsdk/core';

export const adminService = {
  async getPlatformMetrics() {
    const result = await runRead(
      `
        CALL {
          MATCH (u:Mosaic_User)
          RETURN 
            count(u) AS totalUsers,
            sum(CASE WHEN u.planType = 'PRO' THEN 1 ELSE 0 END) AS proUsers,
            sum(CASE WHEN u.planType = 'BASIC' THEN 1 ELSE 0 END) AS basicUsers,
            sum(CASE WHEN u.planType = 'FREE' THEN 1 ELSE 0 END) AS freeUsers
        }
        CALL {
          MATCH (v:Mosaic_Community)
          RETURN count(v) AS totalVillages
        }
        CALL {
          MATCH (p:Mosaic_Piece)
          RETURN count(p) AS totalPieces
        }
        CALL {
          MATCH (s:Mosaic_Subscription)
          WITH s, substring(coalesce(s.createdAt, '2026-06'), 0, 7) AS month,
               coalesce(s.expectedAda, CASE s.planType WHEN 'PRO' THEN 60 WHEN 'BASIC' THEN 8 ELSE 0 END) AS rev
          WITH month, sum(rev) AS mrr
          ORDER BY month DESC LIMIT 6
          RETURN collect({month: month, revenue: mrr}) AS mrrHistory
        }
        RETURN totalUsers, proUsers, basicUsers, freeUsers, totalVillages, totalPieces, mrrHistory
      `,
      {},
      row => {
        // Generate last 6 months strings (YYYY-MM)
        const last6Months: string[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          // Pad month with zero if needed
          const y = d.getFullYear();
          const m = (d.getMonth() + 1).toString().padStart(2, '0');
          last6Months.push(`${y}-${m}`);
        }

        const rawMrr = (row.mrrHistory as Array<{ month: string; revenue: number }>) || [];
        const mrrMap = new Map(rawMrr.map(item => [item.month, item.revenue]));
        
        const mrrHistory: { month: string, revenue: number }[] = [];
        let cumulativeRevenue = 0;
        for (const month of last6Months) {
          cumulativeRevenue += mrrMap.get(month) || 0;
          mrrHistory.push({ month, revenue: cumulativeRevenue });
        }

        return {
          users: {
            total: Number(row.totalUsers) || 0,
            pro: Number(row.proUsers) || 0,
            basic: Number(row.basicUsers) || 0,
            free: Number(row.freeUsers) || 0,
          },
          villages: Number(row.totalVillages) || 0,
          pieces: Number(row.totalPieces) || 0,
          mrrHistory,
        };
      }
    );

    return result[0];
  },

  async getLiveTreasuryBalance(): Promise<number | null> {
    const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
    const BLOCKFROST_PROJECT_ID = process.env.BLOCKFROST_PROJECT_ID;

    if (!TREASURY_ADDRESS || !BLOCKFROST_PROJECT_ID) {
      return null;
    }

    try {
      const provider = new BlockfrostProvider(BLOCKFROST_PROJECT_ID);
      // Fetch UTXOs to calculate total ADA at address
      const outputs = await provider.fetchUTxOs(TREASURY_ADDRESS);
      
      let totalLovelace = 0;
      for (const out of outputs) {
         const amountArr = out.output.amount;
         const lovelaceObj = amountArr.find(a => a.unit === 'lovelace');
         if (lovelaceObj) {
             totalLovelace += parseInt(lovelaceObj.quantity, 10);
         }
      }
      return Math.floor(totalLovelace / 1_000_000); // Return in ADA
    } catch (error: unknown) {
      console.error('Failed to fetch treasury balance', error);
      return null;
    }
  },

  async broadcastMessage(audience: string, title: string, body: string, actionUrl?: string) {
    const { notificationService } = await import('./notification.service');
    
    let userQuery = `MATCH (u:Mosaic_User) RETURN u.id AS id`;
    const params: Record<string, unknown> = {};

    if (audience !== 'ALL') {
      userQuery = `MATCH (u:Mosaic_User {planType: $planType}) RETURN u.id AS id`;
      params.planType = audience;
    }

    const users = await runRead(userQuery, params, row => row.id as string);
    let sentCount = 0;

    // Send notifications in batches to avoid overwhelming the system
    for (const userId of users) {
      await notificationService.createNotification({
        userId,
        type: 'SYSTEM',
        title,
        body,
        actionUrl
      }).catch(err => console.error(`Broadcast failed for user ${userId}:`, err));
      sentCount++;
    }

    return { sentCount };
  },

  async listUsers(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const users = await runRead(
      `MATCH (u:Mosaic_User) RETURN u ORDER BY u.createdAt DESC SKIP toInteger($skip) LIMIT toInteger($limit)`,
      { skip, limit },
      row => row.u
    );
    const countRes = await runRead(`MATCH (u:Mosaic_User) RETURN count(u) AS total`, {}, row => row.total);
    return { items: users, total: Number(countRes[0]) || 0 };
  },

  async listVillages(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const villages = await runRead(
      `MATCH (v:Mosaic_Community) RETURN v ORDER BY v.createdAt DESC SKIP toInteger($skip) LIMIT toInteger($limit)`,
      { skip, limit },
      row => row.v
    );
    const countRes = await runRead(`MATCH (v:Mosaic_Community) RETURN count(v) AS total`, {}, row => row.total);
    return { items: villages, total: Number(countRes[0]) || 0 };
  }
};
