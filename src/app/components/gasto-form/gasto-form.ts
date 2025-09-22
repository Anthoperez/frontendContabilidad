// src/app/components/gasto-form/gasto-form.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';

// Importaciones de Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-gasto-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule
  ],
  templateUrl: './gasto-form.html',
  styleUrls: ['./gasto-form.css']
})
export class GastoFormComponent {
  @Output() gastoCreado = new EventEmitter<void>();
  tiposDocumento = ['C/S', 'P/S', 'O/S', 'R.DGA', 'O/C'];

  gastoForm: ReturnType<FormBuilder['group']>;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.gastoForm = this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      aNombreDe: ['', Validators.required],
      concepto: ['', Validators.required],
      monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
      especifica: ['', Validators.required],
      fechaDevengado: [null as Date | null, Validators.required],
      proyecto: ['', Validators.required],
      siaf: [''],
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