import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { advocates } from '../database/schemas';
import type { AdvocateDB, AdvocateSearchResult } from './interfaces/advocate.interface';

@Injectable()
export class AdvocateRepository {
  private readonly logger = new Logger(AdvocateRepository.name);

  constructor(private databaseService: DatabaseService) {}

  async searchAdvocates(
    search: string,
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      const searchQuery = search.trim().split(' ').map((word, index, arr) => 
        index === arr.length - 1 ? `${word}:*` : word
      ).join(' & ');

      const searchResults = await this.databaseService.db.execute(sql`
        SELECT id, first_name, last_name, city, degree, payload as specialties, 
               years_of_experience, phone_number, created_at, 
          ts_rank(search_vector, to_tsquery('english', ${searchQuery})) as rank
        FROM advocates
        WHERE search_vector @@ to_tsquery('english', ${searchQuery})
        ORDER BY rank DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown as AdvocateDB[];

      const countResult = await this.databaseService.db.execute(sql`
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
      this.logger.error('Error searching advocates', error);
      throw new Error('Failed to search advocates');
    }
  }

  async getAllAdvocates(
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      const advocatesData = await this.databaseService.db.execute(sql`
        SELECT id, first_name, last_name, city, degree, payload as specialties, 
               years_of_experience, phone_number, created_at
        FROM advocates
        ORDER BY id
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown as AdvocateDB[];

      const countResult = await this.databaseService.db.execute(sql`
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
      this.logger.error('Error fetching advocates:', error);
      throw new Error('Failed to fetch advocates');
    }
  }

  async getAdvocateById(id: number): Promise<AdvocateDB | null> {
    try {
      const results = await this.databaseService.db
        .select()
        .from(advocates)
        .where(sql`id = ${id}`)
        .limit(1);

      return (results[0] as unknown as AdvocateDB) || null;
    } catch (error) {
      this.logger.error('Error fetching advocate by ID:', error);
      throw new Error('Failed to fetch advocate');
    }
  }

  async getAdvocatesBySpecialties(
    specialties: string[],
    search: string,
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      const specialtyArray = `ARRAY[${specialties.map(s => `'${s}'`).join(',')}]`;

      let searchResults: AdvocateDB[];
      let countResult: { count: string }[];

      if (search && search.trim()) {
        const searchQuery = search.trim().split(' ').map((word, index, arr) => 
          index === arr.length - 1 ? `${word}:*` : word
        ).join(' & ');

        searchResults = await this.databaseService.db.execute(sql`
          SELECT id, first_name, last_name, city, degree, payload as specialties, 
                 years_of_experience, phone_number, created_at,
            ts_rank(search_vector, to_tsquery('english', ${searchQuery})) as rank
          FROM advocates
          WHERE search_vector @@ to_tsquery('english', ${searchQuery})
            AND payload::jsonb ?| ${sql.raw(specialtyArray)}
          ORDER BY rank DESC
          LIMIT ${limit} OFFSET ${offset}
        `) as unknown as AdvocateDB[];

        countResult = await this.databaseService.db.execute(sql`
          SELECT COUNT(*) as count
          FROM advocates
          WHERE search_vector @@ to_tsquery('english', ${searchQuery})
            AND payload::jsonb ?| ${sql.raw(specialtyArray)}
        `) as { count: string }[];
      } else {
        searchResults = await this.databaseService.db.execute(sql`
          SELECT id, first_name, last_name, city, degree, payload as specialties, 
                 years_of_experience, phone_number, created_at
          FROM advocates
          WHERE payload::jsonb ?| ${sql.raw(specialtyArray)}
          ORDER BY id
          LIMIT ${limit} OFFSET ${offset}
        `) as unknown as AdvocateDB[];

        countResult = await this.databaseService.db.execute(sql`
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
      this.logger.error('Error fetching advocates by specialties:', error);
      throw new Error('Failed to fetch advocates by specialties');
    }
  }

  async getAdvocatesBySpecialty(
    specialty: string,
    limit: number,
    offset: number
  ): Promise<AdvocateSearchResult> {
    try {
      const searchResults = await this.databaseService.db.execute(sql`
        SELECT id, first_name, last_name, city, degree, payload as specialties, 
               years_of_experience, phone_number, created_at
        FROM advocates
        WHERE payload::jsonb @> ${JSON.stringify([specialty])}::jsonb
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown as AdvocateDB[];

      const countResult = await this.databaseService.db.execute(sql`
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
      this.logger.error('Error fetching advocates by specialty:', error);
      throw new Error('Failed to fetch advocates by specialty');
    }
  }
}