import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';
import { UiInputComponent } from '../../../../shared/ui/ui-input/ui-input.component';
import {
  FormBuilder,
  FormGroup,
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
      const emailControl = this.recoveryForm.get('email');
      
      if (emailControl?.hasError('email')) {
        this.errorMessage = 'El formato del correo electrónico no es válido';
      } else if (emailControl?.hasError('required')) {
        this.errorMessage = 'Debes introducir un correo electrónico.';
      }

      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const email = this.recoveryForm.get('email')?.value;

    this.authService.requestPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;
        this.recoveryForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Ha habido un error de conexión. Inténtalo más tarde';
      },
    });
  }
}