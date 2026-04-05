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
import { FormsModule } from '@angular/forms'; // Tu parte
import { RouterLink } from '@angular/router'; // La parte de tu compañero

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Combinados
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css'],
})
export class CategoryCardComponent {
  @Input() id: number = 0; // Añadido por tu compañero
  @Input() name: string = '';
  @Input() itemCount: number = 0;
  @Input() viewMode: 'list' | 'grid' = 'grid';
  @Input() isEditing: boolean = false; // Tu estado de edición

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();

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
