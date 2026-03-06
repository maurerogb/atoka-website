import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
export class GoogleProviderMapComponent implements OnInit {
  @Input() height = '420px';
  @Input() center!: google.maps.LatLngLiteral;
  @Input() zoom = 14;
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

  currentLocationContent: HTMLElement | null = null;
  originMarkerContent: HTMLElement | null = null;
  destinationMarkerContent: HTMLElement | null = null;
  accuracyCircleOptions: google.maps.CircleOptions = {
    strokeColor: '#4285F4',
    strokeOpacity: 0.2,
    strokeWeight: 1.5,
    fillColor: '#4285F4',
    fillOpacity: 0.12,
  };

  ngOnInit(): void {
    this.ensureMarkerContent();
  }

  onRouteSelected(routeIndex: number): void {
    this.routeIndexSelected.emit(routeIndex);
  }

  private ensureMarkerContent(): void {
    if (typeof document === 'undefined') {
      return;
    }

    if (!this.currentLocationContent) {
      this.currentLocationContent = this.buildCurrentLocationContent();
    }
    if (!this.originMarkerContent) {
      this.originMarkerContent = this.buildPinContent('A', '#34A853');
    }
    if (!this.destinationMarkerContent) {
      this.destinationMarkerContent = this.buildPinContent('B', '#EA4335');
    }
  }

  private buildCurrentLocationContent(): HTMLElement {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = '30px';
    container.style.height = '30px';
    container.style.pointerEvents = 'none';
    container.className = 'current-location-dot';

    const ring = document.createElement('div');
    ring.style.position = 'absolute';
    ring.style.top = '50%';
    ring.style.left = '50%';
    ring.style.width = '30px';
    ring.style.height = '30px';
    ring.style.borderRadius = '50%';
    ring.style.background = 'rgba(66,133,244,0.18)';
    ring.style.border = '1px solid rgba(66,133,244,0.35)';
    ring.style.transform = 'translate(-50%, -50%)';

    const dot = document.createElement('div');
    dot.style.position = 'absolute';
    dot.style.top = '50%';
    dot.style.left = '50%';
    dot.style.width = '14px';
    dot.style.height = '14px';
    dot.style.borderRadius = '50%';
    dot.style.background = '#4285F4';
    dot.style.border = '2px solid #FFFFFF';
    dot.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    dot.style.transform = 'translate(-50%, -50%)';

    container.append(ring, dot);
    return container;
  }

  private buildPinContent(label: string, color: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '28px';
    wrapper.style.height = '28px';
    wrapper.style.borderRadius = '50%';
    wrapper.style.background = color;
    wrapper.style.border = '2px solid #FFFFFF';
    wrapper.style.boxShadow = '0 2px 6px rgba(0,0,0,0.35)';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.color = '#FFFFFF';
    wrapper.style.fontWeight = '700';
    wrapper.style.fontSize = '12px';
    wrapper.style.fontFamily = 'Inter, Arial, sans-serif';
    wrapper.style.pointerEvents = 'none';
    wrapper.textContent = label;
    return wrapper;
  }
}
