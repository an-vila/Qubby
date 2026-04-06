import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Item, Box } from '../../interfaces/home.interfaces';
import { ItemService } from '../../services/item.service';
import { BoxService } from '../../services/box.service';
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { ObjectCardComponent } from '../../components/object-card/object-card.component';


@Component({
  selector: 'app-box-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemCardComponent, ObjectCardComponent],
  templateUrl: './box-detail-page.component.html',
  styleUrls: ['./box-detail-page.component.css'],
})
export class BoxDetailPageComponent implements OnInit {
  boxId: number = 0;
  boxName: string = '';
  isProtected: boolean = false;

  items: Item[] = [];
  isLoading: boolean = true;

  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  selectedObject: any = null;

  mostrarModalQR: boolean = false;
  qrCodeUrl: string = '';
  loadingQR: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boxService: BoxService,
    private itemService: ItemService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.boxId = +params['id'];
      if (this.boxId) {
        this.loadBox();
        this.loadItems();
      }
    });
  }

  loadBox() {
    this.boxService.getBox(this.boxId).subscribe({
      next: (box: any) => {
        this.boxName = box.name;
        this.isProtected = box.is_protected;
      },
      error: (err) => {
        console.error('Error al obtener los detalles de la caja:', err);
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

  openModalQR() {
    this.mostrarModalQR = true;

    if (!this.qrCodeUrl && this.boxId) {
      this.loadingQR = true;

      this.boxService.getBoxQrCode(this.boxId).subscribe({
        next: (res: any) => {
          this.qrCodeUrl = res.qr_image;
          this.loadingQR = false;
        },
        error: (err: any) => {
          console.error('Error al generar el QR en Django:', err);
          this.loadingQR = false;
        },
      });
    }
  }

  closeModalQR() {
    this.mostrarModalQR = false;
  }

  printQR() {
    window.print();
  }

  handleNewItem() {
    if (this.items.some((item) => item.isEditing && item.id === 0)) return;

    const nuevoItem: Item = {
      id: 0,
      name: '',
      description: '',
      box: this.boxId,
      // Valores por defecto para los nuevos campos
      code: `OBJ-${Math.floor(Math.random() * 10000)}`, // Genera un código aleatorio temporal
      image: '',
      tags: [],
      registrationDate: new Date().toLocaleDateString('es-ES'),
      quantity: 1,
      status: 'Guardado',

      isEditing: true,
    };

    this.items.unshift(nuevoItem);

    setTimeout(() => {
      const input = document.querySelector('.item-edit-input') as HTMLInputElement;
      if (input) input.focus();
    }, 50);
  }

  saveItem(item: Item, data?: any) {
    if (!item.isEditing) return;

    // Si pasamos 'data' desde la vista de lista/grid, lo usamos.
    // Si no, cogemos lo que ya tiene el 'item' vinculado por ngModel.
    const finalName = data?.name ? data.name.trim() : item.name.trim();

    if (!finalName) {
      this.cancelEdit(item);
      return;
    }

    // Actualizamos el objeto local antes de enviarlo
    item.name = finalName;
    item.description = data?.description ? data.description.trim() : item.description;
    item.isEditing = false;

    // Creamos el "Paquete" (payload) completo para el Backend
    const itemPayload = {
      name: item.name,
      description: item.description,
      box: this.boxId,
      code: item.code || '',
      image: item.image || '',
      tags: item.tags || [],
      registrationDate: item.registrationDate,
      quantity: item.quantity || 1,
      status: item.status || 'Guardado',
    };

    if (item.id === 0) {
      // Crear nuevo en la BBDD
      this.itemService.createItem(itemPayload).subscribe({
        next: (itemReal: Item) => {
          this.items = this.items.map((i) => (i.id === 0 ? itemReal : i));
        },
        error: (err: unknown) => {
          console.error('Error creando item:', err);
          alert('Error al guardar el objeto.');
          this.items = this.items.filter((i) => i.id !== 0);
        },
      });
    } else {
      // Actualizar existente
      this.itemService.updateItem(item.id, itemPayload).subscribe({
        next: () => {
          if (this.selectedObject && this.selectedObject.id === item.id) {
            this.selectedObject = { ...item };
          }
        },
        error: (err: unknown) => {
          console.error('Error al editar item:', err);
          alert('No se pudo guardar el cambio.');
        },
      });
    }
  }

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

  goBack() {
    this.router.navigate(['/home']);
  }

  eliminarCaja() {
    const confirmacion = confirm('¿Seguro que quieres borrar toda la caja y su contenido?');
    if (confirmacion) {
      this.router.navigate(['/home']);
    }
  }
}
