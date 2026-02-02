import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseResponse } from '../model/base-response';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

export interface BranchRequest {
  branchName: string;
  atokaCode: string;
  confirmOwnership: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BranchService extends HttpService<BaseResponse<any>> {
  constructor(private http: HttpClient) {
    super(http);
  }
  
  addBusinessBranch(user: any): Observable<BaseResponse<any>> {
    const url = 'Business/addBusinessBranch';
    return this.filePost(url, user);
  }
}
