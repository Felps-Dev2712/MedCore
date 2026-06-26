import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from './shared/components/sidebar/sidebar';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Header],
  template: `
    <div class="layout">
      <app-sidebar [open]="sidebarOpen()" (closed)="sidebarOpen.set(false)" />
      <div class="layout__main">
        <app-header (menuToggled)="sidebarOpen.update(v => !v)" />
        <main class="layout__content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .layout { display: flex; min-height: 100vh; }
    .layout__main { flex: 1; margin-left: 240px; display: flex; flex-direction: column; }
    .layout__content { flex: 1; padding: 1.5rem; background: var(--bg); overflow-y: auto; }

    @media (max-width: 768px) {
      .layout__main { margin-left: 0; }
    }
  `,
})
export class AppLayout {
  protected sidebarOpen = signal(false);
}
