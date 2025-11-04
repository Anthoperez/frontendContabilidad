// src/app/components/gasto-form/gasto-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Importa FormGroup
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';
// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
import {MatNativeDateModule } from '@angular/material/core';
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatCardModule, MatIconModule
  ],
  templateUrl: './gasto-form.html',
  styleUrls: ['./gasto-form.css'],


})
export class GastoFormComponent {
  @Output() gastoCreado = new EventEmitter<void>();
  tiposDocumento = ['P/V', 'P/S', 'O/S', 'R.DGA', 'O/C']; //no es C/S es P/V
  fuentesFinanciamiento = ['D Y T', 'R.DET', 'R.D.R']; // no es R.D es R.D.R
  meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  // 1. Declaramos la propiedad del formulario aquí
  gastoForm: FormGroup;

  // ▼▼▼ AÑADIR ESTE FORMATEADOR DE MONEDA ▼▼▼
  private formatter = new Intl.NumberFormat('es-PE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲



  // 2. Inyectamos FormBuilder en el constructor y LUEGO inicializamos el formulario
  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.gastoForm = this.fb.group({
      // --- CAMPOS OBLIGATORIOS ---
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      aNombreDe: ['', Validators.required],
      concepto: ['', Validators.required],
      monto: [null as number | null, [Validators.required]],
      especifica: ['', Validators.required],
      fechaDevengado: [null as Date | null, Validators.required],
      proyecto: ['', Validators.required],
      mes: ['', Validators.required],
      meta: ['', Validators.required],
      siaf: ['', Validators.required],
      ff: ['', Validators.required],

      // --- CAMPOS OPCIONALES (sin Validators.required) ---
      monto2: [null as number | null],
      especifica2: [''],
      certificacionViatico: [''],
      destino: [''],
      fechaSalida: [null as Date | null],
      fechaRetorno: [null as Date | null],
    });
  }

  onSubmit(): void {
    if (this.gastoForm.invalid) {
      return;
    }

    const formValue = this.gastoForm.value;
    this.apiService.crearGasto(formValue as Partial<Gasto>).subscribe({
      next: () => {
        alert('Gasto registrado con éxito!');
        this.cancelar();
        this.gastoCreado.emit();
      },
      error: (err) => {
        alert('Error al registrar el gasto.');
        console.error(err);
      }
    });
  }

  // ▼▼▼ --- AÑADIR NUEVOS MÉTODOS --- ▼▼▼

  /**
   * Rellena un campo con ceros a la izquierda (ej: 20 -> 0020)
   * Se activa al salir del campo (onBlur).
   */
  padField(controlName: 'numeroDocumento' | 'siaf' | 'meta', padding: number): void {
    const control = this.gastoForm.get(controlName);
    if (control && control.value) {
      const value = String(control.value);
      control.setValue(value.padStart(padding, '0'));
    }
  }

  /**
   * Al entrar (focus) a un campo de moneda, muestra el número simple.
   * Ej: "23,500.00" -> "23500.00"
   */
  onCurrencyFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const controlName = input.getAttribute('formControlName') as 'monto' | 'monto2';
    const control = this.gastoForm.get(controlName);
    
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
  onCurrencyBlur(event: FocusEvent, controlName: 'monto' | 'monto2'): void {
    const input = event.target as HTMLInputElement;
    const control = this.gastoForm.get(controlName);

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

  /**
   * Limpia todos los campos del formulario.
   */
  cancelar(): void {
    this.gastoForm.reset();
    
    // También debemos limpiar manualmente los valores de los inputs de moneda
    // que fueron formateados por 'onCurrencyBlur'
    const montoInput = (document.querySelector('input[formControlName="monto"]') as HTMLInputElement);
    const monto2Input = (document.querySelector('input[formControlName="monto2"]') as HTMLInputElement);
    
    if (montoInput) montoInput.value = '';
    if (monto2Input) monto2Input.value = '';
  }
  // ▲▲▲ --- FIN DE NUEVOS MÉTODOS --- ▲▲▲

  
}