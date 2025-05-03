import { TestBed } from '@angular/core/testing';

import { TempApiService } from './temp-api.service';

describe('TempApiService', () => {
  let service: TempApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
