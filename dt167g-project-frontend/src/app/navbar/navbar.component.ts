import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { MessageService } from '../services/message.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive
  ],

  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent implements OnInit, OnDestroy {
  /**
   * Flag to control the visibility of the navigation bar for logged in users.
   */
  isLoggedIn: boolean = false;
  private authSubscription!: Subscription;
  
  /**
   * Constructor function to inject services.
   * @param authService Service for authentication related operations.
   * @param router Router for navigation and route handling.
   * @param messageService Message service for managing messages displayed to the user.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
  }

  /**
  * Initializes component and subscribes to the authentication 
  * status observable to track user's login status.
  */
  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
        (status: boolean) => {
            this.isLoggedIn = status;
            console.log('NavbarComponent: isLoggedIn =', this.isLoggedIn);
        }
    );
    this.authService.updateSessionData();
}


  /**
   * Handles the logout success and error scenarios.
   */
  logout(): void {
    this.authService.logout().then(() => {
      this.messageService.showMessage('Logout successful', true);
      this.router.navigate(['/login']);
    }).catch(error => {
      this.messageService.showMessage('Logout failed. Please try again.', false);
    });
  }

  /**
   * Lifecycle hook called before Angular destroys the component.
   * Unsubscribes from the authentication status observable to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

}