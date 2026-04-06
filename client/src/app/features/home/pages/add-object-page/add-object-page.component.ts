import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-add-object-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-object-page.component.html',
  styleUrls: ['./add-object-page.component.css']
})
export class AddObjectPageComponent implements OnInit {
  boxId: number = 0;
  objectForm!: FormGroup;
  tagInput = new FormControl('');
  tags: string[] = [];
  imagePreview: string | null = null; 
  
  isSubmitting: boolean = false;
  showSuccess: boolean = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.boxId = +this.route.snapshot.params['id'];

    this.objectForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      status: ['saved']
    });
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
    const tag = this.tagInput.value?.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInput.setValue('');
    }
  }

  removeTag(tagToRemove: string) {
    this.tags = this.tags.filter(t => t !== tagToRemove);
  }

  handleSubmit() {
    if (this.objectForm.invalid) return; 

    this.isSubmitting = true;

    const formValues = this.objectForm.value;

    const newItem = {
      name: formValues.name,
      description: formValues.description,
      box: this.boxId,
      category: formValues.category,
      quantity: formValues.quantity,
      status: formValues.status,
      tags: this.tags,
      image: this.imagePreview,
      code: `OBJ-${Math.floor(Math.random() * 10000)}`
    };

    this.itemService.createItem(newItem).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.showSuccess = true;
        
        setTimeout(() => {
          this.router.navigate(['/box', this.boxId]);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting = false;
        alert('Hubo un error al guardar el objeto. Revisa la consola.');
      }
    });
  }
}