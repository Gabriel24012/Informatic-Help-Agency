import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { take } from 'rxjs';
import { ToastService } from '../../services/toast/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService)
  /// 1,54,7562,42,454656,565
  // authService.auth$.pipe(
  //   take(1),
  // ).subscribe({
  //   next: (data) => {
  //     if (data) {
  //       return true;
  //     }
  //     else{
  //       return false;
  //     }
  // }, error: () => {
  //   return false;
  // } });
  const router = inject(Router)
  if (authService.isAuth()) {
    return true
  }
  router.navigateByUrl('/login');
  toastService.error(' Inicia sesión o regístrate',3000)
  return false;

};
