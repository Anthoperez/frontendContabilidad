import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { ApiService, Gasto } from '../../services/api';
import { FormsModule } from '@angular/forms';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-excel-importer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatProgressBarModule, 
    MatSnackBarModule, MatSelectModule, MatFormFieldModule
  ],
  templateUrl: './excel-importer.html',
  styleUrls: ['./excel-importer.css']
})
export class ExcelImporterComponent {
  @Output() importComplete = new EventEmitter<void>();
  fileName: string = '';
  processing = false;
  processedData: Partial<Gasto>[] = [];

  workbook: XLSX.WorkBook | null = null;
  sheetNames: string[] = [];
  selectedSheet: string = '';

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  onFileChange(event: any): void {
    this.reset();
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) return;

    this.fileName = target.files[0].name;
    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data: ArrayBuffer = e.target.result;
      this.workbook = XLSX.read(data, { type: 'array', cellDates: true });
      this.sheetNames = this.workbook.SheetNames;

      if (this.sheetNames.length === 1) {
        this.selectedSheet = this.sheetNames[0];
        this.processSheet();
      }
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  processSheet(): void {
    if (!this.workbook || !this.selectedSheet) return;
    const ws: XLSX.WorkSheet = this.workbook.Sheets[this.selectedSheet];
    const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });
    this.processRawData(rawData);
  }

  private processRawData(rawData: any[][]): void {
    this.processedData = [];
    let currentHeaders: string[] | null = null;

    const columnMap: { [key: string]: keyof Gasto | null } = {
        'DOC': 'tipoDocumento', 'N°': 'numeroDocumento', 'SIAF': 'siaf',
        'A NOMBRE DE': 'aNombreDe', 'CONCEPTO': 'concepto', 'MONTO': 'monto',
        'ESPECIFICA': 'especifica', 'MONTO2': 'monto2',
        'FF.': 'ff', 'MES': 'mes', 'FECHA DEVENGADO SIAF': 'fechaDevengado',
        'PROYECTO': 'proyecto', 'META': 'meta',
        'CERTIFICACION VIATICO': 'certificacionViatico', 'DESTINO': 'destino',
        'FECHA SALIDA': 'fechaSalida', 'FECHA RETORNO': 'fechaRetorno'
    };

    for (const row of rawData) {
      if (!row || row.length === 0) continue;
      const firstCell = String(row[0]).trim();
      if (firstCell === 'DOC') {
        currentHeaders = row.map(h => typeof h === 'string' ? h.trim().replace(/\s+/g, ' ') : '');
        continue;
      }
      if (row.some(cell => typeof cell === 'string' && cell.toUpperCase().includes('TOTAL'))) {
        currentHeaders = null;
        continue;
      }
      if (!currentHeaders || !firstCell) continue;

      const gasto: Partial<Gasto> = {};
      let especificaCount = 0;
      currentHeaders.forEach((header, index) => {
        let dbField = columnMap[header];
        if (header === 'ESPECIFICA') {
          dbField = (especificaCount === 0) ? 'especifica' : 'especifica2';
          especificaCount++;
        }
        
        const originalValue = row[index];
        if (dbField && originalValue !== undefined && String(originalValue).trim() !== '') {
          let finalValue: any = originalValue;

          if (dbField === 'monto' || dbField === 'monto2') {
            const numValue = parseFloat(String(finalValue).replace(/,/g, ''));
            finalValue = isNaN(numValue) ? null : numValue;
          } 
          // --- LÓGICA DE FECHA DEFINITIVA Y ROBUSTA ---
          else if (dbField === 'fechaDevengado' || dbField === 'fechaSalida' || dbField === 'fechaRetorno') {
            let parsedDate: Date | null = null;
            if (originalValue instanceof Date && !isNaN(originalValue.getTime())) {
              parsedDate = originalValue; // La librería ya nos dio una fecha válida
            } else if (typeof originalValue === 'string' && originalValue.includes('/')) {
              const parts = originalValue.split('/');
              if (parts.length === 3) {
                 // Formato DD/MM/YYYY
                 parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              }
            }
            finalValue = (parsedDate && !isNaN(parsedDate.getTime())) ? parsedDate.toISOString() : null;
          }
          
          if (finalValue !== null) {
             (gasto as any)[dbField] = finalValue;
          }
        }
      });

      // La validación final: solo importamos si el registro tiene los datos mínimos.
      if (gasto.tipoDocumento && gasto.monto && gasto.fechaDevengado) {
        this.processedData.push(gasto);
      } else {
        console.warn("Fila ignorada por falta de datos obligatorios:", row);
      }
    }
    
    if (this.processedData.length === 0) {
      this.showError(`La hoja "${this.selectedSheet}" no contiene filas de gastos válidas.`);
    }
  }
  
  uploadData(): void {
    if (this.processedData.length === 0) return;

    this.processing = true;
    this.apiService.importarGastos(this.processedData).subscribe({
      next: () => {
        this.showSuccess(`¡Éxito! Se importaron ${this.processedData.length} registros.`);
        this.importComplete.emit();
        this.reset();
      },
      error: (err) => {
        this.showError('Ocurrió un error al importar los datos. Revisa la terminal del backend.');
        console.error("Error completo:", err);
        this.processing = false;
      }
    });
  }

  private reset(): void {
    this.fileName = '';
    this.processedData = [];
    this.processing = false;
    this.workbook = null;
    this.sheetNames = [];
    this.selectedSheet = '';
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
  
  get recordCount(): number {
    return this.processedData.length;
  }
}