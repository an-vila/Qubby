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
    SettingsViewComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit { 
  
  activeSection: 'inicio' | 'buscar' | 'ajustes' = 'inicio';
  viewMode: 'grid' | 'list' = 'grid'; 
  searchQuery: string = '';

  mostrarModal: boolean = false;
  nuevaCaja = {
    name: '',
    isProtected: false,
    pin: ''
  };


  categories = [
    { id: 1, name: 'Caja 1 - Libros', itemCount: 24 },
    { id: 2, name: 'Estantería - Cocina', itemCount: 18 },
    { id: 3, name: 'Trastero - Herramientas', itemCount: 32 },
    { id: 4, name: 'Caja 2 - Ropa de invierno', itemCount: 15 },
    { id: 5, name: 'Caja 3 - Documentos', itemCount: 8 }
  ];

  ngOnInit() {
    this.checkScreenSize();
  }

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
    return this.categories.filter(c => 
      c.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onSectionChange(section: 'inicio' | 'buscar' | 'ajustes') {
    this.activeSection = section;
  }

  onViewChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }


  handleNewCategory() {
    this.nuevaCaja = { name: '', isProtected: false, pin: '' };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }


  guardarCaja() {
    if (!this.nuevaCaja.name.trim()) return;

    const cajaParaAñadir = {
      id: Date.now(),
      name: this.nuevaCaja.name,
      itemCount: 0
    };


    this.categories.unshift(cajaParaAñadir);


    if (this.nuevaCaja.isProtected) {
      console.log('Caja creada con protección PIN:', this.nuevaCaja.pin);
    }


    this.searchQuery = '';
    this.cerrarModal();
  }


  handleEditCategory(id: number) {
    const category = this.categories.find(c => c.id === id);
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
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }
}