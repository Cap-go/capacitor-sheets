import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import '@capgo/capacitor-sheets';
import './styles.css';
import { mountUsecaseGallery } from './usecase-gallery';

function App() {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!galleryRef.current) return;
    return mountUsecaseGallery(galleryRef.current);
  }, []);

  return <div ref={galleryRef} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
