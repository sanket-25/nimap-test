import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryService } from '../../core/services/category.service';
import { Product, ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
  standalone: false,
})
export class ProductFormComponent implements OnInit {
  categories: Category[] = [];
  productId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  readonly productForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {
    this.productForm = this.formBuilder.group({
      productName: ['', Validators.required],
      categoryId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.productId = id;
      this.loadProduct(id);
    }
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
      },
      error: () => {
        this.errorMessage = 'Unable to fetch categories';
      },
    });
  }

  private loadProduct(productId: number): void {
    this.isLoading = true;

    this.productService.getProductById(productId).subscribe({
      next: (product: Product) => {
        this.productForm.patchValue({
          productName: product.product_name,
          categoryId: String(product.category_id),
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to fetch product details';
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const productName = this.productForm.controls['productName'].value?.trim() || '';
    const categoryId = Number(this.productForm.controls['categoryId'].value);

    const request = this.productId
      ? this.productService.updateProduct(this.productId, productName, categoryId)
      : this.productService.createProduct(productName, categoryId);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/products']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to save product';
      },
    });
  }
}
