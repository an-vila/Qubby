import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() activeSection: string = 'inicio';
  @Output() sectionChange = new EventEmitter<'inicio' | 'buscar' | 'ajustes'>();

  isSettingsOpen: boolean = false;

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
 }
}