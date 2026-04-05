import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoxService } from '../../services/box.service';

@Component({
  selector: 'app-qr-scan-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './qr-scan-page.component.html',
  styleUrls: ['./qr-scan-page.component.css'],
})
export class QrScanPageComponent implements OnInit {
  boxId: string = '';
  searchQuery: string = '';
  selectedObject: any = null;

  pinNeeded: boolean = true;
  pinEnter: string = '';
  pinError: boolean = false;
  
  constructor(private route: ActivatedRoute, private boxService: BoxService) {}

  verifyPin() {
    this.boxService.verifyPin(this.boxId, this.pinEnter).subscribe({
      next: (res) => {
        if (res.success) {
          this.pinNeeded = false;
          this.pinError = false;
        }
      },
      error: (err) => {
        this.pinError = true;
        this.pinEnter = '';
      },
    });
  }

  objetos: any[] = [
    {
      id: 1,
      name: 'Cable HDMI',
      code: 'ELC-001',
      quantity: 2,
      status: 'Guardado',
      image: 'https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=400',
      tags: ['Cable', 'HDMI', '2m'],
    },
    {
      id: 2,
      name: 'Cargador USB-C',
      code: 'ELC-002',
      quantity: 1,
      status: 'Prestado',
      image: 'https://images.unsplash.com/photo-1726748398114-2f2260b6ddc5?w=400',
      tags: ['Cargador', '20W'],
    },
  ];

  ngOnInit(): void {
    this.boxId = this.route.snapshot.paramMap.get('id') || 'Desconocida';
  }

  abrirDetalles(obj: any): void {
    this.selectedObject = obj;
  }

  cerrarDetalles(): void {
    this.selectedObject = null;
  }
}