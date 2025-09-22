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
  displayedColumns: string[] = ['fechaRegistro', 'concepto', 'proyecto', 'monto'];

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