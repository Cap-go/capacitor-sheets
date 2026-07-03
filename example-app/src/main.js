import './style.css';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { initCapSheets } from '@capgo/capacitor-sheets';
import '@capgo/capacitor-sheets';

initCapSheets();
const output = document.getElementById('output');
output.textContent = 'Cap Sheets initialized. Use the trigger to open the sheet.';

if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady().catch((error) => console.error('Capgo notifyAppReady failed', error));
}
