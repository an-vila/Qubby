import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-object-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-object-page.component.html',
  styleUrls: ['./add-object-page.component.css']
})
export class AddObjectPageComponent {
  objectName: string = '';
  category: string = ''; 
  description: string = '';
  tags: string[] = [];
  currentTag: string = '';
  quantity: number = 1;
  status: 'saved' | 'loaned' | 'damaged' = 'saved';
  
  imagePreview: string | null = null; 
  
  isSubmitting: boolean = false;
  showSuccess: boolean = false;

  constructor(private location: Location) {}

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
    this.tags = this.tags.filter(t => t !== tagToRemove);
  }

  async handleSubmit() {
    if (!this.objectName || !this.category) return; 

    this.isSubmitting = true;
    await new Promise(resolve => setTimeout(resolve, 800));
    
    this.isSubmitting = false;
    this.showSuccess = true;

    setTimeout(() => {
      this.showSuccess = false;
      this.volver(); 
    }, 2000);
  }
}