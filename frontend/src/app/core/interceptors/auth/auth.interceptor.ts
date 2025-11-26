import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { catchError, of, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.token ?? '';
  const headers = new HttpHeaders({
    'Content-Type':'application/json',
    Authorization: `Bearer ${token}`
  })
  const newReq =req.clone({headers});

  return next(newReq).pipe(
    catchError((error)=>{
      console.log(error)
      if (error.status===403 && error.error.message === 'Forbidden') {
        const refreshToken = authService.refreshStorageToken ?? '';
        return authService.refreshToken(refreshToken).pipe(

          switchMap((res:any)=>{
            const newReq = req.clone({setHeaders:{Authorization:`Bearer ${res.token}`}});
            localStorage.setItem('token', res.token);
            return next(newReq)
          })
        )
      }
      return throwError(()=>error)
      
    })
  );
};


