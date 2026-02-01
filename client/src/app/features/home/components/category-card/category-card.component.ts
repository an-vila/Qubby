import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css']
})
export class CategoryCardComponent {
  
  @Input() name: string = '';
  @Input() itemCount: number = 0;
  @Input() viewMode: 'list' | 'grid' = 'grid';

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
}