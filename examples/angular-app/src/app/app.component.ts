import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { setupSheet } from '@capgo/capacitor-sheets/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <main class="page">
      <header>
        <strong>Angular sheet</strong>
        <cap-sheet-trigger for="angular-sheet" action="present">Open</cap-sheet-trigger>
      </header>

      <cap-sheet-outlet for="angular-sheet" class="panel">Angular</cap-sheet-outlet>

      <cap-sheet id="angular-sheet" #sheet>
        <cap-sheet-view>
          <cap-sheet-backdrop></cap-sheet-backdrop>
          <cap-sheet-content class="sheet">
            <cap-sheet-handle></cap-sheet-handle>
            <cap-sheet-title>Angular workflow</cap-sheet-title>
            <cap-sheet-description>Configure once in ngAfterViewInit.</cap-sheet-description>
            <cap-sheet-trigger action="dismiss">Close</cap-sheet-trigger>
          </cap-sheet-content>
        </cap-sheet-view>
      </cap-sheet>
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1em;
      }

      .panel {
        display: grid;
        place-items: center;
        margin: 1em;
        border-radius: 1.25em;
        background: #8f90b8;
        color: white;
        font-size: 2em;
        font-weight: 800;
      }

      .sheet {
        padding: 0 1.25em 1.25em;
      }
    `,
  ],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sheet', { static: true }) sheet?: ElementRef<HTMLElement>;
  private cleanup?: () => void;

  ngAfterViewInit(): void {
    if (this.sheet?.nativeElement) {
      this.cleanup = setupSheet(this.sheet.nativeElement, {
        detents: ['16em', '30em'],
        contentPlacement: 'bottom',
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }
}
