import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, Subscription, tap } from 'rxjs';
import { Cart } from '../../types/Cart';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../toast/toast.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  // private baseUrl = 'http://localhost:3000/api/cart';
    private baseUrl = `${environment.BACK_URL}/api/cart`;
  

  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  private sub = new Subscription();

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private toastService: ToastService,
  ) {
    // suscribirse a cambios de usuario: cargar o limpiar carrito
    this.sub.add(
      this.authService.user$.pipe(
        switchMap(user => {
          if (!user) {
            this.cartSubject.next(null);
            return of(null);
          }
          const userId = user.decoded.userId;
          return this.getCartByUser(userId);
        })
      ).subscribe({
        next: (cart) => {
          this.cartSubject.next(cart);
        },
        error: (err) => {
          console.error('Error loading cart after auth change', err);
          this.cartSubject.next(null);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private getCurrentCart(): Cart | null {
    return this.cartSubject.getValue();
  }

  private getHeaders(): HttpHeaders | null {
    const token = this.authService.token;
    if (!token) return null;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // permitir carga manual desde AuthService si quieres
  loadCart(): void {
    const userId = this.authService.decodedToken?.userId;
    if (!userId) return;
    this.getCartByUser(userId).subscribe(cart => this.cartSubject.next(cart));
  }

  // Obtener carrito por usuario; si 404 -> crear uno vacío
  getCartByUser(userId: string): Observable<Cart | null> {
    const headers = this.getHeaders();
    if (!headers) return of(null);

    return this.httpClient.get<Cart>(`${this.baseUrl}/user/${userId}`, {
      headers,
      responseType: 'json' as const
    }).pipe(
      catchError((error) => {
        if (error?.status === 404) {
          // crear carrito vacío
          return this.httpClient.post<Cart>(`${this.baseUrl}`, { user: userId, products: [] }, {
            headers,
            responseType: 'json' as const
          }).pipe(
            catchError(err => {
              console.error('Error creating cart after 404', err);
              return of(null);
            })
          );
        }
        console.error('Error fetching cart:', error);
        return of(null);
      })
    );
  }

  // Agregar producto (usa token y recarga carrito)
  addToCart(productId: string, quantity: number = 1): Observable<Cart | null> {
    const headers = this.getHeaders();
    if (!headers) {
      this.toastService.error('Registrate para agregar al carrito', 5000);
      console.log('Usuario no autenticado');
      return of(null);
    }

    const payload = { productId, quantity };
    return this.httpClient.post<Cart>(`${this.baseUrl}/add-product`, payload, {
      headers,
      responseType: 'json' as const
    }).pipe(
      switchMap(() => {
        const userId = this.authService.decodedToken?.userId;
        if (!userId) return of(null);
        return this.getCartByUser(userId);
      }),
      tap(updatedCart => {
        if (updatedCart) {
          this.toastService.success('Producto agregado al carrito');
          this.cartSubject.next(updatedCart);
        }
      }),
      catchError(err => {
        console.error('Error al agregar al carrito:', err);
        return of(null);
      })
    );
  }

  // Actualizar cantidad (construye products array y hace PUT)
  setProductQuantity(productId: string, quantity: number) {
    const cart = this.getCurrentCart();
    if (!cart) return of(null);

    const updatedProducts = cart.products.map(p => {
      const id = typeof p.product === 'string' ? p.product : p.product._id;
      if (id === productId) return { product: id, quantity };
      return { product: id, quantity: p.quantity };
    });

    const headers = this.getHeaders();
    if (!headers) return of(null);

    return this.httpClient.put<Cart>(`${this.baseUrl}/${(cart as any)._id}`, { user: (cart as any).user._id ?? (cart as any).user, products: updatedProducts }, {
      headers,
      responseType: 'json' as const
    }).pipe(
      tap(updated => {
        if (updated) this.cartSubject.next(updated);
      }),
      catchError(err => {
        console.error('Error updating cart quantity', err);
        return of(null);
      })
    );
  }

  // remove product
  removeProductFromCart(productId: string) {
    const cart = this.getCurrentCart();
    if (!cart) return of(null);

    const updatedProducts = cart.products.filter(p => {
      const id = typeof p.product === 'string' ? p.product : p.product._id;
      return id !== productId;
    }).map(p => ({ product: typeof p.product === 'string' ? p.product : p.product._id, quantity: p.quantity }));

    const headers = this.getHeaders();
    if (!headers) return of(null);

    return this.httpClient.put<Cart>(`${this.baseUrl}/${(cart as any)._id}`, { user: (cart as any).user._id ?? (cart as any).user, products: updatedProducts }, {
      headers,
      responseType: 'json' as const
    }).pipe(
      tap(updated => {
        if (updated) this.cartSubject.next(updated);
      }),
      catchError(err => {
        console.error('Error removing product from cart', err);
        return of(null);
      })
    );
  }

  // empty cart
  emptyCart() {
    const cart = this.getCurrentCart();
    if (!cart) return of(null);

    const headers = this.getHeaders();
    if (!headers) return of(null);

    return this.httpClient.put<Cart>(`${this.baseUrl}/${(cart as any)._id}`, { user: (cart as any).user._id ?? (cart as any).user, products: [] }, {
      headers,
      responseType: 'json' as const
    }).pipe(
      tap(updated => {
        if (updated) this.cartSubject.next(updated);
      }),
      catchError(err => {
        console.error('Error emptying cart', err);
        return of(null);
      })
    );
  }

  get cartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        if (!cart || !cart.products) {
          return 0;
        }
        return cart.products.reduce((total, item) => total + (item.quantity ?? 0), 0);
      })
    );
  }

}
