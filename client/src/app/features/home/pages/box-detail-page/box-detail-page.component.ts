import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Item, Box } from '../../interfaces/home.interfaces';
import { ItemService } from '../../services/item.service';
import { BoxService } from '../../services/box.service';
import { ItemCardComponent } from '../../components/item-card/item-card.component';

@Component({
  selector: 'app-box-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemCardComponent],
  templateUrl: './box-detail-page.component.html',
  styleUrls: ['./box-detail-page.component.css'],
})
export class BoxDetailPageComponent implements OnInit {

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

  // --- NAVEGACIÓN ---

  goBack() {
    this.router.navigate(['/home']);
  }
}
