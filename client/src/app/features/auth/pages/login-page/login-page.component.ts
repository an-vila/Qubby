import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { UiInputComponent } from '../../../../shared/ui/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    UiInputComponent,
    UiButtonComponent
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage: string = '';
  infoMessage: string = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.isLoading = true;

    const data = this.loginForm.value

    this.authService.login(data).subscribe({
      next: (response) => {
        if (response.user.activated) {
          this.router.navigate(['/home']); 
        } else {
          this.errorMessage = 'Debes activar tu cuenta desde el correo antes de entrar.';
        }
      },
      // TODO: Ajustar los errores cuando el backend este acabado
      error: (err) => {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }
    });
  }
}