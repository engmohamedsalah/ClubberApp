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
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
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
    this.registerForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required] // Add more validators if needed (e.g., minLength)
    });

    // Optional: Clear error message on init or when form changes
    this.store.dispatch(AuthActions.clearAuthError());
  }

  // Convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    const { username, email, password } = this.registerForm.value;
    this.store.dispatch(AuthActions.register({ username, email, password }));

    // Note: Navigation upon successful registration might be handled by NgRx Effects
    // or you might want to show a success message here.
  }
}

