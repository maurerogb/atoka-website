import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Incident } from '../../../../model/incident';
import { IncidentViewDialogComponent } from '../../../../components/modals/incident-view-dialog/incident-view-dialog.component';
import { IncidentReportDialogComponent } from '../../../../components/modals/incident-report-dialog/incident-report-dialog.component';
import { IncidentService } from '../../../../services/incident.service';
import { ButtonComponent } from "../../../../shared/button/button.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';
import { PageEvent } from '@angular/material/paginator';
import { PaginationComponent } from "../../../../shared/pagination/pagination.component";

interface IncidentColumnVisibility {
  location: boolean;
  priority: boolean;
  entryDate: boolean;
  incidentType: boolean;
  status: boolean;
}

@Component({
  selector: 'app-incident',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ButtonComponent,
    MatDatepickerModule,
    PaginationComponent,
    ReactiveFormsModule
],
  templateUrl: './incident.component.html',
  styleUrl: './incident.component.scss',
})
export class IncidentComponent {
  searchTerm = '';
  showFiltersPanel = false;
  filterForm!: FormGroup;
  incidentForm!: FormGroup;
  incidents: any[] = [];
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20];

  visibleColumns: IncidentColumnVisibility = {
    location: true,
    priority: true,
    entryDate: true,
    incidentType: true,
    status: true,
  };

  constructor(private dialog: MatDialog, private fb: FormBuilder, private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      startDate: null,
      endDate: null,
    });

    this.getAllReportedIncidents();
  }
  
  get filteredIncidents(): Incident[] {
    const term = this.searchTerm.trim().toLowerCase();
    let filtered = this.incidents;

    if (term) {
      filtered = filtered.filter((incident) => {
        const atokaCode = (incident.atokaCode ?? '').toString().toLowerCase();
        const address = (incident.address ?? incident.incidentLocation ?? '').toString().toLowerCase();
        const incidentType = (incident.incidentType ?? '').toString().toLowerCase();
        const incidentDetails = (incident.incidentDetails ?? '').toString().toLowerCase();

        return (
          atokaCode.includes(term) ||
          address.includes(term) ||
          incidentType.includes(term) ||
          incidentDetails.includes(term)
        );
      });
    }

    const startDate: Date | null = this.filterForm?.value?.startDate ?? null;
    const endDate: Date | null = this.filterForm?.value?.endDate ?? null;

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      filtered = filtered.filter((incident) => {
        if (!incident?.incidentDate) {
          return false;
        }

        const incidentDate = new Date(incident.incidentDate);
        if (Number.isNaN(incidentDate.getTime())) {
          return false;
        }

        if (start && incidentDate < start) {
          return false;
        }
        if (end && incidentDate > end) {
          return false;
        }

        return true;
      });
    }

    return filtered;
  }

  get paginatedIncidents(): Incident[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredIncidents.slice(startIndex, startIndex + this.pageSize);
  }

  toggleFiltersPanel(): void {
    this.showFiltersPanel = !this.showFiltersPanel;
  }

  openViewIncident(incident: Incident): void {
    this.dialog.open(IncidentViewDialogComponent, {
      maxHeight: '90vh',
      data: incident,
    });
  }

  openReportIncident(): void {
    const dialogRef = this.dialog.open(IncidentReportDialogComponent, {
      maxHeight: '90vh',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'success') {
        this.pageIndex = 0;
        this.getAllReportedIncidents();
      }
    });
  }

  onDateRangeInput() {
    this.pageIndex = 0;
  }

  resetDateFilter(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
    });
    this.pageIndex = 0;
  }

  onSearchChange(): void {
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getAllReportedIncidents() {
    this.incidentService.getAllReportedIncidents().subscribe((res: any) => {
      this.incidents = res.data;
    });
  }
}
