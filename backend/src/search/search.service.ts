import { Injectable } from '@nestjs/common';

import { Stay } from 'src/stay/stay.entity';
import { StayService } from 'src/stay/stay.service';

import { SearchQueryDto } from 'src/search/dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly stayService: StayService) {}

  async search(query: SearchQueryDto): Promise<Stay[]> {
    return this.stayService.search(query);
  }
}
