import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { EmployeeActionDialogComponent } from '../../../../components/modals/employee-action-dialog/employee-action-dialog.component';
import { ClaimPropertyDialogComponent } from '../../../../components/modals/claim-property-dialog/claim-property-dialog.component';
import { SendTenantRequestDialogComponent } from '../../../../components/modals/send-tenant-request-dialog/send-tenant-request-dialog.component';
import { TenantProfileDialogComponent } from '../../../../components/modals/tenant-profile-dialog/tenant-profile-dialog.component';
import { ResponseCode } from '../../../../model/enums';
import { ClaimedProperty, TenantConfirmationStatusRequest, TenantPerson } from '../../../../model/tenant';
import { ToastNotificationComponent } from '../../../../shared/toast-notification/toast-notification.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { LoadingService } from '../../../../services/loading.service';
import { LocalStorageService } from '../../../../services/local-storage.service';
import { TenantService } from '../../../../services/tenant.service';

@Component({
  selector: 'app-tenant',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSnackBarModule,
    LoaderComponent,
  ],
  templateUrl: './tenant.component.html',
  styleUrl: './tenant.component.scss',
})
export class TenantComponent {
  private readonly lastSelectedAddressKeyPrefix = 'atk_tnt_lsa';

  claimedProperties: ClaimedProperty[] = [];
  filteredClaimedProperties: ClaimedProperty[] = [];
  propertySearchControl = new FormControl('', { nonNullable: true });

  selectedProperty?: ClaimedProperty;
  selectedAtokaCode = '';
  initialTenantsToShow = 6;

