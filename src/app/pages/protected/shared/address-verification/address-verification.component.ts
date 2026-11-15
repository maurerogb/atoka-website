import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PageEvent } from '@angular/material/paginator';
import { GoogleMapsModule } from '@angular/google-maps';
import { loginInfo } from '../../../../model/authentication';
import { BaseResponse } from '../../../../model/base-response';
import { ResponseCode } from '../../../../model/enums';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { EmploymentLengthPipe } from '../../../../shared/pipes/employment-length.pipe';
import { finalize, map, Observable, of, switchMap } from 'rxjs';
import {
  CreateViewRequestPayload,
  MyViewRequest,
  UseProfile,
  ViewApprovedProfileData,
} from '../../../../model/profile';
import { AuthenticationService } from '../../../../services/authentication.service';
import { ProfileService } from '../../../../services/profile.service';
import { ToastService } from '../../../../services/toast.service';

type SearchStatus = 'Verified' | 'Pending' | 'Declined' | 'Expired' | 'Not found';
type LookupActionState = 'request' | 'view' | 'pending';

interface AddressVerificationUser {
  id: string;
  occupantDetailId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  accountStatus: string;
  dateAtAddress: string;
  timeAtAddress: string;
  avatarUrl: string;
  verified: boolean;
}

interface RecentSearchRecord {
  id: string;
  fullName: string;
  address: string;
  phoneNumber: string;
  searchedAt: string;
  status: SearchStatus;
  accessRequestId?: number;
  respondedOn?: string;
  expiresOn?: string;
  isExpired?: boolean;
}

