import { Component, inject, output } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  template: `
    <header class="header" role="banner">
      <button class="header__menu" (click)="menuToggled.emit()" aria-label="Abrir menu">&#9776;</button>
      <div class="header__spacer"></div>
      <div class="header__user">
        <span class="header__username">{{ auth.user()?.username }}</span>
        <button class="header__logout" (click)="auth.logout()" aria-label="Sair">Sair</button>
      </div>
    </header>
  `,
  styles: `
    .header {
      height: 56px; background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; padding: 0 1.5rem; gap: 1rem;
    }
    .header__menu {
      display: none; background: none; border: none;
      font-size: 1.25rem; cursor: pointer; color: var(--text);
      padding: 0.25rem;
    }
    .header__spacer { flex: 1; }
    .header__user { display: flex; align-items: center; gap: 1rem; }
    .header__username { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
    .header__logout {
      background: none; border: 1px solid var(--border); border-radius: 6px;
      padding: 0.375rem 0.875rem; font-size: 0.8125rem; cursor: pointer;
      color: var(--text-secondary); transition: all 0.15s;
    }
    .header__logout:hover { border-color: #dc2626; color: #dc2626; }

    @media (max-width: 768px) {
      .header__menu { display: block; }
    }
  `,
})
export class Header {
  protected auth = inject(AuthService);
  menuToggled = output<void>();
}
