import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas básicas
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // <--- Importamos tu servicio

@Component({
  selector: 'app-activate-page',
  standalone: true,
  // Importamos los módulos necesarios para el HTML
  imports: [CommonModule, RouterModule],
  templateUrl: './activate-page.component.html',
  styleUrls: ['./activate-page.component.css'],
})
export class ActivatePageComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message: string = 'Verificando tu cuenta...';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];

      if (token) {
        this.verifyToken(token);
      } else {
        this.status = 'error';
        this.message = 'No se ha podido activar tu cuenta. Sentimos las moelestias.';
        return;
      }
    });
  }

  verifyToken(token: string) {
    const data = { token };

    this.authService.activateAccount(data).subscribe({
      next: (response) => {
        this.status = 'success';
        this.message = '´¡Cuenta activada! Puedes iniciar sesión para empezar a usar Qubby.';
      },
      error: (error) => {
        this.status = 'error';
        this.message = 'El enlace no es válido o ha caducado';
      },
    });
  }
}
