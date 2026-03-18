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

  accuracyCircleOptions: google.maps.CircleOptions = {
    strokeColor: '#4285F4',
    strokeOpacity: 0.2,
    strokeWeight: 1.5,
    fillColor: '#4285F4',
    fillOpacity: 0.12,
  };

  onRouteSelected(routeIndex: number): void {
    this.routeIndexSelected.emit(routeIndex);
  }
}
