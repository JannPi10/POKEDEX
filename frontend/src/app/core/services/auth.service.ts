import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, catchError, finalize, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'pokedex_token';
  private readonly userKey = 'pokedex_user';

  private tokenSubject = new BehaviorSubject<string | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);

  readonly token$ = this.tokenSubject.asObservable();
  readonly user$ = this.userSubject.asObservable();
  readonly isAuthenticated$ = this.token$.pipe(map((token) => !!token));

  isAuthenticating = signal(false);

  constructor(private http: HttpClient) {
    this.restoreFromStorage();
  }

  get token(): string | null {
    return this.tokenSubject.value;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isAuthenticating.set(true);
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.setSession(res.token, res.user);
      }),
      catchError((err) => {
        return throwError(() => err);
      }),
      finalize(() => this.isAuthenticating.set(false))
    );
  }

  logout(): Observable<null> {
    return this.http.post<null>(`${environment.apiUrl}/logout`, {}).pipe(
      catchError(() => of(null)),
      tap(() => this.clearSession())
    );
  }

  logoutLocal(): void {
    this.clearSession();
  }

  fetchMe(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/me`).pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.persistUser(user);
      })
    );
  }

  updateProfile(payload: Partial<Pick<User, 'name' | 'email' | 'favorite_genres'>>): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/me`, payload).pipe(
      tap((user) => {
        this.userSubject.next(user);
        this.persistUser(user);
      })
    );
  }

  private setSession(token: string, user: User): void {
    this.tokenSubject.next(token);
    this.userSubject.next(user);
    this.persistToken(token);
    this.persistUser(user);
  }

  private clearSession(): void {
    this.tokenSubject.next(null);
    this.userSubject.next(null);
    if (this.canUseStorage()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  private restoreFromStorage(): void {
    if (!this.canUseStorage()) {
      return;
    }

    const token = localStorage.getItem(this.tokenKey);
    const userRaw = localStorage.getItem(this.userKey);

    if (token) {
      this.tokenSubject.next(token);
    }

    if (userRaw) {
      try {
        const parsed: User = JSON.parse(userRaw);
        this.userSubject.next(parsed);
      } catch (error) {
        console.warn('No se pudo parsear el usuario almacenado', error);
      }
    }
  }

  private persistToken(token: string): void {
    if (this.canUseStorage()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private persistUser(user: User): void {
    if (this.canUseStorage()) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
