import { setupSheet } from '@capgo/capacitor-sheets/react';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@capgo/capacitor-sheets';
import './styles.css';

function App() {
  const sheetRef = useRef<HTMLElement>(null);
  const [detent, setDetent] = useState(1);

  useEffect(() => {
    if (!sheetRef.current) return;
    return setupSheet(sheetRef.current, {
      detents: ['18em', '32em'],
      contentPlacement: 'bottom',
      onActiveDetentChange: ({ activeDetent }) => setDetent(activeDetent),
    });
  }, []);

  return (
    <main className="page">
      <section className="toolbar">
        <strong>Capgo Sheets</strong>
        <cap-sheet-trigger for="trip-sheet" action="present">
          Open
        </cap-sheet-trigger>
      </section>

      <cap-sheet-outlet for="trip-sheet" className="map">
        <div className="pin">ROME</div>
      </cap-sheet-outlet>

      <cap-sheet id="trip-sheet" ref={sheetRef}>
        <cap-sheet-portal>
          <cap-sheet-view>
            <cap-sheet-backdrop />
            <cap-sheet-content className="sheet">
              <cap-sheet-bleeding-background />
              <cap-sheet-handle direction={detent > 1 ? 'down' : 'up'} />
              <cap-sheet-title>Evening route</cap-sheet-title>
              <cap-sheet-description>Live options with detents, gestures, focus, and backdrop dimming.</cap-sheet-description>
              <div className="actions">
                <cap-sheet-trigger action="step" detent="1">
                  Compact
                </cap-sheet-trigger>
                <cap-sheet-trigger action="step" detent="2">
                  Expanded
                </cap-sheet-trigger>
                <cap-sheet-trigger action="dismiss">
                  Done
                </cap-sheet-trigger>
              </div>
            </cap-sheet-content>
          </cap-sheet-view>
        </cap-sheet-portal>
      </cap-sheet>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);
