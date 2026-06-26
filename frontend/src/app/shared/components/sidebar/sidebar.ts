import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.sidebar--open]="open()" role="navigation" aria-label="Menu principal">
      <div class="sidebar__brand">
        <span class="sidebar__logo">&#9829;</span>
        <span class="sidebar__title">MedCore</span>
      </div>
      <nav class="sidebar__nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="sidebar__link" (click)="closed.emit()">
          <span class="sidebar__icon">&#9632;</span> Dashboard
        </a>
        <a routerLink="/pacientes" routerLinkActive="active" class="sidebar__link" (click)="closed.emit()">
          <span class="sidebar__icon">&#9899;</span> Pacientes
        </a>
        <a routerLink="/profissionais" routerLinkActive="active" class="sidebar__link" (click)="closed.emit()">
          <span class="sidebar__icon">&#9898;</span> Profissionais
        </a>
        <a routerLink="/especialidades" routerLinkActive="active" class="sidebar__link" (click)="closed.emit()">
          <span class="sidebar__icon">&#10023;</span> Especialidades
        </a>
        <a routerLink="/atendimentos" routerLinkActive="active" class="sidebar__link" (click)="closed.emit()">
          <span class="sidebar__icon">&#10010;</span> Atendimentos
        </a>
      </nav>
    </aside>
    @if (open()) {
      <div class="sidebar__backdrop" (click)="closed.emit()"></div>
    }
  `,
  styles: `
    .sidebar {
      width: 240px; height: 100vh; background: var(--sidebar-bg);
      display: flex; flex-direction: column; position: fixed; left: 0; top: 0;
      z-index: 100; transition: transform 0.3s ease;
      border-right: 1px solid var(--border);
    }
    .sidebar__brand {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border);
    }
    .sidebar__logo { font-size: 1.5rem; color: var(--primary); }
    .sidebar__title { font-size: 1.25rem; font-weight: 700; color: var(--text); }
    .sidebar__nav { padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .sidebar__link {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.625rem 0.75rem; border-radius: 8px;
      color: var(--text-secondary); text-decoration: none;
      font-size: 0.875rem; font-weight: 500; transition: all 0.15s;
    }
    .sidebar__link:hover { background: var(--bg-hover); color: var(--text); }
    .sidebar__link.active { background: var(--primary-light); color: var(--primary); font-weight: 600; }
    .sidebar__icon { font-size: 1rem; width: 20px; text-align: center; }
    .sidebar__backdrop { display: none; }

    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar--open { transform: translateX(0); }
      .sidebar__backdrop {
        display: block; position: fixed; inset: 0;
        background: rgba(0,0,0,0.4); z-index: 99;
      }
    }
  `,
})
export class Sidebar {
  open = input(false);
  closed = output<void>();
}
