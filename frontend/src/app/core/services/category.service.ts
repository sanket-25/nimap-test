import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  category_id: number;
  category_name: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = '/api/categories';

  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  createCategory(categoryName: string): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, { categoryName });
  }

  updateCategory(id: number, categoryName: string): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, { categoryName });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
