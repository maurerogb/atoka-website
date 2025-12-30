import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListItem, NewStreetRequest, StreetDetails } from '../model/atoka-query';
import { HttpService } from './http.service';
import { BaseResponse } from '../model/base-response';

@Injectable({
  providedIn: 'root'
})
export class CountryService extends HttpService<BaseResponse<any>>{
  url: string = ''

  constructor(private http: HttpClient) {
    super(http);
  }

  searchStreet(search:any, cityId: number ): Observable<BaseResponse<StreetDetails>>{
    this.url = `AtokaAddressDetail/SearchAtoka?cityId=${cityId}&address=${search}`;
    return this.get<BaseResponse<StreetDetails>>(this.url);
  }

  getDistrict(id:number ): Observable<BaseResponse<ListItem>>{
    this.url =`Country/GetLocalGovornmentByStateId/${id}`;
    return this.get<BaseResponse<ListItem>>(this.url);
  }

  getCity(id?:number): Observable<BaseResponse<ListItem>>{
    this.url = `Country/GetCitiesByLGId/${id}`;
    return this.get<BaseResponse<ListItem>>(this.url);
  }

  getLga(id?:number): Observable<BaseResponse<ListItem>>{
    this.url = `Country/GetLocalGovornmentByStateId/${id}`;
    return this.get<BaseResponse<ListItem>>(this.url);
  }

  getState(id:number): Observable<BaseResponse<ListItem>>{
    this.url = `Country/GetStatesByCountryId/${id}`;
    return this.get<BaseResponse<ListItem>>(this.url);
  }

  getCountry(): Observable<BaseResponse<ListItem>>{
    this.url = `Country/GetCountries`;
    return this.get<BaseResponse<ListItem>>(this.url);
  }

  saveAddress(request: NewStreetRequest): Observable<BaseResponse<any>>{
    this.url = `ResidentDetail/SaveAddress`;
    return this.post<BaseResponse<any>>(this.url, request);
  }
}
