import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

import { ApiService, LoginResponse } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  private readonly _token = signal<string | null>(this.storedToken());
  private readonly _user = signal<LoginResponse['user'] | null>(this.storedUser());

  readonly isAuthenticated = computed(() => !!this._token());
  readonly user = this._user.asReadonly();

  login(username: string, password: string) {
    return this.api.login(username, password).pipe(
      tap(res => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('user', JSON.stringify(res.user));
        this._token.set(res.access);
        this._user.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  setToken(token: string) {
    localStorage.setItem('access_token', token);
    this._token.set(token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private storedToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private storedUser(): LoginResponse['user'] | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }
}
