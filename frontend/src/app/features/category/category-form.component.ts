import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';

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

  readonly categoryForm = this.formBuilder.group({
    categoryName: ['', Validators.required],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isInteger(id) && id > 0) {
      this.categoryId = id;
      this.loadCategory(id);
    }
  }

  private loadCategory(categoryId: number): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        const category = categories.find((item) => item.category_id === categoryId);
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
    const categoryName = this.categoryForm.controls.categoryName.value?.trim() || '';

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
