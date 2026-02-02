import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { BaseResponse } from '../model/base-response';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends HttpService<BaseResponse<any>> {

  constructor(private http: HttpClient) {
    super(http);
  }


  getUserDetails(userId: string) {
    const url = `OccupantDetails/Get`
    return this.get<BaseResponse<any>>(url, userId)
  }
  
}
