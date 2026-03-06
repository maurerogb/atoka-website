import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
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

  @Input() center: google.maps.LatLngLiteral | null = null;
  @Input() zoom = 16;
  @Input() providerLabel = 'HERE WeGo';
  @Input() atoka = '';
  @Input() address = '';
  @Input() directionsSummary: HereDirectionsSummary | null = null;
  @Input() selectedRoutePath: google.maps.LatLngLiteral[] = [];
  @Input() alternateRoutePaths: HereRoutePath[] = [];

  errorMessage = '';

  private readonly apiKey = (environment.hereMapsApiKey || '').trim();
  private mapInstance: any | null = null;
  private marker: any | null = null;
  private hostEl: HTMLElement | null = null;
  private routeObjects: any[] = [];
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
        const defaultLayers = platform.createDefaultLayers();
        const vectorLayer = defaultLayers.vector?.normal?.map;
        if (!vectorLayer) {
          this.errorMessage = 'HERE vector base layer is unavailable for this API key.';
          return;
        }

        this.mapInstance = new H.Map(host, vectorLayer, {
          center,
          zoom: this.zoom,
          pixelRatio: window.devicePixelRatio || 1,
        });
        this.hostEl = host;
        const mapEvents = new H.mapevents.MapEvents(this.mapInstance);
        new H.mapevents.Behavior(mapEvents);
        H.ui.UI.createDefault(this.mapInstance, defaultLayers);
      }

      this.mapInstance.setCenter(center);
      this.mapInstance.setZoom(this.zoom);
      this.updateMarker(center.lat, center.lng);
      this.renderRoutes();
      this.mapInstance.getViewPort().resize();
    } catch (error) {
      const details = error instanceof Error ? error.message : '';
      this.errorMessage = details
        ? `Unable to load HERE map. ${details}`
        : 'Unable to load HERE map.';
    }
  }

  private updateMarker(lat: number, lng: number): void {
    const H = window.H;
    if (!H || !this.mapInstance) {
      return;
    }

    const point = { lat, lng };
    if (!this.marker) {
      this.marker = new H.map.Marker(point);
      this.mapInstance.addObject(this.marker);
      return;
    }
    this.marker.setGeometry(point);
  }

  private renderRoutes(): void {
    const H = window.H;
    if (!H || !this.mapInstance) {
      return;
    }

    for (const object of this.routeObjects) {
      this.mapInstance.removeObject(object);
    }
    this.routeObjects = [];

    const draw = (
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
      this.mapInstance.addObject(polyline);
      this.routeObjects.push(polyline);
    };

    this.alternateRoutePaths.forEach((route) => {
      draw(route.path, 'rgba(148,163,184,0.8)', 4);
    });
    draw(this.selectedRoutePath, 'rgba(37,99,235,0.95)', 6);
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
    if (typeof document === 'undefined' || document.getElementById(id)) {
      return;
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
    if (this.mapInstance?.dispose) {
      this.mapInstance.dispose();
    }
    this.mapInstance = null;
    this.marker = null;
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
}
