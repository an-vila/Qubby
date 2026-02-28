import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library'; // 👈 Importamos el tipo correcto

@Component({
  selector: 'app-search-view',
  standalone: true,
  imports: [ZXingScannerModule],
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.css']
})
export class SearchViewComponent {
  scannerEnabled: boolean = false;

  // 👈 Creamos esta variable para que el HTML la reconozca
  // Esto le dice al escáner: "Solo busca códigos QR"
  allowedFormats = [ BarcodeFormat.QR_CODE ]; 

  constructor(private router: Router) {}

  activarEscaneo() {
    this.scannerEnabled = true;
  }

  handleQrCodeResult(result: string) {
    this.scannerEnabled = false;
    if (result) {
      this.router.navigate(['/box', result]);
    }
  }
}