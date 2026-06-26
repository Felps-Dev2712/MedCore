import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';

import { ApiService, Paciente } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Loading } from '../../shared/components/loading/loading';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pacientes',
  imports: [FormsModule, Loading, ConfirmDialog],
  template: `
    <div class="page">
      <div class="page__header">
        <h2 class="page-title">Pacientes</h2>
        <button class="btn btn--primary" (click)="openForm()">+ Novo Paciente</button>
      </div>

      <!-- ── Search ──────────────────────────────────────────────── -->
      <div class="search-bar">
        <input class="search-bar__input" type="text" placeholder="Buscar por nome ou CPF..."
               [(ngModel)]="search" (input)="onSearch()" aria-label="Buscar pacientes" />
      </div>

      @if (loading()) {
        <app-loading />
      } @else {
        <!-- ── Table ─────────────────────────────────────────────── -->
        <div class="table-wrapper">
          <table class="table" role="grid">
            <thead>
              <tr>
                <th>Nome</th><th>CPF</th><th>Nascimento</th><th>Sexo</th><th>Telefone</th><th>Convênio</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (p of items(); track p.id) {
                <tr>
                  <td>{{ p.nome_completo }}</td>
                  <td>{{ p.cpf }}</td>
                  <td>{{ p.data_nascimento }}</td>
                  <td>{{ p.sexo }}</td>
                  <td>{{ p.telefone }}</td>
                  <td>{{ p.convenio || '—' }}</td>
                  <td class="table__actions">
                    <button class="btn btn--sm btn--secondary" (click)="openForm(p)">Editar</button>
                    <button class="btn btn--sm btn--danger" (click)="confirmDelete(p)">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table__empty">Nenhum paciente encontrado.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ── Pagination ────────────────────────────────────────── -->
        <div class="pagination">
          <button class="btn btn--sm btn--secondary" [disabled]="page() <= 1" (click)="goPage(page() - 1)">Anterior</button>
          <span class="pagination__info">Página {{ page() }} &middot; {{ totalCount() }} registros</span>
          <button class="btn btn--sm btn--secondary" [disabled]="!hasNext()" (click)="goPage(page() + 1)">Próxima</button>
        </div>
      }

      <!-- ── Form Modal ──────────────────────────────────────────── -->
      @if (showForm()) {
        <div class="overlay" (click)="showForm.set(false)">
          <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Formulário de paciente">
            <h3 class="modal__title">{{ editing() ? 'Editar' : 'Novo' }} Paciente</h3>
            <form (ngSubmit)="save()">
              <div class="form-grid">
                <div class="field field--full">
                  <label class="field__label" for="nome">Nome Completo *</label>
                  <input class="field__input" id="nome" [(ngModel)]="form.nome_completo" name="nome_completo" required />
                </div>
                <div class="field">
                  <label class="field__label" for="cpf">CPF *</label>
                  <input class="field__input" id="cpf" [(ngModel)]="form.cpf" name="cpf" required placeholder="000.000.000-00" />
                </div>
                <div class="field">
                  <label class="field__label" for="nascimento">Data Nascimento *</label>
                  <input class="field__input" id="nascimento" type="date" [(ngModel)]="form.data_nascimento" name="data_nascimento" required />
                </div>
                <div class="field">
                  <label class="field__label" for="sexo">Sexo *</label>
                  <select class="field__input" id="sexo" [(ngModel)]="form.sexo" name="sexo" required>
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
                <div class="field">
                  <label class="field__label" for="telefone">Telefone</label>
                  <input class="field__input" id="telefone" [(ngModel)]="form.telefone" name="telefone" />
                </div>
                <div class="field">
                  <label class="field__label" for="email">Email</label>
                  <input class="field__input" id="email" type="email" [(ngModel)]="form.email" name="email" />
                </div>
                <div class="field">
                  <label class="field__label" for="convenio">Convênio</label>
                  <input class="field__input" id="convenio" [(ngModel)]="form.convenio" name="convenio" />
                </div>
                <div class="field">
                  <label class="field__label" for="carteirinha">Nº Carteirinha</label>
                  <input class="field__input" id="carteirinha" [(ngModel)]="form.numero_carteirinha" name="numero_carteirinha" />
                </div>
                <div class="field field--full">
                  <label class="field__label" for="endereco">Endereço</label>
                  <input class="field__input" id="endereco" [(ngModel)]="form.endereco" name="endereco" />
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

      <!-- ── Delete Confirm ──────────────────────────────────────── -->
      @if (deleteTarget()) {
        <app-confirm-dialog
          title="Excluir Paciente"
          [message]="'Deseja excluir o paciente ' + deleteTarget()!.nome_completo + '?'"
          (confirmed)="doDelete()"
          (cancelled)="deleteTarget.set(null)"
        />
      }
    </div>
  `,
  styleUrl: '../crud.scss',
})
export class Pacientes implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  protected items = signal<Paciente[]>([]);
  protected loading = signal(true);
  protected totalCount = signal(0);
  protected page = signal(1);
  protected hasNext = signal(false);
  protected search = '';
  protected showForm = signal(false);
  protected editing = signal(false);
  protected deleteTarget = signal<Paciente | null>(null);

  protected form: Partial<Paciente> = {};

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page());
    if (this.search) params = params.set('search', this.search);
    this.api.getPacientes(params).subscribe({
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

  openForm(item?: Paciente) {
    this.editing.set(!!item);
    this.form = item ? { ...item } : {};
    this.showForm.set(true);
  }

  save() {
    const action = this.editing()
      ? this.api.updatePaciente(this.form.id!, this.form)
      : this.api.createPaciente(this.form);
    action.subscribe({
      next: () => {
        this.toast.success(this.editing() ? 'Paciente atualizado!' : 'Paciente cadastrado!');
        this.showForm.set(false);
        this.load();
      },
      error: () => this.toast.error('Erro ao salvar paciente.'),
    });
  }

  confirmDelete(item: Paciente) { this.deleteTarget.set(item); }

  doDelete() {
    const id = this.deleteTarget()!.id;
    this.api.deletePaciente(id).subscribe({
      next: () => { this.toast.success('Paciente excluído!'); this.deleteTarget.set(null); this.load(); },
      error: () => this.toast.error('Erro ao excluir paciente.'),
    });
  }
}
