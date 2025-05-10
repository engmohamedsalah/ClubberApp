import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, ValidationErrors } from "@angular/forms";
import { LoginComponent } from "./login.component";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, provideRouter } from '@angular/router';
import { InjectionToken } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe("LoginComponent", () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: { dispatch: (...args: unknown[]) => void; dispatchCalls: unknown[][] };
  let httpTestingController: HttpTestingController;
  const STORE_TOKEN = new InjectionToken('Store');

  beforeEach(async () => {
    store = {
      dispatch: function (...args: unknown[]) {
        this.dispatchCalls.push(args);
      },
      dispatchCalls: []
    };
    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        CommonModule,
        HttpClientTestingModule
      ],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ActivatedRoute, useValue: {} },
        { provide: STORE_TOKEN, useValue: store }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("form should be invalid when empty", () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it("username field validity", () => {
    let errors: ValidationErrors | null = {};
    const username = component.loginForm.controls["username"];
    expect(username.valid).toBeFalsy();
    errors = username.errors;
    expect(errors?.["required"]).toBeTruthy();
    username.setValue("test");
    errors = username.errors;
    expect(errors?.["required"]).toBeFalsy();
  });

  it("password field validity", () => {
    let errors: ValidationErrors | null = {};
    const password = component.loginForm.controls["password"];
    expect(password.valid).toBeFalsy();
    errors = password.errors;
    expect(errors?.["required"]).toBeTruthy();
    password.setValue("password");
    errors = password.errors;
    expect(errors?.["required"]).toBeFalsy();
  });

  it("should call store.dispatch on valid form submission", () => {
    store.dispatchCalls = [];
    spyOn(component, 'onSubmit').and.callThrough();
    component.loginForm.controls["username"].setValue("testuser");
    component.loginForm.controls["password"].setValue("password");
    fixture.detectChanges();
    expect(component.loginForm.valid).toBeTruthy();
    component.onSubmit();
    const req = httpTestingController.match(r => r.url.includes('/api/v1/Auth/login'));
    req.forEach(r => r.flush({ token: 'fake-token', user: { id: '1', username: 'testuser' } }));
    expect(component.onSubmit).toHaveBeenCalled();
  });

  it("should not call store.dispatch on invalid form submission", () => {
    store.dispatchCalls = [];
    spyOn(component, 'onSubmit').and.callThrough();
    component.loginForm.controls["username"].setValue("");
    component.loginForm.controls["password"].setValue("");
    fixture.detectChanges();
    expect(component.loginForm.valid).toBeFalsy();
    component.onSubmit();
    expect(component.onSubmit).toHaveBeenCalled();
  });

  afterEach(() => {
    if (httpTestingController) {
      httpTestingController.verify();
    }
  });
});

