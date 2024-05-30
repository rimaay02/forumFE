import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ForumService {
    private readonly API_URL = 'http://192.168.0.13:8000';
    private roomDataSubject = new BehaviorSubject<any>(null);
    roomData$ = this.roomDataSubject.asObservable();

    constructor(private http: HttpClient) {
    }

  async getRooms(): Promise<any> {
      return await firstValueFrom(this.http.get<any>(`${this.API_URL}/getRooms`));
  }

  async createRoom(newRoom: any): Promise<any> {
    console.log(newRoom)
      return await firstValueFrom(this.http.post<any>(`${this.API_URL}/createTopic`, newRoom));
  }

    async getRoomById(roomId: number): Promise<any> {
      const roomData = await firstValueFrom(this.http.get<any>(`${this.API_URL}/room/${roomId}`));
      console.log(roomData);
      this.roomDataSubject.next(roomData);
      return roomData;
    }
  
    async postAnswer(newAnswer: any): Promise<any> {
      const response = await firstValueFrom(this.http.post<any>(`${this.API_URL}/postAnswer`, newAnswer));
      console.log("response: " + response)
      const currentRoomData = this.roomDataSubject.value;
    
      if (currentRoomData && currentRoomData.answers) {
        currentRoomData.answers.push(response);
        this.roomDataSubject.next(currentRoomData);
      }
    
      return response;
    }
    
  
  async deleteAnswer(answerId: number): Promise<void> {
    try {
        // Send a DELETE request to the backend API to delete the answer
        await firstValueFrom(this.http.delete<any>(`${this.API_URL}/deleteAnswer/${answerId}`));
        
        // If deletion is successful, update the local room data
        const currentRoomData = this.roomDataSubject.value;
        if (currentRoomData) {
            // Find the index of the answer to delete
            const answerIndex = currentRoomData.answers.findIndex((a: any) => a.id === answerId);
            if (answerIndex !== -1) {
                // Remove the answer from the array
                currentRoomData.answers.splice(answerIndex, 1);
                // Update the room data observable
                this.roomDataSubject.next(currentRoomData);
            }
        }
    } catch (error) {
        console.error('Failed to delete answer', error);
        // Handle error as needed
    }
}

async insertVote(userId: number, answerId: number): Promise<void> {
  try {
      await firstValueFrom(this.http.post<any>(`${this.API_URL}/insertVote`, { userId, answerId })
          .pipe(
              catchError(error => {
                  console.error('Failed to insert vote', error);
                  return throwError(() => error);
              })
          )
      );
  } catch (error) {
      throw error; // Rethrow the error for component to handle
  }
}

async deleteVote(userId: number, answerId: number): Promise<void> {
  try {
      await firstValueFrom(this.http.delete<any>(`${this.API_URL}/deleteVote/${userId}/${answerId}`)
          .pipe(
              catchError(error => {
                  console.error('Failed to delete vote', error);
                  return throwError(() => error);
              })
          )
      );
  } catch (error) {
      throw error; // Rethrow the error for component to handle
  }
}

async getAnswersByRoomId(roomId: string): Promise<any[]> {
  try {
    return await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/answersByRoomId/${roomId}`));
  } catch (error) {
    console.error('Failed to fetch answers', error);
    // Handle error as needed
    return [];
  }
}

async getVotesByAnswerId(answerId: number): Promise<any[]> {
  try {
    return await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/votesByAnswerId/${answerId}`));
  } catch (error) {
    console.error('Failed to fetch votes', error);
    return [];
  }
}

async searchRooms(query: string, type: string): Promise<any[]> {
  try {
      console.log(`${this.API_URL}/search/${query}/${type}`)
      return await firstValueFrom(this.http.get<any[]>(`${this.API_URL}/search/${query}/${type}`));
  } catch (error) {
      console.error('Failed to search rooms', error);
      return [];
  }
}

}
