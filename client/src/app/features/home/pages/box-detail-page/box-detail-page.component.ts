import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Item, Box } from '../../interfaces/home.interfaces';
import { ItemService } from '../../services/item.service';
import { BoxService } from '../../services/box.service';
import { ObjectCardComponent } from '../../components/object-card/object-card.component';

@Component({
  selector: 'app-box-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ObjectCardComponent, RouterLink],
  templateUrl: './box-detail-page.component.html',
  styleUrls: ['./box-detail-page.component.css'],
})
export class BoxDetailPageComponent implements OnInit {
  boxId: number = 0;
  boxName: string = '';
  isProtected: boolean = false;

  items: Item[] = [];
  isLoading: boolean = true;

  searchControl = new FormControl('');

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

  get filteredItems() {
    const query = (this.searchControl.value || '').toLowerCase();
    return this.items.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)),
    );
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
      next: (data: any) => {
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
    this.router.navigate(['/box', this.boxId, 'add']);
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

  deleteBox() {
    const confirmacion = confirm('¿Seguro que quieres borrar toda la caja y su contenido?');
    if (confirmacion) {
      this.router.navigate(['/home']);
    }
  }

  openDetails(obj: any) {
    this.selectedObject = obj;
  }

  closeDetails() {
    this.selectedObject = null;
  }

  editarObjeto(obj: any) {
    this.closeDetails();
    this.router.navigate(['/box', this.boxId, 'edit', obj.id]);
  }

  eliminarObjeto(obj: any) {
    this.handleDeleteItem(obj.id);
  }
}
