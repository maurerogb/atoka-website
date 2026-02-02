import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonComponent } from "../../../../shared/button/button.component";

type SearchStatus = 'Verified' | 'Pending' | 'Not found';

interface AddressVerificationUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  accountStatus: 'Active' | 'Inactive' | 'Under Review';
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
    ButtonComponent
],
  templateUrl: './address-verification.component.html',
  styleUrl: './address-verification.component.scss',
})
export class AddressVerificationComponent {
  searchPhone = '';
  tableFilterPhone = '';
  activeTableFilter = '';
  searchPerformed = false;
  showDetails = false;
  searchResult: AddressVerificationUser | null = null;
  mapUrl: SafeResourceUrl | null = null;

  readonly mockUsers: AddressVerificationUser[] = [
    {
      id: 'usr-1001',
      fullName: 'Amaka Okafor',
      email: 'amaka.okafor@example.com',
      phoneNumber: '0801 234 5678',
      address: '21 Admiralty Way, Lekki Phase 1, Lagos',
      gender: 'Female',
      accountStatus: 'Active',
      dateAtAddress: '2021-03-15',
      timeAtAddress: '3 years 10 months',
      avatarUrl: 'assets/images/avatar-1.png',
      verified: true,
    },
    {
      id: 'usr-1002',
      fullName: 'Chinedu Obi',
      email: 'chinedu.obi@example.com',
      phoneNumber: '+234 802 345 6789',
      address: '14 Atbara Street, Wuse 2, Abuja',
      gender: 'Male',
      accountStatus: 'Active',
      dateAtAddress: '2020-06-02',
      timeAtAddress: '5 years 7 months',
      avatarUrl: 'assets/images/avatar-1.png',
      verified: true,
    },
    {
      id: 'usr-1003',
      fullName: 'Sade Adebayo',
      email: 'sade.adebayo@example.com',
      phoneNumber: '0803 987 4321',
      address: '5 Bourdillon Road, Ikoyi, Lagos',
      gender: 'Female',
      accountStatus: 'Under Review',
      dateAtAddress: '2024-05-22',
      timeAtAddress: '8 months',
      avatarUrl: 'assets/images/avatar-1.png',
      verified: true,
    },
  ];

  recentSearches: RecentSearchRecord[] = [
    {
      id: 'search-1001',
      fullName: 'Amaka Okafor',
      address: '21 Admiralty Way, Lekki Phase 1, Lagos',
      phoneNumber: '0801 234 5678',
      searchedAt: '2026-01-24T09:10:00Z',
      status: 'Verified',
    },
    {
      id: 'search-1002',
      fullName: 'Chinedu Obi',
      address: '14 Atbara Street, Wuse 2, Abuja',
      phoneNumber: '0802 345 6789',
      searchedAt: '2026-01-25T13:22:00Z',
      status: 'Verified',
    },
    {
      id: 'search-1003',
      fullName: 'Sade Adebayo',
      address: '5 Bourdillon Road, Ikoyi, Lagos',
      phoneNumber: '0803 987 4321',
      searchedAt: '2026-01-27T08:05:00Z',
      status: 'Verified',
    },
    {
      id: 'search-1004',
      fullName: 'Not available',
      address: 'Not available',
      phoneNumber: '0815 555 1212',
      searchedAt: '2026-01-28T16:40:00Z',
      status: 'Not found',
    },
  ];

  constructor(private sanitizer: DomSanitizer) { }

  onSearch(): void {
    this.runSearch(this.searchPhone, true, false);
  }

  applyTableFilter(): void {
    this.activeTableFilter = this.tableFilterPhone.trim();
  }

  viewSearch(record: RecentSearchRecord): void {
    this.runSearch(record.phoneNumber, false, true);
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

  private runSearch(phone: string, addToHistory: boolean, openDetails: boolean): void {
    const rawPhone = phone.trim();
    if (!rawPhone) {
      this.searchPerformed = false;
      this.searchResult = null;
      this.showDetails = false;
      this.mapUrl = null;
      return;
    }

    const normalizedPhone = this.normalizePhone(rawPhone);
    const found =
      this.mockUsers.find(
        (user) => this.normalizePhone(user.phoneNumber) === normalizedPhone,
      ) ?? null;

    this.searchPhone = rawPhone;
    this.searchPerformed = true;
    this.searchResult = found;
    this.showDetails = Boolean(openDetails && found);
    this.mapUrl = found ? this.buildMapUrl(found.address) : null;

    if (addToHistory) {
      this.addRecentSearch(rawPhone, found);
    }
  }

  private addRecentSearch(phone: string, result: AddressVerificationUser | null): void {
    const status: SearchStatus = result
      ? result.verified
        ? 'Verified'
        : 'Pending'
      : 'Not found';

    const newRecord: RecentSearchRecord = {
      id: `search-${Date.now()}`,
      fullName: result?.fullName ?? 'Not available',
      address: result?.address ?? 'Not available',
      phoneNumber: phone,
      searchedAt: new Date().toISOString(),
      status,
    };

    this.recentSearches = [newRecord, ...this.recentSearches].slice(0, 10);
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length > 10) {
      return digits.slice(-10);
    }
    return digits;
  }

  private buildMapUrl(address: string): SafeResourceUrl {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
