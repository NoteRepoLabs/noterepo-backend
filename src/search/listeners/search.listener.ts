import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RepoCreatedEvent } from '../../repo/events/repo-events';
import { SearchService } from '../search.service';
import { FileCreatedEvent } from '../../repo/files/events/file-events';

@Injectable()
export class SearchListener {
  constructor(private readonly searchService: SearchService) { }
  @OnEvent('searchRepo.created')
  async handleRepoCreatedEvent(event: RepoCreatedEvent[]) {
    const result = await this.searchService.addRepoSearchDocument(event);
    console.log(result);
  }
  @OnEvent('searchRepo.updated')
  async handleRepoUpdatedEvent(event: RepoCreatedEvent[]) {
    const result = await this.searchService.updateRepoSearchDocument(event);
    console.log(result);
  }
  @OnEvent('searchRepo.deleted')
  async handleRepoDeletedEvent(event: string[]) {
    const result = await this.searchService.deleteRepoSearchDocument(event);
    console.log(result);
  }
  @OnEvent('searchFile.created')
  async handleFileCreatedEvent(event: FileCreatedEvent[]) {
    const result = await this.searchService.addFileSearchDocument(event);
    console.log(result);
  }
  @OnEvent('searchFile.deleted')
  async handleFileDeletedEvent(event: string[]) {
    const result = await this.searchService.deleteFileSearchDocument(event);
    console.log(result);
  }
}
