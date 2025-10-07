// src/app/app.component.ts
import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GastoFormComponent } from './components/gasto-form/gasto-form';
import { GastoListComponent } from './components/gasto-list/gasto-list';
import { ExcelImporterComponent } from './components/excel-importer/excel-importer'; // <-- Importa
import { ReportGeneratorComponent } from './components/report-generator/report-generator';

// Importaciones de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GastoFormComponent, GastoListComponent, MatToolbarModule, ExcelImporterComponent, ReportGeneratorComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'frontend';

  @ViewChild(GastoListComponent) gastoListComponent!: GastoListComponent;

  onImportComplete(): void {
    this.gastoListComponent.cargarGastos();
  }

  onGastoCreado(): void {
    this.gastoListComponent.cargarGastos();
  }
}