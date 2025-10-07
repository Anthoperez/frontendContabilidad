import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// La interfaz Gasto no cambia
export interface Gasto {
  id: number;
  tipoDocumento?: string;
  numeroDocumento?: string;
  siaf?: string;
  aNombreDe?: string;
  concepto?: string;
  monto?: number;
  especifica?: string;
  monto2?: number;
  especifica2?: string;
  ff?: string;
  mes?: string;
  fechaDevengado?: Date;
  proyecto?: string;
  meta?: string;
  certificacionViatico?: string;
  destino?: string;
  fechaSalida?: Date;
  fechaRetorno?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api'; // Asegúrate de que la URL base sea correcta

  constructor(private http: HttpClient) { }

  // --- MÉTODOS EXISTENTES (sin cambios) ---
  getGastos(): Observable<Gasto[]> {
    return this.http.get<Gasto[]>(`${this.apiUrl}/gastos`);
  }

  crearGasto(gasto: Partial<Gasto>): Observable<Gasto> {
    return this.http.post<Gasto>(`${this.apiUrl}/gastos`, gasto);
  }

  importarGastos(gastos: Partial<Gasto>[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/gastos/import`, gastos);
  }

  // --- NUEVO MÉTODO: OBTENER LISTA DE PROYECTOS ---
  getProjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects`);
  }

  // --- NUEVO MÉTODO: DESCARGAR REPORTE ---
  // Este método es un poco diferente. No devuelve JSON, sino un 'blob',
  // que es la representación del archivo Excel que vamos a descargar.
  downloadReport(projectName: string): Observable<Blob> {
    const params = new HttpParams().set('projectName', projectName);
    return this.http.get(`${this.apiUrl}/reports/generate`, {
      params: params,
      responseType: 'blob' // ¡Esto es muy importante!
    });
  }
}