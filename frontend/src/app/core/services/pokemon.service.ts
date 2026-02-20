import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PokemonDetail, PokemonListResponse } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  constructor(private http: HttpClient) {}

  list(limit = 20, offset = 0): Observable<PokemonListResponse> {
    const params = new HttpParams().set('limit', limit).set('offset', offset);
    return this.http.get<PokemonListResponse>(`${environment.apiUrl}/pokemon`, { params });
  }

  detail(name: string): Observable<PokemonDetail> {
    return this.http.get<PokemonDetail>(`${environment.apiUrl}/pokemon/${name}`);
  }
}

