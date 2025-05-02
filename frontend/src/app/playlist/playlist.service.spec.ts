import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { PlaylistService } from "./playlist.service";
import { AppState } from "../store/reducers";
import { Playlist, PlaylistActionResult } from "../models/playlist.model"; // Import correct interface
import { Match } from "../models/match.model";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs"; // Import Observable

describe("PlaylistService", () => {
  let service: PlaylistService;
  let store: MockStore<AppState>;
  let httpTestingController: HttpTestingController;

  // Correct initial state without isAuthenticated
  const initialState: AppState = {
    auth: { user: null, token: null, loading: false, error: null },
    matches: { matches: [], loading: false, error: null },
    playlist: { playlist: null, loading: false, error: null }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlaylistService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState }),
      ]
    });
    service = TestBed.inject(PlaylistService);
    store = TestBed.inject(MockStore);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no requests are outstanding after each test
    httpTestingController.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  // Example using correct models:
  it("getPlaylist should return Playlist on success", (done) => {
    const mockPlaylist: Playlist = { matches: [] }; // Playlist only has matches

    service.getPlaylist().subscribe((playlist: Playlist) => { // Add type
      expect(playlist).toEqual(mockPlaylist);
      done();
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/api/Playlist`); // Corrected API URL
    expect(req.request.method).toEqual("GET");
    req.flush(mockPlaylist);
  });

  it("addMatchToPlaylist should return PlaylistActionResult on success", (done) => {
    const matchId = "guid1";
    const mockMatch: Match = { id: matchId, title: "Match 1", competition: "Comp A", date: new Date(), status: "Live" };
    const mockResponse: PlaylistActionResult = { succeeded: true, message: "Added", playlist: { matches: [mockMatch] } };

    // Call correct method
    service.addMatchToPlaylist(matchId).subscribe((response: PlaylistActionResult) => { // Add type
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/api/Playlist/${matchId}`); // Corrected API URL
    expect(req.request.method).toEqual("POST");
    req.flush(mockResponse);
  });

  it("removeMatchFromPlaylist should return PlaylistActionResult on success", (done) => {
    const matchId = "guid1";
    const mockResponse: PlaylistActionResult = { succeeded: true, message: "Removed", playlist: { matches: [] } };

    // Call correct method
    service.removeMatchFromPlaylist(matchId).subscribe((response: PlaylistActionResult) => { // Add type
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/api/Playlist/${matchId}`); // Corrected API URL
    expect(req.request.method).toEqual("DELETE");
    req.flush(mockResponse);
  });

});

