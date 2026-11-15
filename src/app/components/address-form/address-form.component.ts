import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { Address, ListItem, NewStreetRequest, AddressInfo, StreetDetails } from './../../model/atoka-query';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-address-form',
    standalone: true,
    templateUrl: './address-form.component.html',
    styleUrl: './address-form.component.scss',
    imports: [CommonModule, MatIconModule, MatFormFieldModule, MatAutocompleteModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule,
       MatCheckboxModule, MatNativeDateModule, MatDatepickerModule]
})
export class AddressFormComponent implements OnInit, OnChanges {
  @Output() showFormState: EventEmitter<AddressInfo> = new EventEmitter<AddressInfo>();
  @Output() formMessage: EventEmitter<string> = new EventEmitter<string>();
  @Input() hideForm: boolean = false;
  @Input() includeVerify: boolean = false;
  @Input() buttonType: string = 'squared';
  @Input() prefilledAddress?: Address;
  @Input() readOnly: boolean = false;

  streetOptions: StreetDetails[] = [];
  stateOptions: ListItem[] = [];
  cityOptions: ListItem[] = [];
  citySearchOptions: ListItem[] = [];
  lgaOptions: ListItem[] = [];
  lgaSearchOptions: ListItem[] = [];
  districtOptions: ListItem[] = [];
  stateSearchOptions: ListItem[] = [];
  countryOptions: ListItem[] = [];
  countrySearchOptions: ListItem[] = [];
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
  private ignoreNextStreetSearch = false;

  constructor(private countryService: CountryService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.createForm();
    this.setupAutocompleteFiltering();
    this.getCountry();
    this.callStreetSearch();
    this.syncFormWithAddressSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.countryForm) {
      return;
    }

