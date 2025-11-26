import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'Home' },
    {
        path: 'login', loadComponent: () => import('../app/pages/login/login.component').then(c => c.LoginComponent),
        title: 'Iniciar sesión'
    },
    {
        path: 'register', loadComponent: () => import('../app/pages/register/register.component').then(c => c.RegisterComponent),
        title: 'Registrate'
    }
];
