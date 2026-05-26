import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MapDirectionsService } from '@angular/google-maps';
import { Address } from '../../../../model/atoka-query';
import { AtokaSearchComponent } from '../../../../components/atoka-search/atoka-search.component';
import { environment } from '../../../../../environments/environment';
import {
  GoogleProviderMapComponent,
  GoogleMapSummary,
  GoogleMapRoutePath,
} from '../../../../components/maps/google-provider-map/google-provider-map.component';
import { TomtomProviderMapComponent } from '../../../../components/maps/tomtom-provider-map/tomtom-provider-map.component';
import { HereProviderMapComponent } from '../../../../components/maps/here-provider-map/here-provider-map.component';

type MapProvider = 'google' | 'tomtom' | 'here';
type ActionPanel = 'direction' | null;
type TravelModeId = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

interface MapProviderOption {
  id: MapProvider;
  label: string;
  logo: string;
}

interface TravelModeOption {
  id: TravelModeId;
  label: string;
  icon: string;
  mode: TravelModeId;
}

interface RouteOption {
  index: number;
  label: string;
  summary: DirectionsSummary | null;
}

interface DirectionsSummary {
  distanceText: string;
  durationText: string;
  durationTrafficText?: string;
  trafficDeltaText?: string;
  startAddress?: string;
  endAddress?: string;
}

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AtokaSearchComponent,
    GoogleProviderMapComponent,
    TomtomProviderMapComponent,
    HereProviderMapComponent,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss',
})
export class LocationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapViewport') mapViewport?: ElementRef<HTMLElement>;
  mapHeight = '420px';
  private routerContainer: HTMLElement | null = null;
  private mainContent: HTMLElement | null = null;
  isMapFullscreen = false;
  addressCode = '';
  originCode = '';
  originTyped = '';
  destinationTyped = '';
  isGeocodingOrigin = false;
  isGeocodingDestination = false;
  isLocating = false;
  selectedLocation: Address | null = null;
  selectedOrigin: Address | null = null;
  selectedDestination: Address | null = null;
  recentSearches: Address[] = [];
  activeProvider: MapProvider = 'google';
  actionPanel: ActionPanel = null;
  isEditingDirections = false;
  directionsResult: google.maps.DirectionsResult | null = null;
  renderedDirectionsResult: google.maps.DirectionsResult | null = null;
  directionsSummary: DirectionsSummary | null = null;
  directionsResultsByMode: Partial<Record<TravelModeId, google.maps.DirectionsResult>> = {};
  modeSummaries: Partial<Record<TravelModeId, DirectionsSummary>> = {};
  routeOptionsByMode: Partial<Record<TravelModeId, RouteOption[]>> = {};
  routeOptions: RouteOption[] = [];
  selectedRouteIndex = 0;
  selectedRouteIndexByMode: Partial<Record<TravelModeId, number>> = {};
  selectedRoutePath: google.maps.LatLngLiteral[] = [];
  alternateRoutePaths: GoogleMapRoutePath[] = [];
  selectedTravelMode: TravelModeId = 'DRIVING';
  private directionsRequestId = 0;
  private readonly currentLocationLabel = 'Current location';
  private readonly mapIdValue = (environment.googleMapId || '').trim();
  readonly hasMapId = Boolean(this.mapIdValue);
  originPosition: google.maps.LatLngLiteral | null = null;
  destinationPosition: google.maps.LatLngLiteral | null = null;
  originIsCurrentLocation = false;
  destinationIsCurrentLocation = false;
  currentLocationAccuracyMeters: number | null = null;
  destinationAccuracyMeters: number | null = null;
  directionsOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true,
    preserveViewport: false,
  };
  center = { lat: 6.5937961, lng: 3.3662079 };
  zoom = 19;
  mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: 'hybrid' as const,
    clickableIcons: false,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    ],
  };

  mapProviders: MapProviderOption[] = [
    { id: 'google', label: 'Google Map', logo: 'assets/images/google_maps_logo.png' },
    { id: 'tomtom', label: 'TomTom Map', logo: 'assets/images/tom_tom_logo.png' },
    { id: 'here', label: 'HERE WeGo', logo: 'assets/images/here_logo.png' },
  ];

  travelModes: TravelModeOption[] = [
    { id: 'DRIVING', label: 'Drive', icon: 'directions_car', mode: 'DRIVING' },
    { id: 'WALKING', label: 'Walk', icon: 'directions_walk', mode: 'WALKING' },
    { id: 'BICYCLING', label: 'Bike', icon: 'directions_bike', mode: 'BICYCLING' },
    { id: 'TRANSIT', label: 'Transit', icon: 'directions_transit', mode: 'TRANSIT' },
  ];

  constructor(
    private directionsService: MapDirectionsService,
    private el: ElementRef,
    private renderer: Renderer2) {}

  ngOnInit(): void {}

  get mapFocusLocation(): Address | null {
    return this.selectedLocation ?? this.selectedOrigin;
  }

  get mapSummaryForView(): GoogleMapSummary | null {
    return this.directionsSummary;
  }

  onAddressSelected(location?: Address): void {
    if (!location) {
      return;
    }
    this.setDestination(this.normalizeCoordinatesFromSearchResult(location));
  }

  toggleAction(action: ActionPanel): void {
    if (!this.selectedLocation && action === 'direction') {
      return;
    }
    const isOpening = this.actionPanel !== action;
    this.actionPanel = isOpening ? action : null;
    if (isOpening && action === 'direction') {
      this.isEditingDirections = true;
      // this.tryAutoSetOrigin();
    }
    
    if (!isOpening) {
      this.isEditingDirections = false;
    }
  }

  setProvider(provider: MapProvider): void {
    this.activeProvider = provider;
    this.updateMapPosition();
  }

  getProviderLabel(provider: MapProvider): string {
    return this.mapProviders.find((item) => item.id === provider)?.label ?? 'Map';
  }

  formatAddress(address: Address | null): string {
    if (!address) {
      return '';
    }
    const streetLine = [
      address.houseName,
      address.oldNumber,
      address.streetName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();
    const parts = [streetLine, address.cityName, address.stateName, address.countries].filter(
      Boolean,
    );
    return parts.join(', ');
  }

  onOriginSelected(origin?: Address): void {
    if (!origin) {
      return;
    }
    this.setOrigin(this.normalizeCoordinatesFromSearchResult(origin));
  }

  onDestinationSelected(destination?: Address): void {
    if (!destination) {
      return;
    }
    this.setDestination(this.normalizeCoordinatesFromSearchResult(destination));
  }

  setTravelMode(mode: TravelModeId): void {
    if (this.selectedTravelMode === mode) {
      return;
    }
    this.selectedTravelMode = mode;
    const cachedResult = this.directionsResultsByMode[mode] ?? null;
    this.directionsResult = cachedResult;
    this.routeOptions = this.routeOptionsByMode[mode] ?? [];
    this.selectedRouteIndex = this.selectedRouteIndexByMode[mode] ?? 0;
    this.updateSelectedRoute();

    if (!cachedResult && this.selectedOrigin && this.selectedDestination) {
      this.requestDirections();
    }
  }

  useCurrentLocation(): void {
    if (!navigator?.geolocation) {
      return;
    }
    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Address = {
          atoka: this.currentLocationLabel,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        };
        this.originTyped = this.currentLocationLabel;
        this.setOrigin(location, true, true, true, position.coords.accuracy);
        this.isLocating = false;
      },
      () => {
        this.isLocating = false;
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  useCurrentLocationAsDestination(): void {
    if (!navigator?.geolocation) {
      return;
    }
    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Address = {
          atoka: this.currentLocationLabel,
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        };
        this.destinationTyped = this.currentLocationLabel;
        this.setDestination(location, true, true, position.coords.accuracy);
        this.isLocating = false;
      },
      () => {
        this.isLocating = false;
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  applyTypedOrigin(): void {
    const query = this.originTyped.trim();
    if (!query) {
      return;
    }
    this.isGeocodingOrigin = true;
    this.geocodeAddress(query)
      .then((address) => {
        if (address) {
          this.originTyped = address.atoka ?? query;
          this.setOrigin(address);
        }
      })
      .finally(() => {
        this.isGeocodingOrigin = false;
      });
  }

  applyTypedDestination(): void {
    if (this.actionPanel !== 'direction') {
      this.resetDirectionsState();
    }
    const query = this.destinationTyped.trim();
    if (!query) {
      return;
    }
    this.isGeocodingDestination = true;
    this.geocodeAddress(query)
      .then((address) => {
        if (address) {
          this.destinationTyped = address.atoka ?? query;
          this.setDestination(address, true);
        }
      })
      .finally(() => {
        this.isGeocodingDestination = false;
      });
  }

  setOrigin(
    origin: Address,
    updateRecent = true,
    updateCode = true,
    isCurrentLocation = false,
    accuracyMeters?: number,
  ): void {
    this.selectedOrigin = origin;
    if (updateCode) {
      this.originCode = origin.atoka ?? '';
    }
    this.originIsCurrentLocation = isCurrentLocation;
    this.currentLocationAccuracyMeters = isCurrentLocation ? accuracyMeters ?? null : null;
    this.originPosition = this.getLatLng(origin);
    if (updateRecent) {
      this.addRecentSearch(origin);
    }
    this.updateMapPosition();
    if (this.selectedDestination) {
      this.requestDirections();
    }
    if (this.selectedOrigin && this.selectedDestination) {
      this.isEditingDirections = false;
    }
  }

  setDestination(
    destination: Address,
    updateCode = true,
    isCurrentLocation = false,
    accuracyMeters?: number,
    updateRecent = true,
  ): void {
    this.selectedDestination = destination;
    this.selectedLocation = destination;
    if (updateCode) {
      this.addressCode = destination.atoka ?? '';
    }
    this.destinationPosition = this.getLatLng(destination);
    this.destinationIsCurrentLocation = isCurrentLocation;
    this.destinationAccuracyMeters = isCurrentLocation ? accuracyMeters ?? null : null;
    if (updateRecent) {
      this.addRecentSearch(destination);
    }
    this.updateMapPosition();
    this.requestDirections();
    if (this.selectedOrigin && this.selectedDestination) {
      this.isEditingDirections = false;
    }
  }

  swapDirections(): void {
    if (!this.selectedOrigin || !this.selectedDestination) {
      return;
    }

    const origin = this.selectedOrigin;
    const destination = this.selectedDestination;
    const originCode = this.originCode;
    const destinationCode = this.addressCode;
    const originTyped = this.originTyped;
    const destinationTyped = this.destinationTyped;
    const originPosition = this.originPosition;
    const destinationPosition = this.destinationPosition;
    const originIsCurrent = this.originIsCurrentLocation;
    const destinationIsCurrent = this.destinationIsCurrentLocation;
    const originAccuracy = this.currentLocationAccuracyMeters;
    const destinationAccuracy = this.destinationAccuracyMeters;

    this.selectedOrigin = destination;
    this.selectedDestination = origin;
    this.originCode = destinationCode;
    this.addressCode = originCode;
    this.originTyped = destinationTyped;
    this.destinationTyped = originTyped;
    this.originPosition = destinationPosition;
    this.destinationPosition = originPosition;
    this.originIsCurrentLocation = destinationIsCurrent;
    this.destinationIsCurrentLocation = originIsCurrent;
    this.currentLocationAccuracyMeters = destinationAccuracy ?? null;
    this.destinationAccuracyMeters = originAccuracy ?? null;
    this.selectedLocation = this.selectedDestination ?? null;

    this.updateMapPosition();
    if (this.selectedOrigin && this.selectedDestination) {
      this.requestDirections();
    }
  }

  startEditingDirections(): void {
    if (this.actionPanel !== 'direction') {
      this.actionPanel = 'direction';
    }
    this.isEditingDirections = true;
  }

  closeDirectionPicker(): void {
    this.isEditingDirections = false;
    if (!this.selectedOrigin || !this.selectedDestination) {
      this.actionPanel = null;
    }
  }

  resetDirectionsState(): void {
    if (
      !this.selectedLocation &&
      !this.selectedOrigin &&
      !this.selectedDestination &&
      !this.directionsResult &&
      !this.renderedDirectionsResult &&
      !this.directionsSummary &&
      !this.actionPanel
    ) {
      return;
    }

    this.actionPanel = null;
    this.isEditingDirections = false;
    this.selectedLocation = null;
    this.selectedOrigin = null;
    this.selectedDestination = null;
    this.originCode = '';
    this.addressCode = '';
    this.originTyped = '';
    this.originPosition = null;
    this.destinationPosition = null;
    this.originIsCurrentLocation = false;
    this.destinationIsCurrentLocation = false;
    this.currentLocationAccuracyMeters = null;
    this.destinationAccuracyMeters = null;
    this.directionsResult = null;
    this.renderedDirectionsResult = null;
    this.directionsSummary = null;
    this.directionsResultsByMode = {};
    this.modeSummaries = {};
    this.routeOptionsByMode = {};
    this.routeOptions = [];
    this.selectedRouteIndex = 0;
    this.selectedRouteIndexByMode = {};
    this.selectedRoutePath = [];
    this.alternateRoutePaths = [];
    this.selectedTravelMode = 'DRIVING';
  }

  private updateMapPosition(): void {
    const focus = this.mapFocusLocation;
    if (!focus) {
      return;
    }
    const focusPosition = this.getLatLng(focus);
    if (!focusPosition) {
      return;
    }

    if (this.selectedOrigin) {
      this.originPosition = this.getLatLng(this.selectedOrigin);
    }
    if (this.selectedDestination) {
      this.destinationPosition = this.getLatLng(this.selectedDestination);
    }
    this.center = focusPosition;
    this.zoom = 19;
  }

  private requestDirections(): void {
    const originLocation = this.selectedOrigin;
    if (!originLocation || !this.selectedDestination) {
      this.directionsResult = null;
      this.renderedDirectionsResult = null;
      this.directionsSummary = null;
      this.directionsResultsByMode = {};
      this.modeSummaries = {};
      this.routeOptionsByMode = {};
      this.routeOptions = [];
      this.selectedRouteIndex = 0;
      this.selectedRoutePath = [];
      return;
    }

    const origin = this.getLatLng(originLocation);
    const destination = this.getLatLng(this.selectedDestination);

    if (!origin || !destination) {
      this.directionsResult = null;
      this.renderedDirectionsResult = null;
      this.directionsSummary = null;
      this.directionsResultsByMode = {};
      this.modeSummaries = {};
      this.routeOptionsByMode = {};
      this.routeOptions = [];
      this.selectedRouteIndex = 0;
      this.selectedRoutePath = [];
      return;
    }

    this.directionsRequestId += 1;
    const requestId = this.directionsRequestId;
    this.directionsResultsByMode = {};
    this.modeSummaries = {};
    this.routeOptionsByMode = {};
    this.routeOptions = [];
    this.selectedRouteIndex = 0;
    this.selectedRoutePath = [];

    for (const mode of this.travelModes) {
      const request: google.maps.DirectionsRequest = {
        origin,
        destination,
        travelMode: mode.mode as google.maps.TravelMode,
        provideRouteAlternatives: true,
      };

      if (mode.id === 'DRIVING') {
        request.drivingOptions = {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        };
      }

      this.directionsService.route(request).subscribe((response) => {
        if (requestId !== this.directionsRequestId) {
          return;
        }
        if (response.status !== google.maps.DirectionsStatus.OK || !response.result) {
          if (mode.id === this.selectedTravelMode) {
            this.directionsResult = null;
            this.renderedDirectionsResult = null;
            this.directionsSummary = null;
            this.routeOptions = [];
            this.selectedRoutePath = [];
          }
          return;
        }

        const routeOptions = this.buildRouteOptions(response.result);
        const summary = routeOptions[0]?.summary ?? null;
        if (summary) {
          this.modeSummaries[mode.id] = summary;
        }
        this.directionsResultsByMode[mode.id] = response.result;
        this.routeOptionsByMode[mode.id] = routeOptions;

        if (mode.id === this.selectedTravelMode) {
          this.directionsResult = response.result;
          this.routeOptions = routeOptions;
          this.selectedRouteIndex = this.selectedRouteIndexByMode[mode.id] ?? 0;
          this.updateSelectedRoute();
        }
      });
    }
  }

  private getLatLng(address: Address): google.maps.LatLngLiteral | null {
    const latitude = Number.parseFloat(address.latitude ?? '');
    const longitude = Number.parseFloat(address.longitude ?? '');

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return { lat: latitude, lng: longitude };
  }

  // Search results come back with latitude/longitude reversed.
  // Swap only when both values are numeric and the swapped pair is valid.
  private normalizeCoordinatesFromSearchResult(address: Address): Address {
    const latitude = Number.parseFloat(address.latitude ?? '');
    const longitude = Number.parseFloat(address.longitude ?? '');

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return address;
    }

    const swappedLatitude = longitude;
    const swappedLongitude = latitude;

    const isValidSwappedPair =
      swappedLatitude >= -90 &&
      swappedLatitude <= 90 &&
      swappedLongitude >= -180 &&
      swappedLongitude <= 180;

    if (!isValidSwappedPair) {
      return address;
    }

    return {
      ...address,
      latitude: String(swappedLatitude),
      longitude: String(swappedLongitude),
    };
  }

  private geocodeAddress(query: string): Promise<Address | null> {
    if (typeof google === 'undefined' || !google.maps?.Geocoder) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: query }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK || !results?.length) {
          resolve(null);
          return;
        }

        const result = results[0];
        const location = result.geometry?.location;
        if (!location) {
          resolve(null);
          return;
        }

        const formatted = result.formatted_address || query;

        resolve({
          atoka: formatted,
          streetName: formatted,
          cityName: this.getAddressComponent(result, 'locality'),
          stateName: this.getAddressComponent(result, 'administrative_area_level_1'),
          countries: this.getAddressComponent(result, 'country'),
          latitude: String(location.lat()),
          longitude: String(location.lng()),
        });
      });
    });
  }

  private buildRouteSummary(route: google.maps.DirectionsRoute): DirectionsSummary | null {
    if (!route?.legs?.length) {
      return null;
    }

    let distanceMeters = 0;
    let durationSeconds = 0;
    let durationTrafficSeconds = 0;
    let hasTraffic = false;

    for (const leg of route.legs) {
      distanceMeters += leg.distance?.value ?? 0;
      durationSeconds += leg.duration?.value ?? 0;
      if (leg.duration_in_traffic?.value != null) {
        durationTrafficSeconds += leg.duration_in_traffic.value;
        hasTraffic = true;
      }
    }

    const trafficDelta = hasTraffic ? Math.max(durationTrafficSeconds - durationSeconds, 0) : 0;

    return {
      distanceText: this.formatDistance(distanceMeters),
      durationText: this.formatDuration(durationSeconds),
      durationTrafficText: hasTraffic ? this.formatDuration(durationTrafficSeconds) : undefined,
      trafficDeltaText: hasTraffic ? this.formatDuration(trafficDelta) : undefined,
      startAddress: route.legs[0].start_address,
      endAddress: route.legs[route.legs.length - 1].end_address,
    };
  }

  private buildRouteOptions(result: google.maps.DirectionsResult): RouteOption[] {
    if (!result.routes?.length) {
      return [];
    }

    return result.routes.map((route, index) => ({
      index,
      label: route.summary || `Route ${index + 1}`,
      summary: this.buildRouteSummary(route),
    }));
  }

  setRouteIndex(index: number): void {
    if (!this.routeOptions.length) {
      return;
    }
    const safeIndex = Math.max(0, Math.min(index, this.routeOptions.length - 1));
    this.selectedRouteIndex = safeIndex;
    this.selectedRouteIndexByMode[this.selectedTravelMode] = safeIndex;
    this.updateSelectedRoute();
  }

  private updateSelectedRoute(): void {
    if (this.directionsResult?.routes?.length) {
      const route = this.directionsResult.routes[this.selectedRouteIndex];
      this.directionsSummary = route ? this.buildRouteSummary(route) : null;
      this.renderedDirectionsResult = route
        ? { ...this.directionsResult, routes: [route] }
        : null;
      this.selectedRoutePath = route ? this.extractRoutePath(route) : [];
      this.alternateRoutePaths = this.directionsResult.routes
        .map((item, index) => ({
          index,
          path: this.extractRoutePath(item),
        }))
        .filter((item) => item.index !== this.selectedRouteIndex && item.path.length > 0);
      this.directionsOptions = {
        ...this.directionsOptions,
        routeIndex: 0,
      };
      return;
    }
    this.renderedDirectionsResult = null;
    this.selectedRoutePath = [];
    this.alternateRoutePaths = [];
    this.directionsSummary = this.modeSummaries[this.selectedTravelMode] ?? null;
  }

  private extractRoutePath(route: google.maps.DirectionsRoute): google.maps.LatLngLiteral[] {
    const overviewPath = route.overview_path;
    if (overviewPath?.length) {
      return overviewPath.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));
    }

    const overviewPolyline = (route as unknown as { overview_polyline?: string | { points?: string } })
      .overview_polyline;
    const encoded =
      typeof overviewPolyline === 'string'
        ? overviewPolyline
        : overviewPolyline?.points;

    if (!encoded) {
      return [];
    }

    return this.decodeEncodedPolyline(encoded);
  }

  private decodeEncodedPolyline(encoded: string): google.maps.LatLngLiteral[] {
    const result: google.maps.LatLngLiteral[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    const length = encoded.length;

    while (index < length) {
      let shift = 0;
      let value = 0;

      let chunk: number;
      do {
        if (index >= length) {
          return result;
        }
        chunk = encoded.charCodeAt(index++) - 63;
        value |= (chunk & 0x1f) << shift;
        shift += 5;
      } while (chunk >= 0x20);

      const deltaLat = (value & 1) ? ~(value >> 1) : value >> 1;
      lat += deltaLat;

      shift = 0;
      value = 0;
      do {
        if (index >= length) {
          return result;
        }
        chunk = encoded.charCodeAt(index++) - 63;
        value |= (chunk & 0x1f) << shift;
        shift += 5;
      } while (chunk >= 0x20);

      const deltaLng = (value & 1) ? ~(value >> 1) : value >> 1;
      lng += deltaLng;

      result.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }

    return result;
  }

  private formatDistance(meters: number): string {
    if (!meters || meters < 0) {
      return '0 m';
    }
    if (meters >= 1000) {
      const km = meters / 1000;
      return `${km.toFixed(km >= 10 ? 1 : 2)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  private formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) {
      return '0 min';
    }
    const mins = Math.round(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (hours > 0) {
      return `${hours} hr ${remainingMins} min`;
    }
    return `${mins} min`;
  }

  private getAddressComponent(
    result: google.maps.GeocoderResult,
    type: string,
  ): string | undefined {
    return result.address_components?.find((component) => component.types.includes(type))
      ?.long_name;
  }

  private addRecentSearch(location: Address): void {
    if (location.atoka === this.currentLocationLabel) {
      return;
    }
    const existingIndex = this.recentSearches.findIndex(
      (item) => item.atoka === location.atoka,
    );
    if (existingIndex !== -1) {
      this.recentSearches.splice(existingIndex, 1);
    }
    this.recentSearches.unshift(location);
    this.recentSearches = this.recentSearches.slice(0, 6);
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      this.updateMapHeight();
    });

    this.routerContainer = this.el.nativeElement.closest('.router-container');
    if (this.routerContainer) {
      this.renderer.addClass(this.routerContainer, 'no-padding');
    }

    this.mainContent = this.el.nativeElement.closest('.main-content');
  }

  ngOnDestroy(): void {
    if (this.mainContent && this.isMapFullscreen) {
      this.renderer.removeClass(this.mainContent, 'location-map-fullscreen');
    }
    if (this.routerContainer) {
      this.renderer.removeClass(this.routerContainer, 'no-padding');
    }
  }

  toggleMapFullscreen(): void {
    this.isMapFullscreen = !this.isMapFullscreen;

    if (this.mainContent) {
      if (this.isMapFullscreen) {
        this.renderer.addClass(this.mainContent, 'location-map-fullscreen');
      } else {
        this.renderer.removeClass(this.mainContent, 'location-map-fullscreen');
      }
    }

    requestAnimationFrame(() => {
      this.updateMapHeight();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateMapHeight();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMapFullscreen) {
      this.toggleMapFullscreen();
    }
  }

  private updateMapHeight(): void {
    const el = this.mapViewport?.nativeElement;
    if (!el) return;

    if (this.isMapFullscreen && this.mainContent) {
      const mainContentRect = this.mainContent.getBoundingClientRect();
      const top = el.getBoundingClientRect().top;
      const availableHeight = Math.max(mainContentRect.bottom - top, 280);
      this.mapHeight = `${availableHeight}px`;
      return;
    }

    const top = el.getBoundingClientRect().top;
    const paddingBottom = 16;
    const minHeight = 420;
    this.mapHeight = `${Math.max(window.innerHeight - top - paddingBottom, minHeight)}px`;
  }
}

