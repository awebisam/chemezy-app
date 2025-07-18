import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chemicalService } from '../chemical.service';
import { apiClient } from '../api';

// Mock the API client
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('ChemicalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChemicals', () => {
    it('should fetch chemicals with default parameters', async () => {
      const mockResponse = {
        count: 2,
        results: [
          {
            id: 1,
            molecular_formula: 'H2O',
            common_name: 'Water',
            state_of_matter: 'liquid',
            color: 'colorless',
            density: 1.0,
            properties: {},
          },
          {
            id: 2,
            molecular_formula: 'NaCl',
            common_name: 'Salt',
            state_of_matter: 'solid',
            color: 'white',
            density: 2.16,
            properties: {},
          },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await chemicalService.getChemicals();

      expect(apiClient.get).toHaveBeenCalledWith('/chemicals/');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch chemicals with search parameters', async () => {
      const mockResponse = {
        count: 1,
        results: [
          {
            id: 1,
            molecular_formula: 'H2O',
            common_name: 'Water',
            state_of_matter: 'liquid',
            color: 'colorless',
            density: 1.0,
            properties: {},
          },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const params = {
        search: 'water',
        limit: 10,
        skip: 0,
      };

      const result = await chemicalService.getChemicals(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/chemicals/?skip=0&limit=10&search=water'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getChemical', () => {
    it('should fetch a specific chemical by ID', async () => {
      const mockResponse = {
        id: 1,
        molecular_formula: 'H2O',
        common_name: 'Water',
        state_of_matter: 'liquid',
        color: 'colorless',
        density: 1.0,
        properties: {},
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await chemicalService.getChemical(1);

      expect(apiClient.get).toHaveBeenCalledWith('/chemicals/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createChemical', () => {
    it('should create a new chemical', async () => {
      const mockResponse = {
        id: 3,
        molecular_formula: 'CO2',
        common_name: 'Carbon Dioxide',
        state_of_matter: 'gas',
        color: 'colorless',
        density: 1.98,
        properties: {},
      };

      const createData = {
        molecular_formula: 'CO2',
        context: 'Test chemical',
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await chemicalService.createChemical(createData);

      expect(apiClient.post).toHaveBeenCalledWith('/chemicals/', createData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchChemicals', () => {
    it('should search chemicals with query', async () => {
      const mockResponse = {
        count: 1,
        results: [
          {
            id: 1,
            molecular_formula: 'H2O',
            common_name: 'Water',
            state_of_matter: 'liquid',
            color: 'colorless',
            density: 1.0,
            properties: {},
          },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await chemicalService.searchChemicals('water');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/chemicals/?skip=0&limit=20&search=water'
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getChemicalsPaginated', () => {
    it('should fetch paginated chemicals', async () => {
      const mockResponse = {
        count: 100,
        results: [],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await chemicalService.getChemicalsPaginated(2, 10);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/chemicals/?skip=10&limit=10'
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
