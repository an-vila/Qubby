import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
})
export class SettingsPageComponent implements OnInit {
  constructor(private authService: AuthService) {}

  userName: string = 'Usuario';
  editName: string = '';
  userEmail: string = 'tu_correo@qubby.com';

  passwordData = {
    old_password: '',
    new_password: '',
    confirm_password: '',
  };

  ngOnInit(): void {
    const userData = this.authService.getUser();

    if (userData) {
      this.userName = userData.name || 'Usuario';
      this.userEmail = userData.email || 'tu_correo@qubby.com';
    }
  }

  updateName() {
    if (!this.editName.trim()) return;

    this.authService.updateProfile({ name: this.editName }).subscribe({
      next: (res: any) => {
        alert('Nombre actualizado correctamente');
        this.userName = this.editName;
        this.editName = '';
        this.updateLocalStorage(this.userName);
      },
      error: (err) => {
        console.error('Error al actualizar nombre', err);
        alert('Error al actualizar el nombre');
      },
    });
  }

  updatePassword() {
    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }

    this.authService.changePassword(this.passwordData).subscribe({
      next: () => {
        alert('Contraseña cambiada con éxito');
        this.passwordData = { old_password: '', new_password: '', confirm_password: '' };
      },
      error: (err) => {
        console.error('Error cambiando contraseña', err);
        alert(err.error?.error || 'Error al cambiar la contraseña');
      },
    });
  }

  onLogout() {
    this.authService.logout();
  }

  private updateLocalStorage(newName: string) {
    const userData = this.authService.getUser();

    if (userData) {
      userData.name = newName;

      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
    }
  }
}
