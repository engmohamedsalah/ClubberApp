import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideMockStore } from "@ngrx/store/testing";
import { MatchesService } from "./matches.service";
import { AppState } from "../store/reducers";

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
        provideMockStore({ initialState }),
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

  // Example test for MatchesService
  it("getMatches should be defined and callable", () => {
    // Just verify the service exists and can be called
    expect(service.getMatches).toBeDefined();
    service.getMatches(); // Call the method but don't expect a return value
  });

});

