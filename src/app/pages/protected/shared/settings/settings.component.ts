import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BaseResponse } from '../../../../model/base-response';
import { PersonalData } from '../../../../model/dto/personal-data-dto';
import { ResponseCode } from '../../../../model/enums';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { UploadProfileImageComponent } from '../../../../components/upload-profile-image/upload-profile-image.component';
import { SettingsChangePasswordDialogComponent } from '../../../../components/modals/settings-change-password-dialog/settings-change-password-dialog.component';
import { SettingsChangeAddressDialogComponent } from '../../../../components/modals/settings-change-address-dialog/settings-change-address-dialog.component';
import { SettingsChangeEmploymentStatusDialogComponent } from '../../../../components/modals/settings-change-employment-status-dialog/settings-change-employment-status-dialog.component';
import { SettingsSuccessDialogComponent } from '../../../../components/modals/settings-success-dialog/settings-success-dialog.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { LoadingService } from '../../../../services/loading.service';
import { RegistrationService } from '../../../../services/registration.service';
import { SettingsService } from '../../../../services/settings.service';

export type SettingsSectionId =
  | 'my-details'
  | 'account'
  | 'branch'
  | 'notification'
  | 'security';

interface SettingsSection {
  id: SettingsSectionId;
  label: string;
  title: string;
  description: string;
}

const SECTION_DEFINITIONS: Record<SettingsSectionId, SettingsSection> = {
  'my-details': {
    id: 'my-details',
    label: 'My details',
    title: 'Details settings',
    description: 'We may still send you important notifications about your account outside of your notification settings.',
  },
  account: {
    id: 'account',
    label: 'Account',
    title: 'Account settings',
    description: 'We may still send you important notifications about your account outside of your notification settings.',
  },
  branch: {
    id: 'branch',
    label: 'Branch',
    title: 'Branch settings',
    description: 'Review branch details, headquarters information, and branch preferences.',
  },
  notification: {
    id: 'notification',
    label: 'Notification',
    title: 'Notifications',
    description: 'We may still send you important notifications about your account outside of your notification settings.',
  },
  security: {
    id: 'security',
    label: 'Security',
    title: 'Security',
    description: 'We may still send you important notifications about your account outside of your notification settings.',
  },
};

