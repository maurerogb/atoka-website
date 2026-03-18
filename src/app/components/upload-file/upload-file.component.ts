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
  newFiles: File[] = [];
  @Input() file: FormControl = new FormControl();
  @Input() fileType! : any;
  @Input() multiple = false;

  @Output() uploadedFile :  EventEmitter<File> = new EventEmitter<File>();
  @Output() uploadedFiles: EventEmitter<File[]> = new EventEmitter<File[]>();

  fileName : any;

  uploadFile(event: any) {
    if (event.target.files && event.target.files.length) {
      const reader = new FileReader();
      const files: File[] = Array.from(event.target.files);
      this.newFiles = files;
      this.newfile = files[0];

      this.uploadedFile.emit(this.newfile);
      this.uploadedFiles.emit(files);

      reader.onload = (_event: any) => {
        this.file.patchValue(_event.target.result);
      };

      reader.readAsDataURL(files[0]);
    }

    // if (event.target.files && event.target.files[0]) {
    //   const reader = new FileReader();
    //   this.newfile = event.target.files[0];

    //   this.uploadedFile.emit(this.newfile)

    //   reader.onload = (_event: any) => {
    //     this.file.patchValue(_event.target.result);
    //   };

    //   reader.readAsDataURL(event.target.files[0]);
    // }
  }
}
