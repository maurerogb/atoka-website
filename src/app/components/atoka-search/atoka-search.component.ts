import { AtokaSearchService } from './../../services/atoka-search.service';
import { CommonModule } from '@angular/common';

import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Address } from '../../model/atoka-query';

@Component({
  selector: 'app-atoka-search',
  standalone: true,
  imports: [CommonModule, FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule],
  templateUrl: './atoka-search.component.html',
  styleUrl: './atoka-search.component.scss'
})
export class AtokaSearchComponent implements OnInit {
  atokaSearch = new FormControl('');
  option?: Address[];
  searchInput = new Subject<string>();
  filteredOptions?: Address[];
  packages$!: Address[];
  withRefresh = false;

  @Input() labelName: string | undefined;
  @Input() addressCode: string | undefined;
  @Output() returnCode: EventEmitter<string> = new EventEmitter<string>();
  @Output() addressInfo: EventEmitter<Address> = new EventEmitter<Address>();
  constructor(private atokaService: AtokaSearchService) { }

  ngOnInit() {
    this.atokaSearch.valueChanges
      .pipe(debounceTime(1000))
      .subscribe((value: any) => {
        this.search(value);
      })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.atokaSearch.patchValue(this.addressCode ?? '')
  }

  search(value: any) {
    if (value !== '') {
      this.atokaService.searchAtoka(value).subscribe({
        next: (data: any) => {
          this.filteredOptions = data.data;
        }
      });
    }
  }

  setAddressCode(e: MatAutocompleteSelectedEvent) {
    this.addressInfo.emit(this.filteredOptions?.find(a => a.atoka == e.option.value))

    this.addressCode = e.option.value
    this.returnCode.emit(this.addressCode)
  }
}