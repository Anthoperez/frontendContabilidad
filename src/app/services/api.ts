// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos una 'interfaz' para que TypeScript sepa cómo es un Gasto
export interface Gasto {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  siaf?: string;
  aNombreDe: string;
  concepto: string;
  monto: number;
  especifica: string;
  fechaDevengado: string;
  proyecto: string;
  fechaRegistro: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'http://localhost:3000/api/gastos';

  constructor(private http: HttpClient) { }

  // Obtiene todos los gastos
  getGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(this.apiUrl);
  }

  // Crea un nuevo gasto
  crearGasto(gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.post<Gasto>(this.apiUrl, gasto);
  }
}