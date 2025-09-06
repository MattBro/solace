import { sql } from "drizzle-orm";
import db from "../../db/client";
import { advocates } from "../../db/schema";
import type { AdvocateDB, AdvocateSearchResult } from "../types/advocate.types";
import { logger } from "../utils/logger";

export class AdvocateRepository {
  /**
   * Search advocates using PostgreSQL full-text search
   * @param search - Search term
   * @param limit - Number of results per page
   * @param offset - Number of results to skip
   * @returns Advocates matching search criteria with total count
   */
  async searchAdvocates(
    search: string,
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      // Type guard to ensure db has execute method
      if (!('execute' in db)) {
        throw new Error('Database not properly initialized');
      }

      const searchResults = await (db as any).execute(sql`
        SELECT *, 
          ts_rank(search_vector, plainto_tsquery('english', ${search})) as rank
        FROM advocates
        WHERE search_vector @@ plainto_tsquery('english', ${search})
        ORDER BY rank DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as AdvocateDB[];

      const countResult = await (db as any).execute(sql`
        SELECT COUNT(*) as count
        FROM advocates
        WHERE search_vector @@ plainto_tsquery('english', ${search})
      `) as { count: string }[];

      const totalCount = countResult && countResult.length > 0
        ? parseInt(countResult[0].count)
        : 0;

      return {
        advocates: Array.from(searchResults),
        totalCount
      };
    } catch (error) {
      logger.error('Error searching advocates', error);
      throw new Error('Failed to search advocates');
    }
  }

  /**
   * Get paginated list of all advocates
   * @param limit - Number of results per page
   * @param offset - Number of results to skip
   * @returns All advocates with pagination
   */
  async getAllAdvocates(
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      // Type guard to ensure db is properly initialized
      if (!('select' in db) || typeof db.select !== 'function') {
        throw new Error('Database not properly initialized');
      }

      const advocatesData = await (db as any)
        .select()
        .from(advocates)
        .limit(limit)
        .offset(offset);

      const countResult = await (db as any).execute(sql`
        SELECT COUNT(*) as count FROM advocates
      `) as { count: string }[];

      const totalCount = countResult && countResult.length > 0
        ? parseInt(countResult[0].count)
        : 0;

      return {
        advocates: advocatesData as AdvocateDB[],
        totalCount
      };
    } catch (error) {
      console.error('Error fetching advocates:', error);
      throw new Error('Failed to fetch advocates');
    }
  }

  /**
   * Get a single advocate by ID
   * @param id - Advocate ID
   * @returns Advocate or null if not found
   */
  async getAdvocateById(id: number): Promise<AdvocateDB | null> {
    try {
      // Type guard to ensure db is properly initialized
      if (!('select' in db) || typeof db.select !== 'function') {
        throw new Error('Database not properly initialized');
      }

      const results = await (db as any)
        .select()
        .from(advocates)
        .where(sql`id = ${id}`)
        .limit(1);

      return results[0] as AdvocateDB || null;
    } catch (error) {
      console.error('Error fetching advocate by ID:', error);
      throw new Error('Failed to fetch advocate');
    }
  }

  /**
   * Get advocates by specialty
   * @param specialty - Specialty to search for
   * @param limit - Number of results per page
   * @param offset - Number of results to skip
   * @returns Advocates with the specified specialty
   */
  async getAdvocatesBySpecialty(
    specialty: string,
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      // Type guard to ensure db has execute method
      if (!('execute' in db)) {
        throw new Error('Database not properly initialized');
      }

      const searchResults = await (db as any).execute(sql`
        SELECT *
        FROM advocates
        WHERE payload::jsonb @> ${JSON.stringify([specialty])}::jsonb
        LIMIT ${limit} OFFSET ${offset}
      `) as AdvocateDB[];

      const countResult = await (db as any).execute(sql`
        SELECT COUNT(*) as count
        FROM advocates
        WHERE payload::jsonb @> ${JSON.stringify([specialty])}::jsonb
      `) as { count: string }[];

      const totalCount = countResult && countResult.length > 0
        ? parseInt(countResult[0].count)
        : 0;

      return {
        advocates: Array.from(searchResults),
        totalCount
      };
    } catch (error) {
      console.error('Error fetching advocates by specialty:', error);
      throw new Error('Failed to fetch advocates by specialty');
    }
  }
}

// Export singleton instance
export const advocateRepository = new AdvocateRepository();