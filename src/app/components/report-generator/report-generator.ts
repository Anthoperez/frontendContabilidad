import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

// Importaciones de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule
  ],
  templateUrl: './report-generator.html',
  styleUrls: ['./report-generator.css']
})
export class ReportGeneratorComponent implements OnInit {
  projects: string[] = [];
  selectedProject: string = '';
  isLoading = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  // Carga la lista de proyectos desde el backend
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

  // Se ejecuta cuando el usuario presiona el botón de generar
  generateReport(): void {
    if (!this.selectedProject) {
      this.showError('Por favor, selecciona un proyecto.');
      return;
    }

    this.isLoading = true;
    this.apiService.downloadReport(this.selectedProject).subscribe({
      next: (blob) => {
        // Lógica para descargar el archivo en el navegador del usuario
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Creamos un nombre de archivo seguro
        const safeProjectName = this.selectedProject.replace(/[^a-z0-9]/gi, '_');
        a.download = `Reporte_${safeProjectName}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        this.isLoading = false;
        this.showSuccess('¡Reporte generado y descargado!');
      },
      error: (err) => {
        this.isLoading = false;
        this.showError('Ocurrió un error al generar el reporte.');
        console.error('Error al descargar:', err);
      }
    });
  }
  
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Ok', { duration: 3000 });
  }
}