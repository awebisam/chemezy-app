import { apiClient } from './api';
import { createApiWrapper } from './error.service';
import type { PaginationParams } from '@/types/api.types';
import type {
  Chemical,
  ChemicalCreate,
  PaginatedChemicals,
} from '@/types/chemical.types';

export class ChemicalService {
  private getChemicalsWrapper = createApiWrapper(
    this._getChemicals.bind(this),
    'ChemicalService.getChemicals',
    {
      showToast: false, // Don't show toast for list loading errors
      logError: true,
      retryConfig: {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2,
      },
    }
  );

  private getChemicalWrapper = createApiWrapper(
    this._getChemical.bind(this),
    'ChemicalService.getChemical',
    {
      showToast: true,
      logError: true,
      retryConfig: {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2,
      },
    }
  );

  private createChemicalWrapper = createApiWrapper(
    this._createChemical.bind(this),
    'ChemicalService.createChemical',
    { showToast: true, logError: true }
  );

  /**
   * Fetch paginated list of chemicals with optional search
   */
  async getChemicals(
    params: PaginationParams = {}
  ): Promise<PaginatedChemicals> {
    return this.getChemicalsWrapper(params);
  }

  /**
   * Get a specific chemical by ID
   */
  async getChemical(id: number): Promise<Chemical> {
    return this.getChemicalWrapper(id);
  }

  /**
   * Create a new chemical entry
   */
  async createChemical(data: ChemicalCreate): Promise<Chemical> {
    return this.createChemicalWrapper(data);
  }

  /**
   * Search chemicals by molecular formula or common name
   */
  async searchChemicals(
    query: string,
    limit: number = 20
  ): Promise<PaginatedChemicals> {
    return this.getChemicals({
      search: query,
      limit,
      skip: 0,
    });
  }

  /**
   * Get chemicals with pagination for infinite scroll or pagination UI
   */
  async getChemicalsPaginated(
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedChemicals> {
    const skip = (page - 1) * limit;
    return this.getChemicals({
      skip,
      limit,
    });
  }

  // Private methods that contain the actual API calls
  private async _getChemicals(
    params: PaginationParams = {}
  ): Promise<PaginatedChemicals> {
    const queryParams = new URLSearchParams();

    if (params.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }

    const url = `/chemicals/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<PaginatedChemicals>(url);
    return response;
  }

  private async _getChemical(id: number): Promise<Chemical> {
    const response = await apiClient.get<Chemical>(`/chemicals/${id}`);
    return response;
  }

  private async _createChemical(data: ChemicalCreate): Promise<Chemical> {
    const response = await apiClient.post<Chemical>('/chemicals/', data);
    return response;
  }
}

export const chemicalService = new ChemicalService();
