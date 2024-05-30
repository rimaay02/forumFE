import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // The URL of the locally hosted backend API
  private readonly API_URL = 'http://192.168.0.13:8000';  

  // BehaviorSubject to hold the current login status, initially set to false.
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  // BehaviorSubject to store the current username, initially set to null.
  private currentUsernameSubject = new BehaviorSubject<string | null>(null);

  private currentUserIdSubject = new BehaviorSubject<number | null>(null);



  /**
   * Constructs the AuthService and injects dependencies.
   * @param http HttpClient for making HTTP requests.
   */
  constructor(private http: HttpClient) {
    this.updateSessionData();
  }

  /**
   * Registers a new user.
   * @param newUser The new user's registration data.
   * @returns An Observable resolving to the registration response.
   */
  async registerUser(newUser: any): Promise<any> {
    const response = this.http.post<any>(`${this.API_URL}/register`, newUser, { withCredentials: true });
    return await firstValueFrom(response);
  }
  
  /**
   * Post a new topic.
   * @param newTopic The new topic for a new forum room.
   * @returns An Observable resolving to the registration response.
   */
  async postNewTopic(newTopic: any): Promise<any> {
    const response = this.http.post<any>(`${this.API_URL}/newpost`, newTopic);
    return await firstValueFrom(response);
  }
  /**
   * Logs in a user with the provided credentials.
   * @param credentials Login credentials of the user.
   * @returns A Promise resolving to the login response.
   */
  async loginUser(credentials: any): Promise<any> {
    console.log('Attempting login with credentials:', credentials);
    const response = await firstValueFrom(this.http.post<any>(`${this.API_URL}/login`, credentials, { withCredentials: true }));
    console.log('Login response:', response);
    this.updateSessionState(response.isLoggedIn, response.username, response.userId);
    return response;
  }
   

  /**
   * Logs out the current user.
   * @returns A Promise resolving to the logout response.
   */
  async logout(): Promise<void> {
    try {
        await firstValueFrom(this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true, responseType: 'text' }));
        this.updateSessionState(false, null,0);
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
}
  
  /**
   * Updates the session data by fetching it from the server.
   */
  updateSessionData(): void {
    this.http.get<any>(`${this.API_URL}/session`, { withCredentials: true }).subscribe({
        next: (response) => {
          console.log('Session response:', response); // Log the entire response object
            const { isLoggedIn, username, userId } = response;
            this.isLoggedInSubject.next(isLoggedIn);
            this.currentUsernameSubject.next(username);
            this.currentUserIdSubject.next(userId);
            console.log('Session updated: ', { isLoggedIn, username, userId });

          },
        error: (error) => {
            console.error('Failed to update session data', error);
            this.isLoggedInSubject.next(false);
            this.currentUsernameSubject.next(null);
        }
    });
}

  /**
   * Checks if a user is currently logged in.
   * @returns Boolean indicating if the user is logged in (based on the presence of a username).
   */
  checkLoginStatus(): boolean {
    const isLoggedIn = this.isLoggedInSubject.value;
    console.log('AuthService: checkLoginStatus:', isLoggedIn);
    return isLoggedIn;
}

  

  /**
   * Retrieves the current username.
   * @returns The current username or null if not logged in.
   */
  getCurrentUsername(): string | null {
    return this.currentUsernameSubject.value;
  }

  getCurrentUserId(): number | null {
    return this.currentUserIdSubject.value;
  }

 
  /**
   * Exposes an observable for the login status.
   */
  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  /**
   * Exposes an observable for the current username.
   */
  get currentUsername$(): Observable<string | null> {
    return this.currentUsernameSubject.asObservable();
  }

  /**
   * Updates the state for login status and current username.
   * @param isLoggedIn The user's login status.
   * @param username  The current username or null if not logged in.
   */
  private updateSessionState(isLoggedIn: boolean, username: string | null, userId:number): void {
    console.log('Updating session state to:', isLoggedIn, 'for user:', username);
    this.isLoggedInSubject.next(isLoggedIn);
    this.currentUsernameSubject.next(username);
    this.currentUserIdSubject.next(userId);
  }  
}
