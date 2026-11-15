import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AddBranchDialogComponent } from '../../../../components/modals/add-branch-dialog/add-branch-dialog.component';
import { ToastNotificationComponent } from '../../../../shared/toast-notification/toast-notification.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { BusinessService } from '../../../../services/business.service';
import { ResponseCode } from '../../../../model/enums';
import { Address } from '../../../../model/atoka-query';
import { GoogleProviderMapComponent } from '../../../../components/maps/google-provider-map/google-provider-map.component';

interface BranchSummary {
  name: string;
  address: string;
  atoka: string;
  employeeCount: number;
}

interface BranchAddress extends Address {
  isHQ?: boolean;
  staffCount?: number;
  houseNumber?: string;
}

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    GoogleProviderMapComponent,
  ],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss',
})
export class BranchComponent implements AfterViewInit, OnDestroy {
  searchTerm = '';
  businessId?: number;
  branchAddresses: BranchAddress[] = [];
  selectedBranch: BranchSummary = null as any;
  selectedBranchKey = '';
  showMapDetails = false;
  isMapFullscreen = false;
  mapCenter: google.maps.LatLngLiteral | null = null;
  readonly mapZoomLevel = 19;
  private mainContent: HTMLElement | null = null;
  readonly mapOptions: google.maps.MapOptions = {
    mapTypeId: 'hybrid',
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private businessService: BusinessService,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.businessId = this.authService.getLoginInfo()?.businessId;
    this.getBranches();
  }

  ngAfterViewInit(): void {
    this.mainContent = this.el.nativeElement.closest('.main-content');
  }

  ngOnDestroy(): void {
    this.syncFullscreenClass(false);
  }

  getBranches(): void {
    if (!this.businessId) {
      return;
    }

    this.businessService.getBusinessBranches(this.businessId).subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success && Array.isArray(res.data)) {
          this.branchAddresses = res.data as BranchAddress[];
          const hqBranch = this.branchAddresses.find((branch) => branch.isHQ === true) ?? this.branchAddresses[0] ?? null;
          this.selectBranch(hqBranch);
        } else {
          this.branchAddresses = [];
          this.selectBranch(null);
        }
      },
      error: () => {
        this.branchAddresses = [];
        this.selectBranch(null);
      },
    });
  }

  selectBranch(branch: BranchAddress | null): void {
    this.selectedBranch = this.toBranchSummary(branch);
    this.selectedBranchKey = this.getBranchKey(branch);
  }

  isSelectedBranch(branch: BranchAddress): boolean {
    return this.getBranchKey(branch) === this.selectedBranchKey;
  }

  trackBranch(index: number, branch: BranchAddress): string | number {
    return branch.atokaAddressId ?? branch.atoka ?? branch.branchName ?? index;
  }

  openBranchMap(branch: BranchAddress): void {
    const position = this.getBranchMapPosition(branch);
    if (!position) {
      return;
    }

    this.selectBranch(branch);
    this.mapCenter = position;
    this.showMapDetails = true;
  }

  hasBranchCoordinates(branch: BranchAddress): boolean {
    return Boolean(this.getBranchMapPosition(branch));
  }

  get mapHeight(): string {
    return this.isMapFullscreen ? '100%' : '70vh';
  }

  get mapStripLabel(): string {
    const atoka = (this.selectedBranch?.atoka || '').trim();
    const address = (this.selectedBranch?.address || '').trim();

    if (atoka && address) {
      // return `${atoka} · ${address}`;
      return `${atoka}`;
    }

    return atoka || address || 'No location selected';
  }

  toggleMapFullscreen(): void {
    this.isMapFullscreen = !this.isMapFullscreen;
    this.syncFullscreenClass(this.isMapFullscreen);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMapFullscreen) {
      this.isMapFullscreen = false;
      this.syncFullscreenClass(false);
    }
  }

  closeBranchMap(): void {
    this.showMapDetails = false;
    this.isMapFullscreen = false;
    this.syncFullscreenClass(false);
    this.mapCenter = null;
  }

  private getBranchKey(branch: BranchAddress | null): string {
    if (!branch) {
      return '';
    }

    return String(branch.atokaAddressId ?? branch.atoka ?? branch.branchName ?? '');
  }

  private toBranchSummary(branch: BranchAddress | null): BranchSummary {
    if (!branch) {
      return {
        name: 'Head Office',
        address: 'Not available',
        atoka: '',
        employeeCount: 0,
      };
    }

    const address = this.buildBranchAddress(branch);

    return {
      name: branch.branchName ?? (branch.isHQ ? 'Head Office' : 'Branch'),
      atoka: branch.atoka ?? '',
      address: address || branch.atoka || 'Not available',
      employeeCount: branch.staffCount ?? 0,
    };
  }
  
  get filteredBranches(): BranchAddress[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.branchAddresses;
    }

    return this.branchAddresses.filter((branch) =>
      [
        branch.streetName,
        branch.longitude,
        branch.latitude,
        branch.cityName,
        branch.atokaNumber,
        branch.stateName,
        branch.countries,
        branch.atoka,
        branch.branchName,
      ].some((value) => this.normalizeSearchValue(value).includes(term)),
    );
  }

  private normalizeSearchValue(value: unknown): string {
    if (value == null) {
      return '';
    }

    return String(value).toLowerCase();
  }

  private getBranchMapPosition(branch: BranchAddress): google.maps.LatLngLiteral | null {
    const latitude = this.normalizeCoordinate(branch.latitude);
    const longitude = this.normalizeCoordinate(branch.longitude);

    if (!latitude || !longitude) {
      return null;
    }

    const rawLatitude = Number(latitude);
    const rawLongitude = Number(longitude);
    const swappedPosition = { lat: rawLongitude, lng: rawLatitude };
    if (this.isValidLatLng(swappedPosition)) {
      return swappedPosition;
    }

    const directPosition = { lat: rawLatitude, lng: rawLongitude };
    return this.isValidLatLng(directPosition) ? directPosition : null;
  }

  private normalizeCoordinate(value: unknown): string {
    const coordinate = String(value ?? '').trim();
    if (!coordinate) {
      return '';
    }

    return Number.isFinite(Number(coordinate)) ? coordinate : '';
  }

  private buildBranchAddress(branch: BranchAddress): string {
    const houseNumber = branch.houseNumber ?? branch.atokaNumber ?? branch.oldNumber;

    return [houseNumber, branch.streetName, branch.cityName, branch.stateName, branch.countries]
      .filter((value) => value != null && String(value).trim() !== '')
      .map((value) => String(value).trim())
      .join(', ');
  }

  private isValidLatLng(position: google.maps.LatLngLiteral): boolean {
    return (
      Number.isFinite(position.lat) &&
      Number.isFinite(position.lng) &&
      position.lat >= -90 &&
      position.lat <= 90 &&
      position.lng >= -180 &&
      position.lng <= 180
    );
  }

  private syncFullscreenClass(enable: boolean): void {
    if (!this.mainContent) {
      return;
    }

    if (enable) {
      this.renderer.addClass(this.mainContent, 'location-map-fullscreen');
      return;
    }

    this.renderer.removeClass(this.mainContent, 'location-map-fullscreen');
  }

  openAddBranch(): void {
    const dialogRef = this.dialog.open(AddBranchDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'success') {
        this.getBranches();
        this.showToast(
          'Add Branch',
          'Your request is pending review, we will notify you once we have verified your address',
        );
      }
    });
  }

  private showToast(title: string | undefined, message: string): void {
    this.snackBar.openFromComponent(ToastNotificationComponent, {
      data: {
        title,
        message,
      },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['atoka-toast-panel'],
    });
  }
}
