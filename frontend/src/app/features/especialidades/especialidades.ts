import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';

import { ApiService, Especialidade } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Loading } from '../../shared/components/loading/loading';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-especialidades',
  imports: [FormsModule, Loading, ConfirmDialog],
  template: `
    <div class="page">
      <div class="page__header">
        <h2 class="page-title">Especialidades</h2>
        <button class="btn btn--primary" (click)="openForm()">+ Nova Especialidade</button>
      </div>

      <div class="search-bar">
        <input class="search-bar__input" type="text" placeholder="Buscar por nome ou área..."
               [(ngModel)]="search" (input)="onSearch()" aria-label="Buscar especialidades" />
      </div>

      @if (loading()) {
        <app-loading />
      } @else {
        <div class="table-wrapper">
          <table class="table" role="grid">
            <thead>
              <tr>
                <th>Nome</th><th>Área</th><th>Descrição</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (e of items(); track e.id) {
                <tr>
                  <td>{{ e.nome }}</td>
                  <td>{{ e.area }}</td>
                  <td>{{ e.descricao || '—' }}</td>
                  <td class="table__actions">
                    <button class="btn btn--sm btn--secondary" (click)="openForm(e)">Editar</button>
                    <button class="btn btn--sm btn--danger" (click)="confirmDelete(e)">Excluir</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="4" class="table__empty">Nenhuma especialidade encontrada.</td></tr>
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
          <div class="modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Formulário de especialidade">
            <h3 class="modal__title">{{ editing() ? 'Editar' : 'Nova' }} Especialidade</h3>
            <form (ngSubmit)="save()">
              <div class="form-grid">
                <div class="field">
                  <label class="field__label" for="nome">Nome *</label>
                  <input class="field__input" id="nome" [(ngModel)]="form.nome" name="nome" required />
                </div>
                <div class="field">
                  <label class="field__label" for="area">Área *</label>
                  <input class="field__input" id="area" [(ngModel)]="form.area" name="area" required placeholder="Ex: Clínica, Cirúrgica" />
                </div>
                <div class="field field--full">
                  <label class="field__label" for="descricao">Descrição</label>
                  <input class="field__input" id="descricao" [(ngModel)]="form.descricao" name="descricao" />
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
          title="Excluir Especialidade"
          [message]="'Deseja excluir a especialidade ' + deleteTarget()!.nome + '?'"
          (confirmed)="doDelete()"
          (cancelled)="deleteTarget.set(null)"
        />
      }
    </div>
  `,
  styleUrl: '../crud.scss',
})
export class Especialidades implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  protected items = signal<Especialidade[]>([]);
  protected loading = signal(true);
  protected totalCount = signal(0);
  protected page = signal(1);
  protected hasNext = signal(false);
  protected search = '';
  protected showForm = signal(false);
  protected editing = signal(false);
  protected deleteTarget = signal<Especialidade | null>(null);

  protected form: Partial<Especialidade> = {};

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page());
    if (this.search) params = params.set('search', this.search);
    this.api.getEspecialidades(params).subscribe({
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

  openForm(item?: Especialidade) {
    this.editing.set(!!item);
    this.form = item ? { ...item } : {};
    this.showForm.set(true);
  }

  save() {
    const action = this.editing()
      ? this.api.updateEspecialidade(this.form.id!, this.form)
      : this.api.createEspecialidade(this.form);
    action.subscribe({
      next: () => {
        this.toast.success(this.editing() ? 'Especialidade atualizada!' : 'Especialidade cadastrada!');
        this.showForm.set(false);
        this.load();
      },
      error: () => this.toast.error('Erro ao salvar especialidade.'),
    });
  }

  confirmDelete(item: Especialidade) { this.deleteTarget.set(item); }

  doDelete() {
    this.api.deleteEspecialidade(this.deleteTarget()!.id).subscribe({
      next: () => { this.toast.success('Especialidade excluída!'); this.deleteTarget.set(null); this.load(); },
      error: () => this.toast.error('Erro ao excluir. Verifique se não há profissionais vinculados.'),
    });
  }
}
