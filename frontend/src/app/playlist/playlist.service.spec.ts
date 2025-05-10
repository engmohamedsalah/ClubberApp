import { TestBed } from '@angular/core/testing';
import { PlaylistService } from './playlist.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Match, MatchStatus, MatchAvailability } from '../models/match.model';

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
    // Handle initial GET request
    const req = httpTestingController.expectOne('/api/v1/Playlist');
    expect(req.request.method).toBe('GET');
    req.flush({ data: { data: [], page: 1, pageSize: 10, totalCount: 0 } });
    expect(service).toBeTruthy();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should load playlist from API', (done: DoneFn) => {
    let emissionCount = 0;
    const expectedLength = 1;

    // Subscribe before any playlist loading
    const subscription = service.playlist$.subscribe(playlist => {
      emissionCount++;
      console.log('playlist$ emission', emissionCount, playlist);
      // Ignore the first two emissions (initial empty array and the empty array after the first API call)
      if (emissionCount === 3) {
        expect(playlist.length).toBe(expectedLength);
        expect(playlist[0].id).toBe('1');
        expect(playlist[0].title).toBe('Match 1');
        subscription.unsubscribe();
        done();
      }
    });

    // Flush the initial GET request from the constructor
    const initReq = httpTestingController.expectOne('/api/v1/Playlist');
    expect(initReq.request.method).toBe('GET');
    initReq.flush({
      data: {
        data: [],
        page: 1,
        pageSize: 10,
        totalCount: 0
      }
    });

    // Now trigger the playlist load
    service.loadPlaylist();

    // Flush the HTTP request with the mock data
    const req = httpTestingController.expectOne('/api/v1/Playlist');
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      message: 'Success',
      data: {
        data: [
          { id: '1', title: 'Match 1', competition: 'Comp 1', date: new Date().toISOString(), status: 0, availability: 0, streamURL: '', thumbnail: '' }
        ],
        page: 1,
        pageSize: 10,
        totalCount: 1
      }
    });
  });

  it('should add a match to the playlist', (done: DoneFn) => {
    // Handle initial GET request
    const initReq = httpTestingController.expectOne('/api/v1/Playlist');
    expect(initReq.request.method).toBe('GET');
    initReq.flush({ data: { data: [], page: 1, pageSize: 10, totalCount: 0 } });

    const match: Match = { id: '2', title: 'Match 2', competition: 'Comp 2', date: new Date(), status: MatchStatus.Upcoming, availability: MatchAvailability.Available, streamURL: '', thumbnail: '' };
    const mockResponse = { succeeded: true, message: 'Added', playlist: { matches: [match] } };

    service.playlist$.subscribe(playlist => {
      if (playlist.find(m => m.id === '2')) {
        expect(playlist.length).toBeGreaterThan(0);
        done();
      }
    });

    service.addToPlaylist(match);

    const req = httpTestingController.expectOne('/api/v1/Playlist/2');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});

