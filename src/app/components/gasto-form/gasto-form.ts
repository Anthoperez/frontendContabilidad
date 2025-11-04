// src/app/components/gasto-form/gasto-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Importa FormGroup
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
  styleUrls: ['./gasto-form.css']
})
export class GastoFormComponent {
  @Output() gastoCreado = new EventEmitter<void>();
  tiposDocumento = ['P/V', 'P/S', 'O/S', 'R.DGA', 'O/C']; //no es C/S es P/V
  fuentesFinanciamiento = ['D Y T', 'R.DET', 'R.D.R']; // no es R.D es R.D.R
  meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

  // 1. Declaramos la propiedad del formulario aquí
  gastoForm: FormGroup;

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
        this.gastoForm.reset();
        this.gastoCreado.emit();
      },
      error: (err) => {
        alert('Error al registrar el gasto.');
        console.error(err);
      }
    });
  }
}