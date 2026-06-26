import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="overlay" (click)="cancelled.emit()">
      <div class="dialog" role="alertdialog" aria-modal="true" [attr.aria-label]="title()" (click)="$event.stopPropagation()">
        <h3 class="dialog__title">{{ title() }}</h3>
        <p class="dialog__message">{{ message() }}</p>
        <div class="dialog__actions">
          <button class="btn btn--secondary" (click)="cancelled.emit()">Cancelar</button>
          <button class="btn btn--danger" (click)="confirmed.emit()">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .dialog {
      background: var(--surface); border-radius: 12px;
      padding: 1.5rem; width: 90%; max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .dialog__title { margin: 0 0 0.5rem; font-size: 1.125rem; color: var(--text); }
    .dialog__message { color: var(--text-secondary); margin: 0 0 1.5rem; font-size: 0.9375rem; }
    .dialog__actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn {
      padding: 0.5rem 1.25rem; border-radius: 6px; border: none;
      font-size: 0.875rem; cursor: pointer; font-weight: 500;
    }
    .btn--secondary { background: var(--bg-hover); color: var(--text); }
    .btn--danger { background: #dc2626; color: #fff; }
    .btn--danger:hover { background: #b91c1c; }
  `,
})
export class ConfirmDialog {
  title = input('Confirmar');
  message = input('Tem certeza que deseja realizar esta ação?');
  confirmed = output<void>();
  cancelled = output<void>();
}
