import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormErrorService {

  getFieldError(form: FormGroup, fieldName: string, customLabels?: Record<string, string>): string {
    const control = form.get(fieldName);

    if (!control || !(control.touched || control.dirty)) {
      return '';
    }

    const errors = control.errors;
    if (!errors) {
      return '';
    }

    const label = customLabels?.[fieldName] || ' ';

    if (errors['required']) {
      return `${label} es requerido`;
    }

    if (errors['email']) {
      return `${label} debe ser un email válido`;
    }

    if (errors['minlength']) {
      return `${label} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      return `${label} no puede tener más de ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['pattern']) {
      return `${label} tiene formato inválido`;
    }

    if (errors['min']) {
      return `${label} debe ser mayor o igual a ${errors['min'].min}`;
    }

    if (errors['max']) {
      return `${label} debe ser menor o igual a ${errors['max'].max}`;
    }

    if (errors['emailTaken']) {
      return 'Este email ya está registrado';
    }

    if (errors['invalid_phone']) {
      return 'El teléfono debe tener 10 dígitos';
    }

    if (errors['doesnt_match']) {
      return 'Las contraseñas no coinciden';
    }

    if (errors['cantFetch']) {
      return 'Error del servidor, intente más tarde';
    }

    return `${label} contiene un error`;
  }

}