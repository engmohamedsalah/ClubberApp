import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({
          initialState: { auth: { user: null, token: null, loading: false, error: null } }
        }),
        { provide: Router, useValue: { navigate: () => ({}) } }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });


});

