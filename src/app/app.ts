// src/app/app.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GastoFormComponent } from './components/gasto-form/gasto-form';
import { GastoListComponent } from './components/gasto-list/gasto-list';
import { ExcelImporterComponent } from './components/excel-importer/excel-importer'; // <-- Importa

// Importaciones de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GastoFormComponent, GastoListComponent, MatToolbarModule, ExcelImporterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  @ViewChild(GastoListComponent) gastoList!: GastoListComponent;

  actualizarLista(): void {
    this.gastoList.cargarGastos();
  }
}