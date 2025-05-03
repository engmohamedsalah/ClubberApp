// Model that matches the PaginatedResult<T> from the backend
export interface PaginatedResult<T> {
  data: T[];        // The page of items
  page: number;     // Current page number (1-based)
  pageSize: number; // Number of items per page
  totalCount: number; // Total number of items across all pages
}

// Parameters for paginated requests
export interface PagedRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
}

// Utility functions for pagination
export class PaginationHelper {
  // Calculate total number of pages
  static getTotalPages(result: PaginatedResult<unknown>): number {
    return Math.ceil(result.totalCount / result.pageSize);
  }

  // Generate page numbers array for UI pagination controls
  static getPageNumbers(result: PaginatedResult<unknown>, maxVisiblePages = 5): number[] {
    const totalPages = this.getTotalPages(result);
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate range of pages to show
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(result.page - halfVisible, 1);
    const endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    // Adjust if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }
}
