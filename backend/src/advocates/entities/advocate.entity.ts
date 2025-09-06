import { ApiProperty } from '@nestjs/swagger';

export class AdvocateEntity {
  @ApiProperty({ description: 'Advocate ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'First name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'City', example: 'New York' })
  city: string;

  @ApiProperty({ description: 'Educational degree', example: 'J.D.' })
  degree: string;

  @ApiProperty({ 
    description: 'Array of specialties', 
    example: ['Family Law', 'Criminal Defense'],
    type: [String]
  })
  specialties: string[];

  @ApiProperty({ description: 'Years of experience', example: 5 })
  yearsOfExperience: number;

  @ApiProperty({ description: 'Phone number', example: 1234567890 })
  phoneNumber: number;

  @ApiProperty({ description: 'Creation timestamp', example: '2024-01-01T00:00:00.000Z' })
  createdAt?: Date;
}

export class PaginationEntity {
  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Results per page', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Total number of results', example: 1250 })
  totalCount: number;

  @ApiProperty({ description: 'Total number of pages', example: 25 })
  totalPages: number;
}

export class SearchAdvocatesResponseEntity {
  @ApiProperty({ 
    description: 'Array of advocates',
    type: [AdvocateEntity]
  })
  data: AdvocateEntity[];

  @ApiProperty({ 
    description: 'Pagination information',
    type: PaginationEntity
  })
  pagination: PaginationEntity;
}