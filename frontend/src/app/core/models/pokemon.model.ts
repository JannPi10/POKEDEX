export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
  };
  stats: PokemonStat[];
  types: PokemonType[];
  height: number;
  weight: number;
}

