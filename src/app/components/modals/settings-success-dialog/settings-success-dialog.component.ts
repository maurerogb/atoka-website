import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface SettingsSuccessDialogData {
  title?: string;
  message?: string;
}

@Component({
  selector: 'app-settings-success-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './settings-success-dialog.component.html',
  styleUrl: './settings-success-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsSuccessDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SettingsSuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SettingsSuccessDialogData | null,
  ) {}

  get titleText(): string {
    return this.data?.title ?? 'Success';
  }

  get messageText(): string {
    return this.data?.message ?? 'Your changes have been saved.';
  }

  close(): void {
    this.dialogRef.close({ status: 'closed' });
  }
}
