import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Box } from '../interfaces/home.interfaces';

@Injectable({
  providedIn: 'root',
})
export class BoxService {
  private apiUrl = 'http://192.168.86.102:8000/api/boxes/';

  constructor(private http: HttpClient) {}

  getBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(this.apiUrl);
  }
  
  getBox(id: string | number): Observable<Box> {
    return this.http.get<Box>(`${this.apiUrl}${id}/`);
  }

  createBox(boxData: { name: string; is_protected: boolean; pin: string }): Observable<Box> {
    return this.http.post<Box>(this.apiUrl, boxData);
  }

  updateBox(id: number, name: string): Observable<Box> {
    return this.http.patch<Box>(`${this.apiUrl}${id}/`, { name });
  }

  deleteBox(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  getBoxQrCode(boxId: string | number) {
    return this.http.get<any>(`${this.apiUrl}${boxId}/qrcode/`);
  }
  

  verifyPin(boxId: string | number, pin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${boxId}/verify_pin/`, { pin });
  }
}
