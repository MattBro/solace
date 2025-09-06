import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schemas';

const postgres = require('postgres');

@Injectable()
export class DatabaseService {
  private readonly client: any;
  public readonly db: ReturnType<typeof drizzle>;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('DATABASE_URL');
    
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    this.client = postgres(connectionString);
    this.db = drizzle(this.client, { schema });
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}