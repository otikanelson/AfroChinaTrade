import { API_BASE_URL } from '../constants/config';

export interface CreateTicketData {
  subject: string;
  category: string;
  priority: string;
  description: string;
  isSuspensionAppeal?: boolean;
  appealReason?: string;
}

export interface UpdateTicketData {
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

class TicketService {
  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createTicket(token: string, ticketData: CreateTicketData) {
    const response = await fetch(`${API_BASE_URL}/api/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create ticket');
    }

    return data;
  }

  async getUserTickets(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/tickets/my-tickets`, {
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tickets');
    }

    return data;
  }

  async getTicketById(token: string, ticketId: string) {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch ticket details');
    }

    return data;
  }

  async getAllTickets(token: string, filters: TicketFilters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/api/tickets?${queryParams}`, {
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tickets');
    }

    return data;
  }

  async updateTicket(token: string, ticketId: string, updateData: UpdateTicketData) {
    const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update ticket');
    }

    return data;
  }

  async getUserSuspensionAppeals(token: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/api/tickets/user/${userId}/appeals`, {
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch suspension appeals');
    }

    return data;
  }
}

export default new TicketService();