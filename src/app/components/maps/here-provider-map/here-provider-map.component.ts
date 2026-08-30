import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { environment } from '../../../../environments/environment';

interface HereRoutePath {
  index: number;
  path: google.maps.LatLngLiteral[];
}

interface HereDirectionsSummary {
  distanceText: string;
  durationText: string;
  trafficDeltaText?: string;
}

declare global {
  interface Window {
    H?: any;
  }
}

@Component({
  selector: 'app-here-provider-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './here-provider-map.component.html',
  styleUrl: './here-provider-map.component.scss',
})
export class HereProviderMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('host') hostRef?: ElementRef<HTMLElement>;

  @Input() height = '420px';
  @Input() center: google.maps.LatLngLiteral | null = null;
  @Input() zoom = 19;
  @Input() originPosition: google.maps.LatLngLiteral | null = null;
  @Input() destinationPosition: google.maps.LatLngLiteral | null = null;
  @Input() providerLabel = 'HERE WeGo';
  @Input() atoka = '';
  @Input() address = '';
  @Input() directionsSummary: HereDirectionsSummary | null = null;
  @Input() selectedRoutePath: google.maps.LatLngLiteral[] = [];
  @Input() alternateRoutePaths: HereRoutePath[] = [];

  @Output() routeIndexSelected = new EventEmitter<number>();
  @Output() locationPinSelected = new EventEmitter<'origin' | 'destination'>();

  errorMessage = '';

  private readonly apiKey = (environment.hereMapsApiKey || '').trim();
  private mapInstance: any | null = null;
  private focusMarker: any | null = null;
  private originMarker: any | null = null;
  private destinationMarker: any | null = null;
  private hostEl: HTMLElement | null = null;
  private routeObjects: any[] = [];
  private markerTapHandlers: Array<{ object: any; handler: (...args: unknown[]) => void }> = [];
  private routeTapHandlers: Array<{ object: any; handler: (...args: unknown[]) => void }> = [];
  private lastFittedRouteKey = '';
  private static scriptLoaders = new Map<string, Promise<void>>();

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      void this.syncMap();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.hostRef) {
      return;
    }

    if (
      changes['height'] ||
      changes['center'] ||
      changes['zoom'] ||
      changes['selectedRoutePath'] ||
      changes['alternateRoutePaths']
    ) {
      void this.syncMap();
    }
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.mapInstance?.getViewPort?.().resize();
  }

  private async syncMap(): Promise<void> {
    this.errorMessage = '';

    if (!this.apiKey) {
      this.errorMessage = 'HERE Maps API key is missing.';
      return;
    }

    const host = this.hostRef?.nativeElement;
    const center = this.center;
    if (!host || !center) {
      return;
    }

    try {
      await this.loadSdk();
      const H = window.H;
      if (!H?.service?.Platform) {
        this.errorMessage = 'HERE Maps SDK failed to initialize.';
        return;
      }

      if (this.mapInstance && this.hostEl !== host) {
        this.destroyMap();
      }

      if (!this.mapInstance) {
        const platform = new H.service.Platform({ apikey: this.apiKey });
        const harpEngine = H.Map?.EngineType?.HARP;
        const defaultLayers = harpEngine
          ? platform.createDefaultLayers({ engineType: harpEngine })
          : platform.createDefaultLayers();
        const baseLayer = this.resolvePreferredBaseLayer(defaultLayers);
        if (!baseLayer) {
          this.errorMessage = 'HERE base layer is unavailable for this API key.';
          return;
        }

        this.mapInstance = new H.Map(host, baseLayer, {
          center,
          zoom: this.zoom,
          pixelRatio: window.devicePixelRatio || 1,
          engineType: harpEngine,
        });
        this.hostEl = host;
        const mapEvents = new H.mapevents.MapEvents(this.mapInstance);
        new H.mapevents.Behavior(mapEvents);
        const ui = H.ui.UI.createDefault(this.mapInstance, defaultLayers);
        // Remove layer toggle UI so users stay on the fixed hybrid basemap.
        ui.removeControl('mapsettings');
      }

      this.mapInstance.setCenter(center);
      this.mapInstance.setZoom(this.zoom);
      this.updateMarkers(center);
      this.renderRoutes();
      this.mapInstance.getViewPort().resize();
    } catch (error) {
      const details = error instanceof Error ? error.message : '';
      this.errorMessage = details
        ? `Unable to load HERE map. ${details}`
        : 'Unable to load HERE map.';
    }
  }

  private updateMarkers(center: google.maps.LatLngLiteral): void {
    const H = window.H;
    if (!H || !this.mapInstance) {
      return;
    }

    this.clearMarkerTapHandlers();

    if (this.originPosition && this.destinationPosition) {
      this.focusMarker && this.mapInstance.removeObject(this.focusMarker);
      this.focusMarker = null;

      this.originMarker = this.upsertMarker(this.originMarker, this.originPosition);
      this.destinationMarker = this.upsertMarker(this.destinationMarker, this.destinationPosition);
      this.bindMarkerTap(this.originMarker, 'origin');
      this.bindMarkerTap(this.destinationMarker, 'destination');
      return;
    }

    if (this.originMarker) {
      this.mapInstance.removeObject(this.originMarker);
      this.originMarker = null;
    }
    if (this.destinationMarker) {
      this.mapInstance.removeObject(this.destinationMarker);
      this.destinationMarker = null;
    }
    this.focusMarker = this.upsertMarker(this.focusMarker, center);
  }

  private upsertMarker(marker: any, position: google.maps.LatLngLiteral): any {
    const H = window.H;
    if (!H || !this.mapInstance) {
      return marker;
    }

    const point = { lat: position.lat, lng: position.lng };
    if (!marker) {
      marker = new H.map.Marker(point);
      this.mapInstance.addObject(marker);
      return marker;
    }
    marker.setGeometry(point);
    return marker;
  }

  private bindMarkerTap(marker: any, pin: 'origin' | 'destination'): void {
    if (!marker?.addEventListener) {
      return;
    }
    const handler = () => this.locationPinSelected.emit(pin);
    marker.addEventListener('tap', handler);
    this.markerTapHandlers.push({ object: marker, handler });
  }

  private clearMarkerTapHandlers(): void {
    for (const binding of this.markerTapHandlers) {
      binding.object?.removeEventListener?.('tap', binding.handler);
    }
    this.markerTapHandlers = [];
  }

  private clearRouteTapHandlers(): void {
    for (const binding of this.routeTapHandlers) {
      binding.object?.removeEventListener?.('tap', binding.handler);
    }
    this.routeTapHandlers = [];
  }

  private renderRoutes(): void {
    const H = window.H;
    if (!H || !this.mapInstance) {
      return;
    }

    this.clearRouteTapHandlers();
    for (const object of this.routeObjects) {
      this.mapInstance.removeObject(object);
    }
    this.routeObjects = [];

    const draw = (
      routeIndex: number | null,
      path: google.maps.LatLngLiteral[],
      strokeColor: string,
      lineWidth: number,
    ) => {
      if (path.length < 2) {
        return;
      }
      const lineString = new H.geo.LineString();
      for (const point of path) {
        lineString.pushLatLngAlt(point.lat, point.lng, 0);
      }
      const polyline = new H.map.Polyline(lineString, {
        style: {
          strokeColor,
          lineWidth,
        },
      });
      if (routeIndex != null) {
        const handler = () => this.routeIndexSelected.emit(routeIndex);
        polyline.addEventListener('tap', handler);
        this.routeTapHandlers.push({ object: polyline, handler });
      }
      this.mapInstance.addObject(polyline);
      this.routeObjects.push(polyline);
    };

    this.alternateRoutePaths.forEach((route) => {
      draw(route.index, route.path, 'rgba(148,163,184,0.8)', 4);
    });
    draw(null, this.selectedRoutePath, 'rgba(37,99,235,0.95)', 6);
    this.fitMapToRoute(this.selectedRoutePath);
  }

  private async loadSdk(): Promise<void> {
    this.loadStyleOnce('here-maps-css', 'https://js.api.here.com/v3/3.1/mapsjs-ui.css');
    await this.loadScriptOnce('here-maps-core-js', 'https://js.api.here.com/v3/3.1/mapsjs-core.js');
    await this.loadScriptOnce(
      'here-maps-service-js',
      'https://js.api.here.com/v3/3.1/mapsjs-service.js',
    );
    await this.loadScriptOnce('here-maps-ui-js', 'https://js.api.here.com/v3/3.1/mapsjs-ui.js');
    await this.loadScriptOnce(
      'here-maps-events-js',
      'https://js.api.here.com/v3/3.1/mapsjs-mapevents.js',
    );
    await this.loadScriptOnce(
      'here-maps-harp-js',
      'https://js.api.here.com/v3/3.1/mapsjs-harp.js',
    );

    if (!window.H?.service?.Platform) {
      throw new Error('HERE global object was not created after SDK load.');
    }
  }

  private loadStyleOnce(id: string, href: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    const existing = document.getElementById(id) as HTMLLinkElement | null;
    if (existing) {
      if (existing.href === href) {
        return;
      }
      existing.remove();
    }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  private loadScriptOnce(id: string, src: string): Promise<void> {
    const cached = HereProviderMapComponent.scriptLoaders.get(id);
    if (cached) {
      return cached;
    }

    const loader = new Promise<void>((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('Document is not available.'));
        return;
      }

      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (existing) {
        const existingSrc = existing.getAttribute('src') || '';
        if (existingSrc !== src) {
          existing.remove();
          HereProviderMapComponent.scriptLoaders.delete(id);
        } else {
        const isLoaded = existing.getAttribute('data-loaded') === 'true';
        if (isLoaded) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), {
          once: true,
        });
        return;
        }
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

    const safeLoader = loader.catch((error) => {
      HereProviderMapComponent.scriptLoaders.delete(id);
      const existing = typeof document !== 'undefined' ? document.getElementById(id) : null;
      existing?.remove();
      throw error;
    });

    HereProviderMapComponent.scriptLoaders.set(id, safeLoader);
    return safeLoader;
  }

  private destroyMap(): void {
    this.clearMarkerTapHandlers();
    this.clearRouteTapHandlers();
    if (this.mapInstance?.dispose) {
      this.mapInstance.dispose();
    }
    this.mapInstance = null;
    this.focusMarker = null;
    this.originMarker = null;
    this.destinationMarker = null;
    this.hostEl = null;
    this.routeObjects = [];
    this.lastFittedRouteKey = '';
  }

  private fitMapToRoute(path: google.maps.LatLngLiteral[]): void {
    const H = window.H;
    if (!H || !this.mapInstance || path.length < 2) {
      this.lastFittedRouteKey = '';
      return;
    }

    const routeKey = this.buildRouteKey(path);
    if (routeKey === this.lastFittedRouteKey) {
      return;
    }
    this.lastFittedRouteKey = routeKey;

    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;
    let minLng = Number.POSITIVE_INFINITY;
    let maxLng = Number.NEGATIVE_INFINITY;

    for (const point of path) {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    }

    if (!Number.isFinite(minLat) || !Number.isFinite(minLng) || !Number.isFinite(maxLat) || !Number.isFinite(maxLng)) {
      return;
    }

    const bounds = new H.geo.Rect(maxLat, minLng, minLat, maxLng);
    this.mapInstance.getViewModel()?.setLookAtData({
      bounds,
      padding: { top: 72, right: 72, bottom: 72, left: 72 },
      animate: true,
    });
  }

  private buildRouteKey(path: google.maps.LatLngLiteral[]): string {
    const first = path[0];
    const last = path[path.length - 1];
    return `${path.length}|${first.lat},${first.lng}|${last.lat},${last.lng}`;
  }

  private resolvePreferredBaseLayer(defaultLayers: any): any | null {
    if (!defaultLayers) {
      return null;
    }

    // Use vector-only layers to avoid legacy raster (maptile v2) endpoints.
    const candidatePaths = [
      'vector.hybrid.map',
      'vector.hybrid.base',
      'vector.satellite.map',
      'vector.satellite.base',
      'raster.hybrid.map',
      'raster.hybrid.base',
      'raster.satellite.map',
      'raster.satellite.base',
      'raster.satellite.xbase',
      'vector.normal.map',
      'vector.normal.base',
      'raster.normal.map',
    ];

    for (const path of candidatePaths) {
      const layer = this.getLayerByPath(defaultLayers, path);
      if (layer) {
        return layer;
      }
    }
    return null;
  }

  private getLayerByPath(source: any, path: string): any | null {
    const value = path.split('.').reduce<any>((acc, key) => acc?.[key], source);
    return value ?? null;
  }
}
