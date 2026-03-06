import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Address } from '../model/atoka-query';
import { BaseResponse } from '../model/base-response';

@Injectable({
  providedIn: 'root'
})
export class AtokaSearchService extends HttpService<BaseResponse<any>>{

  constructor(private http: HttpClient) {
    super(http);
  }

  searchAtoka(search: any): Observable<BaseResponse<Address[]>>{
    const url = `AtokaAddressDetail?atokaCode=${search}`;
    return this.get<BaseResponse<Address[]>>(url);
  //   return of({
  //   data: [
  //     {
  //         atokaAddressId: 1,
  //         parkingType: "free",
  //         chargable: true,
  //         roadTypeName: "Awe ",
  //         stateName: "Lagos",
  //         lga: "Eti Osa",
  //         districtName: "",
  //         cityName: "Ikoyi\r\n",
  //         countries: "Nigeria",
  //         countryCode: "NGN",
  //         countryCurrency: "NGN",
  //         houseName: "abc",
  //         oldNumber: "13",
  //         atokaNumber: "13",
  //         streetName: "Alimosho Road",
  //         drainageType: "Closed",
  //         streetLight: "No",
  //         electricDistribution: "Surface",
  //         mast: "None",
  //         atoka: "LA AB1883KY",
  //         longitude: "6.5235255",
  //         latitude: "3.25689",
  //         residentDetailId: 32
  //     },
  //     {
  //         atokaAddressId: 2,
  //         parkingType: "free",
  //         chargable: true,
  //         roadTypeName: "Awe ",
  //         stateName: "Lagos",
  //         lga: "Eti Osa",
  //         districtName: "",
  //         cityName: "Ikoyi\r\n",
  //         countries: "Nigeria",
  //         countryCode: "NGN",
  //         countryCurrency: "NGN",
  //         houseName: "Dolphin Estate",
  //         oldNumber: "2",
  //         atokaNumber: "3",
  //         streetName: "Alimosho Road",
  //         drainageType: "Closed",
  //         streetLight: "No",
  //         electricDistribution: "Surface",
  //         mast: "None",
  //         atoka: "LA AB1646KY",
  //         longitude: "6.455717",
  //         latitude: "3.409843",
  //         residentDetailId: 53
  //     }
  //   ],
  //   responseCode: 0,
  //   description: "Operation Successful",
  //   userId: "00000000-0000-0000-0000-000000000000",
  //   timeStamp: "2026-01-16T15:24:24.3601016-08:00",
  //   url: null,
  //   objects: null
  //   });
  }
}
