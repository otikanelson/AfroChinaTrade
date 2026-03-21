// API Client
export { default as apiClient } from './api/apiClient';
export type { ApiResponse, ApiError } from './api/apiClient';

// Service exports will be added as we create them
export * from './AuthService';
export * from './ProductService';
export * from './OrderService';
export { userService } from './UserService';
export type { UserProfile } from './UserService';
export * from './MessageService';
export * from './ReviewService';
export * from './CategoryService';
export * from './SupplierService';
export * from './AnalyticsService';
export * from './RefundService';
export * from './ReportService';
export * from './TicketService';