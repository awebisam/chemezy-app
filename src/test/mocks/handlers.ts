import { http, HttpResponse } from 'msw';
import type { 
  AuthResponse, 
  UserResponse, 
  LoginCredentials, 
  RegisterData 
} from '@/types/api.types';
import type { 
  Chemical, 
  PaginatedChemicals 
} from '@/types/chemical.types';
import type { 
  ReactionRequest, 
  ReactionPrediction, 
  UserReactionStats 
} from '@/types/reaction.types';
import type { 
  UserAward, 
  AvailableAward, 
  LeaderboardEntry, 
  UserRank 
} from '@/types/award.types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Mock data
const mockUser: UserResponse = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  is_active: true,
  is_admin: false,
  created_at: '2024-01-01T00:00:00Z',
};

const mockChemicals: Chemical[] = [
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
  {
    id: 3,
    molecular_formula: 'H2SO4',
    common_name: 'Sulfuric Acid',
    state_of_matter: 'liquid',
    color: 'colorless',
    density: 1.84,
    properties: {},
  },
];

const mockUserAwards: UserAward[] = [
  {
    id: 1,
    user_id: 1,
    template_id: 1,
    tier: 1,
    progress: {},
    granted_at: '2024-01-01T10:00:00Z',
    template: {
      id: 1,
      name: 'First Reaction',
      description: 'Complete your first chemical reaction',
      category: 'discovery',
      icon: '🧪',
      criteria: {},
    },
  },
];

