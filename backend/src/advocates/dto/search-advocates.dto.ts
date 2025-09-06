import { IsOptional, IsString, IsNumber, IsArray, Min, Max, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchAdvocatesDto {
  @ApiPropertyOptional({ 
    description: 'Search term for full-text search',
    example: 'family law'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Comma-separated list of specialties to filter by',
    example: 'Family Law,Criminal Defense'
  })
  @IsOptional()
  @Transform(({ value }) => 
    typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(s => s) : value
  )
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ 
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of results per page',
    minimum: 1,
    maximum: 100,
    default: 50,
    example: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ 
    description: 'Field to sort by',
    enum: ['relevance', 'name', 'experience', 'city'],
    default: 'relevance',
    example: 'name'
  })
  @IsOptional()
  @IsString()
  @IsIn(['relevance', 'name', 'experience', 'city'])
  sortBy?: 'relevance' | 'name' | 'experience' | 'city' = 'relevance';

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'asc'
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}