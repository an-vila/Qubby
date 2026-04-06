import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-object-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './object-card.component.html',
  styleUrls: ['./object-card.component.css']
})
export class ObjectCardComponent {
  @Input() image: string = '';
  @Input() name: string = '';
  @Input() code: string = '';
  @Input() description: string = ''; 
  
  @Input() tags: string[] = [];
  @Input() viewMode: 'grid' | 'list' = 'grid'; 
  
  @Output() viewDetails = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}