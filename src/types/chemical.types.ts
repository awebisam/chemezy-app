// Chemical-related type definitions

export type StateOfMatter = 'solid' | 'liquid' | 'gas' | 'plasma' | 'aqueous';

export interface Chemical {
  id: number;
  molecular_formula: string;
  common_name: string;
  state_of_matter: StateOfMatter;
  color: string;
  density: number;
  properties: Record<string, any>;
}

export interface ChemicalCreate {
  molecular_formula: string;
  context?: string | null;
}

export interface PaginatedChemicals {
  count: number;
  results: Chemical[];
}

export interface SelectedChemical {
  chemical: Chemical;
  quantity: number;
}