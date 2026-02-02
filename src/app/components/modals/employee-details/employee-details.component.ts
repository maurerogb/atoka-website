import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReadOnlyComponent } from '../../read-only/read-only.component';
import { InputComponent } from '../../input/input.component';
import { Employee } from '../../../model/employee-record';

@Component({
    selector: 'app-employee-details',
    standalone: true,
    templateUrl: './employee-details.component.html',
    styleUrl: './employee-details.component.scss',
    imports: [
    InputComponent, ReactiveFormsModule, CommonModule,
    ReadOnlyComponent,
]
})
export class EmployeeDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<EmployeeDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee,
   ){
    console.log(data);

   }

   close() {
    this.dialogRef.close();
   }
}
