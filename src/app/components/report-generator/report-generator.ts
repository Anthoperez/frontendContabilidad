// src/app/components/report-generator/report-generator.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// ▼▼▼ AÑADIR ESTAS IMPORTACIONES ▼▼▼
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReportMetadataDialogComponent } from '../report-metadata-dialog/report-metadata-dialog';
import { ApiService, ReportMetadata } from '../../services/api'; // Importa ApiService y la nueva interfaz
// ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

// Importaciones de Angular Material (existentes)
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonToggleModule
],
  templateUrl: './report-generator.html',
  styleUrls: ['./report-generator.css']
})
export class ReportGeneratorComponent implements OnInit {
  projects: string[] = [];
  selectedProject: string = '';
  isLoading = false;
  isGenerating = false; // <-- CORREGIDO (estaba como 'unknown')

  // ▼▼▼ AÑADIR ESTA PROPIEDAD ▼▼▼
  reportType: 'project' | 'meta' = 'project'; // Controla qué UI se muestra
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲


  // ▼▼▼ INYECTAR 'MatDialog' ▼▼▼
  constructor(
    private apiService: ApiService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog // <-- AÑADIR ESTO
  ) {}
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.apiService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('No se pudo cargar la lista de proyectos.');
      }
    });
  }

  // ▼▼▼ MÉTODO 'generateReport' COMPLETAMENTE MODIFICADO ▼▼▼
  generateProjectReport(): void {
    if (!this.selectedProject) {
      this.showError('Por favor, selecciona un proyecto.');
      return;
    }

    // 1. Abrir el diálogo
    const dialogRef = this.dialog.open(ReportMetadataDialogComponent, {
      width: '600px',
      disableClose: true, // Evita que se cierre al hacer clic fuera
    });

    // 2. Escuchar a cuando se cierre el diálogo
    dialogRef.afterClosed().subscribe((metadata: ReportMetadata | undefined) => {
      
      // Si el usuario presionó "Cancelar", metadata será 'undefined'
      if (metadata === undefined) {
        return; 
      }
      
      // Si el usuario presionó "Omitir" o "Generar", 'metadata' será un objeto
      // (vacío si omitió, con datos si llenó)
      this.isGenerating = true;

      // 3. Llamar a la API con el projectName y los metadatos
      this.apiService.downloadReport(this.selectedProject, metadata).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const safeProjectName = this.selectedProject.replace(/[^a-z0-9]/gi, '_');
          a.download = `Reporte_${safeProjectName}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
          
          this.isGenerating = false;
          this.showSuccess('¡Reporte generado y descargado!');
        },
        error: (err) => {
          this.isGenerating = false;
          this.showError('Ocurrió un error al generar el reporte.');
          console.error('Error al descargar:', err);
        }
      });
    });
  }
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲


  // ▼▼▼ AÑADIR ESTE NUEVO MÉTODO (traído de report-meta.ts) ▼▼▼
  /**
   * Genera el reporte global agrupado por Meta
   */
  generateMetaReport(): void {
    this.isGenerating = true;

    this.apiService.downloadReportByMeta().subscribe({
      next: (blob) => {
        // Lógica para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Global_por_Meta.xlsx`; // Nombre fijo
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        this.isGenerating = false;
        this.showSuccess('¡Reporte por Meta generado y descargado!');
      },
      error: (err) => {
        this.isGenerating = false;
        this.showError('Ocurrió un error al generar el reporte por meta.');
        console.error('Error al descargar:', err);
      },
    });
  }
  // ▲▲▲ FIN DE LA MODIFICACIÓN ▲▲▲


  
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}