import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { EmployeeActionDialogComponent } from '../../../../components/modals/employee-action-dialog/employee-action-dialog.component';
import { TenantProfileDialogComponent } from '../../../../components/modals/tenant-profile-dialog/tenant-profile-dialog.component';
import { ResponseCode } from '../../../../model/enums';
import { TenantConfirmationStatusRequest, TenantPerson } from '../../../../model/tenant';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { LoadingService } from '../../../../services/loading.service';
import { TenantService } from '../../../../services/tenant.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PaginationComponent,
    LoaderComponent,
  ],
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.scss',
})
export class TenantListComponent {
  searchTerm = '';
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20];

  selectedAtokaCode = '';
  selectedPropertyAddress = '';
  tenants: TenantPerson[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private toastService: ToastService,
    private tenantService: TenantService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.selectedAtokaCode = String(params.get('atokaCode') ?? '').trim();
      this.selectedPropertyAddress = String(params.get('propertyAddress') ?? '').trim();
      this.pageIndex = 0;
      this.searchTerm = '';

      if (!this.selectedAtokaCode) {
        this.tenants = [];
        return;
      }

      this.loadTenants(this.selectedAtokaCode);
    });
  }

  get filteredTenants(): TenantPerson[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.tenants;
    }

    return this.tenants.filter((tenant) => {
      const status = String(tenant.confirmationStatus ?? tenant.status ?? '').toLowerCase();
      return (
        this.fullname(tenant).toLowerCase().includes(term) ||
        String(tenant.emailAddress ?? '').toLowerCase().includes(term) ||
        String(tenant.phoneNumber ?? '').toLowerCase().includes(term) ||
        status.includes(term)
      );
    });
  }

  get paginatedTenants(): TenantPerson[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredTenants.slice(startIndex, startIndex + this.pageSize);
  }

  onSearchChange(): void {
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  goBack(): void {
    this.router.navigateByUrl('/app/tenant/tenant');
  }

  openProfile(tenant: TenantPerson): void {
    this.dialog.open(TenantProfileDialogComponent, {
      maxHeight: '90vh',
      panelClass: 'tenant-profile-dialog',
      data: tenant,
    });
  }

  requestRemoval(tenant: TenantPerson): void {
    const dialogRef = this.dialog.open(EmployeeActionDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        employee: tenant,
        title: 'Remove Tenant',
        message: 'Are you sure you want to remove this tenant from your property?',
        confirmText: 'Remove tenant',
        cancelText: 'Cancel request',
        iconType: 'warning',
        requiresReason: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'confirmed') {
        this.updateTenantStatus(
          tenant,
          'REMOVED',
          undefined,
          `You have successfully sent a delete request for "${this.fullname(tenant)}".`,
        );
      }
    });
  }

  fullname(tenant: TenantPerson): string {
    const names = [tenant.firstName, tenant.middleName, tenant.surname]
      .filter((value) => Boolean(value && value.trim()))
      .map((value) => String(value).trim());

    return names.join(' ') || 'N/A';
  }

  entryDate(tenant: TenantPerson): string {
    return tenant.startFrom ?? tenant.createdOn ?? '';
  }

  statusLabel(tenant: TenantPerson): string {
    return this.toTitleCase(String(tenant.confirmationStatus ?? tenant.status ?? ''));
  }

  getStatusClass(tenant: TenantPerson): string {
    const normalized = String(tenant.confirmationStatus ?? tenant.status ?? '').toUpperCase();
    if (normalized === 'CONFIRMED' || normalized === 'APPROVED' || normalized === 'APROVED') {
      return 'successful';
    }

    if (normalized === 'REMOVED' || normalized === 'REJECTED') {
      return 'failed';
    }

    if (normalized === 'PENDING') {
      return 'pending';
    }

    return 'draft';
  }

  private loadTenants(atokaCode: string): void {
    this.tenantService.getTenantsAtProperty(atokaCode).subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success && Array.isArray(res.data)) {
          this.tenants = this.normalizeTenantList(res.data);
          return;
        }

        this.tenants = [];
      },
      error: () => {
        this.tenants = [];
      },
    });
  }

  private normalizeTenantList(data: TenantPerson[]): TenantPerson[] {
    return data.map((item: any) => {
      const status = String(item.confirmationStatus ?? item.status ?? '').trim();

      return {
        title: item.title ?? '',
        firstName: item.firstName ?? item.firstname ?? '',
        middleName: item.middleName ?? '',
        surname: item.surname ?? item.lastName ?? '',
        gender: item.gender ?? '',
        phoneNumber: item.phoneNumber ?? '',
        emailAddress: item.emailAddress ?? item.email ?? '',
        occupantDetailId: Number(item.occupantDetailId ?? item.occupantId ?? item.id ?? 0),
        confirmationStatus: status,
        status: this.toTitleCase(status),
        imageUrl: item.imageUrl ?? '',
        startFrom: item.startFrom ?? item.employmentStartDate ?? item.createdOn ?? '',
        createdOn: item.createdOn ?? new Date().toISOString(),
      };
    });
  }

  private updateTenantStatus(
    tenant: TenantPerson,
    confirmationStatus: string,
    toastTitle: string | undefined,
    toastMessage: string,
  ): void {
    const payload: TenantConfirmationStatusRequest = {
      title: tenant.title ?? '',
      firstName: tenant.firstName ?? '',
      middleName: tenant.middleName ?? '',
      surname: tenant.surname ?? '',
      gender: tenant.gender ?? '',
      phoneNumber: tenant.phoneNumber ?? '',
      occupantDetailId: tenant.occupantDetailId ?? 0,
      confirmationStatus,
      imageUrl: tenant.imageUrl ?? '',
      startFrom: tenant.startFrom ?? tenant.createdOn ?? new Date().toISOString(),
      createdOn: tenant.createdOn ?? new Date().toISOString(),
    };

    this.tenantService.updateConfirmationStatus(payload).subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success) {
          this.toastService.show(toastTitle, toastMessage);
          if (this.selectedAtokaCode) {
            this.loadTenants(this.selectedAtokaCode);
          }
          return;
        }

        this.toastService.show(undefined, res.description || 'Unable to process your request.', 'error');
      },
      error: (err) => {
        this.toastService.show(
          undefined,
          err?.error?.description || 'An error occurred while processing your request.',
          'error',
        );
      },
    });
  }

  private toTitleCase(value: string): string {
    const normalized = value.replace(/_/g, ' ').trim();
    if (!normalized) {
      return 'N/A';
    }

    return normalized
      .toLowerCase()
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
