import { Controller, Get, Query, Param, NotFoundException, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdvocatesService } from './advocates.service';
import { SearchAdvocatesDto } from './dto/search-advocates.dto';
import { AdvocateEntity, SearchAdvocatesResponseEntity } from './entities/advocate.entity';

@ApiTags('advocates')
@Controller('api/advocates')
@UseInterceptors(CacheInterceptor)
export class AdvocatesController {
  constructor(private readonly advocatesService: AdvocatesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Search and retrieve advocates',
    description: 'Search advocates with optional filtering by specialties, pagination, and sorting'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved advocates',
    type: SearchAdvocatesResponseEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async searchAdvocates(
    @Query() query: SearchAdvocatesDto
  ): Promise<SearchAdvocatesResponseEntity> {
    return this.advocatesService.searchAdvocates(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get advocate by ID',
    description: 'Retrieve a single advocate by their ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved advocate',
    type: AdvocateEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Advocate not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAdvocateById(@Param('id') id: string): Promise<AdvocateEntity> {
    const advocateId = parseInt(id, 10);
    
    if (isNaN(advocateId)) {
      throw new NotFoundException('Invalid advocate ID');
    }

    const advocate = await this.advocatesService.getAdvocateById(advocateId);
    
    if (!advocate) {
      throw new NotFoundException('Advocate not found');
    }

    return advocate;
  }

  @Get('specialty/:specialty')
  @ApiOperation({ 
    summary: 'Get advocates by specialty',
    description: 'Retrieve advocates filtered by a specific specialty'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved advocates by specialty',
    type: SearchAdvocatesResponseEntity,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAdvocatesBySpecialty(
    @Param('specialty') specialty: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ): Promise<SearchAdvocatesResponseEntity> {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    
    return this.advocatesService.getAdvocatesBySpecialty(specialty, pageNum, limitNum);
  }
}