import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})

/**
 * AuthGuard class to protect routes for authenticated users.
 */
export class AuthGuard  {
  constructor(private authService: AuthService, private router: Router) {}

  /**
   * canActivate method to check if the user is authenticated.
   * @returns True if the user is authenticated, false otherwise.
  */
  async canActivate(): Promise<boolean> {
    if (this.authService.checkLoginStatus()) {
      return true;
    } else {
      // User is not authenticated, redirect to unauthorized page
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
} 