import { healthService } from "@/services/backend/health";

export const GET = async (request: Request) => {
  // If the request URL contains "withdb" as a query parameter, check the database connection
  const withDb = request.url.includes('withdb');
  const authHeader = request.headers.get('Authorization');

  if (withDb) {
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    await healthService.keepAlive();
    return Response.json({ status: "ok", message: "Database pulse verified." });
  }

  return Response.json({ status: "ok", message: "Up." });
};