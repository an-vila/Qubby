import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  mostrarModal: boolean = false;
  newBox = {
    name: '',
    isProtected: false,
    pin: '',
  };

  constructor(private boxService: BoxService) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadBoxes();
  }

  loadBoxes() {
    this.boxService.getBoxes().subscribe({
      next: (boxesFromDjango) => {
        this.categories = boxesFromDjango.map((box) => ({
          ...box,
          isEditing: false,
          itemCount: box.itemCount || 0,
        }));
      },
      error: (err) => console.error('Error al cargar las cajas desde Django', err),
    });
  }

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

  // Ahora el botón "Nueva Caja" abre el modal
  handleNewCategory() {
    this.newBox = { name: '', isProtected: false, pin: '' };
    this.mostrarModal = true;
  }

  closeModal() {
    this.mostrarModal = false;
  }

  saveBox() {
    if (!this.newBox.name.trim()) return;

    this.boxService.createBox(this.newBox.name).subscribe({
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
      category.isEditing = true; // Esto activa el input de la tarjeta
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
    const confirmation = confirm('¿Estás seguro de que quieres eliminar esta caja?');
    if (confirmation) {
      this.boxService.deleteBox(id).subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== id);
        },
        error: (err) => console.error('Error al borrar la caja en Django', err),
      });
    }
  }
}
