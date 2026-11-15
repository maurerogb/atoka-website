import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type SearchStatus = 'Verified' | 'Pending' | 'Not found';

interface EmployeeVerificationUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  placeOfWork: string;
  address: string;
  gender: string;
  dateAtAddress: string;
  timeAtAddress: string;
  avatarUrl: string;
  verified: boolean;
}

interface RecentSearchRecord {
  id: string;
  fullName: string;
  phoneNumber: string;
  placeOfWork: string;
  searchedAt: string;
  status: SearchStatus;
}

@Component({
  selector: 'app-protected-employee-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './employee-verification.component.html',
  styleUrl: './employee-verification.component.scss',
})
export class EmployeeVerificationComponent implements OnDestroy {
  searchPhone = '';
  searchPlaceOfWork = '';
  tableFilter = '';
  activeTableFilter = '';
  searchPerformed = false;
  showDetails = false;
  isSearching = false;
  searchResult: EmployeeVerificationUser | null = null;
  mapUrl: SafeResourceUrl | null = null;

  recentSearches: RecentSearchRecord[] = [];

  private lookupTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly employeeDirectory: EmployeeVerificationUser[] = [
    {
      id: 'emp-1201',
      fullName: 'John Okafor Johnson Chuks John Okafor Johnson Chuks',
      email: 'okafor@me.com',
      phoneNumber: '08166122256',
      placeOfWork: 'Goody',
      address: '21 Admiralty Way, Lekki Phase 1, Lagos',
      gender: 'Female',
      dateAtAddress: '2024-05-13T00:00:00Z',
      timeAtAddress: '2 years',
      avatarUrl: 'assets/svg/male-memojis.svg',
      verified: true,
    },
    {
      id: 'emp-1201',
      fullName: 'Amaka Okafor',
      email: 'amaka.okafor@example.com',
      phoneNumber: '0801 234 5678',
      placeOfWork: 'Goody Enterprise - Lekki HQ',
      address: '21 Admiralty Way, Lekki Phase 1, Lagos',
      gender: 'Female',
      dateAtAddress: '2024-05-13T00:00:00Z',
      timeAtAddress: '2 years',
      avatarUrl: 'assets/svg/male-memojis.svg',
      verified: true,
    },
    {
      id: 'emp-1202',
      fullName: 'Chinedu Obi',
      email: 'chinedu.obi@example.com',
      phoneNumber: '0802 345 6789',
      placeOfWork: 'Goody Enterprise - Ikeja Branch',
      address: '14 Adekunle Fajuyi Way, Ikeja GRA, Lagos',
      gender: 'Male',
      dateAtAddress: '2025-11-03T00:00:00Z',
      timeAtAddress: '5 months',
      avatarUrl: 'assets/svg/male-memojis.svg',
      verified: false,
    },
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnDestroy(): void {
    this.clearLookupTimer();
  }

  get canSearch(): boolean {
    return Boolean(this.normalizePhone(this.searchPhone) && this.searchPlaceOfWork.trim());
  }

  get filteredRecentSearches(): RecentSearchRecord[] {
    const rawFilter = this.activeTableFilter.trim().toLowerCase();
    if (!rawFilter) {
      return this.recentSearches;
    }

    const normalizedPhoneFilter = this.normalizePhone(rawFilter);
    return this.recentSearches.filter((record) => {
      const matchesPhone = normalizedPhoneFilter
        ? this.normalizePhone(record.phoneNumber).includes(normalizedPhoneFilter)
        : false;
      const matchesPlaceOfWork = record.placeOfWork.toLowerCase().includes(rawFilter);
      return matchesPhone || matchesPlaceOfWork;
    });
  }

  onSearch(): void {
    if (!this.canSearch) {
      return;
    }

    this.lookupEmployee(this.searchPhone, this.searchPlaceOfWork, true, false);
  }

  applyTableFilter(): void {
    this.activeTableFilter = this.tableFilter.trim();
  }

  viewSearch(record: RecentSearchRecord): void {
    this.lookupEmployee(record.phoneNumber, record.placeOfWork, false, true);
  }

  getStatusClass(status: SearchStatus): string {
    switch (status) {
      case 'Verified':
        return 'successful';
      case 'Pending':
        return 'pending';
      case 'Not found':
        return 'failed';
      default:
        return 'draft';
    }
  }

  private lookupEmployee(
    phone: string,
    placeOfWork: string,
    addToHistory: boolean,
    openDetails: boolean,
  ): void {
    const rawPhone = phone.trim();
    const rawPlaceOfWork = placeOfWork.trim();

    if (!rawPhone || !rawPlaceOfWork) {
      this.resetSearchState();
      return;
    }

    this.searchPhone = rawPhone;
    this.searchPlaceOfWork = rawPlaceOfWork;
    this.searchPerformed = true;
    this.isSearching = true;
    this.searchResult = null;
    this.showDetails = false;
    this.mapUrl = null;
    this.clearLookupTimer();

    this.lookupTimeoutId = setTimeout(() => {
      const result = this.findEmployee(rawPhone, rawPlaceOfWork);
      this.searchResult = result;
      this.showDetails = Boolean(openDetails && result);
      this.mapUrl = result && this.canMapAddress(result.address)
        ? this.buildMapUrl(result.address)
        : null;
      this.isSearching = false;

      if (addToHistory) {
        this.addRecentSearch(rawPhone, rawPlaceOfWork, result);
      }

      this.lookupTimeoutId = null;
    }, 500);
  }

  private findEmployee(phone: string, placeOfWork: string): EmployeeVerificationUser | null {
    const normalizedPhone = this.normalizePhone(phone);
    const normalizedWorkplace = this.normalizeText(placeOfWork);

    return (
      this.employeeDirectory.find(
        (employee) =>
          this.normalizePhone(employee.phoneNumber) === normalizedPhone &&
          this.normalizeText(employee.placeOfWork) === normalizedWorkplace,
      ) ?? null
    );
  }

  private addRecentSearch(
    phone: string,
    placeOfWork: string,
    result: EmployeeVerificationUser | null,
  ): void {
    const status: SearchStatus = result
      ? result.verified
        ? 'Verified'
        : 'Pending'
      : 'Not found';

    const normalizedPhone = this.normalizePhone(phone);
    const normalizedWork = this.normalizeText(placeOfWork);
    const existingIndex = this.recentSearches.findIndex(
      (record) =>
        this.normalizePhone(record.phoneNumber) === normalizedPhone &&
        this.normalizeText(record.placeOfWork) === normalizedWork,
    );

    const newRecord: RecentSearchRecord = {
      id: existingIndex >= 0 ? this.recentSearches[existingIndex].id : `search-${Date.now()}`,
      fullName: result?.fullName ?? 'Not available',
      phoneNumber: result?.phoneNumber ?? phone,
      placeOfWork: result?.placeOfWork ?? placeOfWork,
      searchedAt: new Date().toISOString(),
      status,
    };

    if (existingIndex >= 0) {
      const updatedSearches = [...this.recentSearches];
      updatedSearches.splice(existingIndex, 1);
      this.recentSearches = [newRecord, ...updatedSearches].slice(0, 10);
      return;
    }

    this.recentSearches = [newRecord, ...this.recentSearches].slice(0, 10);
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 10) {
      return digits.slice(-10);
    }
    return digits;
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private canMapAddress(value: string): boolean {
    return value.trim().toLowerCase() !== 'not available';
  }

  private buildMapUrl(value: string): SafeResourceUrl {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private clearLookupTimer(): void {
    if (this.lookupTimeoutId) {
      clearTimeout(this.lookupTimeoutId);
      this.lookupTimeoutId = null;
    }
  }

  private resetSearchState(): void {
    this.searchPerformed = false;
    this.isSearching = false;
    this.searchResult = null;
    this.showDetails = false;
    this.mapUrl = null;
    this.clearLookupTimer();
  }
}
