import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

// ── Types ───────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Especialidade {
  id: number;
  nome: string;
  descricao: string;
  area: string;
}

export interface Profissional {
  id: number;
  nome: string;
  registro: string;
  especialidade: Especialidade;
  especialidade_id?: number;
  cargo: string;
  turno: string;
  telefone: string;
  email: string;
  ativo: boolean;
}

export interface Paciente {
  id: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  endereco: string;
  convenio: string;
  numero_carteirinha: string;
}

export interface Atendimento {
  id: number;
  paciente: Paciente;
  paciente_id?: number;
  profissional: Profissional;
  profissional_id?: number;
  data_hora: string;
  tipo: string;
  status: string;
  diagnostico: string;
  observacoes: string;
  valor: number;
}

export interface DashboardData {
  total_pacientes: number;
  total_profissionais: number;
  atendimentos_hoje: number;
  atendimentos_por_tipo: { tipo: string; total: number }[];
  atendimentos_por_status: { status: string; total: number }[];
  receita_total: number;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: { id: number; username: string; email: string; first_name: string; last_name: string };
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login/`, { username, password });
  }

  refreshToken(refresh: string): Observable<{ access: string }> {
    return this.http.post<{ access: string }>(`${this.base}/auth/refresh/`, { refresh });
  }

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.base}/dashboard/`);
  }

  // ── Especialidades ──────────────────────────────────────────────────────

  getEspecialidades(params?: HttpParams): Observable<PaginatedResponse<Especialidade>> {
    return this.http.get<PaginatedResponse<Especialidade>>(`${this.base}/especialidades/`, { params });
  }

  getEspecialidade(id: number): Observable<Especialidade> {
    return this.http.get<Especialidade>(`${this.base}/especialidades/${id}/`);
  }

  createEspecialidade(data: Partial<Especialidade>): Observable<Especialidade> {
    return this.http.post<Especialidade>(`${this.base}/especialidades/`, data);
  }

  updateEspecialidade(id: number, data: Partial<Especialidade>): Observable<Especialidade> {
    return this.http.put<Especialidade>(`${this.base}/especialidades/${id}/`, data);
  }

  deleteEspecialidade(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/especialidades/${id}/`);
  }

  // ── Profissionais ───────────────────────────────────────────────────────

  getProfissionais(params?: HttpParams): Observable<PaginatedResponse<Profissional>> {
    return this.http.get<PaginatedResponse<Profissional>>(`${this.base}/profissionais/`, { params });
  }

  getProfissional(id: number): Observable<Profissional> {
    return this.http.get<Profissional>(`${this.base}/profissionais/${id}/`);
  }

  createProfissional(data: Record<string, unknown>): Observable<Profissional> {
    return this.http.post<Profissional>(`${this.base}/profissionais/`, data);
  }

  updateProfissional(id: number, data: Record<string, unknown>): Observable<Profissional> {
    return this.http.put<Profissional>(`${this.base}/profissionais/${id}/`, data);
  }

  deleteProfissional(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/profissionais/${id}/`);
  }

  // ── Pacientes ───────────────────────────────────────────────────────────

  getPacientes(params?: HttpParams): Observable<PaginatedResponse<Paciente>> {
    return this.http.get<PaginatedResponse<Paciente>>(`${this.base}/pacientes/`, { params });
  }

  getPaciente(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.base}/pacientes/${id}/`);
  }

  createPaciente(data: Partial<Paciente>): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.base}/pacientes/`, data);
  }

  updatePaciente(id: number, data: Partial<Paciente>): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.base}/pacientes/${id}/`, data);
  }

  deletePaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/pacientes/${id}/`);
  }

  // ── Atendimentos ────────────────────────────────────────────────────────

  getAtendimentos(params?: HttpParams): Observable<PaginatedResponse<Atendimento>> {
    return this.http.get<PaginatedResponse<Atendimento>>(`${this.base}/atendimentos/`, { params });
  }

  getAtendimento(id: number): Observable<Atendimento> {
    return this.http.get<Atendimento>(`${this.base}/atendimentos/${id}/`);
  }

  createAtendimento(data: Record<string, unknown>): Observable<Atendimento> {
    return this.http.post<Atendimento>(`${this.base}/atendimentos/`, data);
  }

  updateAtendimento(id: number, data: Record<string, unknown>): Observable<Atendimento> {
    return this.http.put<Atendimento>(`${this.base}/atendimentos/${id}/`, data);
  }

  deleteAtendimento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/atendimentos/${id}/`);
  }
}