    if (changes['prefilledAddress'] || changes['readOnly']) {
      this.syncFormWithAddressSelection();
    }
  }

  save() {
    if (this.readOnly && this.prefilledAddress?.atoka && this.prefilledAddress?.atokaAddressId) {
      this.showFormState.emit({
        atokaCode: this.prefilledAddress.atoka,
        atokaAddressId: this.prefilledAddress.atokaAddressId,
        residentDetailId: this.prefilledAddress.residentDetailId
      });
      return;
    }

    if (this.readOnly) {
      this.formMessage.emit('Switch to manual entry to edit this address.');
      return;
    }

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

  resetForm(): void {
    if (!this.countryForm) {
      return;
    }

    this.clearLocationSelections();
    this.countryForm.enable({ emitEvent: false });
    this.countryForm.reset(
      {
        countryName: '',
        stateName: '',
        lgaName: '',
        cityName: '',
        districtName: '',
        streetName: '',
        houseNumber: '',
        houseName: '',
      },
      { emitEvent: false }
    );
    this.countrySearchOptions = [...this.countryOptions];
    this.stateSearchOptions = [];
    this.lgaSearchOptions = [];
    this.citySearchOptions = [];
    this.countryForm.markAsPristine();
    this.countryForm.markAsUntouched();
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

  setupAutocompleteFiltering() {
    this.countryForm.controls['countryName'].valueChanges
      .pipe(startWith(''))
      .subscribe((value: string) => {
        this.countrySearchOptions = this.filterList(this.countryOptions, value);
      });

    this.countryForm.controls['stateName'].valueChanges
      .pipe(startWith(''))
      .subscribe((value: string) => {
        this.stateSearchOptions = this.filterList(this.stateOptions, value);
      });

    this.countryForm.controls['lgaName'].valueChanges
      .pipe(startWith(''))
      .subscribe((value: string) => {
        this.lgaSearchOptions = this.filterList(this.lgaOptions, value);
      });

    this.countryForm.controls['cityName'].valueChanges
      .pipe(startWith(''))
      .subscribe((value: string) => {
        this.citySearchOptions = this.filterList(this.cityOptions, value);
      });
  }

  callStreetSearch() {
    this.countryForm.controls['streetName'].valueChanges
      .pipe(debounceTime(500))
      .subscribe((value: any) => {
        if (this.readOnly) {
          return;
        }
        if (this.ignoreNextStreetSearch) {
          this.ignoreNextStreetSearch = false;
          return;
        }
        const query = (value ?? '').toString().trim();
        if (!query || !this.cityId) {
          this.streetOptions = [];
          if (!query) {
            this.streetId = undefined;
          }
          return;
        }

        this.streetId = undefined;
        this.searchStreet(query);
      });
  }

  searchStreet(value: any) {
    if (!value || !this.cityId) {
      this.streetOptions = [];
      return;
    }

    this.countryService.searchStreet(value, this.cityId ?? 0).subscribe({
      next: (data: any) => {
        this.streetOptions = data.data ?? [];
      }
    });
  }

  setCityId(e: MatAutocompleteSelectedEvent){
    this.cityId = this.cityOptions?.find(c => c.name == e.option.value || '')?.id
    this.streetId = undefined;
  }

  setStreetId(e: MatAutocompleteSelectedEvent){
    const selectedStreet = (e.option.value ?? '').toString();
    this.streetId = this.streetOptions?.find(c => c.streetName == selectedStreet || '')?.atokaAddressId;
    this.ignoreNextStreetSearch = true;
    this.countryForm.get('streetName')?.patchValue(selectedStreet, { emitEvent: false });
  }

  getCountry() {
    this.countryService.getCountry().subscribe({
      next: (resp: any) => {
        this.countryOptions = resp.data;
        this.countrySearchOptions = [...this.countryOptions];
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
        this.lgaSearchOptions = [];
        this.lgaId = undefined;
        this.countryForm.get('lgaName')?.reset('');
        this.cityOptions = [];
        this.citySearchOptions = [];
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
        this.lgaSearchOptions = [...this.lgaOptions];
        this.lgaId = undefined;
        this.countryForm.get('lgaName')?.reset('');
        this.cityOptions = [];
        this.citySearchOptions = [];
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
        this.citySearchOptions = [...this.cityOptions];
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

  private syncFormWithAddressSelection(): void {
    if (!this.countryForm) {
      return;
    }

    if (this.prefilledAddress) {
      this.clearLocationSelections();
      this.streetId = this.prefilledAddress.atokaAddressId;
      this.countryForm.patchValue(
        {
          countryName: this.prefilledAddress.countries ?? '',
          stateName: this.prefilledAddress.stateName ?? '',
          lgaName: this.prefilledAddress.lga ?? '',
          cityName: this.prefilledAddress.cityName?.trim() ?? '',
          districtName: this.prefilledAddress.districtName ?? '',
          streetName: this.prefilledAddress.streetName ?? '',
          houseNumber: this.prefilledAddress.oldNumber ?? this.prefilledAddress.atokaNumber ?? '',
          houseName: this.prefilledAddress.houseName ?? '',
        },
        { emitEvent: false }
      );
    }

    if (this.readOnly) {
      this.countryForm.disable({ emitEvent: false });
    } else {
      this.countryForm.enable({ emitEvent: false });
    }
  }

  private clearLocationSelections(): void {
    this.countryId = undefined;
    this.stateId = undefined;
    this.lgaId = undefined;
    this.cityId = undefined;
    this.districtId = undefined;
    this.streetId = undefined;
    this.stateOptions = [];
    this.cityOptions = [];
    this.lgaOptions = [];
    this.countrySearchOptions = [...this.countryOptions];
    this.lgaSearchOptions = [];
    this.citySearchOptions = [];
    this.districtOptions = [];
    this.streetOptions = [];
    this.stateSearchOptions = [];
  }

  private filterList(options: ListItem[] | undefined, value: string): ListItem[] {
    if (!options || !options.length) {
      return [];
    }

    const query = (value ?? '').toString().toLowerCase().trim();
    if (!query) {
      return [...options];
    }

    return options.filter((item) =>
      (item.name ?? '').toLowerCase().includes(query)
    );
  }
}
