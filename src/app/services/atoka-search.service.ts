import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../model/atoka-query';
import { BaseResponse } from '../model/base-response';

@Injectable({
  providedIn: 'root'
})
export class AtokaSearchService extends HttpService<BaseResponse<any>>{

  constructor(private http: HttpClient) {
    super(http);
  }

  searchAtoka(search:any ): Observable<BaseResponse<Address>>{
    const url = `AtokaAddressDetail?atokaCode=${search}`;
    return this.get<BaseResponse<Address>>(url);
  }
}
