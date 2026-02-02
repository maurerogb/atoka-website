import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputComponent } from '../../input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-reject-employee',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent
  ],
  templateUrl: './reject-employee.component.html',
  styleUrl: './reject-employee.component.scss'
})
export class RejectEmployeeComponent {

  constructor(
    public dialogRef: MatDialogRef<RejectEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
   ){}

   close() {
    this.dialogRef.close();
   }
}
