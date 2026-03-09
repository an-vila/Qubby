import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Box } from '../interfaces/home.interfaces';

@Injectable({
  providedIn: 'root',
})
export class BoxService {
  private apiUrl = 'http://localhost:8000/api/boxes/';

  constructor(private http: HttpClient) {}

  getBoxes(): Observable<Box[]> {
    return this.http.get<Box[]>(this.apiUrl);
  }

  createBox(name: string): Observable<Box> {
    return this.http.post<Box>(this.apiUrl, { name });
  }

  updateBox(id: number, name: string): Observable<Box> {
    return this.http.patch<Box>(`${this.apiUrl}${id}/`, { name });
  }

  deleteBox(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
