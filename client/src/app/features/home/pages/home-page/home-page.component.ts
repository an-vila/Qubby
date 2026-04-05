import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SearchViewComponent } from '../../components/search-view/search-view.component';
import { SettingsViewComponent } from '../../components/settings-view/settings-view.component';
import { ViewSelectorComponent } from '../../components/view-selector/view-selector.component';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

import { BoxService } from '../../services/box.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    CategoryCardComponent,
    ViewSelectorComponent,
    BottomNavComponent,
    SearchViewComponent,
    SettingsViewComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  activeSection: 'inicio' | 'buscar' | 'ajustes' = 'inicio';
  viewMode: 'grid' | 'list' = 'grid';

  categories: any[] = [];
  searchQuery: string = '';

<<<<<<< HEAD
  mostrarModal: boolean = false;
  newBox = {
    name: '',
    isProtected: false,
    pin: '',
  };

  mostrarModalBorrado: boolean = false;
  categoriaParaBorrar: any = null;

  constructor(private boxService: BoxService) {}
=======
  constructor(private boxService: BoxService, private router: Router) {}
>>>>>>> origin/develop

  ngOnInit() {
    this.checkScreenSize();
    this.loadBoxes();
  }

  loadBoxes() {
    this.boxService.getBoxes().subscribe({
<<<<<<< HEAD
      next: (boxesFromDjango) => {
        this.categories = boxesFromDjango.map((box) => ({
          ...box,
          isEditing: false,
          itemCount: box.itemCount || 0,
        }));
      },
      error: (err) => {
        console.error('Error al cargar las cajas desde el servidor', err);
      },
    });
  }

=======
      next: (data: Box[]) => {
        this.categories = data;
      },
      error: (error: unknown) => console.error('Error al cargar las cajas', error),
    });
  }

  handleNewCategory() {
    if (this.categories.some((box) => box.isEditing && box.id === 0)) return;

    const nuevaCaja: Box = {
      id: 0,
      name: `Nueva Caja ${this.categories.length + 1}`,
      itemCount: 0,
      isEditing: true,
    };

    this.categories.unshift(nuevaCaja);

    // Pequeño truco para seleccionar el texto automáticamente y que el usuario empiece a teclear
    setTimeout(() => {
      const input = document.getElementById('edit-box-input-0') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }

  saveCategory(box: Box, newName: string) {
    if (!box.isEditing) return;

    const updatedName = newName.trim();

    if (!updatedName) {
      this.cancelEdit(box);
      return;
    }

    box.name = updatedName;
    box.isEditing = false;

    if (box.id === 0) {
      this.boxService.createBox(box.name).subscribe({
        next: (cajaReal: Box) => {
          this.categories = this.categories.map((box) => (box.id === 0 ? cajaReal : box));
        },
        error: (err: unknown) => {
          console.error('Error creating box', err);
          alert('Error al guardar la caja');
          this.categories = this.categories.filter((box) => box.id !== 0);
        },
      });
    } else {
      this.boxService.updateBox(box.id, box.name).subscribe({
        next: () => {
          console.log(`Caja ${box.id} actualizada correctamente`);
        },
        error: (err: unknown) => {
          console.error('Error al editar la caja', err);
          alert('Hubo un problema y no se guardó el cambio en el servidor.');
        },
      });
    }
  }

  cancelEdit(box: Box) {
    if (box.id === 0) {
      this.categories = this.categories.filter((box) => box.id !== 0);
    } else {
      box.isEditing = false;
    }
  }

  handleEditCategory(id: number) {
    const category = this.categories.find((box) => box.id === id);
    if (category) {
        category.isEditing = true;
    }
  }

  handleDeleteCategory(id: number) {
    if (!id) return;

    // En el futuro habria que hacer que se vea en una alerta nativa en vez de navegador
    const confirmar = confirm('¿Estás seguro de que quieres tirar esta caja a la basura?');

    if (confirmar) {
      this.boxService.deleteBox(id).subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== id);
        },
        error: (err: unknown) => {
          console.error('Error al borrar la caja:', err);
          alert('Hubo un problema y no se pudo borrar la caja.');
        },
      });
    }
  }

  handleOpenCategory(id: number) {
    this.router.navigate(['/home/box', id]);
  }

  //Logica de la UI

>>>>>>> origin/develop
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.viewMode = window.innerWidth < 768 ? 'list' : 'grid';
  }

  get filteredCategories() {
    return this.categories.filter((c) =>
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  onSectionChange(section: 'inicio' | 'buscar' | 'ajustes') {
    this.activeSection = section;
  }

  onViewChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  handleNewCategory() {
    this.newBox = { name: '', isProtected: false, pin: '' };
    this.mostrarModal = true;
  }

  closeModal() {
    this.mostrarModal = false;
  }

  saveBox() {
    if (!this.newBox.name.trim()) return;

    const boxData = {
      name: this.newBox.name,
      is_protected: this.newBox.isProtected,
      pin: this.newBox.isProtected ? this.newBox.pin : '',
    };

    this.boxService.createBox(boxData).subscribe({
      next: (createdBox) => {
        const newBoxView = {
          ...createdBox,
          isEditing: false,
          itemCount: 0,
        };

        this.categories.unshift(newBoxView);
        this.closeModal();
        this.searchQuery = '';
      },
      error: (err) => console.error('Error al crear la caja en Django', err),
    });
  }

  handleEditCategory(id: number) {
    const category = this.categories.find((c) => c.id === id);
    if (category) {
      category.isEditing = true;
    }
  }

  saveCategory(category: any, newName: string) {
    if (!category.isEditing) return;

    const cleanName = newName.trim();
    if (!cleanName) {
      this.cancelEdit(category);
      return;
    }

    this.boxService.updateBox(category.id, cleanName).subscribe({
      next: (updatedBox) => {
        category.name = updatedBox.name;
        category.isEditing = false;
      },
      error: (err) => {
        console.error('Error al actualizar el nombre en Django', err);
        category.isEditing = false;
      },
    });
  }

  cancelEdit(category: any) {
    category.isEditing = false;
  }


  handleDeleteCategory(id: number) {
    this.categoriaParaBorrar = this.categories.find((c) => c.id === id);
    if (this.categoriaParaBorrar) {
      this.mostrarModalBorrado = true;
    }
  }

  cerrarModalBorrado() {
    this.mostrarModalBorrado = false;
    this.categoriaParaBorrar = null;
  }


  confirmarBorrado() {
    if (!this.categoriaParaBorrar) return;
    const id = this.categoriaParaBorrar.id;

    this.boxService.deleteBox(id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== id);
        this.cerrarModalBorrado();
      },
      error: (err) => {
        console.warn('Error al borrar, pero actualizando vista localmente...');
        this.categories = this.categories.filter((c) => c.id !== id);
        this.cerrarModalBorrado();
      }
    });
  }
}