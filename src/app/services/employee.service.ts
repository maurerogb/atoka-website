import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { BaseResponse } from '../model/base-response';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService extends HttpService<BaseResponse<any>> {

  constructor(private http: HttpClient) {
    super(http);
  }

  getAllEmployees() {
    const url = `PlaceOfWork/GetAll`
    return this.get<BaseResponse<any>>(url)
  }

  getAllNotApprovedColleagues() {
    const url = `PlaceOfWork/GetAllNotApprovedColleagues`
    return this.get<BaseResponse<any>>(url)
  }

  getAllApprovedColleagues() {
    const url = `PlaceOfWork/GetAllApprovedColleagues`
    return this.get<BaseResponse<any>>(url)
  }

  getAllByBusinesses() {
    const url = `PlaceOfWork/GetAllByBusiness`
    return this.get<BaseResponse<any>>(url)
  }

  getEmployeeDetails(id: string) {
    const url = `PlaceOfWork/GetByOccupantId/${id}`
    return this.get<BaseResponse<any>>(url)
  }
}
