import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressVerificationRequestResultDialogComponent } from '../../../../components/modals/address-verification-request-result-dialog/address-verification-request-result-dialog.component';
import { ResponseCode } from '../../../../model/enums';
import { ActionOnViewRequestPayload, PendingViewRequest } from '../../../../model/profile';
import { ProfileService } from '../../../../services/profile.service';
import { ToastService } from '../../../../services/toast.service';

type RequestAction = 'approve' | 'reject';

@Component({
  selector: 'app-address-verification-request-view',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './address-verification-request-view.component.html',
  styleUrl: './address-verification-request-view.component.scss',
})
export class AddressVerificationRequestViewComponent implements OnInit {
  request: PendingViewRequest | null = null;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  private readonly approveStatus = 1;
  private readonly rejectStatus = 2;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: ProfileService,
    private dialog: MatDialog,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const requestId = this.getRouteRequestId();
    if (!requestId) {
      this.errorMessage = 'Invalid address verification request.';
      return;
    }

    const requestFromState = this.getRequestFromState();
    if (requestFromState && Number(requestFromState.accessRequestId) === requestId) {
      this.request = requestFromState;
      return;
    }

    this.loadRequest(requestId);
  }

  approveRequest(): void {
    this.submitAction('approve');
  }

  rejectRequest(): void {
    this.submitAction('reject');
  }

  backToRequests(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  get requestDateText(): string {
    const value = this.request?.requestDate || this.request?.requestedOn || this.request?.createdOn;
    if (!value) {
      return 'Not available';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Not available' : parsed.toISOString();
  }

  get requestedByText(): string {
    return this.request?.fullName?.trim() || 'Not available';
  }

  get relationshipText(): string {
    return this.request?.relationship?.trim() || 'Not available';
  }

  private submitAction(action: RequestAction): void {
    if (!this.request || this.isSubmitting) {
      return;
    }

    const payload: ActionOnViewRequestPayload = {
      approvalStatus: action === 'approve' ? this.approveStatus : this.rejectStatus,
      accessRequestId: this.request.accessRequestId,
    };

    this.isSubmitting = true;

    this.profileService.actionOnViewRequest(payload).subscribe({
      next: (response) => {
        if (response.responseCode === ResponseCode.Success) {
          this.openResultDialog(action);
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
        this.isSubmitting = false;
      },
    });
  }

  private openResultDialog(action: RequestAction): void {
    const dialogRef = this.dialog.open(AddressVerificationRequestResultDialogComponent, {
      autoFocus: false,
      disableClose: true,
      panelClass: 'verification-result-dialog-container',
      data: {
        outcome: action === 'approve' ? 'approved' : 'rejected',
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.backToRequests();
    });
  }

  private loadRequest(requestId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getPendingViewRequests().subscribe({
      next: (response) => {
        if (response.responseCode !== ResponseCode.Success || !Array.isArray(response.data)) {
          this.errorMessage = response.description || 'Unable to load request details.';
          this.request = null;
          return;
        }

        const found = response.data.find(
          (item) => Number(item.accessRequestId) === requestId,
        );

        if (!found) {
          this.errorMessage = 'This request is no longer available.';
          this.request = null;
          return;
        }

        this.request = found;
      },
      error: () => {
        this.errorMessage = 'Unable to load request details right now. Please try again.';
        this.request = null;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private getRouteRequestId(): number {
    const rawId = this.route.snapshot.paramMap.get('requestId');
    const value = Number(rawId);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  private getRequestFromState(): PendingViewRequest | null {
    const navigationState = this.router.getCurrentNavigation()?.extras?.state as
      | { request?: PendingViewRequest }
      | undefined;

    if (navigationState?.request) {
      return navigationState.request;
    }

    const historyRequest = history.state?.request as PendingViewRequest | undefined;
    return historyRequest ?? null;
  }
}
