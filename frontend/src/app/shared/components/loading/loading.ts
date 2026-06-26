import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loading" role="status" aria-label="Carregando">
      <div class="spinner"></div>
      <span>Carregando...</span>
    </div>
  `,
  styles: `
    .loading {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 3rem; gap: 1rem; color: var(--text-secondary);
    }
    .spinner {
      width: 36px; height: 36px; border: 3px solid var(--border);
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `,
})
export class Loading {}
