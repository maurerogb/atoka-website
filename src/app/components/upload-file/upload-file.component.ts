import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss'
})
export class UploadFileComponent {
  newfile: File | undefined;
  @Input() file: FormControl = new FormControl();
  @Input() fileType! : any;

  @Output() uploadedFile :  EventEmitter<File> = new EventEmitter<File>();

  fileName : any;

  uploadFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      this.newfile = event.target.files[0];

      this.uploadedFile.emit(this.newfile)

      reader.onload = (_event: any) => {
        this.file.patchValue(_event.target.result);
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
