import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RegistrationStep, ResponseCode } from '../../../../../model/enums';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { RegistrationService } from '../../../../../services/registration.service';
import { Router } from '@angular/router';
import { PersonalData } from '../../../../../model/dto/personal-data-dto';
import { LoaderComponent } from "../../../../../components/loader/loader.component";
import { LoadingService } from '../../../../../services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-picture',
  standalone: true,
  templateUrl: './profile-picture.component.html',
  styleUrl: './profile-picture.component.scss',
  imports: [CommonModule, MatIconModule, FileUploadModule, MatIconModule, LoaderComponent]
})
export class ProfilePictureComponent {
  imageURL: string = '';
  uploadedImage: any;
  uploader: FileUploader | undefined
  baseUrl: string = '';
  personalDetails: PersonalData = {};
  message: string = '';
  constructor(
    private registrationService: RegistrationService, 
    private router: Router,
    public loadingService: LoadingService) { }

  ngOnInit(): void {
    this.personalDetails = this.registrationService.getProfile() || {};
  }
  
  uploadPhoto(event: any) {
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
    }
    reader.readAsDataURL(this.uploadedImage)
  }

  saveProfilePicture() {
    let formdata = new FormData();
    const profile = this.personalDetails || this.registrationService.getProfile() || {};

    if (!profile.userIdentifer) {
      this.message = 'Unable to determine your user identity.';
      return;
    }

    formdata.append('ProfilePhoto', this.uploadedImage)
    formdata.append('userId', profile.userIdentifer)

    this.registrationService.uploadProfilePhoto(formdata).subscribe({
      next: res => {
        const fullname = `${profile.firstName || ''} ${profile.surname || ''}`;
        if (res.responseCode == ResponseCode.Success) {
          this.registrationService.setStep(RegistrationStep.ProfilePictureCompleted);
          this.router.navigate(['register', 'welcome'], {
            state: { fullname: fullname }
          });
        }
      }
    })
  }

  skip() {
    const profile = this.personalDetails || this.registrationService.getProfile() || {};
    const fullname = `${profile.firstName || ''} ${profile.surname || ''}`;
    this.registrationService.setStep(RegistrationStep.ProfilePictureCompleted);
    this.router.navigate(['register', 'welcome'], {
      state: { fullname: fullname }
    });
  }
}
