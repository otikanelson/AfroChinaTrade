import apiClient, { ApiResponse } from './api/apiClient';

export interface Report {
  id: string;
  type: 'product' | 'user' | 'review' | 'other';
  reportedEntityId: string;
  reportedContent: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface CreateReportData {
  type: Report['type'];
  reportedEntityId: string;
  reason: string;
  description?: string;
}

class ReportService {
  private readonly basePath = '/reports';

  async getReports(params: { 
    page?: number; 
    limit?: number;
    status?: Report['status'];
    type?: Report['type'];
  } = {}): Promise<ApiResponse<Report[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Report[]>(url);
  }

  async createReport(reportData: CreateReportData): Promise<ApiResponse<Report>> {
    return apiClient.post<Report>(this.basePath, reportData);
  }

  async updateReportStatus(id: string, status: Report['status']): Promise<ApiResponse<Report>> {
    return apiClient.patch<Report>(`${this.basePath}/${id}/status`, { status });
  }
}

export const reportService = new ReportService();
export default reportService;