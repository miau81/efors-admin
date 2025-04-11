import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import './app/@util/string-prototype'

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
