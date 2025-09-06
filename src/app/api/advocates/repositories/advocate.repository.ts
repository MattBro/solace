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

      // Add :* to the last word for prefix matching
      const searchQuery = search.trim().split(' ').map((word, index, arr) => 
        index === arr.length - 1 ? `${word}:*` : word
      ).join(' & ');

      const searchResults = await (db as any).execute(sql`
        SELECT id, first_name, last_name, city, degree, payload as specialties, 
               years_of_experience, phone_number, created_at, 
          ts_rank(search_vector, to_tsquery('english', ${searchQuery})) as rank
        FROM advocates
        WHERE search_vector @@ to_tsquery('english', ${searchQuery})
        ORDER BY rank DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as AdvocateDB[];

      const countResult = await (db as any).execute(sql`
        SELECT COUNT(*) as count
        FROM advocates
        WHERE search_vector @@ to_tsquery('english', ${searchQuery})
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
      // Type guard to ensure db has execute method
      if (!('execute' in db)) {
        throw new Error('Database not properly initialized');
      }

      const advocatesData = await (db as any).execute(sql`
        SELECT id, first_name, last_name, city, degree, payload as specialties, 
               years_of_experience, phone_number, created_at
        FROM advocates
        ORDER BY id
        LIMIT ${limit} OFFSET ${offset}
      `) as AdvocateDB[];

      const countResult = await (db as any).execute(sql`
        SELECT COUNT(*) as count FROM advocates
      `) as { count: string }[];

      const totalCount = countResult && countResult.length > 0
        ? parseInt(countResult[0].count)
        : 0;

      return {
        advocates: Array.from(advocatesData),
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
   * Get advocates by multiple specialties with optional search
   * @param specialties - Array of specialties to filter by
   * @param search - Optional search term
   * @param limit - Number of results per page
   * @param offset - Number of results to skip
   * @returns Advocates with any of the specified specialties
   */
  async getAdvocatesBySpecialties(
    specialties: string[],
    search: string,
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      // Type guard to ensure db has execute method
      if (!('execute' in db)) {
        throw new Error('Database not properly initialized');
      }

      // Build the specialty matching condition for any of the specialties
      // Using jsonb ?| operator to check if payload contains any of the specialties
      const specialtyArray = `ARRAY[${specialties.map(s => `'${s}'`).join(',')}]`;

      let searchResults: AdvocateDB[];
      let countResult: { count: string }[];

      if (search && search.trim()) {
        // Add :* to the last word for prefix matching
        const searchQuery = search.trim().split(' ').map((word, index, arr) => 
          index === arr.length - 1 ? `${word}:*` : word
        ).join(' & ');

        // Combine search and specialty filters
        searchResults = await (db as any).execute(sql`
          SELECT id, first_name, last_name, city, degree, payload as specialties, 
                 years_of_experience, phone_number, created_at,
            ts_rank(search_vector, to_tsquery('english', ${searchQuery})) as rank
          FROM advocates
          WHERE search_vector @@ to_tsquery('english', ${searchQuery})
            AND payload::jsonb ?| ${sql.raw(specialtyArray)}
          ORDER BY rank DESC
          LIMIT ${limit} OFFSET ${offset}
        `) as AdvocateDB[];

        countResult = await (db as any).execute(sql`
          SELECT COUNT(*) as count
          FROM advocates
          WHERE search_vector @@ to_tsquery('english', ${searchQuery})
            AND payload::jsonb ?| ${sql.raw(specialtyArray)}
        `) as { count: string }[];
      } else {
        // Just filter by specialties
        searchResults = await (db as any).execute(sql`
          SELECT id, first_name, last_name, city, degree, payload as specialties, 
                 years_of_experience, phone_number, created_at
          FROM advocates
          WHERE payload::jsonb ?| ${sql.raw(specialtyArray)}
          ORDER BY id
          LIMIT ${limit} OFFSET ${offset}
        `) as AdvocateDB[];

        countResult = await (db as any).execute(sql`
          SELECT COUNT(*) as count
          FROM advocates
          WHERE payload::jsonb ?| ${sql.raw(specialtyArray)}
        `) as { count: string }[];
      }

      const totalCount = countResult && countResult.length > 0
        ? parseInt(countResult[0].count)
        : 0;

      return {
        advocates: Array.from(searchResults),
        totalCount
      };
    } catch (error) {
      console.error('Error fetching advocates by specialties:', error);
      throw new Error('Failed to fetch advocates by specialties');
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
        SELECT id, first_name, last_name, city, degree, payload as specialties, 
               years_of_experience, phone_number, created_at
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