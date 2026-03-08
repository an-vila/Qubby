import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Box } from '../../interfaces/home.interfaces';
import { BoxService } from '../../services/box.service';

import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SearchViewComponent } from '../../components/search-view/search-view.component';
import { SettingsViewComponent } from '../../components/settings-view/settings-view.component';
import { ViewSelectorComponent } from '../../components/view-selector/view-selector.component';
import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { BottomNavComponent } from '../../components/bottom-nav/bottom-nav.component';

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

  // Datos de ejemplo
  categories: Box[] = [];

  searchQuery: string = '';

  constructor(private boxService: BoxService) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadBoxes();
  }

  // Logica del server

  loadBoxes() {
    this.boxService.getBoxes().subscribe({
      next: (data) => {
        this.categories = data.map((box) => ({
          ...box,
          itemCount: 0,
        }));
      },
      error: (error) => console.error('Error al cargar las cajas', error),
    });
  }

  handleNewCategory() {
    const nombre = prompt('Escribe el nombre de la nueva caja:');

    if (!nombre) return;

    this.boxService.createBox(nombre).subscribe({
      next: (nuevaCaja) => {
        this.categories.unshift(nuevaCaja);
        this.searchQuery = '';
      },
      error: (err) => {
        console.error('Error creando la caja', err);
        alert('Hubo un error al crear la caja en el servidor.');
      },
    });
  }

  handleEditCategory(id: number) {
    const category = this.categories.find((c) => c.id === id);
    if (category) {
      const nuevoNombre = prompt('Escribe el nuevo nombre de la caja:', category.name);
      if (nuevoNombre) {
        category.name = nuevoNombre;
      }
    }
  }
  handleDeleteCategory(id: number) {
    const confirmar = confirm('¿Estás seguro de que quieres eliminar esta caja?');
    if (confirmar) {
      this.categories = this.categories.filter((c) => c.id !== id);
    }
  }

  //Logica de la UI

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (window.innerWidth < 768) {
      this.viewMode = 'list';
    } else {
      this.viewMode = 'grid';
    }
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
}
