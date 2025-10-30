// src/app/components/report-metadata-dialog/report-metadata-dialog.ts
import { Component, OnInit } from '@angular/core'; // Añadir OnInit
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms'; // Añadir Validators
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core'; // Importar si no está (aunque app.config ya lo provee)

@Component({
  selector: 'app-report-metadata-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    MatNativeDateModule, // <-- Asegurarse de que esté aquí también
  ],
  templateUrl: './report-metadata-dialog.html',
  styleUrls: ['./report-metadata-dialog.css'],
})
export class ReportMetadataDialogComponent implements OnInit { // Implementar OnInit
  metadataForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ReportMetadataDialogComponent>,
    private fb: FormBuilder,
  ) {
    this.metadataForm = this.fb.group({
      investigador: [''],
      rr_investigador: [''], // Para la "R.R. Nº..."
      fechaInicio: [null as Date | null],
      duracion: [''],
      
      // ▼▼▼ NUEVOS CAMPOS PARA DESCRIPCION DE PRESUPUESTO ▼▼▼
      presupuestoProcienciaAporteMonetario: [null as number | null],
      presupuestoProcienciaAporteNoMonetario: [null as number | null], // Nuevo
      presupuestoEntidadEjecutoraAporteMonetario: [null as number | null],
      presupuestoEntidadEjecutoraAporteNoMonetario: [null as number | null], // Nuevo
      presupuestoEntidadAsociadaAporteMonetario: [null as number | null], // Nuevo
      presupuestoEntidadAsociadaAporteNoMonetario: [null as number | null], // Nuevo
      // ▲▲▲ FIN NUEVOS CAMPOS PRESUPUESTO ▲▲▲

      ingresos: this.fb.array([]),

      // ▼▼▼ NUEVOS CAMPOS PARA EJECUCIÓN DE GASTOS - AÑO ANTERIOR ▼▼▼
      gastosAnoAnterior: this.fb.group({
        year: [new Date().getFullYear() - 1], // Por defecto, el año anterior al actual
        bienesCorrientes: [null as number | null],
        bienesCapital: [null as number | null],
        servicios: [null as number | null],
        subvencion: [null as number | null],
        viaticos: [null as number | null],
        encargoInterno: [null as number | null],
      }),
      // ▲▲▲ FIN NUEVOS CAMPOS GASTOS AÑO ANTERIOR ▲▲▲
    });
  }

  ngOnInit(): void {
    // Para asegurarnos de que haya al menos una fila de ingreso al iniciar
    if (this.ingresos.length === 0) {
      this.nuevoIngreso();
    }
  }

  // Helper para acceder al FormArray de ingresos
  get ingresos(): FormArray {
    return this.metadataForm.get('ingresos') as FormArray;
  }

  // Añade un nuevo grupo de ingreso (descripción + monto)
  nuevoIngreso(): void {
    this.ingresos.push(
      this.fb.group({
        descripcion: [''], // Ya no es Validators.required, puede ir vacío
        monto: [null as number | null], // Ya no es Validators.required, puede ir vacío
      }),
    );
  }

  // Elimina un ingreso por su índice
  eliminarIngreso(index: number): void {
    this.ingresos.removeAt(index);
  }

  onGenerar(): void {
    // Antes de cerrar, asegurarnos de que los montos sean números (si no son null)
    const formValue = this.metadataForm.value;

    // Convertir strings vacíos a null para campos numéricos
    for (const key in formValue) {
      if (typeof formValue[key] === 'string' && formValue[key] === '') {
        formValue[key] = null;
      }
    }

    // Procesar los ingresos
    if (formValue.ingresos) {
      formValue.ingresos = formValue.ingresos
        .filter((ing: any) => ing.descripcion || ing.monto !== null) // Filtra filas completamente vacías
        .map((ing: any) => ({
          descripcion: ing.descripcion,
          monto: ing.monto !== '' ? Number(ing.monto) : null,
        }));
    }

    // Procesar gastos del año anterior
    if (formValue.gastosAnoAnterior) {
      for (const key in formValue.gastosAnoAnterior) {
        if (formValue.gastosAnoAnterior[key] === '') {
          formValue.gastosAnoAnterior[key] = null;
        } else if (key !== 'year') { // Asegura que los montos sean números
          formValue.gastosAnoAnterior[key] = Number(formValue.gastosAnoAnterior[key]);
        }
      }
    }

    this.dialogRef.close(formValue);
  }

  onOmitir(): void {
    this.dialogRef.close({}); 
  }
}