const mockAvailableAwards: AvailableAward[] = [
  {
    id: 2,
    name: 'Master Chemist',
    description: 'Complete 100 reactions',
    category: 'achievement',
    icon: '👨‍🔬',
    criteria: { reactions_needed: 100 },
    progress: { current_reactions: 25, percentage: 25 },
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user_id: 2,
    username: 'topuser',
    award_count: 15,
    total_points: 450,
  },
  {
    rank: 2,
    user_id: 1,
    username: 'testuser',
    award_count: 1,
    total_points: 10,
  },
];

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/token`, async ({ request }) => {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (username === 'testuser' && password === 'password123') {
      const response: AuthResponse = {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
      };
      return HttpResponse.json(response);
    }

    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const data = await request.json() as RegisterData;
    
    if (data.username === 'existinguser') {
      return HttpResponse.json(
        { detail: 'Username already exists' },
        { status: 400 }
      );
    }

    return HttpResponse.json(mockUser, { status: 201 });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json(mockUser);
  }),

  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    const response: AuthResponse = {
      access_token: 'new-mock-jwt-token',
      token_type: 'bearer',
    };
    return HttpResponse.json(response);
  }),

  // Chemical endpoints
  http.get(`${API_BASE_URL}/chemicals/`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const size = parseInt(url.searchParams.get('size') || '50');

    let filteredChemicals = mockChemicals;
    
    if (search) {
      filteredChemicals = mockChemicals.filter(
        chemical =>
          chemical.common_name.toLowerCase().includes(search.toLowerCase()) ||
          chemical.molecular_formula.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedChemicals = filteredChemicals.slice(startIndex, endIndex);

    const response: PaginatedChemicals = {
      items: paginatedChemicals,
      total: filteredChemicals.length,
      page,
      size,
      pages: Math.ceil(filteredChemicals.length / size),
    };

    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/chemicals/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    const chemical = mockChemicals.find(c => c.id === id);
    
    if (!chemical) {
      return HttpResponse.json(
        { detail: 'Chemical not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json(chemical);
  }),

  // Reaction endpoints
  http.post(`${API_BASE_URL}/reactions/react`, async ({ request }) => {
    const data = await request.json() as ReactionRequest;
    
    // Simulate different reaction outcomes based on reactants
    const hasWater = data.reactants.some(r => r.chemical_id === 1);
    const hasSalt = data.reactants.some(r => r.chemical_id === 2);

    let response: ReactionPrediction;

    if (hasWater && hasSalt) {
      response = {
        products: [
          {
            chemical_id: 4,
            molecular_formula: 'NaCl(aq)',
            common_name: 'Salt Solution',
            quantity: 1.0,
            state_of_matter: 'liquid',
            color: 'colorless',
          },
        ],
        effects: [
          {
            effect_type: 'state_change',
            initial_state: 'solid',
            final_state: 'liquid',
          },
        ],
        explanation: 'Salt dissolves in water to form a solution',
        is_world_first: false,
        state_of_product: 'liquid',
      };
    } else {
      response = {
        products: [
          {
            chemical_id: 999,
            molecular_formula: 'XYZ',
            common_name: 'Unknown Compound',
            quantity: 1.0,
            state_of_matter: 'solid',
            color: 'purple',
          },
        ],
        effects: [
          {
            effect_type: 'light_emission',
            color: '#ff00ff',
            intensity: 0.8,
            radius: 2.0,
            duration: 3,
          },
        ],
        explanation: 'A mysterious reaction has occurred!',
        is_world_first: true,
        state_of_product: 'solid',
      };
    }

    return HttpResponse.json(response);
  }),

  http.get(`${API_BASE_URL}/reactions/cache`, () => {
    const cachedReactions: ReactionPrediction[] = [
      {
        products: [
          {
            chemical_id: 4,
            molecular_formula: 'H2O',
            common_name: 'Steam',
            quantity: 1.0,
            state_of_matter: 'gas',
            color: 'colorless',
          },
        ],
        effects: [
          {
            effect_type: 'gas_production',
            gas_type: 'steam',
            color: '#ffffff',
            intensity: 0.7,
            duration: 2,
          },
        ],
        explanation: 'Water heated to produce steam',
        is_world_first: false,
        state_of_product: 'gas',
      },
    ];

    return HttpResponse.json(cachedReactions);
  }),

  http.get(`${API_BASE_URL}/reactions/stats`, () => {
    const stats: UserReactionStats = {
      total_reactions: 25,
      world_first_discoveries: 1,
      favorite_environment: 'Earth (Normal)',
      most_used_chemical: 'Water',
    };

    return HttpResponse.json(stats);
  }),

  // Award endpoints
  http.get(`${API_BASE_URL}/awards/me`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let filteredAwards = mockUserAwards;
    
    if (category) {
      filteredAwards = mockUserAwards.filter(
        award => award.template.category === category
      );
    }

    return HttpResponse.json(filteredAwards);
  }),

  http.get(`${API_BASE_URL}/awards/available`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let filteredAwards = mockAvailableAwards;
    
    if (category) {
      filteredAwards = mockAvailableAwards.filter(
        award => award.category === category
      );
    }

    return HttpResponse.json(filteredAwards);
  }),

  http.get(`${API_BASE_URL}/awards/leaderboard/overall`, () => {
    return HttpResponse.json(mockLeaderboard);
  }),

  http.get(`${API_BASE_URL}/awards/leaderboard/:category`, ({ params }) => {
    const category = params.category as string;
    
    // Return filtered leaderboard for category
    const categoryLeaderboard = mockLeaderboard.map(entry => ({
      ...entry,
      award_count: Math.floor(entry.award_count / 2), // Simulate category-specific counts
    }));

    return HttpResponse.json(categoryLeaderboard);
  }),

  http.get(`${API_BASE_URL}/awards/leaderboard/my-rank`, ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const userRank: UserRank = {
      rank: 2,
      user_id: 1,
      username: 'testuser',
      award_count: category ? 1 : 1,
      total_points: category ? 5 : 10,
    };

    return HttpResponse.json(userRank);
  }),

  // Error simulation endpoints
  http.get(`${API_BASE_URL}/test/error`, () => {
    return HttpResponse.json(
      { detail: 'Simulated server error' },
      { status: 500 }
    );
  }),

  http.get(`${API_BASE_URL}/test/timeout`, () => {
    // Simulate timeout by never resolving
    return new Promise(() => {});
  }),
];