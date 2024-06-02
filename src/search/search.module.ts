import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchListener } from './listeners/search.listener';

@Module({
  providers: [SearchService, SearchListener],
})
export class SearchModule { }
