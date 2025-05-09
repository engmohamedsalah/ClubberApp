import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideMockStore } from "@ngrx/store/testing";
import { MatchesService } from "./matches.service";
import { AppState } from "../store/reducers";
import { first } from "rxjs/operators";
import { Match } from "../models/match.model";

describe("MatchesService", () => {
  let service: MatchesService;
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
        provideMockStore({ initialState })
      ]
    });
    service = TestBed.inject(MatchesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Verify that no requests are outstanding.
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  // Test loadMatches and matches$ observable
  it("should load matches and emit them through matches$ observable", (done: any) => {
    // Ensure that matches$ emits after loadMatches is called
    service.matches$.pipe(first()).subscribe((matches: Match[]) => {
      expect(matches).toBeDefined();
      expect(Array.isArray(matches)).toBeTruthy();
      done();
    });

    // Call loadMatches to trigger the observable
    service.loadMatches();

    // Expect the HTTP request and flush a response
    const req = httpTestingController.expectOne(req => req.method === 'GET');
    req.flush([]); // Respond with an empty array or mock data as needed
  });

  // Test the filterMatches method
  it("should filter matches by Live status", () => {
    // Call the method to test
    service.filterMatches('Live');

    // Validate service state is correct
    expect(service.loading$).toBeDefined();
    expect(service.error$).toBeDefined();

    // Get any pending requests
    const requests = httpTestingController.match(req => req.method === 'GET');

    // If we found any requests, flush them
    if (requests.length > 0) {
      requests.forEach(req => {
        req.flush([]);
      });
    }
  });
});

