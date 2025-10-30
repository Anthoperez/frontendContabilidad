// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ... (La interfaz Gasto no cambia) ...
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

// ▼▼▼ AÑADIR ESTA INTERFAZ ▼▼▼
// Define la estructura de los metadatos opcionales
export interface ReportMetadata {
  investigador?: string;
  rr_investigador?: string;
  fechaInicio?: Date | null;
  duracion?: string;
  ingresos?: {
  descripcion: string;
  monto: number;
  }[];
}
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

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

  getProjects(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects`);
  }

  // --- MÉTODO MODIFICADO: DESCARGAR REPORTE ---
  // ▼▼▼ MODIFICACIÓN AQUÍ ▼▼▼
  downloadReport(
    projectName: string,
    metadata: ReportMetadata,
  ): Observable<Blob> {
    // Creamos el cuerpo de la solicitud
    const body = {
      projectName: projectName,
      metadata: metadata,
    };

    

    // Cambiamos de GET a POST y enviamos el 'body'
    return this.http.post(`${this.apiUrl}/reports/generate`, body, {
      responseType: 'blob', // ¡Esto sigue siendo muy importante!
    });
  }
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  // ▼▼▼ AÑADIR ESTE NUEVO MÉTODO ▼▼▼
  /**
   * Genera un reporte global con todos los gastos agrupados por Meta.
   */
  downloadReportByMeta(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reports/by-meta`, {
      responseType: 'blob', // ¡Muy importante!
    });
  }
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  
}