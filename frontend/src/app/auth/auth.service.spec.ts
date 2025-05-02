import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideHttpClient } from "@angular/common/http";
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { AuthService } from "./auth.service";
import { AppState } from "../store/reducers";
import { User } from "../models/user.model";
import { AuthResponseDto, LoginDto, RegisterDto } from "../models/auth.model";
import { environment } from "../../environments/environment";


describe("AuthService", () => {
  let service: AuthService;
  let store: MockStore<AppState>;
  const initialState: AppState = {
    auth: { user: null, token: null, isAuthenticated: false, error: null },
    matches: { matches: [], loading: false, error: null },
    playlist: { playlist: null, loading: false, error: null }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockStore({ initialState }),
      ]
    });
    service = TestBed.inject(AuthService);
    store = TestBed.inject(MockStore);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  // Add more tests for login and register methods
  // Example:
  // it("login should return AuthResponseDto on success", (done) => {
  //   const loginDto: LoginDto = { username: "test", password: "pass" };
  //   const mockResponse: AuthResponseDto = { succeeded: true, message: "Login successful.", token: "fake-token" };

  //   service.login(loginDto).subscribe(response => {
  //     expect(response).toEqual(mockResponse);
  //     done();
  //   });

  //   const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
  //   expect(req.request.method).toEqual("POST");
  //   req.flush(mockResponse);
  // });

  // it("register should return AuthResponseDto on success", (done) => {
  //   const registerDto: RegisterDto = { username: "newuser", password: "pass" };
  //   const mockResponse: AuthResponseDto = { succeeded: true, message: "User registered successfully.", token: null };

  //   service.register(registerDto).subscribe(response => {
  //     expect(response).toEqual(mockResponse);
  //     done();
  //   });

  //   const req = httpTestingController.expectOne(`${environment.apiUrl}/auth/register`);
  //   expect(req.request.method).toEqual("POST");
  //   req.flush(mockResponse);
  // });

});

