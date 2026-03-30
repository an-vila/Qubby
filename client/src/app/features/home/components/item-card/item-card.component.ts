import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.css'],
})
export class ItemCardComponent {
  @Input() name: string = '';
  @Input() description: string = '';
  @Input() isEditing: boolean = false;

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ name: string; description: string }>();
  @Output() cancel = new EventEmitter<void>();

  editName: string = '';
  editDescription: string = '';

  @ViewChild('editInput') editInput!: ElementRef<HTMLInputElement>;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isEditing'] && changes['isEditing'].currentValue === true) {
      this.editName = this.name;
      this.editDescription = this.description;
      setTimeout(() => {
        if (this.editInput) {
          this.editInput.nativeElement.focus();
          this.editInput.nativeElement.select();
        }
      });
    }
  }

  onSave() {
    this.save.emit({ name: this.editName, description: this.editDescription });
  }

  onCancel() {
    this.cancel.emit();
  }
}
