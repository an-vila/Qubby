import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css'],
})
export class CategoryCardComponent {
  @Input() name: string = '';
  @Input() itemCount: number = 0;
  @Input() viewMode: 'list' | 'grid' = 'grid';
  @Input() isEditing: boolean = false;

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>(); 
  @Output() cancel = new EventEmitter<void>();

  editName: string = ''; 

  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditing'] && changes['isEditing'].currentValue === true) {
      this.editName = this.name;
      setTimeout(() => {
        if (this.editInput) {
          this.editInput.nativeElement.focus();
          this.editInput.nativeElement.select();
        }
      });
    }
  }

  onSave() {
    this.save.emit(this.editName);
  }

  onCancel() {
    this.cancel.emit();
  }
}