const SETTINGS_NAV_BY_ACCOUNT: Record<string, SettingsSectionId[]> = {
  'business-account': ['my-details', 'account', 'branch', 'notification', 'security'],
  tenant: ['my-details', 'account', 'notification', 'security'],
  user: ['my-details', 'account', 'notification', 'security'],
  'public-service': ['my-details', 'account', 'notification', 'security'],
  default: ['my-details', 'account', 'notification', 'security'],
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    UploadProfileImageComponent,
    LoaderComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent implements OnInit, OnDestroy {
  accountType = '';
  sections: SettingsSection[] = [];
  activeSectionId: SettingsSectionId = 'my-details'; //'security'; //'my-details';
  profileImageControl = new FormControl('assets/images/avatar-2.png');
  personalForm: FormGroup;
  personalDetails?: PersonalData;
  personalMessage = '';
  isSavingPersonal = false;
  private readonly subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private authService: AuthenticationService,
    private registrationService: RegistrationService,
    public loadingService: LoadingService,
    private fb: FormBuilder,
  ) {
    const data$ = this.route.parent?.data ?? this.route.data;

    this.personalForm = this.fb.group({
      title: [''],
      firstName: [''],
      middleName: [''],
      surname: [''],
      emailAddress: [''],
      phoneNumber: [''],
      gender: [''],
      dateOfBirth: [null],
    });

    this.subscriptions.add(
      data$.subscribe((data) => {
        this.accountType = (data['accountType'] as string) ?? this.accountType;
        const sectionIds =
          SETTINGS_NAV_BY_ACCOUNT[this.accountType] ?? SETTINGS_NAV_BY_ACCOUNT['default'];
        this.sections = sectionIds.map((id) => SECTION_DEFINITIONS[id]);
        if (!this.sections.find((section) => section.id === this.activeSectionId)) {
          this.activeSectionId = this.sections[0]?.id ?? 'my-details';
        }
      })
    );
  }

  ngOnInit(): void {
    this.loadPersonalDetails();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get activeSection(): SettingsSection | undefined {
    return this.sections.find((section) => section.id === this.activeSectionId);
  }

  get accountTypeLabel(): string {
    return this.formatAccountType(this.accountType) || 'Account';
  }

  get canSavePersonal(): boolean {
    return this.personalForm.dirty && !this.isSavingPersonal;
  }

  get titleValue(): string {
    const value = (this.personalDetails?.title ?? '').trim().toLowerCase();
    if (['mr', 'mrs', 'ms', 'dr'].includes(value)) {
      return value;
    }
    return '';
  }

  get genderValue(): string {
    const value = (this.personalDetails?.gender ?? '').trim().toLowerCase();
    if (['male', 'female', 'other'].includes(value)) {
      return value;
    }
    return '';
  }

  get dateOfBirthValue(): string {
    const value = this.personalDetails?.dateOfBirth;
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value.includes('T') ? value.split('T')[0] : value;
    }
    return '';
  }

  get atokaAddressValue(): string {
    const addressDetails = this.personalDetails?.addressDetails as
      | { atoka?: string; atokaCode?: string; code?: string }
      | undefined;
    const addressCode = addressDetails?.atoka || addressDetails?.atokaCode || addressDetails?.code;
    if (addressCode) {
      return addressCode;
    }
    const id = this.personalDetails?.atokaAddressId;
    return id && id > 0 ? String(id) : '';
  }

  get accountStatusLabel(): string {
    return this.personalDetails?.confirmationStatus || 'Active';
  }

  get accountSummary(): Array<{ label: string; value: string }> {
    return [
      { label: 'Account type', value: this.accountTypeLabel },
      { label: 'Primary email', value: 'Not set' },
      { label: 'Language', value: 'Not set' },
      { label: 'Timezone', value: 'Not set' },
    ];
  }

  get branchSummary(): Array<{ label: string; value: string }> {
    return [
      { label: 'Head office', value: 'Not set' },
      { label: 'Default branch', value: 'Not set' },
      { label: 'Branch count', value: '0' },
      { label: 'Branch status', value: 'Not set' },
    ];
  }

  setActiveSection(id: SettingsSectionId): void {
    this.activeSectionId = id;
  }

  savePersonalDetails(): void {
    if (this.personalForm.invalid || !this.personalForm.dirty || this.isSavingPersonal) {
      return;
    }

    if (!this.personalDetails?.occupantDetailId) {
      this.personalMessage = 'Unable to determine your profile. Please refresh and try again.';
      return;
    }

    this.personalMessage = '';
    this.isSavingPersonal = true;
    this.loadingService.show();

    const formValue = this.personalForm.value;
    const payload: PersonalData = {
      ...this.personalDetails,
      title: formValue.title || '',
      firstName: formValue.firstName || '',
      middleName: formValue.middleName || '',
      surname: formValue.surname || '',
      emailAddress: formValue.emailAddress || '',
      phoneNumber: formValue.phoneNumber || '',
      gender: formValue.gender || '',
      dateOfBirth: this.normalizeDateForApi(formValue.dateOfBirth),
    };

    this.registrationService.updateProfile(payload).subscribe({
      next: (res: BaseResponse<PersonalData>) => {
        this.isSavingPersonal = false;
        this.loadingService.hide();
        if (res.responseCode === ResponseCode.Success) {
          this.personalDetails = res.data || payload;
          this.patchPersonalForm(this.personalDetails);
          this.personalForm.markAsPristine();
        } else {
          this.personalMessage = res.description || 'Unable to update your profile.';
        }
      },
      error: (err: any) => {
        this.isSavingPersonal = false;
        this.loadingService.hide();
        if (err?.error?.description) {
          this.personalMessage = err.error.description;
        } else if (err?.description) {
          this.personalMessage = err.description;
        } else {
          this.personalMessage = 'An error occurred. Please try again.';
        }
      },
    });
  }

  openChangePassword(): void {
    this.dialog.open(SettingsChangePasswordDialogComponent, {
      width: '520px',
      maxWidth: '90vw',
      autoFocus: false,
    });
  }

  openChangeAddress(): void {
    this.dialog.open(SettingsChangeAddressDialogComponent, {
      width: '640px',
      maxWidth: '95vw',
      autoFocus: false,
    });
  }

  openChangeEmploymentStatus(): void {
    this.dialog.open(SettingsChangeEmploymentStatusDialogComponent, {
      width: '520px',
      maxWidth: '90vw',
      autoFocus: false,
    });
  }

  private openSuccessDialog(title: string, message: string): void {
    this.dialog.open(SettingsSuccessDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      autoFocus: false,
      data: { title, message },
    });
  }

  private loadPersonalDetails(): void {
    const loginInfo = this.authService.getLoginInfo();
    if (!loginInfo?.userId && !loginInfo?.userName) {
      return;
    }

    this.settingsService.getUserDetails(loginInfo?.userId ?? '').subscribe({
      next: (res: BaseResponse<PersonalData>) => {
        if (res.responseCode === ResponseCode.Success && res.data) {
          this.personalDetails = res.data;
          this.patchPersonalForm(res.data);
          if (res.data.imageUrl) {
            this.profileImageControl.setValue(res.data.imageUrl);
          }
        }
      },
    });
  }

  private patchPersonalForm(details: PersonalData): void {
    this.personalForm.patchValue(
      {
        title: this.normalizeTitle(details.title),
        firstName: details.firstName || '',
        middleName: details.middleName || '',
        surname: details.surname || '',
        emailAddress: details.emailAddress || '',
        phoneNumber: details.phoneNumber || '',
        gender: this.normalizeGender(details.gender),
        dateOfBirth: this.normalizeDateForForm(details.dateOfBirth),
      },
      { emitEvent: false }
    );
    this.personalForm.markAsPristine();
  }

  private normalizeGender(value?: string): string {
    const normalized = (value ?? '').trim().toLowerCase();
    if (['male', 'female', 'other'].includes(normalized)) {
      return normalized;
    }
    return '';
  }

  private normalizeTitle(value?: string): string {
    const normalized = (value ?? '').trim().toLowerCase();
    const map: Record<string, string> = {
      mr: 'Mr',
      mrs: 'Mrs',
      ms: 'Ms',
      dr: 'Dr',
    };
    return map[normalized] ?? '';
  }

  private normalizeDateForForm(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private normalizeDateForApi(value: Date | string | null): string | undefined {
    if (!value) {
      return undefined;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }

  private formatAccountType(accountType: string): string {
    if (!accountType) {
      return '';
    }

    return accountType
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}
