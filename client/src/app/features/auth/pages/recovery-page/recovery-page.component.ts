import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../../../shared/ui/ui-input/ui-input.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recovery-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UiInputComponent,
    UiButtonComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './recovery-page.component.html',
  styleUrls: ['./recovery-page.component.css'],
})
export class RecoveryPageComponent {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  recoveryForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      if (this.recoveryForm.get('email')?.hasError('email')) {
        this.errorMessage = 'El formato del correo electrónico no es válido';
      } else if (this.recoveryForm.get('email')?.hasError('required')) {
        this.errorMessage = 'Debes introducir un correo electrónico.';
      }

      return;
    }

    const email = this.recoveryForm.get('email')?.value;

    this.authService.requestPassword(email).subscribe({
      next: (response) => {
        this.successMessage = response.message;

        this.recoveryForm.reset();
      },

      // Error que solo salta si por lo que sea no funciona el backend
      error: (error) => {
        this.errorMessage = 'Ha habido un error de conexion. Intentalo más tarde';
      },
    });
  }
}
