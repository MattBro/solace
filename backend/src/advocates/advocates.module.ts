import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AdvocatesController } from './advocates.controller';
import { AdvocatesService } from './advocates.service';
import { AdvocateRepository } from './advocates.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [AdvocatesController],
  providers: [AdvocatesService, AdvocateRepository],
  exports: [AdvocatesService, AdvocateRepository],
})
export class AdvocatesModule {}