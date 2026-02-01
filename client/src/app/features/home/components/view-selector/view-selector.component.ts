import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-selector.component.html',
  styleUrls: ['./view-selector.component.css']
})
export class ViewSelectorComponent {

  @Input() currentView: 'grid' | 'list' = 'grid';

  @Output() viewChange = new EventEmitter<'grid' | 'list'>();

  setView(view: 'grid' | 'list') {
    this.viewChange.emit(view);
  }
}