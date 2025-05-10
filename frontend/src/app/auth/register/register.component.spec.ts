import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, ValidationErrors } from "@angular/forms";
import { RegisterComponent } from "./register.component";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, provideRouter } from '@angular/router';
import { InjectionToken } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';

describe("RegisterComponent", () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let store: { dispatch: (...args: unknown[]) => void; dispatchCalls: unknown[][] };
  let httpTestingController: HttpTestingController;
  let authService: { register: ((...args: unknown[]) => ReturnType<typeof of>) & { calls: unknown[][] } };
  const STORE_TOKEN = new InjectionToken('Store');

  beforeEach(async () => {
    store = {
      dispatch: function (...args: unknown[]) {
        this.dispatchCalls.push(args);
      },
      dispatchCalls: []
    };
    const register = function (...args: unknown[]) {
      register.calls.push(args);
      return of({ succeeded: true, message: 'Registration successful!' });
    } as ((...args: unknown[]) => ReturnType<typeof of>) & { calls: unknown[][] };
    register.calls = [];
    authService = { register };
    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: STORE_TOKEN, useValue: store },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("form should be invalid when empty", () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it("username field validity", () => {
    let errors: ValidationErrors | null = {};
    const username = component.registerForm.controls["username"];
    expect(username.valid).toBeFalsy();
    errors = username.errors;
    expect(errors?.["required"]).toBeTruthy();
    username.setValue("test");
    errors = username.errors;
    expect(errors?.["required"]).toBeFalsy();
  });

  it("password field validity", () => {
    let errors: ValidationErrors | null = {};
    const password = component.registerForm.controls["password"];
    expect(password.valid).toBeFalsy();
    errors = password.errors;
    expect(errors?.["required"]).toBeTruthy();
    password.setValue("password");
    errors = password.errors;
    expect(errors?.["required"]).toBeFalsy();
  });

  it("should call store.dispatch on valid form submission", () => {
    component.registerForm.controls["username"].setValue("newuser");
    component.registerForm.controls["password"].setValue("password");
    if (component.registerForm.controls["email"]) {
      component.registerForm.controls["email"].setValue("test@example.com");
    }
    fixture.detectChanges();
    expect(component.registerForm.valid).toBeTrue();
    component.onSubmit();
    expect(authService.register.calls.length).toBe(1);
    expect(authService.register.calls[0]).toEqual(["newuser", "test@example.com", "password"]);
  });

  it("should not call store.dispatch on invalid form submission", () => {
    spyOn(component, 'onSubmit').and.callThrough();

    component.registerForm.controls["username"].setValue("");
    component.registerForm.controls["password"].setValue("");
    fixture.detectChanges();

    expect(component.registerForm.valid).toBeFalsy();

    component.onSubmit();

    expect(component.onSubmit).toHaveBeenCalled();
  });

  afterEach(() => {
    if (httpTestingController) {
      httpTestingController.verify();
    }
  });
});

