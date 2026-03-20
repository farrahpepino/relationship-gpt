import { Routes } from '@angular/router';
import { Login } from '../Components/Auth/login/login';
import { Home } from '../Components/Main/home/home';
import { authGuard } from '../Guards/auth-guard';
export const routes: Routes = [
    { path: '', component: Login },
    { path: 'home', component: Home, canActivate: [authGuard]}
];
