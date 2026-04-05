import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 👈 1. Añadimos esta importación

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
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