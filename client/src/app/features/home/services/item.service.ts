import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../interfaces/home.interfaces';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiUrl = `${environment.apiUrl}items/`;

  constructor(private http: HttpClient) {}

  getItemsByBox(boxId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}?box_id=${boxId}`);
  }

  createItem(data: FormData | any): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, data);
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}${id}/`);
  }

  updateItem(id: number, data: FormData | any): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}${id}/`, data);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
