import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category, CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
  standalone: false,
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly categoryService: CategoryService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to fetch categories';
        this.isLoading = false;
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/categories/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/categories/edit', id]);
  }

  deleteCategory(id: number): void {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) {
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: () => (this.errorMessage = 'Unable to delete category'),
    });
  }
}
