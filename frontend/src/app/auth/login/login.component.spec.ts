import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, ValidationErrors } from "@angular/forms"; // Import ValidationErrors
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { LoginComponent } from "./login.component";
import { AppState } from "../../store/reducers";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import * as AuthActions from "../../store/actions/auth.actions"; // Import actions

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore<AppState>;

  // Correct initial state without isAuthenticated
  const initialState: AppState = {
    auth: { user: null, token: null, loading: false, error: null },
    matches: { matches: [], loading: false, error: null },
    playlist: { playlist: null, loading: false, error: null }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent, // Import standalone component
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges(); // Initial change detection
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("form should be invalid when empty", () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it("username field validity", () => {
    let errors: ValidationErrors | null = {}; // Use ValidationErrors type
    const username = component.loginForm.controls["username"];
    expect(username.valid).toBeFalsy();

    // Username field is required
    errors = username.errors;
    expect(errors?.["required"]).toBeTruthy(); // Use safe access

    // Set username to something
    username.setValue("test");
    errors = username.errors;
    expect(errors?.["required"]).toBeFalsy(); // Use safe access
  });

  it("password field validity", () => {
    let errors: ValidationErrors | null = {}; // Use ValidationErrors type
    const password = component.loginForm.controls["password"];
    expect(password.valid).toBeFalsy();

    // Password field is required
    errors = password.errors;
    expect(errors?.["required"]).toBeTruthy(); // Use safe access

    // Set password to something
    password.setValue("password");
    errors = password.errors;
    expect(errors?.["required"]).toBeFalsy(); // Use safe access
  });

  it("should dispatch login action on valid form submission", () => {
    spyOn(store, "dispatch");
    const username = "testuser";
    const password = "password";
    expect(component.loginForm.valid).toBeFalsy();
    component.loginForm.controls["username"].setValue(username);
    component.loginForm.controls["password"].setValue(password);
    expect(component.loginForm.valid).toBeTruthy();

    component.onSubmit();

    expect(store.dispatch).toHaveBeenCalledOnceWith(
      AuthActions.login({ credentials: { username, password } })
    );
  });

  it("should not dispatch login action on invalid form submission", () => {
    spyOn(store, "dispatch");
    expect(component.loginForm.valid).toBeFalsy();

    component.onSubmit();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

});

