import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-incident-view-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './incident-view-dialog.component.html',
  styleUrl: './incident-view-dialog.component.scss',
})
export class IncidentViewDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<IncidentViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}