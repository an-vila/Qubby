import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas básicas
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <--- Importamos tu servicio
import { UiButtonComponent } from '../../../../shared/ui/ui-button/ui-button.component'; // <--- Tu botón naranja

@Component({
  selector: 'app-activate-page',
  standalone: true,
  // Importamos los módulos necesarios para el HTML
  imports: [CommonModule, RouterModule, UiButtonComponent], 
  templateUrl: './activate-page.component.html',
  styleUrls: ['./activate-page.component.css']
})
export class ActivatePageComponent implements OnInit {

  // En lugar de true/false, usamos 3 estados para controlar qué mostramos
  status: 'loading' | 'success' | 'error' = 'loading';
  message: string = 'Verificando tu cuenta...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService // <--- Inyectamos el cerebro
  ) {}

  ngOnInit(): void {
    // 1. Leemos el token de la URL
    // Usamos 'subscribe' por si la URL cambia dinámicamente, es más seguro que 'snapshot'
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (!token) {
        this.status = 'error';
        this.message = 'No se ha encontrado el código de activación.';
        return;
      }

      // 2. Llamamos al servicio para confirmar
      this.confirmActivation(token);
    });
  }

  confirmActivation(token: string) {
    // Aquí el servicio (aunque sea Mock) nos dirá si todo está bien
    this.authService.activateAccount(token).subscribe({
      next: () => {
        this.status = 'success';
        this.message = '¡Tu cuenta ha sido activada correctamente!';
      },
      error: () => {
        this.status = 'error';
        this.message = 'El enlace ha caducado o no es válido.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}