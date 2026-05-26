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

interface TomTomRoutePath {
  index: number;
  path: google.maps.LatLngLiteral[];
}

interface TomTomDirectionsSummary {
  distanceText: string;
  durationText: string;
  trafficDeltaText?: string;
}

declare global {
  interface Window {
    tt?: {
      map: (options: Record<string, unknown>) => any;
      Marker: new (options?: Record<string, unknown>) => any;
      NavigationControl: new () => any;
    };
  }
}

@Component({
  selector: 'app-tomtom-provider-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tomtom-provider-map.component.html',
  styleUrl: './tomtom-provider-map.component.scss',
})
export class TomtomProviderMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('host') hostRef?: ElementRef<HTMLElement>;

  @Input() height = '420px';
  @Input() center: google.maps.LatLngLiteral | null = null;
  @Input() zoom = 19;
  @Input() providerLabel = 'TomTom Map';
  @Input() atoka = '';
  @Input() address = '';
  @Input() directionsSummary: TomTomDirectionsSummary | null = null;
  @Input() selectedRoutePath: google.maps.LatLngLiteral[] = [];
  @Input() alternateRoutePaths: TomTomRoutePath[] = [];

  errorMessage = '';

  private readonly apiKey = (environment.tomTomApiKey || '').trim();
  // Keep a single hybrid-style base map (satellite imagery with street labels).
  private readonly hybridStyleUrl =
    'https://api.tomtom.com/style/1/style/*?map=2/basic_street-satellite&poi=2/poi_dynamic-satellite';
  private mapInstance: any | null = null;
  private marker: any | null = null;
  private hostEl: HTMLElement | null = null;
  private routeIds: string[] = [];
  private lastFittedRouteKey = '';
  private lastAppliedStyleUrl = '';
  private pendingRouteRender = false;
  private styleRefreshHandler: (() => void) | null = null;
  private idleReconcileHandler: (() => void) | null = null;
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
    this.mapInstance?.resize?.();
  }

  private async syncMap(): Promise<void> {
    this.errorMessage = '';

    if (!this.apiKey) {
      this.errorMessage = 'TomTom API key is missing.';
      return;
    }

    const host = this.hostRef?.nativeElement;
    const center = this.center;
    if (!host || !center) {
      return;
    }

    try {
      await this.loadSdk();
      const tt = window.tt;
      if (!tt?.map) {
        this.errorMessage = 'TomTom SDK failed to initialize.';
        return;
      }

      if (this.mapInstance && this.hostEl !== host) {
        this.destroyMap();
      }

      if (!this.mapInstance) {
        const initialStyle = this.getStyleUrl();
        this.mapInstance = tt.map({
          key: this.apiKey,
          container: host,
          center: [center.lng, center.lat],
          zoom: this.zoom,
          style: initialStyle,
          dragRotate: false,
        });
        this.lastAppliedStyleUrl = initialStyle;
        this.hostEl = host;
        this.mapInstance.addControl(new tt.NavigationControl(), 'top-right');
        if (typeof this.mapInstance.once === 'function') {
          this.mapInstance.once('load', () => this.renderRoutes());
        }
        if (typeof this.mapInstance.on === 'function') {
          this.styleRefreshHandler = () => {
            if (!this.mapInstance || this.selectedRoutePath.length < 2) {
              return;
            }
            this.lastFittedRouteKey = '';
            this.scheduleRouteRenderWhenReady();
          };
          this.idleReconcileHandler = () => {
            const map = this.mapInstance;
            if (!map || this.selectedRoutePath.length < 2) {
              return;
            }
            const hasMainRouteLayer = Boolean(map.getLayer?.('route-main'));
            if (!hasMainRouteLayer) {
              this.lastFittedRouteKey = '';
              this.scheduleRouteRenderWhenReady();
            }
          };
          this.mapInstance.on('style.load', this.styleRefreshHandler);
          this.mapInstance.on('load', this.styleRefreshHandler);
          this.mapInstance.on('idle', this.idleReconcileHandler);
        }
      }

      this.mapInstance.setCenter([center.lng, center.lat]);
      this.mapInstance.setZoom(this.zoom);
      this.updateMarker(center.lat, center.lng);
      this.renderRoutes();
      this.mapInstance.resize();
    } catch (error) {
      const details = error instanceof Error ? error.message : '';
      this.errorMessage = details
        ? `Unable to load TomTom map. ${details}`
        : 'Unable to load TomTom map.';
    }
  }

  private updateMarker(lat: number, lng: number): void {
    const tt = window.tt;
    if (!tt || !this.mapInstance) {
      return;
    }

    const point = [lng, lat];
    if (!this.marker) {
      this.marker = new tt.Marker({ color: '#EA4335' }).setLngLat(point).addTo(this.mapInstance);
      return;
    }
    this.marker.setLngLat(point);
  }

  private renderRoutes(): void {
    if (!this.mapInstance) {
      return;
    }

    const map = this.mapInstance;
    const clearRoute = (id: string) => {
      if (map.getLayer?.(id)) {
        map.removeLayer(id);
      }
      if (map.getSource?.(id)) {
        map.removeSource(id);
      }
    };

    const selectedPath = this.selectedRoutePath;
    if (selectedPath.length < 2) {
      if (typeof map.isStyleLoaded !== 'function' || map.isStyleLoaded()) {
        for (const id of this.routeIds) {
          clearRoute(id);
        }
        this.routeIds = [];
      }
      this.lastFittedRouteKey = '';
      return;
    }

    if (typeof map.isStyleLoaded === 'function' && !map.isStyleLoaded()) {
      this.scheduleRouteRenderWhenReady();
      return;
    }

    for (const id of this.routeIds) {
      clearRoute(id);
    }
    this.routeIds = [];

    const draw = (
      id: string,
      path: google.maps.LatLngLiteral[],
      strokeColor: string,
      strokeWidth: number,
    ) => {
      if (path.length < 2) {
        return;
      }
      clearRoute(id);
      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: path.map((point) => [point.lng, point.lat]),
          },
        },
      });
      map.addLayer({
        id,
        type: 'line',
        source: id,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': strokeColor,
          'line-opacity': 0.9,
          'line-width': strokeWidth,
        },
      });
      this.routeIds.push(id);
    };

    try {
      this.alternateRoutePaths.forEach((alt, index) => {
        draw(`route-alt-${index}`, alt.path, '#94A3B8', 4);
      });
      draw('route-main', selectedPath, '#2563EB', 6);
      this.fitMapToRoute(selectedPath);
    } catch (error) {
      const details = error instanceof Error ? error.message : '';
      this.errorMessage = details
        ? `Unable to draw TomTom route. ${details}`
        : 'Unable to draw TomTom route.';
    }
  }

  private async loadSdk(): Promise<void> {
    this.loadStyleOnce(
      'tomtom-maps-css',
      'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css',
    );
    await this.loadScriptOnce(
      'tomtom-maps-js',
      'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js',
    );
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
    const cached = TomtomProviderMapComponent.scriptLoaders.get(id);
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

    TomtomProviderMapComponent.scriptLoaders.set(id, loader);
    return loader;
  }

  private destroyMap(): void {
    if (this.mapInstance && this.styleRefreshHandler && typeof this.mapInstance.off === 'function') {
      this.mapInstance.off('style.load', this.styleRefreshHandler);
      this.mapInstance.off('load', this.styleRefreshHandler);
    }
    if (this.mapInstance && this.idleReconcileHandler && typeof this.mapInstance.off === 'function') {
      this.mapInstance.off('idle', this.idleReconcileHandler);
    }
    if (this.mapInstance?.remove) {
      this.mapInstance.remove();
    }
    this.mapInstance = null;
    this.marker = null;
    this.hostEl = null;
    this.routeIds = [];
    this.lastFittedRouteKey = '';
    this.lastAppliedStyleUrl = '';
    this.pendingRouteRender = false;
    this.styleRefreshHandler = null;
    this.idleReconcileHandler = null;
  }

  private scheduleRouteRenderWhenReady(): void {
    if (!this.mapInstance || this.pendingRouteRender) {
      return;
    }
    this.pendingRouteRender = true;

    let completed = false;
    const onReady = () => {
      if (completed) {
        return;
      }
      completed = true;
      this.pendingRouteRender = false;
      this.renderRoutes();
    };

    if (typeof this.mapInstance.once === 'function') {
      this.mapInstance.once('load', onReady);
      this.mapInstance.once('style.load', onReady);
      this.mapInstance.once('styledata', onReady);
      setTimeout(onReady, 350);
      return;
    }

    requestAnimationFrame(onReady);
    setTimeout(onReady, 350);
  }

  private fitMapToRoute(path: google.maps.LatLngLiteral[]): void {
    if (!this.mapInstance || path.length < 2) {
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

    this.mapInstance.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 72,
        maxZoom: 19,
        duration: 450,
      },
    );
  }

  private getStyleUrl(): string {
    return this.hybridStyleUrl;
  }

  private buildRouteKey(path: google.maps.LatLngLiteral[]): string {
    const first = path[0];
    const last = path[path.length - 1];
    return `${path.length}|${first.lat},${first.lng}|${last.lat},${last.lng}`;
  }
}
