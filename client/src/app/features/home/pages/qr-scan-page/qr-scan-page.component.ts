import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { BoxService } from '../../services/box.service';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-qr-scan-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './qr-scan-page.component.html',
  styleUrls: ['./qr-scan-page.component.css'],
})
export class QrScanPageComponent implements OnInit {
  boxId: string = '';
  selectedObject: any = null;

  searchControl = new FormControl('');
  pinForm!: FormGroup;

  pinNeeded: boolean = true;
  pinError: boolean = false;

  objetos: any[] = [];
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boxService: BoxService,
    private itemService: ItemService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required]],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.boxId = id;
      this.verifySecure();
    } else {
      this.router.navigate(['/home']);
    }
  }

  verifySecure() {
    this.boxService.getBox(this.boxId).subscribe({
      next: (box: any) => {
        if (!box.is_protected) {
          this.pinNeeded = false;
          this.loadItems();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
    });
  }

  verifyPin() {
    if (this.pinForm.invalid) return;

    const pinValue = this.pinForm.value.pin;

    this.boxService.verifyPin(this.boxId, pinValue).subscribe({
      next: (res) => {
        if (res.success) {
          this.pinNeeded = false;
          this.pinError = false;
          this.loadItems();
        } else {
          this.pinError = true;
          this.pinForm.reset();
        }
      },
      error: (err) => {
        this.pinError = true;
        this.pinForm.reset();
      },
    });
  }

  loadItems() {
    this.isLoading = true;
    this.itemService.getItemsByBox(Number(this.boxId)).subscribe({
      next: (data: any) => {
        this.objetos = data.results || data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando objetos:', err);
        this.isLoading = false;
      },
    });
  }

  openDetails(obj: any): void {
    this.selectedObject = obj;
  }

  closeDetails(): void {
    this.selectedObject = null;
  }
}
