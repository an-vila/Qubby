import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// Interfaces
import { Item, Box } from '../../interfaces/home.interfaces';

// Services
import { ItemService } from '../../services/item.service';
import { BoxService } from '../../services/box.service';

// Components
import { ItemCardComponent } from '../../components/item-card/item-card.component';
import { ObjectCardComponent } from '../../components/object-card/object-card.component';

@Component({
  selector: 'app-box-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ItemCardComponent, ObjectCardComponent],
  templateUrl: './box-detail-page.component.html',
  styleUrls: ['./box-detail-page.component.css'],
})
export class BoxDetailPageComponent implements OnInit {
  // === ESTADO DE LA CAJA ===
  boxId: number = 0;
  boxName: string = '';
  isProtected: boolean = false;

  // === ESTADO DE LOS OBJETOS (ITEMS) ===
  items: Item[] = [];
  isLoading: boolean = true;

  // === FILTROS Y VISTAS ===
  searchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';

  // === PANEL DE DETALLES LATERAL ===
  selectedObject: any = null;

  // === MODAL QR ===
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
    // Usamos subscribe para detectar cambios en la URL dinámicamente
    this.route.params.subscribe((params) => {
      this.boxId = +params['id'];
      if (this.boxId) {
        this.loadBox();
        this.loadItems();
      }
    });
  }

  // ----------------------------------------------------------------------
  // LÓGICA DE LA CAJA
  // ----------------------------------------------------------------------

  loadBox() {
    this.boxService.getBox(this.boxId).subscribe({
      next: (box: any) => {
        this.boxName = box.name || `Caja ${this.boxId}`;
        this.isProtected = box.is_protected;
      },
      error: (err) => {
        console.error('Error al obtener los detalles de la caja:', err);
        this.router.navigate(['/home']);
      },
    });
  }

  eliminarCaja() {
    const confirmacion = confirm('¿Seguro que quieres borrar toda la caja y su contenido?');
    if (confirmacion) {
      // TODO: Añadir this.boxService.deleteBox(this.boxId) cuando lo tengas
      this.router.navigate(['/home']);
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  // ----------------------------------------------------------------------
  // LÓGICA DEL CÓDIGO QR
  // ----------------------------------------------------------------------

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

  // ----------------------------------------------------------------------
  // LÓGICA DE LOS OBJETOS (CRUD EN BASE DE DATOS)
  // ----------------------------------------------------------------------

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

  handleNewItem() {
    // Evitar que se creen múltiples objetos vacíos a la vez
    if (this.items.some((item) => item.isEditing && item.id === 0)) return;

    const nuevoItem: Item = {
      id: 0,
      name: '',
      description: '',
      box: this.boxId,
      isEditing: true,
    };

    this.items.unshift(nuevoItem); // Añadir al principio

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
      // Crear nuevo en la BBDD
      this.itemService
        .createItem({ name: item.name, description: item.description, box: this.boxId })
        .subscribe({
          next: (itemReal: Item) => {
            // Reemplazamos el item temporal (id=0) por el real de Django
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
      this.itemService
        .updateItem(item.id, { name: item.name, description: item.description })
        .subscribe({
          next: () => {
            // Si el objeto modificado estaba abierto en los detalles, lo actualizamos ahí también
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
      this.items = this.items.filter((i) => i.id !== 0); // Borrar si era nuevo
    } else {
      item.isEditing = false; // Solo quitar modo edición
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

    const confirmar = confirm('¿Eliminar este objeto permanentemente?');
    if (confirmar) {
      this.itemService.deleteItem(id).subscribe({
        next: () => {
          this.items = this.items.filter((i) => i.id !== id);
          // Si estaba abierto en el panel de detalles, lo cerramos
          if (this.selectedObject && this.selectedObject.id === id) {
            this.cerrarDetalles();
          }
        },
        error: (err: unknown) => {
          console.error('Error al borrar item:', err);
          alert('No se pudo eliminar el objeto.');
        },
      });
    }
  }

  // ----------------------------------------------------------------------
  // LÓGICA DEL PANEL LATERAL DE DETALLES (Sidebar)
  // ----------------------------------------------------------------------

  abrirDetalles(obj: any) {
    this.selectedObject = obj;
  }

  cerrarDetalles() {
    this.selectedObject = null;
  }

  // Funciones puente por si el HTML llama a estas funciones desde el panel lateral
  editarObjeto(obj: any) {
    this.handleEditItem(obj.id);
    this.cerrarDetalles(); // Cierra el panel lateral para permitir edición inline
  }

  eliminarObjeto(obj: any) {
    this.handleDeleteItem(obj.id);
  }
}
