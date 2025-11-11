// src/app/components/report-metadata-dialog/report-metadata-dialog.ts
import { Component, Inject, OnInit } from '@angular/core'; // Añadir OnInit
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms'; // Añadir Validators
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

   // ▼▼▼ AÑADIR ESTE FORMATEADOR DE MONEDA ▼▼▼
  private formatter = new Intl.NumberFormat('es-PE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  constructor(
    public dialogRef: MatDialogRef<ReportMetadataDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, // Datos opcionales si se pasan
  ) {
    this.metadataForm = this.fb.group({
      investigador: [''],
      rr_investigador: [''], // Para la "R.R. Nº..."
      fechaInicio: [null as Date | null],
      duracion: [''],
      fechaCulminacion: [null],
      
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
      gastosAnosAnteriores: this.fb.array([]),
      // ▲▲▲ FIN NUEVOS CAMPOS GASTOS AÑO ANTERIOR ▲▲▲
    });
  }


  
  ngOnInit(): void {
    // Para asegurarnos de que haya al menos una fila de ingreso al iniciar

    if(this.data && this.data.metadata) {
      this.metadataForm.patchValue(this.data.metadata);
      if(this.data.metadata.ingresos){
        this.data.metadata.ingresos.forEach((ingreso: any) => {
          this.nuevoIngreso();
          const lastIndex = this.ingresos.length - 1;
          const ingresoGroup = this.ingresos.at(lastIndex);
          ingresoGroup.patchValue({
            descripcion: ingreso.descripcion,
            monto: ingreso.monto
          });
        });
      }
    }else{
      this.ingresos;
    }

    if (this.ingresos.length === 0) {
      this.nuevoIngreso();
    }


    // ▼▼▼ CÓDIGO NUEVO AQUÍ ▼▼▼
    // Lógica para cargar los gastos de años anteriores si existen
    if (this.data && this.data.metadata && this.data.metadata.gastosAnosAnteriores) {
      this.data.metadata.gastosAnosAnteriores.forEach((gasto: any) => {
        this.gastosAnosAnteriores.push(this.nuevoGastoAnoAnteriorGroup(gasto));
      });
    }

    // Si el FormArray sigue vacío, añadimos una fila por defecto
    if (this.gastosAnosAnteriores.length === 0) {
      this.agregarGastoAnoAnterior();
    }
    // ▲▲▲ FIN DE CÓDIGO NUEVO ▲▲▲


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
  

  // ▼▼▼ CÓDIGO NUEVO AQUÍ (Añadir estos 4 métodos) ▼▼▼

  /**
   * Helper para acceder al FormArray de gastosAnosAnteriores
   */
  get gastosAnosAnteriores(): FormArray {
    return this.metadataForm.get('gastosAnosAnteriores') as FormArray;
  }

  /**
   * Crea un FormGroup para una fila de gasto de año anterior
   */
  nuevoGastoAnoAnteriorGroup(gasto?: any): FormGroup {
    return this.fb.group({
      year: [gasto?.year || new Date().getFullYear() - 1, [Validators.required]],
      bienesCorrientes: [gasto?.bienesCorrientes || null],
      bienesCapital: [gasto?.bienesCapital || null],
      servicios: [gasto?.servicios || null],
      subvencion: [gasto?.subvencion || null],
      viaticos: [gasto?.viaticos || null],
      encargoInterno: [gasto?.encargoInterno || null],
    });
  }

  /**
   * Añade una nueva fila de gasto de año anterior al FormArray
   */
  agregarGastoAnoAnterior(): void {
    this.gastosAnosAnteriores.push(this.nuevoGastoAnoAnteriorGroup());
  }

  /**
   * Elimina una fila de gasto de año anterior por su índice
   */
  eliminarGastoAnoAnterior(index: number): void {
    // Solo permite eliminar si hay más de una fila
    if (this.gastosAnosAnteriores.length > 1) {
      this.gastosAnosAnteriores.removeAt(index);
    }
  }
  // ▲▲▲ FIN DE CÓDIGO NUEVO ▲▲▲



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

    // ▼▼▼ MODIFICACIÓN AQUÍ ▼▼▼
    // Procesar gastos del año anterior (ahora es un array)
    if (formValue.gastosAnosAnteriores) {
      formValue.gastosAnosAnteriores = formValue.gastosAnosAnteriores
        .map((gasto: any) => {
          // Limpiamos los valores de la fila
          const filaLimpia: any = { year: Number(gasto.year) || (new Date().getFullYear() - 1) };
          for (const key in gasto) {
            if (key !== 'year') {
              if (gasto[key] === '' || gasto[key] === null || gasto[key] === undefined) {
                filaLimpia[key] = null;
              } else {
                filaLimpia[key] = Number(gasto[key]);
              }
            }
          }
          return filaLimpia;
        })
        // Filtramos filas que podrían estar vacías (aunque siempre tendrán un año)
        .filter((gasto: any) => gasto.year); 
    }
    // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

    this.dialogRef.close(formValue);
  }

  onOmitir(): void {
    this.dialogRef.close({}); 
  }

  /**
   * Al entrar (focus) a un campo de moneda, muestra el número simple.
   * Ej: "23,500.00" -> "23500.00"
   */
  onCurrencyFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const controlName = input.getAttribute('formControlName') as 'presupuestoProcienciaAporteNoMonetario' | 'presupuestoProcienciaAporteMonetario' | 'presupuestoEntidadEjecutoraAporteNoMonetario' | 'presupuestoEntidadEjecutoraAporteMonetario' | 'presupuestoEntidadAsociadaAporteNoMonetario' | 'presupuestoEntidadAsociadaAporteMonetario' | 'monto';
    const control = this.metadataForm.get(controlName);
    
    if (control && control.value !== null) {
      input.value = Number(control.value).toFixed(2);
    }
  }

  /**
   * Al salir (blur) de un campo de moneda:
   * 1. Parsea el valor (ej: "23,500.5" o "23500.5") a un número.
   * 2. Guarda el número limpio en el form control.
   * 3. Muestra el valor formateado en el input (ej: "23,500.50").
   */
  onCurrencyBlur(event: FocusEvent, controlName: 'presupuestoProcienciaAporteNoMonetario' | 'presupuestoProcienciaAporteMonetario' | 'presupuestoEntidadEjecutoraAporteNoMonetario' | 'presupuestoEntidadEjecutoraAporteMonetario' | 'presupuestoEntidadAsociadaAporteNoMonetario' | 'presupuestoEntidadAsociadaAporteMonetario' | 'monto' ): void {
    const input = event.target as HTMLInputElement;
    const control = this.metadataForm.get(controlName);

    if (control) {
      const rawValue = input.value.replace(/,/g, ''); // Quita comas
      const numValue = parseFloat(rawValue);

      if (!isNaN(numValue)) {
        control.setValue(numValue); // Guarda el número
        input.value = this.formatter.format(numValue); // Muestra formateado
      } else {
        control.setValue(null); // Borra si no es un número
        input.value = '';
      }
    }
  }

  
}