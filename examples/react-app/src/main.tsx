import { setupSheet } from '@capgo/capacitor-sheets/react';
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import '@capgo/capacitor-sheets';
import { mountUsecaseGallery } from '../../shared/usecase-gallery';
import './styles.css';

function App() {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!galleryRef.current) return;
    return mountUsecaseGallery(galleryRef.current, {
      framework: 'React',
      setupSheet,
    });
  }, []);

  return <div ref={galleryRef} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
