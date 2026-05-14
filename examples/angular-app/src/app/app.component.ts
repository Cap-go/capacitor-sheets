import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { setupSheet } from '@capgo/capacitor-sheets/angular';

import { mountUsecaseGallery } from '../../../shared/usecase-gallery';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<div #gallery></div>`,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gallery', { static: true }) gallery?: ElementRef<HTMLElement>;
  private cleanup?: () => void;

  ngAfterViewInit(): void {
    if (this.gallery?.nativeElement) {
      this.cleanup = mountUsecaseGallery(this.gallery.nativeElement, {
        framework: 'Angular',
        setupSheet,
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
