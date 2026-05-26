import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-profile-image',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './upload-profile-image.component.html',
  styleUrl: './upload-profile-image.component.scss'
})
export class UploadProfileImageComponent implements OnInit, OnDestroy {
  hasBaseDropZoneOver: boolean = false;
  hasAnotherDropZoneOver: boolean = false;
  response: string | undefined;
  files?: FileList | undefined;
  file: File  | undefined;
  imageLoadFailed = false;
  private imageValueSub?: Subscription;
    
  @Input() image: FormControl = new FormControl();
  @Output() selectedFile = new EventEmitter<File | null>();

  constructor(){}

  ngOnInit(): void {
    this.imageValueSub = this.image.valueChanges.subscribe(() => {
      this.imageLoadFailed = false;
    });
  }

  ngOnDestroy(): void {
    this.imageValueSub?.unsubscribe();
  }

  onFileChange(event: any) {
    this.files = event.target.files;
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  uploadPhoto(event: any) {
    const file = event?.target?.files?.[0] as File | undefined;
    if (!file) {
      this.selectedFile.emit(null);
      return;
    }

    this.file = file;
    this.selectedFile.emit(file);

    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.onload = (_event: any) => {
        this.imageLoadFailed = false;
        this.image.patchValue(_event.target.result);
      };

      reader.readAsDataURL(file);
    }
  }

  onImageError(): void {
    this.imageLoadFailed = true;
  }

  get hasImagePreview(): boolean {
    const value = this.image?.value;
    if (typeof value === 'string') {
      return value.trim().length > 0 && !this.imageLoadFailed;
    }
    return Boolean(value) && !this.imageLoadFailed;
  }
}
