import {
  PaginatedData,
  PaginationMeta,
} from '../interfaces/api-response.interface';

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: any;
}

export interface PaginationWithFilters {
  page: number;
  limit: number;
  offset: number;
  filters: FilterOptions;
}

export class PaginationHelper {
  static createPaginatedResponse<T>(
    items: T[],
    options: PaginationOptions,
    appliedFilters?: FilterOptions,
  ): PaginatedData<T> {
    const { page, limit, total } = options;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };

    const result: PaginatedData<T> = {
      items,
      pagination,
    };

    if (appliedFilters && Object.keys(appliedFilters).length > 0) {
      (result as any).appliedFilters = appliedFilters;
    }

    return result;
  }

  static validatePaginationParams(
    page?: number,
    limit?: number,
    filters?: FilterOptions,
  ): PaginationWithFilters {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 20));

    const cleanFilters: FilterOptions = {};

    if (filters) {
      if (filters.search && typeof filters.search === 'string') {
        cleanFilters.search = filters.search.trim();
      }

      if (filters.sortBy && typeof filters.sortBy === 'string') {
        cleanFilters.sortBy = filters.sortBy.trim();
      }

      if (filters.sortOrder && ['ASC', 'DESC'].includes(filters.sortOrder)) {
        cleanFilters.sortOrder = filters.sortOrder;
      }

      Object.keys(filters).forEach((key) => {
        if (
          !['search', 'sortBy', 'sortOrder'].includes(key) &&
          filters[key] !== undefined
        ) {
          cleanFilters[key] = filters[key];
        }
      });
    }

    return {
      page: validatedPage,
      limit: validatedLimit,
      offset: (validatedPage - 1) * validatedLimit,
      filters: cleanFilters,
    };
  }

  static buildSearchConditions(
    searchFields: string[],
    searchTerm?: string,
  ): any[] {
    if (!searchTerm || !searchFields.length) {
      return [];
    }

    return searchFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: 'i' },
    }));
  }

  static buildSortConditions(
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'ASC',
    allowedSortFields: string[] = [],
  ): any {
    if (!sortBy || !allowedSortFields.includes(sortBy)) {
      return { createdAt: sortOrder === 'ASC' ? 1 : -1 };
    }

    return { [sortBy]: sortOrder === 'ASC' ? 1 : -1 };
  }
}
