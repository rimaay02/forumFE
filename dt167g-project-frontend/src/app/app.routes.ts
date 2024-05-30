import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { ForumComponent } from './forum/forum.component';
import { RoomComponent } from './room/room.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { AuthGuard } from './services/auth.guard';


export const routes: Routes = [
    { path: 'login', component: AuthenticationComponent},
    { path: '', redirectTo: 'forum', pathMatch: 'full' },
    { path: 'unauthorized', component: UnauthorizedComponent },
    { path: 'forum', component: ForumComponent, canActivate: [AuthGuard] },
    { path: 'room/:id', component: RoomComponent, canActivate: [AuthGuard]},
    { path: '**', redirectTo: '/forum' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
