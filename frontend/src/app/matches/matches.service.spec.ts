import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { MatchesService } from "./matches.service";
import { AppState } from "../store/reducers";
import { Match, MatchStatus, MatchAvailability } from "../models/match.model";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs"; // Import Observable

describe("MatchesService", () => {
  let service: MatchesService;
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
        MatchesService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState }),
      ]
    });
    service = TestBed.inject(MatchesService);
    store = TestBed.inject(MockStore);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify that no requests are outstanding.
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  // Example using correct Match model properties and correct service method name:
  it("getMatches should return Match[] on success", (done) => {
    const mockMatches: Match[] = [
      { id: "guid1", title: "Match 1", competition: "Comp A", date: new Date(), status: MatchStatus.InProgress, availability: MatchAvailability.Available, streamURL: "" },
      { id: "guid2", title: "Match 2", competition: "Comp B", date: new Date(), status: MatchStatus.Completed, availability: MatchAvailability.Available, streamURL: "" }
    ];

    // Call the correct method: getMatches()
    // Add explicit type for matches parameter
    service.getMatches().subscribe((matches: Match[]) => {
      expect(matches).toEqual(mockMatches);
      done();
    });

    const req = httpTestingController.expectOne(`${environment.apiUrl}/api/Matches`); // Corrected API URL based on service
    expect(req.request.method).toEqual("GET");
    req.flush(mockMatches);
  });

});

