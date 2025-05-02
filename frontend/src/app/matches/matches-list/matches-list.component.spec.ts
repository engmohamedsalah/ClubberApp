import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { MatchesListComponent } from "./matches-list.component";
import { AppState } from "../../store/reducers";
import { Match } from "../../models/match.model";
import * as MatchesActions from "../../store/actions/matches.actions";
import * as PlaylistActions from "../../store/actions/playlist.actions";
import { selectAllMatches, selectMatchesLoading } from "../../store/selectors/matches.selectors";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { By } from "@angular/platform-browser";
import { MemoizedSelector } from "@ngrx/store";

describe("MatchesListComponent", () => {
  let component: MatchesListComponent;
  let fixture: ComponentFixture<MatchesListComponent>;
  let store: MockStore<AppState>;
  let mockSelectAllMatches: MemoizedSelector<AppState, Match[]>;
  let mockSelectMatchesLoading: MemoizedSelector<AppState, boolean>;

  // Correct initial state without isAuthenticated
  const initialState: AppState = {
    auth: { user: null, token: null, loading: false, error: null },
    matches: { matches: [], loading: false, error: null },
    playlist: { playlist: null, loading: false, error: null }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatchesListComponent, // Import standalone component
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    // Setup mock selectors
    mockSelectAllMatches = store.overrideSelector(selectAllMatches, []);
    mockSelectMatchesLoading = store.overrideSelector(selectMatchesLoading, false);

    spyOn(store, "dispatch"); // Spy on dispatch before initial detectChanges

    fixture.detectChanges(); // Trigger ngOnInit
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should dispatch loadMatches action on init", () => {
    expect(store.dispatch).toHaveBeenCalledWith(MatchesActions.loadMatches());
  });

  it("should display loading indicator when loading is true", () => {
    mockSelectMatchesLoading.setResult(true);
    store.refreshState();
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css("p"));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain("Loading matches...");
  });

  it("should display matches when loading is false and matches exist", () => {
    // Use correct Match properties (id as string, title, competition)
    const mockMatches: Match[] = [
      { id: "guid1", title: "Match 1", competition: "Comp A", date: new Date(), status: "Live" },
      { id: "guid2", title: "Match 2", competition: "Comp B", date: new Date(), status: "Replay" }
    ];
    mockSelectAllMatches.setResult(mockMatches);
    mockSelectMatchesLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const matchElements = fixture.debugElement.queryAll(By.css("li"));
    expect(matchElements.length).toBe(2);
    expect(matchElements[0].nativeElement.textContent).toContain("Match 1");
    expect(matchElements[1].nativeElement.textContent).toContain("Match 2");

    const loadingElement = fixture.debugElement.query(By.css("p"));
    expect(loadingElement).toBeFalsy(); // No loading indicator
  });

  it("should display 'No matches available' when loading is false and no matches exist", () => {
    mockSelectAllMatches.setResult([]);
    mockSelectMatchesLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const noMatchesElement = fixture.debugElement.query(By.css("p"));
    expect(noMatchesElement).toBeTruthy();
    expect(noMatchesElement.nativeElement.textContent).toContain("No matches available.");

    const matchElements = fixture.debugElement.queryAll(By.css("li"));
    expect(matchElements.length).toBe(0);
  });

  it("should dispatch addMatchToPlaylist action when 'Add to Playlist' button is clicked", () => {
    // Use correct Match properties
    const matchIdToAdd = "guid1";
    const mockMatches: Match[] = [
      { id: matchIdToAdd, title: "Match 1", competition: "Comp A", date: new Date(), status: "Live" }
    ];
    mockSelectAllMatches.setResult(mockMatches);
    mockSelectMatchesLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css("button"));
    expect(addButton).toBeTruthy();

    addButton.triggerEventHandler("click", null);

    // Ensure matchId is passed correctly (as string)
    // Need to check playlist.actions.ts for the correct type expected by addMatchToPlaylist
    // Assuming it expects string based on backend Guid
    expect(store.dispatch).toHaveBeenCalledWith(PlaylistActions.addMatchToPlaylist({ matchId: matchIdToAdd }));
  });

});