@Component({
  selector: 'app-protected-address-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    GoogleMapsModule,
    PaginationComponent,
    EmploymentLengthPipe,
  ],
  templateUrl: './address-verification.component.html',
  styleUrl: './address-verification.component.scss',
})
export class AddressVerificationComponent implements OnInit {
  searchPhone = '';
  tableFilterPhone = '';
  activeTableFilter = '';
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20];
  searchPerformed = false;
  showDetails = false;
  isSearching = false;
  isRequestingView = false;
  requestViewMessage = '';
  searchResult: AddressVerificationUser | null = null;
  mapCenter: google.maps.LatLngLiteral | null = null;
  readonly mapZoomLevel = 19;
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
  readonly mapMarkerOptions: google.maps.MarkerOptions = {
    clickable: false,
  };
  lookupActionState: LookupActionState = 'request';
  private viewRequestRecords: MyViewRequest[] = [];
  private mapLookupRequestId = 0;

  recentSearches: RecentSearchRecord[] = [];

  constructor(
    private authService: AuthenticationService,
    private profileService: ProfileService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.loadMyViewRequests();
  }

  onSearch(): void {
    this.lookupPhone(this.searchPhone, false);
  }

  applyTableFilter(): void {
    this.activeTableFilter = this.tableFilterPhone.trim();
    this.pageIndex = 0;
  }

  viewSearch(record: RecentSearchRecord): void {
    if (record.status === 'Pending' || record.status === 'Declined') {
      return;
    }

    if (this.isRequestExpired(record)) {
      this.markRecordAsExpired(record.id);
      this.toastService.show(
        'Request Expired',
        'This request has expired and can no longer be viewed.',
        'error',
      );
      return;
    }

    if (record.accessRequestId && record.status === 'Verified') {
      this.loadApprovedProfile(record);
      return;
    }

    this.lookupPhone(record.phoneNumber, record.status === 'Verified');
  }

  get lookupActionLabel(): string {
    switch (this.lookupActionState) {
      case 'view':
        return 'View Verification';
      case 'pending':
        return 'Request View';
      default:
        return this.isRequestingView ? 'Requesting...' : 'Request View';
    }
  }

  get isLookupActionDisabled(): boolean {
    if (this.isSearching) {
      return true;
    }

    if (this.lookupActionState === 'pending') {
      return true;
    }

    return this.lookupActionState === 'request' && this.isRequestingView;
  }

  onLookupAction(result: AddressVerificationUser): void {
    if (this.isLookupActionDisabled) {
      return;
    }

    if (this.lookupActionState === 'view') {
      this.showDetails = true;
      this.updateMapFromAddress(result.address);
      this.requestViewMessage = '';
      return;
    }

    this.requestView(result);
  }

  get filteredRecentSearches(): RecentSearchRecord[] {
    const term = this.normalizePhone(this.activeTableFilter);
    if (!term) {
      return this.recentSearches;
    }

    return this.recentSearches.filter((record) =>
      this.normalizePhone(record.phoneNumber).includes(term),
    );
  }

  get paginatedRecentSearches(): RecentSearchRecord[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredRecentSearches.slice(startIndex, startIndex + this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getStatusClass(status: SearchStatus): string {
    switch (status) {
      case 'Verified':
        return 'successful';
      case 'Pending':
        return 'pending';
      case 'Declined':
        return 'failed';
      case 'Expired':
        return 'draft';
      case 'Not found':
        return 'failed';
      default:
        return 'draft';
    }
  }

  private lookupPhone(phone: string, openDetails: boolean): void {
    const rawPhone = phone.trim();
    if (!rawPhone) {
      this.searchPerformed = false;
      this.isSearching = false;
      this.searchResult = null;
      this.showDetails = false;
      this.resetMap();
      return;
    }

    this.searchPhone = rawPhone;
    this.searchPerformed = true;
    this.isSearching = true;
    this.isRequestingView = false;
    this.requestViewMessage = '';
    this.searchResult = null;
    this.showDetails = false;
    this.resetMap();
    this.lookupActionState = 'request';

    this.profileService.getProfileByPhone(rawPhone).subscribe({
      next: (response) => {
        const lookupResult = this.mapLookupResult(response);
        const requestState = lookupResult
          ? this.getRequestStateForPhone(lookupResult.phoneNumber)
          : null;
        const result = this.applyRequestStateToResult(lookupResult, requestState);

        this.searchResult = result;
        this.lookupActionState = this.getLookupActionState(requestState);
        this.showDetails = Boolean(openDetails && result && this.lookupActionState === 'view');
        if (this.showDetails && result) {
          this.updateMapFromAddress(result.address);
        } else {
          this.resetMap();
        }

        if (result && requestState) {
          this.updateExistingRecentSearch(result, requestState);
        }
      },
      error: () => {
        this.isSearching = false;
        this.isRequestingView = false;
        this.searchResult = null;
        this.showDetails = false;
        this.resetMap();
        this.lookupActionState = 'request';
      },
      complete: () => {
        this.isSearching = false;
      },
    });
  }

  private loadApprovedProfile(record: RecentSearchRecord): void {
    const accessRequestId = this.toPositiveNumber(record.accessRequestId);
    if (!accessRequestId) {
      this.toastService.show(
        'Request Error',
        'Unable to load this request. Please refresh and try again.',
        'error',
      );
      return;
    }

    this.searchPhone = record.phoneNumber;
    this.searchPerformed = true;
    this.isSearching = true;
    this.isRequestingView = false;
    this.requestViewMessage = '';
    this.searchResult = null;
    this.showDetails = false;
    this.resetMap();
    this.lookupActionState = 'request';

    this.profileService.getApprovedProfileByRequest(accessRequestId).subscribe({
      next: (response) => {
        const expiresOn = this.extractExpiryFromApprovedProfileResponse(response, record);

        if (this.isExpiredAccessResponse(response)) {
          this.markRecordAsExpired(record.id, expiresOn);
          this.markViewRequestRecordAsExpired(record.accessRequestId);
          this.toastService.show(
            'Request Expired',
            response.description || 'Access has expired. Please request permission again.',
            'error',
          );
          this.searchResult = null;
          this.showDetails = false;
          this.resetMap();
          return;
        }

        if (this.isExpiredAt(expiresOn)) {
          this.markRecordAsExpired(record.id, expiresOn);
          this.markViewRequestRecordAsExpired(record.accessRequestId);
          this.toastService.show(
            'Request Expired',
            'This request has expired and can no longer be viewed.',
            'error',
          );
          this.searchResult = null;
          this.showDetails = false;
          this.resetMap();
          return;
        }

        if (response.responseCode !== ResponseCode.Success || !response.data) {
          this.toastService.show(
            'Request Error',
            response.description || 'Unable to load this request right now. Please try again.',
            'error',
          );
          this.searchResult = null;
          this.showDetails = false;
          this.resetMap();
          return;
        }

        const mappedResult = this.mapApprovedProfileResponse(response.data);
        this.searchResult = mappedResult;
        this.lookupActionState = 'view';
        this.showDetails = Boolean(mappedResult);
        if (mappedResult) {
          this.updateMapFromApprovedProfile(response.data, mappedResult.address);
        } else {
          this.resetMap();
        }
      },
      error: (err) => {
        const expiredMessage = this.getExpiredMessageFromError(err);
        if (expiredMessage) {
          this.markRecordAsExpired(record.id, record.expiresOn);
          this.markViewRequestRecordAsExpired(record.accessRequestId);
          this.toastService.show('Request Expired', expiredMessage, 'error');
        } else {
          this.toastService.show(
            'Request Error',
            this.getErrorMessage(err) || 'Unable to load this request right now. Please try again.',
            'error',
          );
        }
        this.searchResult = null;
        this.showDetails = false;
        this.resetMap();
      },
      complete: () => {
        this.isSearching = false;
      },
    });
  }

  requestView(result: AddressVerificationUser): void {
    if (this.isRequestingView || this.isSearching) {
      return;
    }

    this.isRequestingView = true;
    this.requestViewMessage = '';

    this.buildViewRequestPayload(result.occupantDetailId).pipe(
      switchMap((payload) => {
        if (!payload) {
          this.requestViewMessage = 'Unable to create view request. Please re-login and try again.';
          return of(null);
        }

        return this.profileService.createViewRequest(payload);
      }),
      finalize(() => {
        this.isRequestingView = false;
      }),
    ).subscribe({
      next: (response) => {
        if (!response) {
          return;
        }

        if (response.responseCode === ResponseCode.Success) {
          const pendingResult: AddressVerificationUser = {
            ...result,
            verified: false,
          };

          this.searchResult = pendingResult;
          this.addRecentSearch(pendingResult.phoneNumber, pendingResult);
          this.lookupActionState = 'pending';
          this.upsertLocalViewRequestStatus(result.phoneNumber, 'PENDING');
          this.showDetails = false;
          this.requestViewMessage = '';
          this.toastService.show(
            'Request View',
            `Your request has been sent out to ${result.fullName}. You will receive a notification when the user approves your request`,
          );
          return;
        }

        this.requestViewMessage = response.description || 'Unable to create view request.';
      },
      error: (err) => {
        this.requestViewMessage =
          err?.error?.description ||
          err?.description ||
          'Unable to create view request.';
      },
    });
  }

  private loadMyViewRequests(): void {
    const login = this.authService.getLoginInfo();
    if (!login) {
      this.viewRequestRecords = [];
      this.recentSearches = [];
      this.pageIndex = 0;
      return;
    }

    const isBusiness = Number(login.accountTypeId) > 2;
    const requesterId$ = isBusiness
      ? of(this.toPositiveNumber(login.businessId))
      : this.getLoggedInOccupantDetailId(login);

    requesterId$.pipe(
      switchMap((requesterId) => {
        if (!requesterId) {
          return of(null);
        }

        return this.profileService.getMyViewRequests(requesterId, isBusiness);
      }),
    ).subscribe({
      next: (response) => {
        // if (response?.responseCode === ResponseCode.Success && Array.isArray(response.data)) {
        if (response && Array.isArray(response.data)) {
          this.viewRequestRecords = response.data;
          this.recentSearches = this.mapMyViewRequestsToRecentSearches(response.data);
          this.ensurePageIndexInRange();
        } else {
          this.viewRequestRecords = [];
          this.recentSearches = [];
          this.pageIndex = 0;
        }

        this.lookupActionState = this.getLookupActionState(
          this.searchResult ? this.getRequestStateForPhone(this.searchResult.phoneNumber) : null,
        );
      },
      error: () => {
        this.viewRequestRecords = [];
        this.recentSearches = [];
        this.pageIndex = 0;
      },
    });
  }

  private upsertLocalViewRequestStatus(
    phoneNumber: string,
    status: 'PENDING' | 'APPROVED' | 'DECLINED',
  ): void {
    const normalizedPhone = this.normalizePhone(phoneNumber);
    if (!normalizedPhone) {
      return;
    }

    const existingIndex = this.viewRequestRecords.findIndex((record) =>
      this.normalizePhone(record.phoneNumber || '') === normalizedPhone,
    );
    const existingRecord = existingIndex >= 0 ? this.viewRequestRecords[existingIndex] : null;
    const updatedRecord: MyViewRequest = {
      ...(existingRecord || {}),
      accessRequestId: existingRecord?.accessRequestId || 0,
      status,
      phoneNumber,
      requestedOn:
        existingIndex >= 0
          ? this.viewRequestRecords[existingIndex].requestedOn
          : new Date().toISOString(),
      respondedOn: status === 'PENDING' ? undefined : new Date().toISOString(),
      ownerName: existingIndex >= 0 ? this.viewRequestRecords[existingIndex].ownerName : '',
    };

    if (existingIndex >= 0) {
      const updatedRequests = [...this.viewRequestRecords];
      updatedRequests.splice(existingIndex, 1, updatedRecord);
      this.viewRequestRecords = updatedRequests;
      return;
    }

    this.viewRequestRecords = [updatedRecord, ...this.viewRequestRecords];
  }

  private addRecentSearch(phone: string, result: AddressVerificationUser | null): void {
    const status: SearchStatus = result
      ? result.verified
        ? 'Verified'
        : 'Pending'
      : 'Not found';

    const normalizedPhone = this.normalizePhone(phone);
    const existingIndex = this.recentSearches.findIndex(
      (record) => this.normalizePhone(record.phoneNumber) === normalizedPhone,
    );

    const newRecord: RecentSearchRecord = {
      id: existingIndex >= 0 ? this.recentSearches[existingIndex].id : `search-${Date.now()}`,
      fullName: result?.fullName ?? 'Not available',
      address: result?.address ?? 'Not available',
      phoneNumber: result?.phoneNumber ?? phone,
      searchedAt: new Date().toISOString(),
      status,
    };

    if (existingIndex >= 0) {
      const updatedSearches = [...this.recentSearches];
      updatedSearches.splice(existingIndex, 1);
      this.recentSearches = [newRecord, ...updatedSearches].slice(0, 10);
      this.ensurePageIndexInRange();
      return;
    }

    this.recentSearches = [newRecord, ...this.recentSearches].slice(0, 10);
    this.ensurePageIndexInRange();
  }

  private mapMyViewRequestsToRecentSearches(requests: MyViewRequest[]): RecentSearchRecord[] {
    return requests
      .map((request) => {
        const searchedAt = request.requestedOn || request.respondedOn || new Date().toISOString();
        const expiresOn = String(request.expiresOn || '').trim() || undefined;
        const isExpired = this.isViewRequestExpired(request);
        return {
          id: `view-request-${request.accessRequestId}`,
          fullName: request.ownerName?.trim() || 'Not available',
          address: '----------------------', //request.message?.trim() || 'Not available',
          phoneNumber: request.phoneNumber || 'Not available',
          searchedAt,
          status: this.mapMyViewRequestStatus(request.status, isExpired),
          accessRequestId: request.accessRequestId,
          respondedOn: request.respondedOn,
          expiresOn,
          isExpired,
        };
      })
      .sort((a, b) => this.toDateValue(b.searchedAt) - this.toDateValue(a.searchedAt));
  }

  private mapMyViewRequestStatus(statusValue?: string, isExpired = false): SearchStatus {
    const status = this.normalizeRequestStatus(statusValue);
    if (isExpired) {
      return 'Expired';
    }

    if (status === 'APPROVED' || status === 'APROVED' || status === 'CONFIRMED') {
      return 'Verified';
    }

    if (status === 'PENDING') {
      return 'Pending';
    }

    if (status === 'DECLINED' || status === 'REJECTED' || status === 'DENIED') {
      return 'Declined';
    }

    return 'Pending';
  }

  private isViewRequestExpired(request: MyViewRequest): boolean {
    return request.isExpired === true;
  }

  private isExpiredAt(expiresOn?: string): boolean {
    if (!expiresOn) {
      return false;
    }

    return this.toDateValue(expiresOn) > 0 && this.toDateValue(expiresOn) <= Date.now();
  }

  private isRequestExpired(record: RecentSearchRecord): boolean {
    if (record.status === 'Expired' || record.isExpired) {
      return true;
    }

    return false;
  }

  private markRecordAsExpired(recordId: string, expiresOn?: string): void {
    this.recentSearches = this.recentSearches.map((record) => {
      if (record.id !== recordId) {
        return record;
      }

      return {
        ...record,
        status: 'Expired',
        isExpired: true,
        expiresOn: expiresOn || record.expiresOn,
      };
    });
    this.ensurePageIndexInRange();
  }

  private markViewRequestRecordAsExpired(accessRequestId?: number): void {
    const normalizedId = this.toPositiveNumber(accessRequestId);
    if (!normalizedId) {
      return;
    }

    this.viewRequestRecords = this.viewRequestRecords.map((record) => {
      if (this.toPositiveNumber(record.accessRequestId) !== normalizedId) {
        return record;
      }

      return {
        ...record,
        status: record.status,
        isExpired: true,
      };
    });
  }

  private mapLookupResult(response: BaseResponse<UseProfile>): AddressVerificationUser | null {
    if (!response || response.responseCode !== ResponseCode.Success || !response.data) {
      return null;
    }

    const data = response.data as UseProfile;
    return {
      id: `${data.occupantDetailId}`,
      occupantDetailId: data.occupantDetailId,
      fullName: this.buildFullName(data),
      email: data.emailAddress || 'Not available',
      phoneNumber: data.phoneNumber || this.searchPhone,
      address: this.pickAddress(data),
      gender: data.gender || 'Not available',
      accountStatus: data.status || 'Active',
      dateAtAddress: this.normalizeDate(data.dateAtAddress),
      timeAtAddress: data.timeAtAddress || 'Not available',
      avatarUrl: data.imageUrl || 'assets/svg/male-memojis.svg',
      verified: typeof data.isVerified === 'boolean' ? data.isVerified : true,
    };
  }

  private mapApprovedProfileResponse(data: ViewApprovedProfileData): AddressVerificationUser | null {
    const fullName = String(data.name || '').trim();
    const validatedStatus = this.normalizeRequestStatus(data.isValidated);
    const isValidated =
      validatedStatus === 'APPROVED' ||
      validatedStatus === 'APROVED' ||
      validatedStatus === 'CONFIRMED' ||
      validatedStatus === 'VERIFIED';

    return {
      id: `${data.residentDetailId || Date.now()}`,
      occupantDetailId: this.toPositiveNumber(data.residentDetailId),
      fullName: fullName || 'Not available',
      email: data.email || 'Not available',
      phoneNumber: data.phoneNumber || 'Not available',
      address: (data.address || '').trim() || 'Not available',
      gender: data.gender || 'Not available',
      accountStatus: data.isValidated || 'Active',
      dateAtAddress: this.normalizeDate(data.dateAtAddress),
      timeAtAddress: 'Not available',
      avatarUrl: data.photo || 'assets/svg/male-memojis.svg',
      verified: isValidated,
    };
  }

  private extractExpiryFromApprovedProfileResponse(
    response: BaseResponse<ViewApprovedProfileData> & { expiresOn?: string },
    record: RecentSearchRecord,
  ): string | undefined {
    const directExpiresOn = typeof response.expiresOn === 'string' ? response.expiresOn : undefined;
    if (directExpiresOn) {
      return directExpiresOn;
    }

    const nestedExpiresOn = typeof (response as any)?.objects?.expiresOn === 'string'
      ? (response as any).objects.expiresOn
      : undefined;
    if (nestedExpiresOn) {
      return nestedExpiresOn;
    }

    return record.expiresOn;
  }

  private updateMapFromApprovedProfile(
    data: ViewApprovedProfileData,
    fallbackAddress: string,
  ): void {
    const latitude = this.toCoordinateValue(data.latitude);
    const longitude = this.toCoordinateValue(data.longitude);

    if (latitude !== null && longitude !== null) {
      // API currently returns these coordinates swapped, so flip them for map rendering.
      const swappedLatitude = longitude;
      const swappedLongitude = latitude;

      if (this.isValidCoordinate(swappedLatitude, swappedLongitude)) {
        this.setMapCenter({
          lat: swappedLatitude,
          lng: swappedLongitude,
        });
        return;
      }
    }

    this.updateMapFromAddress(fallbackAddress);
  }

  private updateMapFromAddress(address: string): void {
    if (!this.canMapAddress(address)) {
      this.resetMap();
      return;
    }

    const requestId = ++this.mapLookupRequestId;
    this.geocodeMapAddress(address).then((center) => {
      if (requestId !== this.mapLookupRequestId) {
        return;
      }

      if (center) {
        this.setMapCenter(center);
        return;
      }

      this.resetMap();
    });
  }

  private geocodeMapAddress(query: string): Promise<google.maps.LatLngLiteral | null> {
    if (typeof google === 'undefined' || !google.maps?.Geocoder) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results?.length) {
          resolve(null);
          return;
        }

        const location = results[0].geometry?.location;
        if (!location) {
          resolve(null);
          return;
        }

        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      });
    });
  }

  private setMapCenter(center: google.maps.LatLngLiteral): void {
    this.mapCenter = center;
  }

  private resetMap(): void {
    this.mapLookupRequestId += 1;
    this.mapCenter = null;
  }

  private isValidCoordinate(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  private toCoordinateValue(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }

    return parsed;
  }

  private getRequestStateForPhone(phone: string): SearchStatus | null {
    const normalizedPhone = this.normalizePhone(phone);
    if (!normalizedPhone) {
      return null;
    }

    const matches = this.viewRequestRecords.filter((record) =>
      this.normalizePhone(record.phoneNumber || '') === normalizedPhone,
    );

    if (!matches.length) {
      return null;
    }

    if (matches.some((record) => this.isActiveApproved(record))) {
      return 'Verified';
    }

    if (matches.some((record) => this.isViewRequestExpired(record))) {
      return 'Expired';
    }

    if (matches.some((record) => this.isPending(record))) {
      return 'Pending';
    }

    if (matches.some((record) => this.isDeclined(record))) {
      return 'Declined';
    }

    return null;
  }

  private getLookupActionState(state: SearchStatus | null): LookupActionState {
    if (state === 'Verified') {
      return 'view';
    }

    if (state === 'Pending') {
      return 'pending';
    }

    return 'request';
  }

  private isApproved(record: MyViewRequest): boolean {
    const status = this.normalizeRequestStatus(record.status);
    return status === 'APPROVED' || status === 'APROVED' || status === 'CONFIRMED';
  }

  private isActiveApproved(record: MyViewRequest): boolean {
    return this.isApproved(record) && !this.isViewRequestExpired(record);
  }

  private isPending(record: MyViewRequest): boolean {
    return this.normalizeRequestStatus(record.status) === 'PENDING';
  }

  private isDeclined(record: MyViewRequest): boolean {
    const status = this.normalizeRequestStatus(record.status);
    return status === 'DECLINED' || status === 'REJECTED' || status === 'DENIED';
  }

  private normalizeRequestStatus(statusValue?: string): string {
    return String(statusValue || '').trim().replace(/\s+/g, '_').toUpperCase();
  }

  private getExpiredMessageFromError(error: any): string | null {
    const errorDescription = this.getErrorMessage(error);
    if (!errorDescription) {
      return null;
    }

    if (errorDescription.toLowerCase().includes('expired')) {
      return errorDescription;
    }

    return null;
  }

  private getErrorMessage(error: any): string {
    return String(
      error?.error?.description ||
        error?.error?.message ||
        error?.description ||
        error?.message ||
        '',
    ).trim();
  }

  private isExpiredAccessResponse(
    response: BaseResponse<ViewApprovedProfileData> & { expiresOn?: string },
  ): boolean {
    if (!response) {
      return false;
    }

    const responseCode = Number((response as any).responseCode);
    const description = String(response.description || '').toLowerCase();
    const hasExpiredMessage = description.includes('expired');
    return hasExpiredMessage && (responseCode === ResponseCode.Error || !response.data);
  }

  private updateExistingRecentSearch(result: AddressVerificationUser, status: SearchStatus): void {
    const normalizedPhone = this.normalizePhone(result.phoneNumber);
    const existingIndex = this.recentSearches.findIndex(
      (record) => this.normalizePhone(record.phoneNumber) === normalizedPhone,
    );

    if (existingIndex < 0) {
      return;
    }

    const updatedRecord: RecentSearchRecord = {
      ...this.recentSearches[existingIndex],
      fullName: result.fullName,
      address: result.address,
      phoneNumber: result.phoneNumber,
      searchedAt: new Date().toISOString(),
      status,
    };

    const updatedSearches = [...this.recentSearches];
    updatedSearches.splice(existingIndex, 1);
    this.recentSearches = [updatedRecord, ...updatedSearches].slice(0, 10);
    this.ensurePageIndexInRange();
  }

  private applyRequestStateToResult(
    result: AddressVerificationUser | null,
    state: SearchStatus | null,
  ): AddressVerificationUser | null {
    if (!result) {
      return null;
    }

    if (state === 'Verified') {
      return {
        ...result,
        verified: true,
      };
    }

    if (state === 'Pending' || state === 'Declined' || state === 'Expired') {
      return {
        ...result,
        verified: false,
      };
    }

    return result;
  }

  private buildViewRequestPayload(profileId: number): Observable<CreateViewRequestPayload | null> {
    const login = this.authService.getLoginInfo();
    if (!login) {
      return of(null);
    }

    const isBusiness = Number(login.accountTypeId) > 2;
    if (isBusiness) {
      const requesterId = this.toPositiveNumber(login.businessId);
      if (!requesterId || !profileId) {
        return of(null);
      }

      return of({
        profileId,
        requesterId,
        isBusiness,
      });
    }

    return this.getLoggedInOccupantDetailId(login).pipe(
      map((requesterId) => {
        if (!requesterId || !profileId) {
          return null;
        }

        return {
          profileId,
          requesterId,
          isBusiness,
        };
      }),
    );
  }

  private getLoggedInOccupantDetailId(login: loginInfo): Observable<number> {
    const cachedOccupantDetailId = this.toPositiveNumber(
      this.authService.getCachedOccupantDetails()?.occupantDetailId,
    );
    if (cachedOccupantDetailId) {
      return of(cachedOccupantDetailId);
    }

    return this.authService.ensureOccupantDetailsCached(true).pipe(
      map((details) => {
        const refreshedOccupantDetailId = this.toPositiveNumber(details?.occupantDetailId);
        if (refreshedOccupantDetailId) {
          return refreshedOccupantDetailId;
        }

        if (typeof login.occupantDetailId === 'number') {
          return this.toPositiveNumber(login.occupantDetailId);
        }

        return 0;
      }),
    );
  }

  private toPositiveNumber(value: unknown): number {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      return 0;
    }
    return num;
  }

  private buildFullName(data: UseProfile): string {
    const parts = [data.title, data.firstName, data.middleName, data.surname]
      .map((part) => part?.trim())
      .filter((part): part is string => Boolean(part));

    return parts.join(' ') || 'Not available';
  }

  private pickAddress(data: UseProfile): string {
    const address = data.address || data.fullAddress || data.residentialAddress;
    return address?.trim() || 'Not available';
  }

  private canMapAddress(address: string): boolean {
    return address.trim().toLowerCase() !== 'not available';
  }

  private normalizeDate(dateValue?: string): string {
    if (!dateValue) {
      return '';
    }

    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? '' : dateValue;
  }

  private toDateValue(value: string): number {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 10) {
      return digits.slice(-10);
    }
    return digits;
  }

  private ensurePageIndexInRange(): void {
    const maxPageIndex = Math.max(Math.ceil(this.filteredRecentSearches.length / this.pageSize) - 1, 0);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }
  }
}
