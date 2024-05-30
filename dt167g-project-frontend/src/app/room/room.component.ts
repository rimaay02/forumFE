import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ForumService } from '../services/forum.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';


@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
  roomId: string | null = null;
  roomData: any = { id: 0, title: "", message: "", creatorName: "", answers: [] };
  newAnswer: string = '';
  userId: number = 0;
  currentUser: any = null; 
  private roomDataSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null; // Declare userSubscription

  constructor(
    private route: ActivatedRoute,
    private forumService: ForumService,
    private authService: AuthService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUsername$.subscribe(username => {
      this.currentUser = username ? { username: username } : null;
    });
    this.userId = this.authService.getCurrentUserId() || 0;
    this.route.paramMap.subscribe(params => {
      this.roomId = params.get('id');
      if (this.roomId) {
        this.loadRoomData(this.roomId);
      }
    });

    this.roomDataSubscription = this.forumService.roomData$.subscribe(roomData => {
      if (roomData) {
        this.roomData = roomData;
        this.cdr.detectChanges(); 
      }
    });
  }

  ngOnDestroy(): void {
    if (this.roomDataSubscription) {
      this.roomDataSubscription.unsubscribe();
    }
  }

  async loadRoomData(roomId: string): Promise<void> {
    try {
      this.roomData = await this.forumService.getRoomById(+roomId);
      await this.loadAnswers(+roomId); 
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load room data', error);
    }
  }

  async loadAnswers(roomId: number): Promise<void> {
    try {
      const answers = await this.forumService.getAnswersByRoomId(roomId.toString());
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        console.log(answer)
        let votes = await this.forumService.getVotesByAnswerId(answer.id);
        
        for (let i in votes) {
          answer.votesLength = votes[i].length;
        }
      }
      this.roomData.answers = answers;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load answers', error);
    }
  }



  async sendAnswer(): Promise<void> {
    if (this.roomId && this.newAnswer && this.currentUser) {
      const answer = {
        roomId: this.roomId,
        message: this.newAnswer,
        userId: this.userId
      };
      try {
        await this.forumService.postAnswer(answer);
        this.newAnswer = '';
        // Reload room data to ensure the new answer with username is fetched
        await this.loadRoomData(this.roomId);
        this.cdr.detectChanges(); 
      } catch (error) {
        console.error('Failed to post answer', error);
      }
    }
  }
  async voteUp(answer: any): Promise<void> {
    try {
      await this.forumService.insertVote(this.userId, answer.id);
      // Reload answers to update the votes
      await this.loadAnswers(this.roomData.id);
    } catch (error) {
      const errorMessage = "You have used your upvote";
      this.messageService.showMessage(errorMessage, false);
      console.error('Failed to upvote', error);
    }
  }

  async voteDown(answer: any): Promise<void> {
    try {
      await this.forumService.deleteVote(this.userId, answer.id);
      // Reload answers to update the votes
      await this.loadAnswers(this.roomData.id);
    } catch (error) {
      console.error('Failed to downvote', error);
    }
  }


  
  async deleteAnswer(answerId: number): Promise<void> {
    try {
      await this.forumService.deleteAnswer(answerId);
    } catch (error) {
      console.error('Failed to delete answer', error);
    }
  }
}
