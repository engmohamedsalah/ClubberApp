import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
        return true; // User is authenticated, allow access
      } else {
        // User is not authenticated, redirect to login page
        router.navigate(["/auth/login"]);
        return false; // Prevent access
      }
};

