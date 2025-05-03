import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { PlaylistService } from './playlist.service';

describe('PlaylistService', () => {
  let service: PlaylistService;
  const initialState = {}; // Initial state for the mock store

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlaylistService,
        provideMockStore({ initialState })
      ]
    });
    service = TestBed.inject(PlaylistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

