import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { PlaylistViewComponent } from "./playlist-view.component";
import { AppState } from "../../store/reducers";
import { Playlist } from "../../models/playlist.model";
import { Match } from "../../models/match.model";
import * as PlaylistActions from "../../store/actions/playlist.actions";
// Correct import for selector
import { selectUserPlaylist, selectPlaylistLoading } from "../../store/selectors/playlist.selectors";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { By } from "@angular/platform-browser";
import { MemoizedSelector } from "@ngrx/store";

describe("PlaylistViewComponent", () => {
  let component: PlaylistViewComponent;
  let fixture: ComponentFixture<PlaylistViewComponent>;
  let store: MockStore<AppState>;
  let mockSelectUserPlaylist: MemoizedSelector<AppState, Playlist | null>; // Renamed variable
  let mockSelectPlaylistLoading: MemoizedSelector<AppState, boolean>;

  // Correct initial state without isAuthenticated
  const initialState: AppState = {
    auth: { user: null, token: null, loading: false, error: null }, // Assume authenticated by presence of token/user if needed
    matches: { matches: [], loading: false, error: null },
    playlist: { playlist: null, loading: false, error: null }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PlaylistViewComponent, // Import standalone component
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistViewComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    // Setup mock selectors with correct names
    mockSelectUserPlaylist = store.overrideSelector(selectUserPlaylist, null);
    mockSelectPlaylistLoading = store.overrideSelector(selectPlaylistLoading, false);

    spyOn(store, "dispatch"); // Spy on dispatch before initial detectChanges

    fixture.detectChanges(); // Trigger ngOnInit
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should dispatch loadPlaylist action on init", () => {
    expect(store.dispatch).toHaveBeenCalledWith(PlaylistActions.loadPlaylist());
  });

  it("should display loading indicator when loading is true", () => {
    mockSelectPlaylistLoading.setResult(true);
    store.refreshState();
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(By.css("p"));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain("Loading playlist...");
  });

  it("should display playlist matches when loading is false and playlist exists", () => {
    // Use correct Match properties (id as string, title, competition)
    const mockPlaylist: Playlist = {
      matches: [
        { id: "guid1", title: "Match 1", competition: "Comp A", date: new Date(), status: "Live" },
        { id: "guid2", title: "Match 2", competition: "Comp B", date: new Date(), status: "Replay" }
      ]
    };
    mockSelectUserPlaylist.setResult(mockPlaylist);
    mockSelectPlaylistLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const matchElements = fixture.debugElement.queryAll(By.css("li"));
    expect(matchElements.length).toBe(2);
    expect(matchElements[0].nativeElement.textContent).toContain("Match 1");
    expect(matchElements[1].nativeElement.textContent).toContain("Match 2");

    const loadingElement = fixture.debugElement.query(By.css("p"));
    expect(loadingElement).toBeFalsy(); // No loading indicator
  });

  it("should display 'Playlist is empty' when loading is false and playlist has no matches", () => {
    const mockPlaylist: Playlist = { matches: [] };
    mockSelectUserPlaylist.setResult(mockPlaylist);
    mockSelectPlaylistLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const emptyPlaylistElement = fixture.debugElement.query(By.css("p"));
    expect(emptyPlaylistElement).toBeTruthy();
    expect(emptyPlaylistElement.nativeElement.textContent).toContain("Playlist is empty.");

    const matchElements = fixture.debugElement.queryAll(By.css("li"));
    expect(matchElements.length).toBe(0);
  });

   it("should display 'Playlist not found' when loading is false and playlist is null", () => {
    mockSelectUserPlaylist.setResult(null);
    mockSelectPlaylistLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const notFoundElement = fixture.debugElement.query(By.css("p"));
    expect(notFoundElement).toBeTruthy();
    expect(notFoundElement.nativeElement.textContent).toContain("Playlist not found or failed to load.");

    const matchElements = fixture.debugElement.queryAll(By.css("li"));
    expect(matchElements.length).toBe(0);
  });

  it("should dispatch removeMatchFromPlaylist action when 'Remove' button is clicked", () => {
     // Use correct Match properties
     const matchIdToRemove = "guid1";
     const mockPlaylist: Playlist = {
      matches: [
        { id: matchIdToRemove, title: "Match 1", competition: "Comp A", date: new Date(), status: "Live" }
      ]
    };
    mockSelectUserPlaylist.setResult(mockPlaylist);
    mockSelectPlaylistLoading.setResult(false);
    store.refreshState();
    fixture.detectChanges();

    const removeButton = fixture.debugElement.query(By.css("button"));
    expect(removeButton).toBeTruthy();

    removeButton.triggerEventHandler("click", null);

    // Ensure matchId is passed correctly (as string)
    expect(store.dispatch).toHaveBeenCalledWith(PlaylistActions.removeMatchFromPlaylist({ matchId: matchIdToRemove }));
  });

});

