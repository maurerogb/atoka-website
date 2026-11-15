import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss'
})
export class UploadFileComponent {
  newfile: File | undefined;
  newFiles: File[] = [];
  uploadProgressByFile: Record<string, number> = {};
  @Input() file: FormControl = new FormControl();
  @Input() fileType! : any;
  @Input() multiple = false;

  @Output() uploadedFile :  EventEmitter<File | undefined> = new EventEmitter<File | undefined>();
  @Output() uploadedFiles: EventEmitter<File[]> = new EventEmitter<File[]>();
  trackByFileKey = (_index: number, file: File): string => `${file.name}-${file.size}-${file.lastModified}`;

  uploadFile(event: Event): void {
    const fileInput = event.target as HTMLInputElement;

    if (fileInput.files && fileInput.files.length) {
      const reader = new FileReader();
      const files: File[] = Array.from(fileInput.files);
      this.newFiles = this.multiple ? files : [files[0]];
      this.newfile = this.newFiles[0];
      this.uploadProgressByFile = {};

      for (const file of this.newFiles) {
        this.uploadProgressByFile[this.trackByFileKey(0, file)] = 100;
      }

      this.uploadedFile.emit(this.newfile);
      this.uploadedFiles.emit(this.newFiles);

      reader.onload = (_event: any) => {
        this.file.patchValue(_event.target.result);
      };

      reader.readAsDataURL(this.newFiles[0]);
      fileInput.value = '';
    }
  }

  getFileProgress(file: File): number {
    return this.uploadProgressByFile[this.trackByFileKey(0, file)] ?? 0;
  }

  removeFile(fileToRemove: File): void {
    const fileKey = this.trackByFileKey(0, fileToRemove);

    this.newFiles = this.newFiles.filter((file) => this.trackByFileKey(0, file) !== fileKey);
    delete this.uploadProgressByFile[fileKey];

    this.newfile = this.newFiles[0];
    this.uploadedFile.emit(this.newfile);
    this.uploadedFiles.emit(this.newFiles);

    if (!this.newfile) {
      this.file.reset();
    }
  }

  formatFileSize(bytes: number): string {
    if (!bytes) {
      return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** unitIndex);
    const formattedValue = value >= 10 ? value.toFixed(0) : value.toFixed(1);

    return `${formattedValue} ${units[unitIndex]}`;
  }
}
