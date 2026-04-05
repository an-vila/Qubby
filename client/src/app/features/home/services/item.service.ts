import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../interfaces/home.interfaces';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiUrl = 'http://localhost:8000/api/items/';

  constructor(private http: HttpClient) {}

  getItemsByBox(boxId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}?box=${boxId}`);
  }

  createItem(data: { name: string; description?: string; box: number }): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, data);
  }

  updateItem(id: number, data: Partial<Item>): Observable<Item> {
    return this.http.patch<Item>(`${this.apiUrl}${id}/`, data);
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
