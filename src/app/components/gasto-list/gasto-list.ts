// src/app/components/gasto-list/gasto-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Gasto } from '../../services/api';

// Importaciones de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-gasto-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatCardModule],
  templateUrl: './gasto-list.html',
  styleUrls: ['./gasto-list.css']
})
export class GastoListComponent implements OnInit {
  gastos: Gasto[] = [];
  // ¡Ahora mostramos todas las columnas!
  displayedColumns: string[] = [
    'fechaRegistro','tipoDocumento', 'numeroDocumento', 'siaf', 'aNombreDe',
    'concepto', 'monto', 'monto2', 'especifica', 'especifica2', 'ff',
    'mes', 'fechaDevengado', 'proyecto', 'meta',
    'certificacionViatico', 'destino', 'fechaSalida', 'fechaRetorno'
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarGastos();
  }

  cargarGastos(): void {
    this.apiService.getGastos().subscribe(data => {
      this.gastos = data;
    });
  }
}