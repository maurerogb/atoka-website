import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

type PaginationItem = number | '...';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input() length = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100];
  @Input() showFirstLastButtons = true;

  @Output() page = new EventEmitter<PageEvent>();

  get totalPages(): number {
    if (!this.length) {
      return 0;
    }

    return Math.ceil(this.length / this.pageSize);
  }

  get currentPage(): number {
    return this.pageIndex + 1;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get paginationItems(): PaginationItem[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  onPageSizeChange(nextPageSize: number): void {
    if (!nextPageSize || nextPageSize === this.pageSize) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    const firstVisibleItemIndex = this.pageIndex * this.pageSize;
    this.pageSize = nextPageSize;
    this.pageIndex = Math.floor(firstVisibleItemIndex / this.pageSize);

    const maxPageIndex = Math.max(this.totalPages - 1, 0);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }

    this.emitPage(previousPageIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    const previousPageIndex = this.pageIndex;
    this.pageIndex = page - 1;
    this.emitPage(previousPageIndex);
  }

  goToPreviousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onPaginationItemClick(item: PaginationItem): void {
    if (item === '...') {
      return;
    }

    this.goToPage(item);
  }

  private emitPage(previousPageIndex: number): void {
    this.page.emit({
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.length,
      previousPageIndex,
    });
  }
}
