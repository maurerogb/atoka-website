import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InputComponent } from '../../input/input.component';
import { ButtonComponent } from '../../../shared/button/button.component';

@Component({
  selector: 'app-remove-employee',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent
  ],
  templateUrl: './remove-employee.component.html',
  styleUrl: './remove-employee.component.scss'
})
export class RemoveEmployeeComponent {

  constructor(
    public dialogRef: MatDialogRef<RemoveEmployeeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
   ){}

   close() {
    this.dialogRef.close();
   }
}
