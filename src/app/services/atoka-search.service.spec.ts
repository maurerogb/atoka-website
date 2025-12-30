import { TestBed } from '@angular/core/testing';

import { AtokaSearchService } from './atoka-search.service';

describe('AtokaSearchService', () => {
  let service: AtokaSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtokaSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
