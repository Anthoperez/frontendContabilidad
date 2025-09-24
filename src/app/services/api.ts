import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos una 'interfaz' para que TypeScript sepa cómo es un Gasto
export interface Gasto {
  id: number;
  // Campos obligatorios
  tipoDocumento: string;
  numeroDocumento: string;
  aNombreDe: string;
  concepto: string;
  monto: number;
  especifica: string;
  fechaDevengado: string;
  proyecto: string;
  mes: string;
  meta: string;
  fechaRegistro: string;
  // Campos opcionales (con '?')
  siaf?: string;
  monto2?: number;
  especifica2?: string;
  ff?: string;
  certificacionViatico?: string;
  destino?: string;
  fechaSalida?: string;
  fechaRetorno?: string;
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

  // Importa gastos en lote
  importarGastos(gastos: Partial<Gasto>[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/import`, gastos);
  }
}