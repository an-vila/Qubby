import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-add-object-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-object-page.component.html',
  styleUrls: ['./add-object-page.component.css'],
})
export class AddObjectPageComponent implements OnInit {
  boxId: number = 0;
  itemId: number | null = null;
  isEditMode: boolean = false;

  private fb = inject(FormBuilder);
  objectForm!: FormGroup;

  tagInput = new FormControl('');
  tags: string[] = [];

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  isSubmitting: boolean = false;
  showSuccess: boolean = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
  ) {}

  ngOnInit() {
    this.boxId = +this.route.snapshot.params['id'];
    const itemIdParam = this.route.snapshot.params['itemId'];

    this.objectForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      status: ['saved', Validators.required],
    });

    if (itemIdParam) {
      this.isEditMode = true;
      this.itemId = +itemIdParam;
      this.cargarDatosObjeto(this.itemId);
    }
  }

  cargarDatosObjeto(id: number) {
    this.itemService.getItem(id).subscribe({
      next: (item: any) => {
        this.objectForm.patchValue({
          name: item.name,
          category: item.category || '',
          description: item.description,
          quantity: item.quantity,
          status: item.status || 'saved',
        });
        this.tags = item.tags || [];
        this.imagePreview = item.image; // URL de la imagen que ya existe
      },
      error: (err) => console.error('Error al cargar el objeto:', err),
    });
  }

  volver() {
    this.location.back();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  handleAddTag() {
    const tag = this.tagInput.value?.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInput.setValue('');
    }
  }

  removeTag(tagToRemove: string) {
    this.tags = this.tags.filter((t) => t !== tagToRemove);
  }

  handleSubmit() {
    if (this.objectForm.invalid) {
      this.objectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValues = this.objectForm.value;

    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('category', formValues.category);
    formData.append('description', formValues.description || '');
    formData.append('box', this.boxId.toString());
    formData.append('quantity', formValues.quantity.toString());
    formData.append('status', formValues.status);

    if (!this.isEditMode) {
      formData.append('code', `OBJ-${Math.floor(Math.random() * 10000)}`);
    }

    if (this.tags.length > 0) {
      this.tags.forEach((tag) => formData.append('tags', tag));
    }

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const operacion$ =
      this.isEditMode && this.itemId
        ? this.itemService.updateItem(this.itemId, formData)
        : this.itemService.createItem(formData);

    operacion$.subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showSuccess = true;
        setTimeout(() => {
          this.router.navigate(['/box', this.boxId]);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Error en el servidor:', err);
        this.isSubmitting = false;
        alert('Hubo un error al guardar los cambios.');
      },
    });
  }
}
