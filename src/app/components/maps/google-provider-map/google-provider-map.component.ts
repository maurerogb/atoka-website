import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

export interface GoogleMapRoutePath {
  index: number;
  path: google.maps.LatLngLiteral[];
}

export interface GoogleMapSummary {
  distanceText: string;
  durationText: string;
  trafficDeltaText?: string;
}

@Component({
  selector: 'app-google-provider-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './google-provider-map.component.html',
  styleUrl: './google-provider-map.component.scss',
})
export class GoogleProviderMapComponent {
  @Input() height = '420px';
  @Input() center!: google.maps.LatLngLiteral;
  @Input() zoom = 19;
  @Input() options: google.maps.MapOptions = {};
  @Input() hasMapId = false;
  @Input() originPosition: google.maps.LatLngLiteral | null = null;
  @Input() destinationPosition: google.maps.LatLngLiteral | null = null;
  @Input() originIsCurrentLocation = false;
  @Input() destinationIsCurrentLocation = false;
  @Input() currentLocationAccuracyMeters: number | null = null;
  @Input() destinationAccuracyMeters: number | null = null;
  @Input() renderedDirectionsResult: google.maps.DirectionsResult | null = null;
  @Input() directionsOptions: google.maps.DirectionsRendererOptions = {};
  @Input() alternateRoutePaths: GoogleMapRoutePath[] = [];
  @Input() showTraffic = false;
  @Input() providerLabel = 'Google Map';
  @Input() atoka = '';
  @Input() address = '';
  @Input() directionsSummary: GoogleMapSummary | null = null;

  @Output() routeIndexSelected = new EventEmitter<number>();
  @Output() locationPinSelected = new EventEmitter<'origin' | 'destination'>();

  accuracyCircleOptions: google.maps.CircleOptions = {
    strokeColor: '#4285F4',
    strokeOpacity: 0.2,
    strokeWeight: 1.5,
    fillColor: '#4285F4',
    fillOpacity: 0.12,
  };
  readonly originMarkerOptions: google.maps.MarkerOptions = {
    clickable: true,
    icon: {
      url: this.buildBluePinIconDataUrl(),
    },
  };
  readonly destinationMarkerOptions: google.maps.MarkerOptions = {
    clickable: true,
  };

  onRouteSelected(routeIndex: number): void {
    this.routeIndexSelected.emit(routeIndex);
  }

  onLocationSelected(pin: 'origin' | 'destination'): void {
    this.locationPinSelected.emit(pin);
  }

  private buildBluePinIconDataUrl(): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="27" height="43" viewBox="0 0 27 43">
        <path
          d="M13.5 0.6C6.43 0.6 0.7 6.33 0.7 13.4c0 8.8 9.79 17.59 11.6 27.94a1.2 1.2 0 0 0 2.37 0C16.52 30.99 26.3 22.2 26.3 13.4 26.3 6.33 20.57 0.6 13.5 0.6Z"
          fill="#1a73e8"
          stroke="#0b57d0"
          stroke-width="1"
        />
        <circle cx="13.5" cy="13.4" r="4.1" fill="#0a4695"/>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
}
