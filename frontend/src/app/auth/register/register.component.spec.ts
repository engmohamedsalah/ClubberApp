import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, ValidationErrors } from "@angular/forms"; // Import ValidationErrors
import { provideMockStore, MockStore } from "@ngrx/store/testing";
import { RegisterComponent } from "./register.component";
import { AppState } from "../../store/reducers";
import { CommonModule } from "@angular/common";
import { RouterTestingModule } from "@angular/router/testing";
import * as AuthActions from "../../store/actions/auth.actions"; // Import actions

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
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
        RegisterComponent, // Import standalone component
        ReactiveFormsModule,
        CommonModule,
        RouterTestingModule
      ],
      providers: [
        provideMockStore({ initialState }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    fixture.detectChanges(); // Initial change detection
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("form should be invalid when empty", () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it("username field validity", () => {
    let errors: ValidationErrors | null = {}; // Use ValidationErrors type
    const username = component.registerForm.controls["username"];
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
    const password = component.registerForm.controls["password"];
    expect(password.valid).toBeFalsy();

    // Password field is required
    errors = password.errors;
    expect(errors?.["required"]).toBeTruthy(); // Use safe access

    // Set password to something
    password.setValue("password");
    errors = password.errors;
    expect(errors?.["required"]).toBeFalsy(); // Use safe access
  });

  it("should dispatch register action on valid form submission", () => {
    spyOn(store, "dispatch");
    const username = "newuser";
    const password = "password";
    expect(component.registerForm.valid).toBeFalsy();
    component.registerForm.controls["username"].setValue(username);
    component.registerForm.controls["password"].setValue(password);
    expect(component.registerForm.valid).toBeTruthy();

    component.onSubmit();

    expect(store.dispatch).toHaveBeenCalledOnceWith(
      AuthActions.register({ credentials: { username, password } })
    );
  });

  it("should not dispatch register action on invalid form submission", () => {
    spyOn(store, "dispatch");
    expect(component.registerForm.valid).toBeFalsy();

    component.onSubmit();

    expect(store.dispatch).not.toHaveBeenCalled();
  });

});

