import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, TitleCasePipe } from '@angular/common';

import { ApiService, DashboardData } from '../../core/services/api.service';
import { Loading } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-dashboard',
  imports: [Loading, DecimalPipe, TitleCasePipe],
  template: `
    @if (loading()) {
      <app-loading />
    } @else if (data(); as d) {
      <div class="dashboard">
        <h2 class="page-title">Dashboard</h2>

        <!-- ── KPI Cards ─────────────────────────────────────────── -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-card--blue">
            <span class="kpi-card__icon">&#9899;</span>
            <div class="kpi-card__info">
              <span class="kpi-card__value">{{ d.total_pacientes }}</span>
              <span class="kpi-card__label">Pacientes</span>
            </div>
          </div>
          <div class="kpi-card kpi-card--green">
            <span class="kpi-card__icon">&#9898;</span>
            <div class="kpi-card__info">
              <span class="kpi-card__value">{{ d.total_profissionais }}</span>
              <span class="kpi-card__label">Profissionais Ativos</span>
            </div>
          </div>
          <div class="kpi-card kpi-card--orange">
            <span class="kpi-card__icon">&#10010;</span>
            <div class="kpi-card__info">
              <span class="kpi-card__value">{{ d.atendimentos_hoje }}</span>
              <span class="kpi-card__label">Atendimentos Hoje</span>
            </div>
          </div>
          <div class="kpi-card kpi-card--purple">
            <span class="kpi-card__icon">&#36;</span>
            <div class="kpi-card__info">
              <span class="kpi-card__value">R$ {{ d.receita_total | number:'1.2-2' }}</span>
              <span class="kpi-card__label">Receita Total</span>
            </div>
          </div>
        </div>

        <!-- ── Charts / Summary ──────────────────────────────────── -->
        <div class="summary-grid">
          <div class="summary-card">
            <h3 class="summary-card__title">Atendimentos por Tipo</h3>
            @for (item of d.atendimentos_por_tipo; track item.tipo) {
              <div class="bar-row">
                <span class="bar-row__label">{{ item.tipo | titlecase }}</span>
                <div class="bar-row__track">
                  <div class="bar-row__fill bar-row__fill--blue" [style.width.%]="barPercent(item.total, d.atendimentos_por_tipo)"></div>
                </div>
                <span class="bar-row__value">{{ item.total }}</span>
              </div>
            }
          </div>
          <div class="summary-card">
            <h3 class="summary-card__title">Atendimentos por Status</h3>
            @for (item of d.atendimentos_por_status; track item.status) {
              <div class="bar-row">
                <span class="bar-row__label">{{ formatStatus(item.status) }}</span>
                <div class="bar-row__track">
                  <div class="bar-row__fill" [class]="'bar-row__fill--' + item.status" [style.width.%]="barPercent(item.total, d.atendimentos_por_status)"></div>
                </div>
                <span class="bar-row__value">{{ item.total }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .dashboard { padding: 0; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text); margin: 0 0 1.5rem; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .kpi-card {
      background: var(--surface); border-radius: 12px; padding: 1.25rem 1.5rem;
      display: flex; align-items: center; gap: 1rem;
      border: 1px solid var(--border); transition: transform 0.15s;
    }
    .kpi-card:hover { transform: translateY(-2px); }
    .kpi-card__icon { font-size: 1.75rem; opacity: 0.9; }
    .kpi-card--blue .kpi-card__icon { color: #3b82f6; }
    .kpi-card--green .kpi-card__icon { color: #059669; }
    .kpi-card--orange .kpi-card__icon { color: #f59e0b; }
    .kpi-card--purple .kpi-card__icon { color: #8b5cf6; }
    .kpi-card__info { display: flex; flex-direction: column; }
    .kpi-card__value { font-size: 1.5rem; font-weight: 700; color: var(--text); }
    .kpi-card__label { font-size: 0.8125rem; color: var(--text-secondary); }

    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1rem; }
    .summary-card {
      background: var(--surface); border-radius: 12px; padding: 1.25rem 1.5rem;
      border: 1px solid var(--border);
    }
    .summary-card__title { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: var(--text); }

    .bar-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .bar-row__label { width: 100px; font-size: 0.8125rem; color: var(--text-secondary); text-transform: capitalize; }
    .bar-row__track { flex: 1; height: 8px; background: var(--bg-hover); border-radius: 4px; overflow: hidden; }
    .bar-row__fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
    .bar-row__fill--blue, .bar-row__fill--consulta, .bar-row__fill--agendado { background: #3b82f6; }
    .bar-row__fill--exame, .bar-row__fill--em_andamento { background: #f59e0b; }
    .bar-row__fill--internacao, .bar-row__fill--concluido { background: #059669; }
    .bar-row__fill--cancelado { background: #dc2626; }
    .bar-row__value { width: 30px; text-align: right; font-size: 0.875rem; font-weight: 600; color: var(--text); }
  `,
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);

  protected loading = signal(true);
  protected data = signal<DashboardData | null>(null);

  ngOnInit() {
    this.api.getDashboard().subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected barPercent(value: number, items: { total: number }[]): number {
    const max = Math.max(...items.map(i => i.total), 1);
    return (value / max) * 100;
  }

  protected formatStatus(status: string): string {
    const map: Record<string, string> = {
      agendado: 'Agendado',
      em_andamento: 'Em andamento',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return map[status] ?? status;
  }
}
