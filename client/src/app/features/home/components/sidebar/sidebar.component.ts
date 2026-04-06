import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  constructor(private authService: AuthService, private autService: AuthService) {}
  @Input() activeSection: string = 'inicio';
  @Output() sectionChange = new EventEmitter<'inicio' | 'buscar' | 'ajustes'>();

  isSettingsOpen: boolean = false;

  toggleSettings() {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  onLogout() {
    this.authService.logout();
  }

  userName: string = "Usuario"

  ngOnInit(): void {
    const userData = this.autService.getUser();

    if(userData) {
      this.userName = userData.name || "Usuario";
    }
  }
}