import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-qr-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-page.component.html',
  styleUrls: ['./qr-page.component.css'],
})
export class QrPageComponent { 

  constructor(private location: Location) {}

  volver() {
    this.location.back(); 
  }

  imprimir() {
    window.print(); 
  }
}