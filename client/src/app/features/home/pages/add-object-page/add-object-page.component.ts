import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Importamos Router y ActivatedRoute
import { ItemService } from '../../services/item.service'; // Importamos tu servicio real

@Component({
  selector: 'app-add-object-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-object-page.component.html',
  styleUrls: ['./add-object-page.component.css'],
})
export class AddObjectPageComponent implements OnInit {
  // === CAMPOS DEL FORMULARIO ===
  boxId: number = 0; // Necesario para saber a qué caja pertenece
  objectName: string = '';
  category: string = '';
  description: string = '';
  tags: string[] = [];
  currentTag: string = '';
  quantity: number = 1;
  status: 'saved' | 'loaned' | 'damaged' = 'saved';
  imagePreview: string | null = null;

  // === ESTADOS DE LA UI ===
  isSubmitting: boolean = false;
  showSuccess: boolean = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute, // Para leer el :id de la URL
    private router: Router, // Para navegar
    private itemService: ItemService, // El servicio que conecta con Django
  ) {}

  ngOnInit() {
    // Al cargar, pillamos el ID de la caja de la ruta: /box/5/add -> boxId = 5
    this.boxId = +this.route.snapshot.params['id'];
  }

  volver() {
    this.location.back();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  handleAddTag() {
    const tag = this.currentTag.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.currentTag = '';
    }
  }

  removeTag(tagToRemove: string) {
    this.tags = this.tags.filter((t) => t !== tagToRemove);
  }

  // === AQUÍ ESTÁ LA MAGIA: ENVÍO REAL AL BACKEND ===
  handleSubmit() {
    if (!this.objectName || !this.category) return;

    this.isSubmitting = true;

    // Creamos el objeto tal como lo espera la API de Ander
    const newItem = {
      name: this.objectName,
      description: this.description,
      box: this.boxId, // ¡Fundamental!
      quantity: this.quantity,
      status: this.status,
      tags: this.tags,
      image: this.imagePreview, // Ander tendrá que procesar esto como Base64 o File
      code: `OBJ-${Math.floor(Math.random() * 10000)}`, // Generamos un código por defecto
    };

    // Llamada al servicio real
    this.itemService.createItem(newItem).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showSuccess = true;

        // Esperamos 1.5s para que el usuario vea el check verde y volvemos
        setTimeout(() => {
          this.router.navigate(['/box', this.boxId]);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al guardar en Django:', err);
        this.isSubmitting = false;
        alert('Hubo un error al guardar el objeto. Revisa la consola.');
      },
    });
  }
}
