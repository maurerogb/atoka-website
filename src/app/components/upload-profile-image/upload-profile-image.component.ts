import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-profile-image',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './upload-profile-image.component.html',
  styleUrl: './upload-profile-image.component.scss'
})
export class UploadProfileImageComponent implements OnInit {
  hasBaseDropZoneOver: boolean = false;
  hasAnotherDropZoneOver: boolean = false;
  response: string | undefined;
  files?: FileList | undefined;
  file: File  | undefined;
    
  @Input() image: FormControl = new FormControl();

  constructor(){}

  ngOnInit(): void {    
  }

  onFileChange(event: any) {
    // this.files = event.target.files;
    console.log(event.target);
  }

  fileOverBase(e: any): void {
    console.log(e);
    this.hasBaseDropZoneOver = e;
  }

  uploadPhoto(event: any) {
    console.log(event.target.files[0]);

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.onload = (_event: any) => {
        this.image.patchValue(_event.target.result);
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  }
}
