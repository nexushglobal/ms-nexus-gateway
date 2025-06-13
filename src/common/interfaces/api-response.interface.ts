export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  errors: ApiError[] | null;
}

export interface ApiError {
  field?: string;
  code: string;
  message: string;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
  appliedFilters?: FilterOptions;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  [key: string]: any;
}
