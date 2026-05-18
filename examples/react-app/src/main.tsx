import { Capacitor } from '@capacitor/core';
import { createRoot } from 'react-dom/client';

import '@capgo/capacitor-sheets';
import './styles.css';
import { UsecaseGallery } from './UsecaseGallery';

function App() {
  return <UsecaseGallery />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

async function notifyCapgoReady() {
  if (!Capacitor.isNativePlatform()) return;

  const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
  await CapacitorUpdater.notifyAppReady();
}

void notifyCapgoReady().catch(() => undefined);

createRoot(root).render(<App />);
