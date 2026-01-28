import { Component, OnInit } from '@angular/core'; // Añadimos OnInit
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// Añadimos ActivatedRoute para leer la URL
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
export class LoginPageComponent implements OnInit {
  
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string = '';
  infoMessage: string = ''; // <--- NUEVA variable para mensajes verdes (éxito)

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // <--- Inyectamos esto para leer la URL
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  // Usamos ngOnInit para revisar la URL nada más cargar la página
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.infoMessage = '✅ Registro exitoso. Por favor, revisa tu correo para activar la cuenta.';
        
        // Opcional: Limpiar la URL para que si recarga no salga el mensaje otra vez
        // this.router.navigate([], { replaceUrl: true });
      }
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
    this.infoMessage = ''; // Limpiamos el mensaje de éxito si intenta loguearse

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.user.activated) {
          this.router.navigate(['/home']); 
        } else {
          this.errorMessage = 'Debes activar tu cuenta desde el correo antes de entrar.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }
    });
  }
}