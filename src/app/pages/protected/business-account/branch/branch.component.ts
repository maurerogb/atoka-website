import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

interface HeadOfficeSummary {
  name: string;
  address: string;
  atoka: string;
  employeeCount: number;
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
  ],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss',
})
export class BranchComponent {
  searchTerm = '';
  businessId?: number;
  branchAddresses: Address[] = [];
  headOffice: HeadOfficeSummary = null as any;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private businessService: BusinessService,
    private authService: AuthenticationService) {}

  ngOnInit(): void {
    // this.createFilterForm();
    this.businessId = this.authService.getLoginInfo()?.businessId;
    this.getBranches();
  }

  getBranches(): void {
    if (!this.businessId) {
      return;
    }

    this.businessService.getBusinessBranches(this.businessId).subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success && Array.isArray(res.data)) {
          const hqBranch = res.data.find((branch: any) => branch.isHQ == true) ?? null;
          this.headOffice = this.toHeadOfficeSummary(hqBranch);
          this.branchAddresses = res.data;
        } else {
          this.headOffice = this.toHeadOfficeSummary(null);
        }
      },
      error: () => {
        this.headOffice = this.toHeadOfficeSummary(null);
      },
    });
  }

  private toHeadOfficeSummary(branch: any | null): HeadOfficeSummary {
    if (!branch) {
      return {
        name: 'You are yet to indicate your Head Office',
        address: 'Not available',
        atoka: '',
        employeeCount: 0,
      };
    }

    const addressParts = [
      branch.houseNumber,
      branch.streetName,
      branch.cityName,
      branch.stateName,
      branch.countries,
    ]
      .filter((value: any) => value != null && String(value).trim() !== '')
      .map((value: any) => String(value).trim());

    return {
      name: branch.branchName ?? 'Head Office',
      atoka: branch.atoka ?? '',
      address: addressParts.length > 0 ? addressParts.join(', ') : (branch.atoka ?? 'Not available'),
      employeeCount: branch.staffCount ?? 0,
    };
  }
  
  get filteredBranches(): Address[] {
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
      ].some((value) => value?.toLowerCase().includes(term)),
    );
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
