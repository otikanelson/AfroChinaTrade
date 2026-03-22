import apiClient, { ApiResponse } from './api/apiClient';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DeliveryAddress {
  _id: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  localGovernment?: string;
  country: string;
  postalCode?: string;
  landmark?: string;
  deliveryInstructions?: string;
  location?: LocationData;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressData {
  type: 'home' | 'work' | 'other';
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  localGovernment?: string;
  postalCode?: string;
  landmark?: string;
  deliveryInstructions?: string;
  location?: LocationData;
  isDefault?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

export interface LocationState {
  name: string;
  lgas: string[];
}

class AddressService {
  private readonly basePath = '/addresses';
  private readonly locationsPath = '/locations';

  /**
   * Get all delivery addresses for the user
   */
  async getAddresses(): Promise<ApiResponse<DeliveryAddress[]>> {
    return apiClient.get<DeliveryAddress[]>(this.basePath);
  }

  /**
   * Get a specific delivery address
   */
  async getAddressById(id: string): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.get<DeliveryAddress>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new delivery address
   */
  async createAddress(data: CreateAddressData): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.post<DeliveryAddress>(this.basePath, data);
  }

  /**
   * Update a delivery address
   */
  async updateAddress(id: string, data: UpdateAddressData): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.put<DeliveryAddress>(`${this.basePath}/${id}`, data);
  }

  /**
   * Delete a delivery address
   */
  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(id: string): Promise<ApiResponse<DeliveryAddress>> {
    return apiClient.patch<DeliveryAddress>(`${this.basePath}/${id}/set-default`, {});
  }

  /**
   * Get all Nigerian states
   */
  async getStates(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${this.locationsPath}/states`);
  }

  /**
   * Get LGAs for a specific state
   */
  async getLGAsForState(state: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${this.locationsPath}/states/${state}/lgas`);
  }
}

export default new AddressService();
