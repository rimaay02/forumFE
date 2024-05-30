import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Mark the messageServices as injectable using the @Injectable() decorator.
@Injectable({
  providedIn: 'root'
})

/**
 * The MessageService class provides methods to manage messages in the application
 */
export class MessageService {
  /**
   * A new BehaviorSubject that hols the current message and its success status.
   */
  private messageSource = new BehaviorSubject<{message: string, isSuccess: boolean}>({message: '', isSuccess: true});
  // Expose the current message as an Observable.
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  /**
   * Updates the current message and its success status
   * @param message The message to update
   * @param isSuccess The success status
   */
  showMessage(message: string, isSuccess: boolean) {
    this.messageSource.next({message, isSuccess});
  }
}
