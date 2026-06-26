import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { TitleCasePipe } from '@angular/common';

import { ApiService, Profissional, Especialidade } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Loading } from '../../shared/components/loading/loading';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

interface ProfissionalForm {
  id?: number;
  nome: string;
  registro: string;
  especialidade?: number;
  cargo: string;
  turno: string;
  telefone: string;
  email: string;
  ativo: boolean;
}

@Component({
  selector: 'app-profissionais',
  imports: [FormsModule, Loading, ConfirmDialog, TitleCasePipe],
  template: `
    <div class="page">
      <div class="page__header">
        <h2 class="page-title">Profissionais</h2>
        <button class="btn btn--primary" (click)="openForm()">+ Novo Profissional</button>
      </div>

      <div class="search-bar">
        <input class="search-bar__input" type="text" placeholder="Buscar por nome ou registro..."
               [(ngModel)]="search" (input)="onSearch()" aria-label="Buscar profissionais" />
      </div>

      @if (loading()) {
        <app-loading />
      } @else {
        <div class="table-wrapper">
          <table class="table" role="grid">
            <thead>
              <tr>
                <th>Nome</th><th>Registro</th><th>Especialidade</th><th>Cargo</th><th>Turno</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (p of items(); track p.id) {
                <tr>
                  <td>{{ p.nome }}</td>
                  <td>{{ p.registro }}</td>
                  <td>{{ p.especialidade?.nome }}</td>
                  <td>{{ p.cargo }}</td>
                  <td>{{ p.turno | titlecase }}</td>
                  <td><span class="badge" [class]="p.ativo ? 'badge--ativo' : 'badge--inativo'">{{ p.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                  <td class="table__actions">
                    <button class="btn btn--sm btn--secondary" (click)="openForm(p)">Editar</button>
                    <button class="btn btn--sm btn--danger" (click)="confirmDelete(p)">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="table__empty">Nenhum profissional encontrado.</td></tr>
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
          <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Formulário de profissional">
            <h3 class="modal__title">{{ editing() ? 'Editar' : 'Novo' }} Profissional</h3>
            <form (ngSubmit)="save()">
              <div class="form-grid">
                <div class="field field--full">
                  <label class="field__label" for="nome">Nome *</label>
                  <input class="field__input" id="nome" [(ngModel)]="form.nome" name="nome" required />
                </div>
                <div class="field">
                  <label class="field__label" for="registro">Registro (CRM/COREN/CRF) *</label>
                  <input class="field__input" id="registro" [(ngModel)]="form.registro" name="registro" required />
                </div>
                <div class="field">
                  <label class="field__label" for="especialidade">Especialidade *</label>
                  <select class="field__input" id="especialidade" [(ngModel)]="form.especialidade" name="especialidade" required>
                    <option [ngValue]="undefined">Selecione</option>
                    @for (e of especialidades(); track e.id) {
                      <option [ngValue]="e.id">{{ e.nome }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label class="field__label" for="cargo">Cargo *</label>
                  <input class="field__input" id="cargo" [(ngModel)]="form.cargo" name="cargo" required />
                </div>
                <div class="field">
                  <label class="field__label" for="turno">Turno</label>
                  <select class="field__input" id="turno" [(ngModel)]="form.turno" name="turno">
                    <option value="integral">Integral</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
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
                  <label class="field__label" for="ativo">Status</label>
                  <select class="field__input" id="ativo" [(ngModel)]="form.ativo" name="ativo">
                    <option [ngValue]="true">Ativo</option>
                    <option [ngValue]="false">Inativo</option>
                  </select>
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
          title="Excluir Profissional"
          [message]="'Deseja excluir o profissional ' + deleteTarget()!.nome + '?'"
          (confirmed)="doDelete()"
          (cancelled)="deleteTarget.set(null)"
        />
      }
    </div>
  `,
  styleUrl: '../crud.scss',
})
export class Profissionais implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  protected items = signal<Profissional[]>([]);
  protected especialidades = signal<Especialidade[]>([]);
  protected loading = signal(true);
  protected totalCount = signal(0);
  protected page = signal(1);
  protected hasNext = signal(false);
  protected search = '';
  protected showForm = signal(false);
  protected editing = signal(false);
  protected deleteTarget = signal<Profissional | null>(null);

  protected form: ProfissionalForm = this.emptyForm();

  ngOnInit() {
    this.load();
    this.api.getEspecialidades(new HttpParams().set('page_size', 100)).subscribe(
      res => this.especialidades.set(res.results)
    );
  }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page());
    if (this.search) params = params.set('search', this.search);
    this.api.getProfissionais(params).subscribe({
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

  openForm(item?: Profissional) {
    this.editing.set(!!item);
    this.form = item
      ? { id: item.id, nome: item.nome, registro: item.registro, especialidade: item.especialidade?.id, cargo: item.cargo, turno: item.turno, telefone: item.telefone, email: item.email, ativo: item.ativo }
      : this.emptyForm();
    this.showForm.set(true);
  }

  save() {
    const data = { ...this.form, especialidade: this.form.especialidade };
    const action = this.editing()
      ? this.api.updateProfissional(this.form.id!, data)
      : this.api.createProfissional(data);
    action.subscribe({
      next: () => {
        this.toast.success(this.editing() ? 'Profissional atualizado!' : 'Profissional cadastrado!');
        this.showForm.set(false);
        this.load();
      },
      error: () => this.toast.error('Erro ao salvar profissional.'),
    });
  }

  confirmDelete(item: Profissional) { this.deleteTarget.set(item); }

  doDelete() {
    this.api.deleteProfissional(this.deleteTarget()!.id).subscribe({
      next: () => { this.toast.success('Profissional excluído!'); this.deleteTarget.set(null); this.load(); },
      error: () => this.toast.error('Erro ao excluir. Verifique se não há atendimentos vinculados.'),
    });
  }

  private emptyForm(): ProfissionalForm {
    return { nome: '', registro: '', cargo: '', turno: 'integral', telefone: '', email: '', ativo: true };
  }
}
