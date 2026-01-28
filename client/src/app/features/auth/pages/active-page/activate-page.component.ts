import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-activate-page',
  standalone: true,   // El componente es independiente, no depende de un AppModule
  imports: [],    
  templateUrl: './activate-page.component.html',
  styleUrls: ['./activate-page.component.css']
})
export class ActivatePageComponent implements OnInit {

  // Propiedades para gestionar el estado de la vista
  token: string | null = null; // Guardará el código de activación que viene en la URL
  activated = false;           // Cambia a true si el proceso de activación es correcto

  constructor(
    private route: ActivatedRoute, // Inyectamos el servicio para leer datos de la URL actual
    private router: Router          // Inyectamos el servicio para navegar a otras páginas
  ) {}

  // Este método se ejecuta justo después de que el componente se carga
  ngOnInit(): void {
    // Extraemos el parámetro 'token' de la URL (ejemplo: ?token=abc123)
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (this.token) {
      // Simulación de éxito: Aquí conectarás con tu API 
      console.log('Token recibido:', this.token);
      this.activated = true; // Al ser true, el HTML mostrará el mensaje de éxito
    }
  }

  // Método para redirigir al usuario al Login de Qubby
  goToLogin() {
    this.router.navigate(['/auth/login']); // Redirige a la ruta definida en auth.routes.ts
  }
}