import { Component, Input } from '@angular/core';
import { Address } from '../../model/atoka-query';

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss'
})
export class AddressCardComponent {

  @Input() address?: Address;
  @Input() showResidenceCount?: boolean;
  @Input() isResidential?: boolean;
  @Input() buttonStyles?: string

}
