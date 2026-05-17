import { render } from 'solid-js/web';

import '@capgo/capacitor-sheets';
import './styles.css';
import { UsecaseGallery } from './UsecaseGallery';

function App() {
  return <UsecaseGallery />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

render(() => <App />, root);
