import { User } from './user.model';

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

