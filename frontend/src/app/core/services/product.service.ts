import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name?: string;
  created_at: string;
}

export interface PaginatedProducts {
  data: Product[];
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = '/api/products';

  constructor(private readonly http: HttpClient) {}

  getProducts(page: number, pageSize: number): Observable<PaginatedProducts> {
    const params = { page: String(page), pageSize: String(pageSize) };
    return this.http.get<PaginatedProducts>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productName: string, categoryId: number): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, { productName, categoryId });
  }

  updateProduct(
    id: number,
    productName: string,
    categoryId: number,
  ): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, {
      productName,
      categoryId,
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
