<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ObjectCardComponent } from '../../components/object-card/object-card.component';
import { BoxService } from '../../services/box.service';
=======
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Item, Box } from '../../interfaces/home.interfaces';
import { ItemService } from '../../services/item.service';
import { BoxService } from '../../services/box.service';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
>>>>>>> origin/develop

@Component({
  selector: 'app-box-detail-page',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterLink, ObjectCardComponent, FormsModule],
=======
  imports: [CommonModule, FormsModule, ItemCardComponent],
>>>>>>> origin/develop
  templateUrl: './box-detail-page.component.html',
  styleUrls: ['./box-detail-page.component.css'],
})
export class BoxDetailPageComponent implements OnInit {
<<<<<<< HEAD
  boxId: string | null = '';

  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  selectedObject: any = null;
  mostrarModalQR: boolean = false;
  
  isProtected: boolean = false; 

  qrCodeUrl: string = '';
  loadingQR: boolean = false;

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

    if (this.boxId) {
      this.cargarDetallesCaja();
    }
  }


  cargarDetallesCaja() {
    if (!this.boxId) return;

    this.boxService.getBox(this.boxId).subscribe({
      next: (box: any ) => {
        this.isProtected = box.is_protected;
      },
      error: (err) => {
        console.error('Error al obtener los detalles de la caja:', err);
      }
    });
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
          console.error('Error al generar el QR en Django:', err);
          this.loadingQR = false;
=======

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private itemService = inject(ItemService);
  private boxService = inject(BoxService);

  boxId: number = 0;
  boxName: string = '';
  items: Item[] = [];
  isLoading: boolean = true;

  ngOnInit() {
    // Leer el :id de la URL (ej: /home/box/3)
    this.route.params.subscribe((params) => {
      this.boxId = +params['id']; // El '+' convierte string → number
      this.loadBox();
      this.loadItems();
    });
  }

  // --- CARGA DE DATOS ---

  loadBox() {
    // Usamos getBoxes y filtramos porque BoxService no tiene getById
    // Alternativa: podrías añadir un getBoxById() en box.service.ts
    this.boxService.getBoxes().subscribe({
      next: (boxes: Box[]) => {
        const box = boxes.find((b) => b.id === this.boxId);
        if (box) {
          this.boxName = box.name;
        } else {
          // La caja no existe o no te pertenece → volver al home
          this.router.navigate(['/home']);
        }
      },
      error: (err: unknown) => {
        console.error('Error cargando cajas:', err);
        this.router.navigate(['/home']);
      },
    });
  }

  loadItems() {
    this.isLoading = true;
    this.itemService.getItemsByBox(this.boxId).subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Error al cargar items:', err);
        this.isLoading = false;
      },
    });
  }

  // --- CRUD DE ITEMS ---

  handleNewItem() {
    // Evitar crear dos items temporales a la vez
    if (this.items.some((item) => item.isEditing && item.id === 0)) return;

    const nuevoItem: Item = {
      id: 0,
      name: '',
      description: '',
      box: this.boxId,
      isEditing: true,
    };

    this.items.unshift(nuevoItem);

    // Focus automático al input
    setTimeout(() => {
      const input = document.querySelector('.item-edit-input') as HTMLInputElement;
      if (input) input.focus();
    }, 50);
  }

  saveItem(item: Item, data: { name: string; description: string }) {
    if (!item.isEditing) return;

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      this.cancelEdit(item);
      return;
    }

    item.name = trimmedName;
    item.description = data.description?.trim() || '';
    item.isEditing = false;

    if (item.id === 0) {
      // CREAR nuevo item en el backend
      this.itemService
        .createItem({ name: item.name, description: item.description, box: this.boxId })
        .subscribe({
          next: (itemReal: Item) => {
            // Reemplazar el item temporal (id=0) por el real del servidor
            this.items = this.items.map((i) => (i.id === 0 ? itemReal : i));
          },
          error: (err: unknown) => {
            console.error('Error creando item:', err);
            alert('Error al guardar el objeto.');
            this.items = this.items.filter((i) => i.id !== 0);
          },
        });
    } else {
      // ACTUALIZAR item existente
      this.itemService.updateItem(item.id, { name: item.name, description: item.description }).subscribe({
        next: () => console.log(`Item ${item.id} actualizado`),
        error: (err: unknown) => {
          console.error('Error al editar item:', err);
          alert('No se pudo guardar el cambio.');
>>>>>>> origin/develop
        },
      });
    }
  }

<<<<<<< HEAD
  cerrarModalQR() {
    this.mostrarModalQR = false;
  }

  imprimirQR() {
    window.print();
  }


  eliminarCaja() {

    const confirmacion = confirm('¿Seguro que quieres borrar toda la caja y su contenido?');
    if (confirmacion) {
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
    // TODO: Implementar navegación a la página de edición o abrir modal
    console.log('Navegando a edición de:', obj.name);
  }

  eliminarObjeto(obj: any) {
    if (confirm(`¿Deseas eliminar "${obj.name}" definitivamente?`)) {
      this.objetos = this.objetos.filter((o) => o.id !== obj.id);
      this.cerrarDetalles();
    }
  }
}
=======
  cancelEdit(item: Item) {
    if (item.id === 0) {
      this.items = this.items.filter((i) => i.id !== 0);
    } else {
      item.isEditing = false;
    }
  }

  handleEditItem(id: number) {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.isEditing = true;
    }
  }

  handleDeleteItem(id: number) {
    if (!id) return;

    const confirmar = confirm('¿Eliminar este objeto?');
    if (confirmar) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.items = this.items.filter((i) => i.id !== id);
        },
        error: (err: unknown) => {
          console.error('Error al borrar item:', err);
          alert('No se pudo eliminar el objeto.');
        },
      });
    }
  }

  // --- NAVEGACIÓN ---

  goBack() {
    this.router.navigate(['/home']);
  }
}
>>>>>>> origin/develop
