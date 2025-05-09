import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Assuming the correct path to ProfileService is '../profile/profile.service'
import { ProfileService, ChangePasswordRequest } from '../profile/profile.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [ProfileService]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;
  success = false;
  error: string | null = null;
  passwordForm!: FormGroup;

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  ngOnInit() {
    this.loading = true;
    this.profileService.getProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.passwordForm = this.fb.group({
          oldPassword: ['', [Validators.required]],
          newPassword: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', [Validators.required]]
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.error = 'New password and confirmation do not match.';
      this.success = false;
      return;
    }
    this.loading = true;
    this.success = false;
    this.error = null;
    const req: ChangePasswordRequest = this.passwordForm.value;
    this.profileService.changePassword(req).subscribe({
      next: () => {
        this.success = true;
        this.error = null;
        this.loading = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to change password.';
        this.success = false;
        this.loading = false;
      }
    });
  }
}
