export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  category: 'order' | 'payment' | 'product' | 'account' | 'technical' | 'suspension_appeal' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    status: string;
  };
  adminResponse?: string;
  adminId?: string | {
    _id: string;
    name: string;
    email: string;
  };
  resolvedAt?: string;
  isSuspensionAppeal?: boolean;
  appealReason?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  category: string;
  priority: string;
  description: string;
  isSuspensionAppeal?: boolean;
  appealReason?: string;
}

export interface UpdateTicketRequest {
  status?: string;
  adminResponse?: string;
  unsuspendUser?: boolean;
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const TICKET_CATEGORIES = [
  { value: 'order', label: 'Order Issues' },
  { value: 'payment', label: 'Payment Problems' },
  { value: 'product', label: 'Product Questions' },
  { value: 'account', label: 'Account Issues' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'suspension_appeal', label: 'Suspension Appeals' },
  { value: 'other', label: 'Other' },
] as const;

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const;

export const TICKET_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;