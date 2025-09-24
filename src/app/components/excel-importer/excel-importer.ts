import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ApiService, Gasto } from '../../services/api';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-excel-importer',
  standalone: true,
  imports: [ CommonModule, MatCardModule, MatButtonModule, MatProgressBarModule ],
  templateUrl: './excel-importer.html',
  styleUrls: ['./excel-importer.css']
})
export class ExcelImporterComponent {
  @Output() importComplete = new EventEmitter<void>();
  fileName: string = '';
  processing = false;
  processedData: Partial<Gasto>[] = [];

  constructor(private apiService: ApiService) {}

  onFileChange(event: any): void {
    this.processedData = [];
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) return;

    this.fileName = target.files[0].name;
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data: ArrayBuffer = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(data, { type: 'array', cellDates: true });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

      this.processRawData(rawData);
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  private processRawData(rawData: any[][]): void {
    console.clear(); // Limpia la consola para un nuevo reporte
    console.log("%c--- INICIO DEL REPORTE DE DEPURACIÓN ---", "color: blue; font-size: 16px;");

    const headerRowIndex = rawData.findIndex(row => row && String(row[0]).trim() === 'DOC');

    if (headerRowIndex === -1) {
      console.error("ERROR CRÍTICO: No se encontró la fila de encabezado que empieza con 'DOC'.");
      return;
    }

    const rawHeaders = rawData[headerRowIndex];
    const cleanedHeaders = rawHeaders.map(h => typeof h === 'string' ? h.trim() : '');

    console.log("Paso 1: Encabezados encontrados en el Excel (crudo)", rawHeaders);
    console.log("Paso 2: Encabezados después de limpiarlos (trim)", cleanedHeaders);

    const columnMap: { [key: string]: keyof Gasto | null } = {
      'DOC': 'tipoDocumento', 'N°': 'numeroDocumento', 'SIAF': 'siaf',
      'A NOMBRE DE': 'aNombreDe', 'CONCEPTO': 'concepto', 'MONTO': 'monto',
      'ESPECIFICA': 'especifica', 'MONTO2': 'monto2', 'ESPECIFICA ': 'especifica2',
      'FF.': 'ff', 'MES': 'mes', 'FECHA DEVENGADO SIAF': 'fechaDevengado',
      'PROYECTO': 'proyecto', 'META': 'meta'
    };

    console.log("Paso 3: Mapeo de columnas que el código espera", columnMap);
    console.log("%c--- ANALIZANDO FILAS DE DATOS ---", "color: green; font-size: 14px;");

    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];

      if (!row || row.length === 0) {
        continue;
      }

      if (row.some(cell => typeof cell === 'string' && cell.toUpperCase().includes('TOTAL META'))) {
        console.log(`%cFila ${i} detectada como TOTAL. Proceso detenido.`, "color: red;");
        break;
      }

      if (!row[0]) {
        continue;
      }

      console.log(`%cProcesando Fila ${i}:`, "color: orange;", row);
      const gasto: Partial<Gasto> = {};
      cleanedHeaders.forEach((header, index) => {
        const dbField = columnMap[header];
        if (dbField) {
          // Este log nos dirá qué está encontrando exactamente
          console.log(` -> Coincidencia encontrada: Encabezado '${header}' mapea a '${dbField}'. Valor:`, row[index]);
          let value: any = row[index];
          (gasto as any)[dbField] = value;
        }
      });
      this.processedData.push(gasto);
    }

    console.log("%c--- FIN DEL REPORTE ---", "color: blue; font-size: 16px;");
    console.log("Datos finales procesados:", this.processedData);
  }
  uploadData(): void {
    if (this.processedData.length === 0) {
      alert('No hay datos para importar.');
      return;
    }

    this.processing = true;
    this.apiService.importarGastos(this.processedData).subscribe({
      next: () => {
        alert(`¡Éxito! Se importaron ${this.processedData.length} registros.`);
        this.fileName = '';
        this.processedData = [];
        this.importComplete.emit();
        this.processing = false;
      },
      error: (err) => {
        alert('Ocurrió un error al importar los datos.');
        console.error(err);
        this.processing = false;
      }
    });
  }
  
  get recordCount(): number {
    return this.processedData.length;
  }
}