import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

import { StayModule } from 'src/stay/stay.module';

@Module({
  imports: [StayModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
