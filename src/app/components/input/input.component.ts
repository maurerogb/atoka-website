import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss'
})
export class InputComponent {
  @Input() control: FormControl = new FormControl();
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() customClass!: string;
  @Input() customInputClass!: string;
  @Input() errorMessage: string = '';
 // @Input() control?: string;


  public get value() : string {
    return this.control.value
  }


  public set value(v : string) {
    this.control.setValue(v);
  }


}
