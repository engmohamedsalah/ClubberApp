import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import { By } from "@angular/platform-browser";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { PlaylistService } from '../playlist.service';
import { BehaviorSubject, of } from 'rxjs';
import { PlaylistViewComponent } from './playlist-view.component';
import { MatchStatus, MatchAvailability } from '../../models/match.model';
import { provideMockStore } from '@ngrx/store/testing';
import { provideHttpClient } from '@angular/common/http';

type SpyFunction = ((...args: unknown[]) => void) & { calls: unknown[][] };

describe("PlaylistViewComponent", () => {
  let component: PlaylistViewComponent;
  let fixture: ComponentFixture<PlaylistViewComponent>;
  let playlistService: {
    loadPlaylist: SpyFunction;
    removeFromPlaylist: SpyFunction;
    filterPlaylist: SpyFunction;
    clearNotification: SpyFunction;
    playlist$: unknown;
    loading$: unknown;
    error$: unknown;
    notification$: unknown;
  };
  let playlistSubject: BehaviorSubject<unknown[]>;
  let loadingSubject: BehaviorSubject<boolean>;
  let errorSubject: BehaviorSubject<string | null>;
  let notificationSubject: BehaviorSubject<unknown>;

  beforeEach(async () => {
    function createSpy(): SpyFunction {
      const fn = ((...args: unknown[]) => { fn.calls.push(args); }) as SpyFunction;
      fn.calls = [];
      return fn;
    }
    playlistSubject = new BehaviorSubject<unknown[]>([]);
    loadingSubject = new BehaviorSubject<boolean>(false);
    errorSubject = new BehaviorSubject<string | null>(null);
    notificationSubject = new BehaviorSubject<unknown>(null);
    const playlistServiceSpy = {
      loadPlaylist: createSpy(),
      removeFromPlaylist: createSpy(),
      filterPlaylist: createSpy(),
      clearNotification: createSpy(),
      playlist$: playlistSubject.asObservable(),
      loading$: loadingSubject.asObservable(),
      error$: errorSubject.asObservable(),
      notification$: notificationSubject.asObservable()
    };
    await TestBed.configureTestingModule({
      imports: [
        PlaylistViewComponent,
        CommonModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: PlaylistService, useValue: playlistServiceSpy },
        { provide: ActivatedRoute, useValue: { params: of({ id: '123' }) } },
        provideMockStore({
          initialState: {
            auth: { isAuthenticated: true }
          }
        })
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistViewComponent);
    component = fixture.componentInstance;
    playlistService = playlistServiceSpy;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call loadPlaylist on init", () => {
    expect(playlistService.loadPlaylist.calls.length).toBeGreaterThan(0);
  });

  it("should show loading spinner when loading is true", () => {
    loadingSubject.next(true);
    fixture.detectChanges();
    const spinner = fixture.debugElement.query(By.css('app-loading-spinner'));
    expect(spinner).toBeTruthy();
  });

  it("should show match cards when matches exist", () => {
    playlistSubject.next([
      { id: '1', title: 'Match 1', competition: 'Comp A', date: new Date(), status: MatchStatus.OnDemand, availability: MatchAvailability.Available, streamURL: '' },
      { id: '2', title: 'Match 2', competition: 'Comp B', date: new Date(), status: MatchStatus.OnDemand, availability: MatchAvailability.Available, streamURL: '' }
    ]);
    fixture.detectChanges();
    const cards = fixture.debugElement.queryAll(By.css('app-match-card'));
    expect(cards.length).toBe(2);
  });

  it("should show empty state when playlist is empty", () => {
    playlistSubject.next([]);
    fixture.detectChanges();
    const emptyHeader = fixture.debugElement.query(By.css('h3'));
    expect(emptyHeader.nativeElement.textContent).toContain('Your playlist is empty');
  });

  it("should call removeFromPlaylist when remove event is emitted", () => {
    playlistSubject.next([
      { id: '1', title: 'Match 1', competition: 'Comp A', date: new Date(), status: MatchStatus.OnDemand, availability: MatchAvailability.Available, streamURL: '' }
    ]);
    fixture.detectChanges();
    const card = fixture.debugElement.query(By.css('app-match-card'));
    card.triggerEventHandler('removeFromPlaylist', '1');
    expect(playlistService.removeFromPlaylist.calls[0][0]).toBe('1');
  });

});

