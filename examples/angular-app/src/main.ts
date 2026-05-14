import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import '@capgo/capacitor-sheets';
import 'zone.js';
import './styles.css';

bootstrapApplication(AppComponent).catch((error) => console.error(error));
