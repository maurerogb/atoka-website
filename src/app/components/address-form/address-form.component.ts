import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CountryService } from '../../services/country.service';
import { ListItem, NewStreetRequest, StreetDetails } from './../../model/atoka-query';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-address-form',
    standalone: true,
    templateUrl: './address-form.component.html',
    styleUrl: './address-form.component.scss',
    imports: [CommonModule, MatIconModule, MatFormFieldModule, MatAutocompleteModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule,
       MatCheckboxModule, MatNativeDateModule, MatDatepickerModule]
})
export class AddressFormComponent implements OnInit {
  @Output() showFormState: EventEmitter<string> = new EventEmitter<string>();
  @Output() formMessage: EventEmitter<string> = new EventEmitter<string>();
  @Input() hideForm: boolean = false;
  @Input() includeVerify: boolean = false;
  @Input() buttonType: string = 'squared'

  streetOptions?: StreetDetails[];
  stateOptions!: ListItem[];
  cityOptions!: ListItem[];
  lgaOptions!: ListItem[];
  districtOptions!: ListItem[];
  stateSearchOptions!: ListItem[];
  countryOptions!: ListItem[];
  cityId?: number;
  newAddressCode?: string = 'LA BD2738PK';
  input!: ElementRef<HTMLInputElement>;
  countryForm!: FormGroup;
  countryId?: number;
  stateId?: number;
  lgaId?: number;
  street?: number;
  districtId?: number;
  streetId: number | undefined;

  constructor(private countryService: CountryService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.createForm();
    this.getCountry();
    this.callStreetSearch();
  }

  save() {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched();
      this.formMessage.emit('Please complete the address form before continuing.');
      return;
    }

    if (!this.countryId) {
      this.formMessage.emit('Please select a valid country from the list.');
      return;
    }

    if (!this.stateId) {
      this.formMessage.emit('Please select a valid state from the list.');
      return;
    }

    if (!this.lgaId) {
      this.formMessage.emit('Please select a valid LGA from the list.');
      return;
    }
    
    if (!this.cityId) {
      this.formMessage.emit('Please select a valid city from the list.');
      return;
    }
    
    if (!this.streetId) {
      this.formMessage.emit('Please select a valid street from the list.');
      return;
    }
    
    const form = this.countryForm.value;
    let req: NewStreetRequest = {
      cityId: this.cityId,
      countryId: this.countryId,
      streetId: this.streetId,
      streetName: form.streetName,
      stateId: this.stateId,
      houseName: form.houseName,
      lgaId: this.lgaId,
      houseNumber: form.houseNumber
    }

    this.countryService.saveAddress(req).subscribe({
      next: (res) => {
         this.showFormState.emit(res.data);
      },
      error: (err) => {
        console.log(err);
        const message =
          err?.error?.description ||
          'An error occurred while saving the address. Please try again.';
        this.formMessage.emit(message);
      }
    })
  }

  createForm() {
    this.countryForm = this.fb.group({
      countryName: ['', Validators.required],
      stateName: ['', Validators.required],
      lgaName: ['', Validators.required],
      cityName: ['', Validators.required],
      districtName: [''],
      streetName: ['', Validators.required],
      houseNumber: ['', Validators.required],
      houseName: ['']
    })
  }

  callStreetSearch() {
    this.countryForm.controls['streetName'].valueChanges
      .pipe(debounceTime(1000))
      .subscribe((value: any) => {
        this.searchStreet(value);
      });
  }

  searchStreet(value: any) {
    this.countryService.searchStreet(value, this.cityId ?? 0).subscribe({
      next: (data: any) => {
        this.streetOptions = data.data;
      }
    });
  }

  setCityId(e: MatAutocompleteSelectedEvent){
    this.cityId = this.cityOptions?.find(c => c.name == e.option.value || '')?.id
  }

  setStreetId(e: MatAutocompleteSelectedEvent){
    this.streetId = this.streetOptions?.find(c => c.streetName == e.option.value || '')?.atokaAddressId  
  }

  getCountry() {
    this.countryService.getCountry().subscribe({
      next: (resp: any) => {
        this.countryOptions = resp.data;
      }
    });
  }

  getState(e: MatAutocompleteSelectedEvent) {
    const countryId = this.countryOptions?.find(c => c.name == e.option.value || '')?.id
    this.countryId = countryId;
    this.countryService.getState(countryId ?? 0).subscribe({
      next: (resp: any) => {
        this.stateOptions = this.stateSearchOptions = resp.data;
        this.stateId = undefined;
        this.countryForm.get('stateName')?.reset('');
        this.lgaOptions = [];
        this.lgaId = undefined;
        this.countryForm.get('lgaName')?.reset('');
        this.cityOptions = [];
        this.cityId = undefined;
        this.countryForm.get('cityName')?.reset('');
        this.districtOptions = [];
        this.districtId = undefined;
        this.countryForm.get('districtName')?.reset('');
        this.streetOptions = [];
        this.streetId = undefined;
      }
    });
  }

  getLga(e: MatAutocompleteSelectedEvent) {
    const id = this.stateOptions?.find(c => c.name == e.option.value || '')?.id
    this.stateId = id;
    this.countryService.getLga(id).subscribe({
      next: (data: any) => {
        this.lgaOptions = data.data;
        this.lgaId = undefined;
        this.countryForm.get('lgaName')?.reset('');
        this.cityOptions = [];
        this.cityId = undefined;
        this.countryForm.get('cityName')?.reset('');
        this.districtOptions = [];
        this.districtId = undefined;
        this.countryForm.get('districtName')?.reset('');
        this.streetOptions = [];
        this.streetId = undefined;
      }
    });
  }

  getCity(e: MatAutocompleteSelectedEvent) {
    const id = this.lgaOptions?.find(c => c.name == e.option.value || '')?.id
    this.lgaId = id;
    this.countryService.getCity(id).subscribe({
      next: (data: any) => {
        this.cityOptions = data.data;
        this.cityId = undefined;
        this.countryForm.get('cityName')?.reset('');
        this.districtOptions = [];
        this.districtId = undefined;
        this.countryForm.get('districtName')?.reset('');
        this.streetOptions = [];
        this.streetId = undefined;        
        if (this.countryForm.get('streetName')?.value) {
          this.countryForm.get('streetName')?.reset('');
        }
      }
    });
  }

  getDistrict(value: any) {
    this.countryService.getDistrict(value).subscribe({
      next: (data: any) => {
        this.districtOptions = data.data;
        this.districtId = undefined;
        this.countryForm.get('districtName')?.reset('');
      }
    });
  }
}
