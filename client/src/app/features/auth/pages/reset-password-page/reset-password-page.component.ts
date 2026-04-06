import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../../../shared/ui/ui-input/ui-input.component';

@Component({
  selector: 'app-reset-password.component',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UiButtonComponent, UiInputComponent],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.css',
})
export class ResetPasswordPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  message: string = '';

  uid: string = '';
  token: string = '';
  showPassword: boolean = false;

  resetForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.uid = params['uid']
      this.token = params['token'];

      if (!this.token) {
        this.status = 'error';
        this.message = 'Enlace no válido.';
      } else {
        this.status = 'idle';
      }
    });
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mismatch: true };
  }
  
  onSubmit(): void {
    const { password, confirmPassword } = this.resetForm.value;

    if (password !== confirmPassword) {
      this.message = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.resetForm.invalid) {
      this.status = 'error';
      this.message = 'Todos los campos son obligatorios';
      this.resetForm.markAllAsTouched();
      return;
    }

    if (this.resetForm.get('password')?.hasError('minlength')) {
      this.message = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    const requestData = {
      uid: this.uid,
      token: this.token,
      new_password: this.resetForm.get('password')?.value || '',
    };

    this.authService.resetPassword(requestData).subscribe({
      next: () => {
        this.status = 'success';
        this.message = '¡Contraseña restablecida correctamente!';
        this.resetForm.disable();
      },

      error: (error) => {
        this.status = 'error';
        if (error.status === 400 || error.status === 404) {
          this.message = 'El enlace ha caducado o ya fue utilizado. Solicita uno nuevo.';
        } else {
          this.message = 'Ocurrió un error inesperado. Inténtalo más tarde.';
        }
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
