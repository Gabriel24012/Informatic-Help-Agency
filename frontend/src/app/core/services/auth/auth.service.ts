import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ToastService } from '../toast/toast.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { tokenSchema } from '../../types/Token';
import { environment } from '../../../../environments/environment';

export type decodedToken = {
  userId: string;
  displayName: string;
  role: 'admin' | 'customer' | 'guest';
};

export interface AuthUser {
  token: string;
  refreshToken?: string;
  decoded: decodedToken;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  // baseUrl = 'http://localhost:3000/api';
  baseUrl = `${environment.BACK_URL}/api`;


  private authSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  user$ = this.userSubject.asObservable();

  auth$: Observable<boolean>;

  isAuth() {
    return this.authSubject.value;
  }

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private toast: ToastService,
  ) {
    this.authSubject.next(!!this.token);
    this.auth$ = this.authSubject.asObservable();
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<decodedToken>(token);
      this.userSubject.next({
        token,
        decoded,
        refreshToken: localStorage.getItem('refreshToken') ?? undefined,
      });
      // No llamar cartService aquí (evita dependencia circular).
      // CartService se suscribe a user$ y cargará el carrito automáticamente.
    }
  }

  get token(): string | null {
    return this.userSubject.value?.token ?? null;
  }

  get decodedToken(): decodedToken | null {
    return this.userSubject.value?.decoded ?? null;
  }

  get refreshStorageToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  register(data: any) {
    return this.httpClient.post(`${this.baseUrl}/auth/register`, data).subscribe({
      next: () => {
        this.toast.success('Cuenta creada correctamente', 3000);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const backendErrors = err?.error?.errors;
        if (backendErrors && backendErrors.length > 0) {
          this.toast.error(backendErrors[0].msg, 4000);
        } else {
          const msg = err?.error?.message ?? 'Error al registrar';
          this.toast.error(msg, 4000);
        }
        console.error('Register error', err);
      }
    });
  }

  login(data: any) {
    return this.httpClient.post(`${this.baseUrl}/auth/login`, data).subscribe({
      next: (raw: any) => {
        const mapped = {
          token: raw?.token ?? raw?.accessToken ?? raw?.access_token ?? '',
          refreshToken: raw?.refreshToken ?? raw?.refresh_token ?? undefined,
        };

        const parsed = tokenSchema.safeParse(mapped);
        if (!parsed.success) throw new Error('Respuesta inválida del servidor');

        const decoded = jwtDecode<decodedToken>(parsed.data.token);
        const user: AuthUser = { ...parsed.data, decoded };

        localStorage.setItem('token', user.token);
        if (user.refreshToken) localStorage.setItem('refreshToken', user.refreshToken);

        this.userSubject.next(user);
        this.toast.success(`¡Bienvenido ${decoded.displayName}!`, 3000);
        this.authSubject.next(true);

        // NO llamar cartService aquí. CartService escucha user$ y recargará automáticamente.

        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error de autenticación';
        this.toast.error(msg, 4000);
        console.error('Login error', err);
      }
    });
  }

  logout(redirect = '/') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
    this.authSubject.next(false);
    this.toast.success('Sesión cerrada', 2500);
    this.router.navigate([redirect]);
  }

  refreshToken(refreshToken: string) {
    return this.httpClient.post(`${this.baseUrl}/auth/refresh-token`, { token: refreshToken });
  }

  checkEmailExist(email: string) {
    return this.httpClient.get<{ exists: boolean }>(`${this.baseUrl}/auth/check-email`, { params: { email } });
  }



}
