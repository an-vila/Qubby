import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// Ajuste de ruta: subimos 2 niveles para salir de 'pages' y 'auth' y entrar en 'services'
import { AuthService } from '../../services/auth.service';
import { UiInputComponent } from '../../../../shared/ui/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, UiInputComponent, UiButtonComponent],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css'],
})
export class RegisterPageComponent {
  
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string = '';
  
  // NUEVO: Variable para controlar si mostramos el formulario o el mensaje de éxito
  isSuccess = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    // --- VALIDACIONES VISUALES ---
    const { password, confirmPassword } = this.registerForm.value;
    
    if (password !== confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      
      if (this.registerForm.get('email')?.hasError('email')) {
        this.errorMessage = 'El formato del correo electrónico no es válido';
        return;
      }
      
      if (this.registerForm.get('password')?.hasError('minlength')) {
        this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }

      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    // --- LÓGICA DE REGISTRO REAL ---
    this.errorMessage = ''; 

    // Llamamos al servicio
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // CAMBIO PRINCIPAL:
        // En lugar de this.router.navigate(...), activamos la bandera de éxito
        this.isSuccess = true; 
        this.errorMessage = ''; // Aseguramos que no haya errores visibles
      },
      error: (err) => {
        console.error('Error en registro:', err);
        // Aquí podrías personalizar el mensaje según el error del backend (ej: "Email ya existe")
        this.errorMessage = 'Ha ocurrido un error al registrarse. Inténtalo de nuevo.';
      }
    });
  }
}