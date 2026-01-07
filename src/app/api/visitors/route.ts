import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VISITORS_KEY = "bounty_unique_visitors";

export async function POST(request: NextRequest) {
  try {
    const { visitorId } = await request.json();

    if (!visitorId) {
      return Response.json({ error: "Visitor ID required" }, { status: 400 });
    }

    // Add visitor to set (only adds if not already present)
    await redis.sadd(VISITORS_KEY, visitorId);

    // Get total count
    const count = await redis.scard(VISITORS_KEY);

    return Response.json({ count });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    // Return a fallback count on error
    return Response.json({ count: null });
  }
}

export async function GET() {
  try {
    const count = await redis.scard(VISITORS_KEY);
    return Response.json({ count });
  } catch (error) {
    console.error("Visitor count error:", error);
    return Response.json({ count: null });
  }
}
