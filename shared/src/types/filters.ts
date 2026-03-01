// Filter and Search Types

import { Order } from './entities';

export interface ProductFilters {
  categoryId?: string;
  supplierId?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
}

export interface OrderFilters {
  status?: Order['status'];
  startDate?: string;
  endDate?: string;
  userId?: string;
}
