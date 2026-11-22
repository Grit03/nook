import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { SearchService } from './search.service';
import { Stay } from 'src/stay/stay.entity';
import { SearchQueryDto } from 'src/search/dto/search-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query(
      new ValidationPipe({
        // 1. DTO에 정의되지 않은 속성 제거
        whitelist: true,

        // 2. class-transformer 활성화
        transform: true,
      }),
    )
    query: SearchQueryDto,
  ): Promise<Stay[]> {
    console.log('query', query);
    const {
      longitude,
      latitude,
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      numOfGuests,
      swLng,
      swLat,
      neLng,
      neLat,
    } = query;

    return this.searchService.search({
      longitude,
      latitude,
      checkIn,
      checkOut,
      minPrice,
      maxPrice,
      numOfGuests,
      swLng,
      swLat,
      neLng,
      neLat,
    });
  }
}
