import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MessageComponent } from "./message/message.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
      CommonModule, 
      RouterOutlet, 
      MessageComponent, 
      NavbarComponent,
      RouterLink
  ]
})

export class AppComponent {
  title = 'dt167g-project-frontend';
}
