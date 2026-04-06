import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms'; 
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
    ReactiveFormsModule, 
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
  
 
  searchControl = new FormControl(''); 
  newBoxForm!: FormGroup;              

  mostrarModal: boolean = false;
  mostrarModalBorrado: boolean = false;
  categoriaParaBorrar: any = null;

  constructor(
    private boxService: BoxService,
    private router: Router,
    private fb: FormBuilder 
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.loadBoxes();


    this.newBoxForm = this.fb.group({
      name: ['', Validators.required],
      isProtected: [false],
      pin: ['']
    });
  }

  loadBoxes() {
    this.boxService.getBoxes().subscribe({
      next: (boxesFromDjango: any[]) => {
        this.categories = boxesFromDjango.map((box) => ({
          ...box,
          isEditing: false,
          itemCount: box.itemCount || box.item_count || 0,
        }));
      },
      error: (err) => {
        console.error('Error al cargar las cajas desde el servidor', err);
      },
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
    const query = (this.searchControl.value || '').toLowerCase();
    return this.categories.filter((c) =>
      c.name.toLowerCase().includes(query)
    );
  }

  onSectionChange(section: 'inicio' | 'buscar' | 'ajustes') {
    this.activeSection = section;
  }

  onViewChange(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  handleOpenCategory(id: number) {
    this.router.navigate(['/box', id]); 
  }

  handleNewCategory() {
    this.newBoxForm.reset({ isProtected: false, pin: '' }); 
    this.mostrarModal = true;
  }

  closeModal() {
    this.mostrarModal = false;
  }

  saveBox() {
    if (this.newBoxForm.invalid) return;

    const formValues = this.newBoxForm.value;
    const cleanName = formValues.name?.trim();
    
    if (!cleanName) return;

    const boxData = {
      name: cleanName,
      is_protected: formValues.isProtected,
      pin: formValues.isProtected ? formValues.pin : '',
    };

    this.boxService.createBox(boxData).subscribe({
      next: (createdBox: any) => {
        const newBoxView = {
          ...createdBox,
          isEditing: false,
          itemCount: 0,
        };

        this.categories.unshift(newBoxView);
        this.closeModal();
        this.searchControl.setValue(''); 
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
      next: (updatedBox: any) => {
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
      },
    });
  }
}