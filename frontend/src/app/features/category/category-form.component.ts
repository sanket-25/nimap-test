import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
  standalone: false,
})
export class CategoryFormComponent implements OnInit {
  categoryId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  // form will be setup in constructor to avoid using injected member before initialization
  readonly categoryForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
  ) {
    this.categoryForm = this.formBuilder.group({
      categoryName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.categoryId = id;
      this.loadCategory(id);
    }
  }

  private loadCategory(categoryId: number): void {
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        const category = categories.find((item: Category) => item.category_id === categoryId);
        if (!category) {
          this.errorMessage = 'Category not found';
          return;
        }

        this.categoryForm.patchValue({
          categoryName: category.category_name,
        });
      },
      error: () => {
        this.errorMessage = 'Unable to fetch category details';
      },
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const categoryName = this.categoryForm.controls['categoryName'].value?.trim() || '';

    const request = this.categoryId
      ? this.categoryService.updateCategory(this.categoryId, categoryName)
      : this.categoryService.createCategory(categoryName);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/categories']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to save category';
      },
    });
  }

  onReset(): void {
    this.categoryForm.reset();
  }
}
