import { onCleanup, onMount } from 'solid-js';
import { render } from 'solid-js/web';

import '@capgo/capacitor-sheets';
import './styles.css';
import { mountUsecaseGallery } from './usecase-gallery';

function App() {
  let galleryEl!: HTMLDivElement;

  onMount(() => {
    const cleanup = mountUsecaseGallery(galleryEl);
    onCleanup(cleanup);
  });

  return <div ref={galleryEl} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(() => <App />, root);
