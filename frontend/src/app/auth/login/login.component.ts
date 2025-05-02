import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/reducers'; // Adjust path as needed
import * as AuthActions from '../../store/actions/auth.actions'; // Adjust path as needed
import { selectAuthError, selectAuthLoading } from '../../store/selectors/auth.selectors'; // Adjust path as needed
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading$: Observable<boolean>;
  errorMessage$: Observable<string | null>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.loading$ = this.store.select(selectAuthLoading);
    this.errorMessage$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Optional: Clear error message on init or when form changes
    this.store.dispatch(AuthActions.clearAuthError());
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    this.store.dispatch(AuthActions.login({ username, password }));

    // Note: Navigation upon successful login will be handled by NgRx Effects
  }
}