  allTenants: TenantPerson[] = [];
  pendingRequests: TenantPerson[] = [];
  tenantList: TenantPerson[] = [];
  activeTenant?: TenantPerson;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private tenantService: TenantService,
    private authService: AuthenticationService,
    private storage: LocalStorageService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.clearTenantState();
    this.loadClaimedProperties(this.getPersistedSelectedAtokaCode());
  }

  ngOnDestroy(): void {
    this.clearTenantState();
  }

  get selectedLocationAddress(): string {
    if (this.selectedProperty) {
      return this.formatPropertyAddress(this.selectedProperty);
    }

    return '';
  }

  get selectedPropertyCode(): string {
    if (this.selectedAtokaCode) {
      return this.selectedAtokaCode;
    }

    if (this.selectedProperty) {
      return this.getPropertyCode(this.selectedProperty);
    }

    return '';
  }

  get peopleCount(): number {
    return this.allTenants.length;
  }

  get displayedTenants(): TenantPerson[] {
    return this.tenantList.slice(0, this.initialTenantsToShow);
  }

  onPropertySearchInput(value: string): void {
    const normalized = String(value ?? '').trim();

    this.filterClaimedProperties(normalized);

    if (!normalized) {
      this.clearTenantState();
      this.clearPersistedSelectedAtokaCode();
      return;
    }

    if (
      this.selectedAtokaCode &&
      this.selectedAtokaCode.toLowerCase() !== normalized.toLowerCase()
    ) {
      this.selectedAtokaCode = '';
      this.selectedProperty = undefined;
      this.clearTenantCollections();
    }
  }

  onLocationChange(atokaCode: string): void {
    const normalized = String(atokaCode ?? '').trim();

    if (!normalized) {
      this.clearTenantState();
      this.clearPersistedSelectedAtokaCode();
      return;
    }

    const matchedProperty =
      this.claimedProperties.find(
        (property) => this.getPropertyCode(property).toLowerCase() === normalized.toLowerCase(),
      ) ?? undefined;

    if (!matchedProperty) {
      this.clearTenantState();
      this.clearPersistedSelectedAtokaCode();
      return;
    }

    const selectedCode = this.getPropertyCode(matchedProperty) || normalized;
    this.selectedAtokaCode = selectedCode;
    this.selectedProperty = matchedProperty;
    this.propertySearchControl.setValue(selectedCode, { emitEvent: false });
    this.persistSelectedAtokaCode(selectedCode);

    this.loadTenants(selectedCode);
  }

  setActiveTenant(tenant: TenantPerson): void {
    this.activeTenant = tenant;
  }

  goToTenantList(): void {
    if (!this.selectedPropertyCode) {
      return;
    }

    this.router.navigate(['/app/tenant/tenant/list'], {
      queryParams: {
        atokaCode: this.selectedPropertyCode,
        propertyAddress: this.selectedLocationAddress || null,
      },
    });
  }

  openClaimProperty(): void {
    const dialogRef = this.dialog.open(ClaimPropertyDialogComponent, {
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'success') {
        this.showToast('Claim Property', 'Your request has been submitted and is pending review.');
        if (result.atokaCode) {
          this.loadClaimedProperties(result.atokaCode);
          return;
        }

        this.loadClaimedProperties();
      }
    });
  }

  openNotifyUser(): void {
    const dialogRef = this.dialog.open(SendTenantRequestDialogComponent, {
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'success') {
        const userName = result.data?.userName ?? '';
        const phoneNumber = result.data?.phoneNumber ?? '';
        this.showToast(
          'Tenant Request Sent',
          `You have successful sent a request to ${phoneNumber} ${userName}.`,
        );
      }
    });
  }

  openTenantProfile(tenant: TenantPerson): void {
    this.dialog.open(TenantProfileDialogComponent, {
      maxHeight: '90vh',
      panelClass: 'tenant-profile-dialog',
      data: tenant,
    });
  }

  openApproveRequest(tenant: TenantPerson): void {
    const dialogRef = this.dialog.open(EmployeeActionDialogComponent, {
      maxHeight: '90vh',
      data: {
        employee: tenant,
        title: 'Approve Tenant',
        message: 'Are you sure you want to approve this tenant for your property?',
        confirmText: 'Approve request',
        cancelText: 'Cancel request',
        iconType: 'success',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'confirmed') {
        this.updateTenantStatus(
          tenant,
          'APPROVED',
          'Tenant Approved',
          `You have successfully approved "${this.fullname(tenant)}".`,
        );
      }
    });
  }

  openRejectRequest(tenant: TenantPerson): void {
    const dialogRef = this.dialog.open(EmployeeActionDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        employee: tenant,
        title: 'Reject Tenant',
        message: 'Are you sure you want to reject this tenant for your property?',
        confirmText: 'Reject request',
        cancelText: 'Cancel request',
        iconType: 'warning',
        requiresReason: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'confirmed') {
        this.updateTenantStatus(
          tenant,
          'REJECTED',
          'Tenant Rejected',
          `You have successfully rejected "${this.fullname(tenant)}".`,
        );
      }
    });
  }

  openRemoveTenant(tenant: TenantPerson): void {
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

  private loadClaimedProperties(preselectAtokaCode?: string): void {
    this.tenantService.getAllClaimedProperties().subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success && Array.isArray(res.data) && res.data.length > 0) {
          this.claimedProperties = res.data;
          this.filterClaimedProperties(this.propertySearchControl.value);

          if (preselectAtokaCode) {
            this.onLocationChange(preselectAtokaCode);
          }

          return;
        }

        this.claimedProperties = [];
        this.filteredClaimedProperties = [];
        this.clearTenantState();
      },
      error: () => {
        this.claimedProperties = [];
        this.filteredClaimedProperties = [];
        this.clearTenantState();
      },
    });
  }

  private loadTenants(atokaCode: string): void {
    this.tenantService.getTenantsAtProperty(atokaCode).subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success && Array.isArray(res.data)) {
          this.allTenants = this.normalizeTenantList(res.data);
          this.pendingRequests = this.allTenants.filter((tenant) =>
            this.isPendingStatus(tenant.confirmationStatus || tenant.status || ''),
          );
          this.tenantList = this.allTenants.filter((tenant) =>
            this.isActiveTenantStatus(tenant.confirmationStatus || tenant.status || ''),
          );
          return;
        }

        this.clearTenantCollections();
      },
      error: () => {
        this.clearTenantCollections();
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
          this.showToast(toastTitle, toastMessage);
          if (this.selectedAtokaCode) {
            this.loadTenants(this.selectedAtokaCode);
          }
          return;
        }

        this.showToast(undefined, res.description || 'Unable to process your request.', 'error');
      },
      error: (err) => {
        this.showToast(
          undefined,
          err?.error?.description || 'An error occurred while processing your request.',
          'error',
        );
      },
    });
  }

  private showToast(
    title: string | undefined,
    message: string,
    type: 'success' | 'error' = 'success',
  ): void {
    this.snackBar.openFromComponent(ToastNotificationComponent, {
      data: {
        title,
        message,
        type,
      },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['atoka-toast-panel'],
    });
  }

  private clearTenantState(): void {
    this.selectedAtokaCode = '';
    this.selectedProperty = undefined;
    this.clearTenantCollections();
  }

  private clearTenantCollections(): void {
    this.allTenants = [];
    this.pendingRequests = [];
    this.tenantList = [];
  }

  private getPersistedSelectedAtokaCode(): string | undefined {
    const saved = this.storage.getItem<string>(this.getScopedAddressStorageKey());
    const normalized = String(saved ?? '').trim();
    return normalized || undefined;
  }

  private persistSelectedAtokaCode(atokaCode: string): void {
    this.storage.setItem<string>(this.getScopedAddressStorageKey(), atokaCode);
  }

  private clearPersistedSelectedAtokaCode(): void {
    this.storage.removeItem(this.getScopedAddressStorageKey());
  }

  private getScopedAddressStorageKey(): string {
    const userId = String(this.authService.getLoginInfo()?.userId ?? '').trim();
    if (!userId) {
      return this.lastSelectedAddressKeyPrefix;
    }

    return `${this.lastSelectedAddressKeyPrefix}_${userId}`;
  }

  private getPropertyCode(property: ClaimedProperty): string {
    return String(property.atokaCode).trim();
  }

  propertyCode(property: ClaimedProperty): string {
    return this.getPropertyCode(property);
  }

  private filterClaimedProperties(value: string): void {
    const normalized = String(value ?? '').trim().toLowerCase();

    if (!normalized) {
      this.filteredClaimedProperties = [...this.claimedProperties];
      return;
    }

    this.filteredClaimedProperties = this.claimedProperties.filter((property) => {
      const atokaCode = this.getPropertyCode(property).toLowerCase();
      const fullAddress = this.formatPropertyAddress(property).toLowerCase();
      return atokaCode.includes(normalized) || fullAddress.includes(normalized);
    });
  }

  formatPropertyAddress(property: ClaimedProperty): string {
    if (property.fullAddress && property.fullAddress.trim()) {
      return property.fullAddress.trim();
    }

    const streetLine = [
      property.houseName,
      property.houseNo,
      property.street,
    ]
      .filter((value) => Boolean(value && String(value).trim()))
      .map((value) => String(value).trim())
      .join(' ')
      .trim();

    const parts = [streetLine, property.city, property.state, property.country || property.countries]
      .filter((value) => Boolean(value && String(value).trim()))
      .map((value) => String(value).trim());

    return parts.join(', ');
  }

  private isPendingStatus(status: string): boolean {
    return status.toUpperCase() === 'PENDING';
  }

  private isActiveTenantStatus(status: string): boolean {
    const normalized = status.toUpperCase();
    return normalized === 'APPROVED' || normalized === 'APROVED' || normalized === 'CONFIRMED';
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
