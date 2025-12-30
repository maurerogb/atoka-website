import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = 0;
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);

  readonly isLoading$ = this.isLoadingSubject.asObservable();

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.isLoadingSubject.next(true);
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
      if (this.activeRequests === 0) {
        this.isLoadingSubject.next(false);
      }
    }
  }
}

