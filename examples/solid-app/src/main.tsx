import { setupSheet } from '@capgo/capacitor-sheets/solid';
import { onCleanup, onMount } from 'solid-js';
import { render } from 'solid-js/web';

import '@capgo/capacitor-sheets';
import { mountUsecaseGallery } from '../../shared/usecase-gallery';
import './styles.css';

function App() {
  let galleryEl!: HTMLDivElement;

  onMount(() => {
    const cleanup = mountUsecaseGallery(galleryEl, {
      framework: 'Solid',
      setupSheet,
    });
    onCleanup(cleanup);
  });

  return <div ref={galleryEl} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(() => <App />, root);
