import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HomeComponent } from './app/pages/home/home.component';
import { authGuard } from './app/core/guards/auth/auth.guard';

const routes: Routes = [

  { path: '', component: HomeComponent, title: 'Informatic-Help' },
  {
    path: 'login', loadComponent: () => import('./app/pages/login/login.component').then(c => c.LoginComponent),
    title: 'Iniciar sesión'
  },
  {
    path: 'register', loadComponent: () => import('./app/pages/register/register.component').then(c => c.RegisterComponent),
    title: 'Registrate'
  },
  {
    path: 'product-detail/:id', loadComponent: () => import('./app/pages/products-detail/products-detail.component').then(c => c.ProductsDetailComponent),
    title: `Producto`
  },
  {
    path: 'cart', loadComponent: () => import('./app/pages/cart/cart.component').then(c => c.CartComponent),
    title: 'Carrito'
  },
  {
    path: 'products-list', loadComponent: () => import('./app/components/products/products-list/products-list.component').then(c => c.ProductsListComponent),
    title: 'Productos'
  },
  {
    path: 'user', loadComponent: () => import('./app/pages/user/user.component').then(c=>c.UserComponent),
    //children: USER_ROUTES
    loadChildren: () => import('./app/pages/user/user.routes').then(r=>r.USER_ROUTES),
    canActivate:[authGuard]
  },

];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(RouterModule)
  ]
});
