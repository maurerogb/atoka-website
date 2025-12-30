import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListItem } from '../model/atoka-query';
import { BaseResponse } from '../model/base-response';
import { Observable } from 'rxjs';
import { PersonalData, PersonRequest } from '../model/dto/personal-data-dto';
import { HttpService } from './http.service';
import { LocalStorageService } from './local-storage.service';
import { RegistrationStep } from '../model/enums';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService extends HttpService<PersonRequest> {

  private readonly profileKey = 'reg_profile';
  private readonly stepKey = 'reg_step';

  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
  ) {
    super(http);
  }

  getAccountTypes(): Observable<BaseResponse<ListItem[]>> {
    const url = `DocumentType/GetAccountTypes`
    return this.http.get<BaseResponse<ListItem[]>>(url);
  }

  generateOTP(identifer: any): Observable<BaseResponse<any>> {
    const url = `ValidateOTP/Generate-OTP-Identifer/${identifer}`;
    return this.http.get<BaseResponse<any>>(url);
  }

  createProfile(person: PersonRequest): Observable<BaseResponse<PersonalData>> {
    const url = 'OccupantDetails/Create-User-Profile';
    return this.http.post<BaseResponse<PersonalData>>(url, person);
  }

  uploadProfilePhoto(file: any): Observable<any> {
    const url = `OccupantDetails/Upload-Profile-Photo`
    return this.filePost(url, file);
  }
  
  movedInOn(data: any): Observable<BaseResponse<any>> {
    let url = 'ResidenceStartFrom/ResidenceStarted'
    return this.post<BaseResponse<PersonRequest>>(url, data);
  }

  setProfile(profile: PersonalData): void {
    this.storage.setItem<PersonalData>(this.profileKey, profile);
  }

  getProfile(): PersonalData | null {
    return this.storage.getItem<PersonalData>(this.profileKey);
  }

  clearProfile(): void {
    this.storage.removeItem(this.profileKey);
  }

  setStep(step: RegistrationStep): void {
    this.storage.setItem<number>(this.stepKey, step);
  }

  getStep(): RegistrationStep {
    const stored = this.storage.getItem<number>(this.stepKey);
    if (typeof stored === 'number') {
      return stored as RegistrationStep;
    }
    return RegistrationStep.None;
  }

  clearStep(): void {
    this.storage.removeItem(this.stepKey);
  }
}
