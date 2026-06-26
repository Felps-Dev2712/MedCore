import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { TitleCasePipe, DecimalPipe } from '@angular/common';

import { ApiService, Atendimento, Paciente, Profissional } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Loading } from '../../shared/components/loading/loading';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

interface AtendimentoForm {
  id?: number;
  paciente?: number;
  profissional?: number;
  data_hora: string;
  tipo: string;
  status: string;
  diagnostico: string;
  observacoes: string;
  valor: number;
}

@Component({
  selector: 'app-atendimentos',
  imports: [FormsModule, Loading, ConfirmDialog, TitleCasePipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page__header">
        <h2 class="page-title">Atendimentos</h2>
        <button class="btn btn--primary" (click)="openForm()">+ Novo Atendimento</button>
      </div>

      <!-- ── Filters ─────────────────────────────────────────────── -->
      <div class="filter-bar">
        <input class="search-bar__input" type="text" placeholder="Buscar paciente ou profissional..."
               [(ngModel)]="search" (input)="onSearch()" aria-label="Buscar atendimentos" />
        <input class="search-bar__input" type="date" [(ngModel)]="filterDate" (change)="onSearch()" aria-label="Filtrar por data" />
        <select class="search-bar__input" [(ngModel)]="filterStatus" (change)="onSearch()" aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          <option value="agendado">Agendado</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      @if (loading()) {
        <app-loading />
      } @else {
        <div class="table-wrapper">
          <table class="table" role="grid">
            <thead>
              <tr>
                <th>Data/Hora</th><th>Paciente</th><th>Profissional</th><th>Tipo</th><th>Status</th><th>Valor</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (a of items(); track a.id) {
                <tr>
                  <td>{{ formatDate(a.data_hora) }}</td>
                  <td>{{ a.paciente?.nome_completo }}</td>
                  <td>{{ a.profissional?.nome }}</td>
                  <td>{{ a.tipo | titlecase }}</td>
                  <td><span class="badge" [class]="'badge--' + a.status">{{ formatStatus(a.status) }}</span></td>
                  <td>R$ {{ a.valor | number:'1.2-2' }}</td>
                  <td class="table__actions">
                    <button class="btn btn--sm btn--secondary" (click)="openForm(a)">Editar</button>
                    <button class="btn btn--sm btn--danger" (click)="confirmDelete(a)">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table__empty">Nenhum atendimento encontrado.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <button class="btn btn--sm btn--secondary" [disabled]="page() <= 1" (click)="goPage(page() - 1)">Anterior</button>
          <span class="pagination__info">Página {{ page() }} &middot; {{ totalCount() }} registros</span>
          <button class="btn btn--sm btn--secondary" [disabled]="!hasNext()" (click)="goPage(page() + 1)">Próxima</button>
        </div>
      }

      @if (showForm()) {
        <div class="overlay" (click)="showForm.set(false)">
          <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Formulário de atendimento">
            <h3 class="modal__title">{{ editing() ? 'Editar' : 'Novo' }} Atendimento</h3>
            <form (ngSubmit)="save()">
              <div class="form-grid">
                <div class="field">
                  <label class="field__label" for="paciente">Paciente *</label>
                  <select class="field__input" id="paciente" [(ngModel)]="form.paciente" name="paciente" required>
                    <option [ngValue]="undefined">Selecione</option>
                    @for (p of pacientes(); track p.id) {
                      <option [ngValue]="p.id">{{ p.nome_completo }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label class="field__label" for="profissional">Profissional *</label>
                  <select class="field__input" id="profissional" [(ngModel)]="form.profissional" name="profissional" required>
                    <option [ngValue]="undefined">Selecione</option>
                    @for (p of profissionais(); track p.id) {
                      <option [ngValue]="p.id">{{ p.nome }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label class="field__label" for="data_hora">Data/Hora *</label>
                  <input class="field__input" id="data_hora" type="datetime-local" [(ngModel)]="form.data_hora" name="data_hora" required />
                </div>
                <div class="field">
                  <label class="field__label" for="tipo">Tipo *</label>
                  <select class="field__input" id="tipo" [(ngModel)]="form.tipo" name="tipo" required>
                    <option value="">Selecione</option>
                    <option value="consulta">Consulta</option>
                    <option value="exame">Exame</option>
                    <option value="internacao">Internação</option>
                  </select>
                </div>
                <div class="field">
                  <label class="field__label" for="status">Status</label>
                  <select class="field__input" id="status" [(ngModel)]="form.status" name="status">
                    <option value="agendado">Agendado</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div class="field">
                  <label class="field__label" for="valor">Valor (R$)</label>
                  <input class="field__input" id="valor" type="number" step="0.01" [(ngModel)]="form.valor" name="valor" />
                </div>
                <div class="field field--full">
                  <label class="field__label" for="diagnostico">Diagnóstico</label>
                  <input class="field__input" id="diagnostico" [(ngModel)]="form.diagnostico" name="diagnostico" />
                </div>
                <div class="field field--full">
                  <label class="field__label" for="observacoes">Observações</label>
                  <input class="field__input" id="observacoes" [(ngModel)]="form.observacoes" name="observacoes" />
                </div>
              </div>
              <div class="modal__actions">
                <button type="button" class="btn btn--secondary" (click)="showForm.set(false)">Cancelar</button>
                <button type="submit" class="btn btn--primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (deleteTarget()) {
        <app-confirm-dialog
          title="Excluir Atendimento"
          [message]="'Deseja excluir o atendimento #' + deleteTarget()!.id + '?'"
          (confirmed)="doDelete()"
          (cancelled)="deleteTarget.set(null)"
        />
      }
    </div>
  `,
  styles: `
    .filter-bar {
      display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;
    }
    .filter-bar .search-bar__input { max-width: 280px; }
  `,
  styleUrl: '../crud.scss',
})
export class Atendimentos implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  protected items = signal<Atendimento[]>([]);
  protected pacientes = signal<Paciente[]>([]);
  protected profissionais = signal<Profissional[]>([]);
  protected loading = signal(true);
  protected totalCount = signal(0);
  protected page = signal(1);
  protected hasNext = signal(false);
  protected search = '';
  protected filterDate = '';
  protected filterStatus = '';
  protected showForm = signal(false);
  protected editing = signal(false);
  protected deleteTarget = signal<Atendimento | null>(null);

  protected form: AtendimentoForm = this.emptyForm();

  ngOnInit() {
    this.load();
    this.api.getPacientes(new HttpParams().set('page_size', 200)).subscribe(
      res => this.pacientes.set(res.results)
    );
    this.api.getProfissionais(new HttpParams().set('page_size', 200)).subscribe(
      res => this.profissionais.set(res.results)
    );
  }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page());
    if (this.search) params = params.set('search', this.search);
    if (this.filterDate) params = params.set('data', this.filterDate);
    if (this.filterStatus) params = params.set('status', this.filterStatus);
    this.api.getAtendimentos(params).subscribe({
      next: res => {
        this.items.set(res.results);
        this.totalCount.set(res.count);
        this.hasNext.set(!!res.next);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch() { this.page.set(1); this.load(); }
  goPage(p: number) { this.page.set(p); this.load(); }

  openForm(item?: Atendimento) {
    this.editing.set(!!item);
    if (item) {
      this.form = {
        id: item.id,
        paciente: item.paciente?.id,
        profissional: item.profissional?.id,
        data_hora: item.data_hora ? item.data_hora.slice(0, 16) : '',
        tipo: item.tipo,
        status: item.status,
        diagnostico: item.diagnostico,
        observacoes: item.observacoes,
        valor: item.valor,
      };
    } else {
      this.form = this.emptyForm();
    }
    this.showForm.set(true);
  }

  save() {
    const data = { ...this.form };
    const action = this.editing()
      ? this.api.updateAtendimento(data.id!, data)
      : this.api.createAtendimento(data);
    action.subscribe({
      next: () => {
        this.toast.success(this.editing() ? 'Atendimento atualizado!' : 'Atendimento cadastrado!');
        this.showForm.set(false);
        this.load();
      },
      error: () => this.toast.error('Erro ao salvar atendimento.'),
    });
  }

  confirmDelete(item: Atendimento) { this.deleteTarget.set(item); }

  doDelete() {
    this.api.deleteAtendimento(this.deleteTarget()!.id).subscribe({
      next: () => { this.toast.success('Atendimento excluído!'); this.deleteTarget.set(null); this.load(); },
      error: () => this.toast.error('Erro ao excluir atendimento.'),
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

  private emptyForm(): AtendimentoForm {
    return { data_hora: '', tipo: '', status: 'agendado', diagnostico: '', observacoes: '', valor: 0 };
  }
}
