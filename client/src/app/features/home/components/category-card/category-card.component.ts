import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms'; 
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], 
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css'],
})
export class CategoryCardComponent {
  @Input() id: number = 0; 
  @Input() name: string = '';
  @Input() itemCount: number = 0;
  @Input() viewMode: 'list' | 'grid' = 'grid';
  @Input() isEditing: boolean = false; 

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();

  editControl = new FormControl('');

  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditing'] && changes['isEditing'].currentValue === true) {
      this.editControl.setValue(this.name);
      setTimeout(() => {
        if (this.editInput) {
          this.editInput.nativeElement.focus();
          this.editInput.nativeElement.select();
        }
      });
    }
  }

  onSave() {
    this.save.emit(this.editControl.value || '');
  }

  onCancel() {
    this.cancel.emit();
  }
}