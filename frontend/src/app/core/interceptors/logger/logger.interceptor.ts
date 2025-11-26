import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { catchError, throwError } from 'rxjs';

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {

  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error:HttpErrorResponse)=>{
      const errorMessage = getErrorMessage(error);
      toastService.error(errorMessage, 3000);
      return throwError(()=>error);
    })
  );
};


const getErrorMessage = (error: HttpErrorResponse): string => {
  if (error.status === 0) {
    return 'No hay conexion a internet';
  }
  if (error.error?.message) {
    return error.error.message;
  }
  switch (error.status) {
    case 400:
      return 'Datos invalidos, verifica la infomración';
    case 401:
      return 'Sesión expirada. Por favor inicie sesión nuevamente';
    case 403:
      return 'No tienes permisos para realizar esta acción';
    case 404:
      return 'Recurso no encontrado';
    case 409: 
      return 'El recurso ya existe o hay un conflicto';
    case 422: 
      return 'Error de validación';
    case 500: 
      return 'Error del servidor';
    case 503:
      return 'Servicio no disponible. Intente más tarde.';
    default:
      return `Error inesperado (${error.status}). Intente nuevamente`;
  }
}

// function getErrorMessage(){

// }
