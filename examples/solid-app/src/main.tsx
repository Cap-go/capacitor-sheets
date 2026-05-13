import { setupSheet } from '@capgo/capacitor-sheets/solid';
import { onCleanup, onMount } from 'solid-js';
import { render } from 'solid-js/web';
import '@capgo/capacitor-sheets';
import './styles.css';

function App() {
  let sheetEl: HTMLElement | undefined;

  onMount(() => {
    if (!sheetEl) return;
    const cleanup = setupSheet(sheetEl, {
      detents: ['16em', '30em'],
      contentPlacement: 'bottom',
    });
    onCleanup(cleanup);
  });

  return (
    <main class="page">
      <header>
        <strong>Solid sheet</strong>
        <cap-sheet-trigger for="solid-sheet" action="present">
          Open
        </cap-sheet-trigger>
      </header>

      <cap-sheet-outlet for="solid-sheet" class="panel">
        Solid
      </cap-sheet-outlet>

      <cap-sheet id="solid-sheet" ref={sheetEl}>
        <cap-sheet-view>
          <cap-sheet-backdrop />
          <cap-sheet-content class="sheet">
            <cap-sheet-handle />
            <cap-sheet-title>Solid modal</cap-sheet-title>
            <cap-sheet-description>Solid uses the same elements and a tiny setup helper.</cap-sheet-description>
            <cap-sheet-trigger action="dismiss">Close</cap-sheet-trigger>
          </cap-sheet-content>
        </cap-sheet-view>
      </cap-sheet>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(() => <App />, root);
