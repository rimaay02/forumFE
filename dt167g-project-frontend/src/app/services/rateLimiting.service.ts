import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RateLimitingService {
  private failedAttempts: Map<string, number> = new Map<string, number>();
  private readonly maxAttempts = 3;
  private readonly windowPeriod = 30 * 60 * 1000; // 30 minutes in milliseconds

  constructor() { }

  loginFailed(username: string): boolean {
    const currentTime = new Date().getTime();
    const attempts = this.failedAttempts.get(username) || 0;
    if (attempts >= this.maxAttempts) {
      // Check if the user is still within the window period
      const lastAttemptTime = this.failedAttempts.get(username + '_time') || 0;
      if (currentTime - lastAttemptTime < this.windowPeriod) {
        // User is still within the window period, block login
        return true;
      } else {
        // Reset failed attempt count
        this.failedAttempts.set(username, 0);
        this.failedAttempts.set(username + '_time', currentTime);
      }
    } else {
      // Increment failed attempt count
      this.failedAttempts.set(username, attempts + 1);
      this.failedAttempts.set(username + '_time', currentTime);
    }
    return false;
  }
}
