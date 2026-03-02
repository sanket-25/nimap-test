import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product, ProductService, PaginatedProducts } from '../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: false,
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  page = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20];
  totalRecords = 0;
  totalPages = 0;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts(this.page, this.pageSize).subscribe({
      next: (response: PaginatedProducts) => {
        this.products = response.data;
        this.page = response.page;
        this.pageSize = response.pageSize;
        this.totalRecords = response.totalRecords;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to fetch products';
        this.isLoading = false;
      },
    });
  }

  onPageSizeChange(value: string): void {
    this.pageSize = Number(value);
    this.page = 1;
    this.loadProducts();
  }

  previousPage(): void {
    if (this.page <= 1) {
      return;
    }

    this.page -= 1;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) {
      return;
    }

    this.page += 1;
    this.loadProducts();
  }

  goToCreate(): void {
    this.router.navigate(['/products/new']);
  }

  goToEdit(productId: number): void {
    this.router.navigate(['/products/edit', productId]);
  }

  deleteProduct(productId: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        if (this.products.length === 1 && this.page > 1) {
          this.page -= 1;
        }
        this.loadProducts();
      },
      error: () => {
        this.errorMessage = 'Unable to delete product';
      },
    });
  }
}
