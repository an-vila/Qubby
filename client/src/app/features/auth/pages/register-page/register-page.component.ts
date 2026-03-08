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
import { RegisterRequest } from '../../interfaces/auth.interfaces';

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
    const { name, email, password, confirmPassword } = this.registerForm.value;
    
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

    this.errorMessage = ''; 

    const registerInfo: RegisterRequest = { 
      name: name, 
      email: email, 
      password: password
    };

    console.log(registerInfo)

    this.authService.register(registerInfo).subscribe({
      next: (response) => {

        this.isSuccess = true; 
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error en registro:', err);
        
        if (err.status === 400 && err.error) {
          const errors = err.error;
          
          if (errors.email) {
            this.errorMessage = errors.email[0] || 'Este email ya está registrado.';
          }
          else if (errors.name) {
            this.errorMessage = errors.name[0] || 'Este nombre de usuario ya existe.';
          }
          else {
            this.errorMessage = 'Error al registrarse. Por favor, revisa los datos.';
          }
        } else {
          this.errorMessage = 'Ha ocurrido un error al registrarse. Inténtalo de nuevo.';
        }
      }
    });
  }
}