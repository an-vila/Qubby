import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ObjectCardComponent } from '../../components/object-card/object-card.component';
import { BoxService } from '../../services/box.service';

@Component({
  selector: 'app-box-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ObjectCardComponent, FormsModule],
  templateUrl: './box-detail-page.component.html',
  styleUrls: ['./box-detail-page.component.css'],
})
export class BoxDetailPageComponent implements OnInit {
  boxId: string | null = '';

  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  selectedObject: any = null;
  mostrarModalQR: boolean = false;
  isProtected: boolean = true;

  qrCodeUrl: string = '';
  loadingQR: boolean = false;

  // Datos de ejemplo
  objetos = [
    {
      id: 1,
      name: 'Cable HDMI',
      code: 'ELC-001',
      image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400',
      description: 'Cable HDMI 2.0 de alta velocidad, compatible con 4K a 60Hz...',
      tags: ['Cable', 'HDMI', '2m'],
      registrationDate: '15/01/2025',
      quantity: 3,
      status: 'Guardado',
    },
    {
      id: 2,
      name: 'Cargador USB-C',
      code: 'ELC-002',
      image: 'https://images.unsplash.com/photo-1726748398114-2f2260b6ddc5?w=400',
      description: 'Cargador rápido de 20W para móviles y tablets.',
      tags: ['Cargador', '20W'],
      registrationDate: '18/01/2025',
      quantity: 1,
      status: 'Prestado',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boxService: BoxService,
  ) {}

  ngOnInit() {
    this.boxId = this.route.snapshot.paramMap.get('id');
  }

  openModalQR() {
    this.mostrarModalQR = true;

    if (!this.qrCodeUrl && this.boxId) {
      this.loadingQR = true;

      this.boxService.getBoxQrCode(this.boxId).subscribe({
        next: (res) => {
          this.qrCodeUrl = res.qr_image;
          this.loadingQR = false;
        },
        error: (err) => {
          console.error('Error al generar el QR en Django', err);
          this.loadingQR = false;
        },
      });
    }
  }

  cerrarModalQR() {
    this.mostrarModalQR = false;
  }

  imprimirQR() {
    window.print();
  }

  eliminarCaja() {
    if (confirm('¿Seguro que quieres borrar toda la caja?')) {
      this.router.navigate(['/home']);
    }
  }

  abrirDetalles(obj: any) {
    this.selectedObject = obj;
  }

  cerrarDetalles() {
    this.selectedObject = null;
  }

  editarObjeto(obj: any) {
    alert('Editar objeto: ' + obj.name);
  }

  eliminarObjeto(obj: any) {
    if (confirm('¿Borrar ' + obj.name + ' de esta caja?')) {
      this.objetos = this.objetos.filter((o) => o.id !== obj.id);
      this.cerrarDetalles();
    }
  }
}
