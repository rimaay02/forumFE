import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, timer } from 'rxjs';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})

export class MessageComponent implements OnDestroy {
  /**
   * The message property 
   */
  message: string = '';
  /**
   * The status of the message
   */
  isSuccess: boolean = true;

  /**
   * A property that holds the subscription to the message Observable.
   */
  messageSubscription: Subscription;

  /**
   * The auto close timeout (10 seconds)
   */
  autoCloseTimeout: number = 10000;

  /**
   * Constructor function to inject services.
   * @param messageService A service for managing messages displayed to the user.
   */
  constructor(private messageService: MessageService) {
    // Subscribe to the message service to get the current message and its success status.
    this.messageSubscription = this.messageService.currentMessage.subscribe(msgInfo => {
      this.message = msgInfo.message;
      this.isSuccess = msgInfo.isSuccess;
      this.startAutoCloseTimer();
  })
  }

  /**
   * A lifecycle hook that is called when the message component is destroyed.
   */
  ngOnDestroy() {
    this.messageSubscription.unsubscribe();
  }

  /**
   * Clears the current message.
   */
  closeMessage() {
    this.message = '';
  }

  /**
   * Starts the auto-close timer
   */
  private startAutoCloseTimer() {
    const timerSubscription = timer(this.autoCloseTimeout).subscribe(() => {
      // Automatically close the message after the specified timeout
      this.closeMessage();
      timerSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    });
  }
}
