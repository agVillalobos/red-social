import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'

//Components
import { LoginComponent } from './components/login/login.component'
import { RegisterComponent } from './components/register/register.component'
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FollowingComponent } from './components/following/following.component';
import {FollowedComponent} from './components/followed/followed.component';
//Servicios
import {UseGuard} from './services/user.guard';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'mis-datos', component: UserEditComponent, canActivate:[UseGuard] },
    { path: 'gente', component: UsersComponent, canActivate:[UseGuard] },
    { path: 'gente/:page', component: UsersComponent, canActivate:[UseGuard] },
    { path: 'timeline', component: TimelineComponent, canActivate:[UseGuard] },
    { path: 'perfil/:id', component: ProfileComponent, canActivate:[UseGuard] },
    { path: 'siguiendo/:id/:page', component: FollowingComponent, canActivate:[UseGuard] },
    { path: 'seguidores/:id/:page', component: FollowedComponent, canActivate:[UseGuard] },
    { path: '**', component: HomeComponent }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);