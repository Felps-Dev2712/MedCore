import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <form class="login-card" (ngSubmit)="onSubmit()">
        <div class="login-card__brand">
          <span class="login-card__logo">&#9829;</span>
          <h1 class="login-card__title">MedCore System</h1>
          <p class="login-card__subtitle">Sistema Integrado de Gestão Hospitalar</p>
        </div>
        <div class="field">
          <label class="field__label" for="username">Usuário</label>
          <input class="field__input" id="username" type="text" [(ngModel)]="username" name="username"
                 required autocomplete="username" placeholder="Digite seu usuário" />
        </div>
        <div class="field">
          <label class="field__label" for="password">Senha</label>
          <input class="field__input" id="password" type="password" [(ngModel)]="password" name="password"
                 required autocomplete="current-password" placeholder="Digite sua senha" />
        </div>
        <button class="btn-login" type="submit" [disabled]="loading()">
          @if (loading()) { Entrando... } @else { Entrar }
        </button>
      </form>
    </div>
  `,
  styles: `
    .login-page {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1e3a5f 0%, #0f2137 100%);
      padding: 1rem;
    }
    .login-card {
      background: var(--surface); border-radius: 16px; padding: 2.5rem;
      width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-card__brand { text-align: center; margin-bottom: 2rem; }
    .login-card__logo { font-size: 2.5rem; color: var(--primary); }
    .login-card__title { margin: 0.5rem 0 0.25rem; font-size: 1.5rem; color: var(--text); }
    .login-card__subtitle { margin: 0; font-size: 0.875rem; color: var(--text-secondary); }
    .field { margin-bottom: 1.25rem; }
    .field__label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text); margin-bottom: 0.375rem; }
    .field__input {
      width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border);
      border-radius: 8px; font-size: 0.875rem; background: var(--bg);
      color: var(--text); box-sizing: border-box; transition: border-color 0.15s;
    }
    .field__input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
    .btn-login {
      width: 100%; padding: 0.75rem; background: var(--primary); color: #fff;
      border: none; border-radius: 8px; font-size: 0.9375rem; font-weight: 600;
      cursor: pointer; transition: background 0.15s;
    }
    .btn-login:hover:not(:disabled) { background: var(--primary-dark); }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected username = '';
  protected password = '';
  protected loading = signal(false);

  onSubmit() {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.toast.success('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.toast.error('Usuário ou senha inválidos.');
        this.loading.set(false);
      },
    });
  }
}
