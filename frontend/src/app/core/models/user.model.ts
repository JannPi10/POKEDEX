export interface User {
  id: number;
  name: string;
  email: string | null;
  favorite_genres: string[];
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

