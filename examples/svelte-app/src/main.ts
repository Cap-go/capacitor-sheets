import { mount } from 'svelte';

import App from './App.svelte';
import '@capgo/capacitor-sheets';
import './styles.css';

const target = document.getElementById('app');
if (!target) throw new Error('App element not found');

const app = mount(App, { target });

export default app;
