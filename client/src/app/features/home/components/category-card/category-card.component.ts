import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.css']
})
export class CategoryCardComponent {
  
  @Input() id: number = 0; 
  @Input() name: string = '';
  @Input() itemCount: number = 0;
  @Input() viewMode: 'list' | 'grid' = 'grid';

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
}