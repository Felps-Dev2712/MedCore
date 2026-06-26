import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./app.layout').then(m => m.AppLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'pacientes', loadComponent: () => import('./features/pacientes/pacientes').then(m => m.Pacientes) },
      { path: 'profissionais', loadComponent: () => import('./features/profissionais/profissionais').then(m => m.Profissionais) },
      { path: 'especialidades', loadComponent: () => import('./features/especialidades/especialidades').then(m => m.Especialidades) },
      { path: 'atendimentos', loadComponent: () => import('./features/atendimentos/atendimentos').then(m => m.Atendimentos) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
