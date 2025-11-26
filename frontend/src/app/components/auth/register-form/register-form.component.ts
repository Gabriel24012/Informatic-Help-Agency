import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormFieldComponent, CommonModule, RouterModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css',
})
export class RegisterFormComponent {
  imagePreview: string = '';

  fb = inject(FormBuilder);
  registerForm: FormGroup;

  fields = [
    { label: 'Nombre de usuario', fieldId: 'displayName', type: 'text', placeholder: 'Nombre', required: true },
    { label: 'Fecha de nacimiento', fieldId: 'dateOfBirth', type: 'date', placeholder: '', required: true },
    { label: 'Email', fieldId: 'email', type: 'email', placeholder: 'example@example.com', required: true },
    { label: 'Teléfono', fieldId: 'phone', type: 'text', placeholder: '1234567890', required: true },
    { label: 'Contraseña', fieldId: 'password', type: 'password', placeholder: '*******', required: true },
    { label: 'Repetir contraseña', fieldId: 'repeatPassword', type: 'password', placeholder: '*******', required: true },
  ];

  constructor(private authService: AuthService) {
    this.registerForm = this.fb.group(
      {
        displayName: ['', [Validators.required]],
        email: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/)
          ],
          [this.emailAsycValidator()]
        ]

        ,
        phone: ['', [Validators.required, this.phoneValidator()]],
        dateOfBirth: ['', [Validators.required]],
        avatar: [''],
        password: ['', [Validators.required]],
        repeatPassword: ['', [Validators.required]],
      },
      {
        validators: this.matchPasswordValidator('password', 'repeatPassword'),
      }
    );
  }

  onImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files && target.files.length > 0 ? target.files[0] : null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // opcional: mostrar toast de error aquí si tienes ToastService
      console.warn('Imagen muy grande');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview = e.target?.result as string;
      // actualiza el control avatar con base64 para enviarlo en payload
      this.registerForm.get('avatar')?.setValue(this.imagePreview);
    };
    reader.readAsDataURL(file);
  }

  matchPasswordValidator(passwordField: string, repeatPasswordField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = (formGroup as FormGroup).get(passwordField)?.value;
      const repeatPassword = (formGroup as FormGroup).get(repeatPasswordField)?.value;
      return password === repeatPassword ? null : { doesnt_match: true };
    };
  }

  phoneValidator(): ValidatorFn {
    return (formControl: AbstractControl): ValidationErrors | null => {
      const phoneValue = formControl.value ?? '';
      if (phoneValue.toString().length !== 10 || Number.isNaN(+phoneValue)) {
        return { invalid_phone: true };
      }
      return null;
    };
  }

  emailAsycValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return of(control.value).pipe(
        debounceTime(300),
        switchMap((value: string) =>
          this.authService.checkEmailExist(value).pipe(
            switchMap(res => (res.exists ? of({ emailTaken: true }) : of(null))),
            catchError(() => of({ cantFetch: true }))
          )
        )
      );
    };
  }


  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.touched) return '';
    if (control.hasError('required')) return 'Este campo es requerido';
    if (control.hasError('email')) return 'Email no válido';
    if (control.hasError('emailTaken')) return 'Este usuario ya existe';
    if (control.hasError('cantFetch')) return 'Error del servidor, intente en otro momento';
    if (control.hasError('invalid_phone')) return 'Teléfono no válido';
    if ((controlName === 'password' || controlName === 'repeatPassword') && this.registerForm.hasError('doesnt_match')) {
      return 'Las contraseñas deben ser iguales';
    }
    return '';
  }

  handleSubmit() {
    if (this.registerForm.invalid) return;

    const payload = { ...this.registerForm.value };
    delete payload.repeatPassword; // backend no necesita repeatPassword

    // si avatar está vacío elimina la propiedad
    if (!payload.avatar) delete payload.avatar;

    // Llamada al servicio
    this.authService.register(payload);
  }
}
