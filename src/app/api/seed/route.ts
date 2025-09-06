import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "Database connection not configured" },
      { status: 500 }
    );
  }

  // Type guard to ensure db has insert method
  if (!('insert' in db)) {
    return Response.json(
      { error: "Database not properly initialized" },
      { status: 500 }
    );
  }

  const records = await db.insert(advocates).values(advocateData).returning();

  return Response.json({ advocates: records });
}
