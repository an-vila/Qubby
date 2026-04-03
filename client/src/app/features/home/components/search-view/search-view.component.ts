import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-search-view',
  standalone: true,
  imports: [],
  templateUrl: './search-view.component.html',
  styleUrls: ['./search-view.component.css']
})
export class SearchViewComponent {
  scannerEnabled: boolean = false;

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