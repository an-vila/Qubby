import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], 
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
})
export class SettingsPageComponent implements OnInit {
  userName: string = 'Usuario';
  userEmail: string = 'tu_correo@qubby.com';

 
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder 
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUser();

    if (userData) {
      this.userName = userData.name || 'Usuario';
      this.userEmail = userData.email || 'tu_correo@qubby.com';
    }

   
    this.profileForm = this.fb.group({
      name: ['', Validators.required]
    });

   
    this.passwordForm = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    });
  }

  updateName() {
    if (this.profileForm.invalid) return;

    const newName = this.profileForm.value.name.trim();

    this.authService.updateProfile({ name: newName }).subscribe({
      next: (res: any) => {
        alert('Nombre actualizado correctamente');
        this.userName = newName;
        this.profileForm.reset(); 
        this.updateLocalStorage(this.userName);
      },
      error: (err) => {
        console.error('Error al actualizar nombre', err);
        alert('Error al actualizar el nombre');
      },
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) {
      alert('Por favor, rellena todos los campos correctamente.');
      return;
    }

    const formValues = this.passwordForm.value;

    if (formValues.new_password !== formValues.confirm_password) {
      alert('Las contraseñas nuevas no coinciden.');
      return;
    }

    this.authService.changePassword(formValues).subscribe({
      next: () => {
        alert('Contraseña cambiada con éxito');
        this.passwordForm.reset(); 
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