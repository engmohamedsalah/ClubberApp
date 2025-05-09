import { TestBed } from '@angular/core/testing';
import { PlaylistService } from './playlist.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlaylistService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: {
            auth: { user: null, token: null, loading: false, error: null },
            playlist: { playlist: null, loading: false, error: null }
          }
        })
      ]
    });
    service = TestBed.inject(PlaylistService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

