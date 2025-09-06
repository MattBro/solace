import db from "../../../db";
import { advocates } from "../../../db/schema";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  let data;
  let totalCount;

  if (search) {
    // Use full-text search with relevance ranking
    const searchResults = await db.execute(sql`
      SELECT *, 
        ts_rank(search_vector, plainto_tsquery('english', ${search})) as rank
      FROM advocates
      WHERE search_vector @@ plainto_tsquery('english', ${search})
      ORDER BY rank DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    
    // The result is an array-like object, not {rows: ...}
    data = Array.from(searchResults);
    
    // Get total count for pagination
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM advocates
      WHERE search_vector @@ plainto_tsquery('english', ${search})
    `);
    
    totalCount = countResult && countResult.length > 0 
      ? parseInt(countResult[0].count as string) 
      : 0;
  } else {
    // No search term - return paginated results
    data = await db.select().from(advocates).limit(limit).offset(offset);
    
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM advocates
    `);
    
    totalCount = countResult && countResult.length > 0 
      ? parseInt(countResult[0].count as string)
      : 0;
  }

  const totalPages = Math.ceil(totalCount / limit);

  return Response.json({ 
    data: data || [],
    pagination: {
      page,
      limit,
      totalCount,
      totalPages
    }
  });
}