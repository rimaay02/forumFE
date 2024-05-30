import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ForumService } from '../services/forum.service';
import { UserService } from '../services/user.service';
import { MessageService } from '../services/message.service';

@Component({
    selector: 'app-forum',
    standalone: true,
    templateUrl: './forum.component.html',
    styleUrls: ['./forum.component.css'],
    imports: [CommonModule, FormsModule, RouterLink]
})
export class ForumComponent implements OnInit {
    roomId : number = 0;
    creatorId : number = 0;
    username: string = '';
    title: string = '';
    message: string = '';
    forumRooms: any[] = [];
    filteredRooms: any[] = [];
    searchQuery: string = '';
    searchType: string = 'keyword';

    constructor(
        private authService: AuthService,
        private forumService: ForumService,
        private messageService: MessageService,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.username = this.authService.getCurrentUsername() || 'User';
        this.creatorId = this.authService.getCurrentUserId() || 0;
        this.loadRooms();
    }

    isModalOpen: boolean = false;

    openCreateTopicModal() {
        this.isModalOpen = true;
    }

    closeCreateTopicModal() {
        this.isModalOpen = false;
        this.title = '';
        this.message = '';
    }

    async onCreateRoom(): Promise<void> {

        const newRoom = { title: this.title, message: this.message, creatorId : this.creatorId };

        try {
            const response = await this.forumService.createRoom(newRoom);
            this.messageService.showMessage(response.message, true);
            this.closeCreateTopicModal();
            this.loadRooms(); // Refresh the list of topics
        } catch (error: any) {
            const errorMessage = error.error?.message || 'Unknown error occurred';
            this.messageService.showMessage(errorMessage, false);
        }
    }

    async loadRooms(): Promise<void> {
        try {
            const rooms = await this.forumService.getRooms();
            if (!rooms || rooms.length === 0) {
                console.warn('No rooms found.');
                return;
            }
            const roomPromises = rooms.map(async (room: any) => {
                const answers = await this.forumService.getAnswersByRoomId(room.id);
                return { ...room, answersCount: answers.length };
            });
            this.forumRooms = await Promise.all(roomPromises);
            this.filteredRooms = this.forumRooms;
        } catch (error) {
            console.error('Failed to load topics', error);
        }
    }
    
    async search(query: string, type: string): Promise<void> {
        try {
            const searchResults = await this.forumService.searchRooms(query, type);
            const searchRoomPromises = searchResults.map(async (room: any) => {
                const answers = await this.forumService.getAnswersByRoomId(room.id);
                return { ...room, answersCount: answers.length };
            });
            this.filteredRooms = await Promise.all(searchRoomPromises);
    
            console.log('Search Results:', this.filteredRooms);
            
            const numberOfRooms = this.filteredRooms.length;
            const message = numberOfRooms > 0 ? `Found ${numberOfRooms} rooms for '${query}'` : 'No rooms found for the search query.';
            this.messageService.showMessage(message, true);
        } catch (error) {
            console.error('Failed to search rooms', error);
        }
    }
    
      resetSearch() {
        this.searchQuery = '';
        this.searchType = 'user';
        this.filteredRooms = this.forumRooms; // Reset to show all rooms
        const numberOfRooms = this.filteredRooms.length;
        const message = numberOfRooms > 0 ? `Showing ${numberOfRooms} rooms.` : 'No rooms found.';
        this.messageService.showMessage(message, true);
      }
    
}
