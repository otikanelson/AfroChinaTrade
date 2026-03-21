import apiClient, { ApiResponse } from './api/apiClient';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export type TicketPriority = Ticket['priority'];
export type TicketStatus = Ticket['status'];

export interface CreateTicketData {
  subject: string;
  description: string;
  priority?: Ticket['priority'];
}

class TicketService {
  private readonly basePath = '/tickets';

  async getTickets(params: { 
    page?: number; 
    limit?: number;
    status?: Ticket['status'];
    priority?: Ticket['priority'];
  } = {}): Promise<ApiResponse<Ticket[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Ticket[]>(url);
  }

  async getTicketById(id: string): Promise<ApiResponse<Ticket>> {
    return apiClient.get<Ticket>(`${this.basePath}/${id}`);
  }

  async createTicket(ticketData: CreateTicketData): Promise<ApiResponse<Ticket>> {
    return apiClient.post<Ticket>(this.basePath, ticketData);
  }

  async updateTicketStatus(id: string, status: Ticket['status']): Promise<ApiResponse<Ticket>> {
    return apiClient.patch<Ticket>(`${this.basePath}/${id}/status`, { status });
  }

  async updateTicketPriority(id: string, priority: Ticket['priority']): Promise<ApiResponse<Ticket>> {
    return apiClient.patch<Ticket>(`${this.basePath}/${id}/priority`, { priority });
  }
}

export const ticketService = new TicketService();
export default ticketService;