import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  AddressVerificationRequestAction,
  AddressVerificationRequestActionDialogComponent,
} from '../../../../components/modals/address-verification-request-action-dialog/address-verification-request-action-dialog.component';
import { AddressVerificationRequestResultDialogComponent } from '../../../../components/modals/address-verification-request-result-dialog/address-verification-request-result-dialog.component';
import { ResponseCode } from '../../../../model/enums';
import { ActionOnViewRequestPayload, PendingViewRequest } from '../../../../model/profile';
import { ProfileService } from '../../../../services/profile.service';
import { ToastService } from '../../../../services/toast.service';

type RequestAction = 'approve' | 'reject';

@Component({
  selector: 'app-address-verification-requests',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './address-verification-requests.component.html',
  styleUrl: './address-verification-requests.component.scss',
})
export class AddressVerificationRequestsComponent implements OnInit {
  requests: PendingViewRequest[] = [];
  isLoading = false;
  errorMessage = '';
  emptyStateMessage = 'No pending address verification requests';
  processingRequestId = 0;
  processingAction: RequestAction | null = null;
  private readonly approveStatus = 1;
  private readonly rejectStatus = 2;

  constructor(
    private profileService: ProfileService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.emptyStateMessage = 'No pending address verification requests';

    this.profileService.getPendingViewRequests().subscribe({
      next: (response) => {
        if (Array.isArray(response.data)) {
          this.requests = response.data;
          this.errorMessage = '';
          if (!this.requests.length && response.description) {
            this.emptyStateMessage = response.description;
          }
        } else {
          this.requests = [];
          if (this.isNoPendingResult(response.description)) {
            this.errorMessage = '';
            this.emptyStateMessage = response.description || this.emptyStateMessage;
          } else {
            this.errorMessage = response.description || '';
          }
        }
      },
      error: () => {
        this.requests = [];
        this.errorMessage =
          'Unable to load address verification requests right now. Please try again.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  approveRequest(request: PendingViewRequest): void {
    this.openActionDialog(request);
  }

  declineRequest(request: PendingViewRequest): void {
    this.openActionDialog(request);
  }

  isActionProcessing(accessRequestId: number, action: RequestAction): boolean {
    return this.processingRequestId === accessRequestId && this.processingAction === action;
  }

  isAnyActionProcessing(accessRequestId: number): boolean {
    return this.processingRequestId === accessRequestId;
  }

  trackRequest(index: number, request: PendingViewRequest): number {
    return request.accessRequestId || index;
  }

  getRequestDate(request: PendingViewRequest): string {
    const value = request.requestDate || request.requestedOn || request.createdOn;
    if (!value) {
      return 'Not available';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toISOString();
  }

  private submitAction(request: PendingViewRequest, action: RequestAction): void {
    const accessRequestId = Number(request.accessRequestId);
    if (!Number.isFinite(accessRequestId) || accessRequestId <= 0) {
      return;
    }

    if (this.processingRequestId > 0) {
      return;
    }

    const payload: ActionOnViewRequestPayload = {
      approvalStatus: action === 'approve' ? this.approveStatus : this.rejectStatus,
      accessRequestId,
    };

    this.processingRequestId = accessRequestId;
    this.processingAction = action;

    this.profileService.actionOnViewRequest(payload).subscribe({
      next: (response) => {
        if (response.responseCode === ResponseCode.Success) {
          this.openResultDialog(action, accessRequestId);
          return;
        }

        this.toastService.show(undefined, response.description || 'Unable to process request.', 'error');
      },
      error: (error) => {
        this.toastService.show(
          undefined,
          error?.error?.description || 'Unable to process request.',
          'error',
        );
      },
      complete: () => {
        this.processingRequestId = 0;
        this.processingAction = null;
      },
    });
  }

  private openActionDialog(request: PendingViewRequest): void {
    if (this.processingRequestId > 0) {
      return;
    }

    const dialogRef = this.dialog.open(AddressVerificationRequestActionDialogComponent, {
      autoFocus: false,
      disableClose: false,
      panelClass: 'verification-action-dialog-container',
    });

    dialogRef.afterClosed().subscribe((action: AddressVerificationRequestAction | undefined) => {
      if (!action) {
        return;
      }

      this.submitAction(request, action);
    });
  }

  private openResultDialog(action: RequestAction, accessRequestId: number): void {
    const dialogRef = this.dialog.open(AddressVerificationRequestResultDialogComponent, {
      autoFocus: false,
      disableClose: true,
      panelClass: 'verification-result-dialog-container',
      data: {
        outcome: action === 'approve' ? 'approved' : 'rejected',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.requests = this.requests.filter((item) => item.accessRequestId !== accessRequestId);
      if (!this.requests.length) {
        this.errorMessage = '';
      }
      this.loadRequests();
    });
  }

  private isNoPendingResult(description?: string): boolean {
    const value = String(description || '').toLowerCase();
    return value.includes('no pending') || value.includes('no request');
  }
}
