import { Routes } from "@angular/router";

export const USER_ROUTES: Routes = [
    {
        path: 'paymenthods',
        loadComponent: () => import('./paymethods/paymethods.component').then(c => c.PaymethodsComponent),
        title: 'Metodos de pago'
    },
    {
        path: 'shipping_address',
        loadComponent: () => import('./shipping-address/shipping-address.component').then(c => c.ShippingAddressComponent),
        title: 'Direcciones de envio'
    },
    {
        path: 'cart',
        loadComponent: () => import('./cart/cart.component').then(c => c.CartComponent),
        title: 'Carrito'
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then(c => c.ProfileComponent),
        title: 'Mi perfil'
    },
    {
        path: 'wishlist',
        loadComponent: () => import('./wish-list/wish-list.component').then(c => c.WishListComponent),
        title: 'Lista de deseos',
    },
    {
        //user
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
    }

]