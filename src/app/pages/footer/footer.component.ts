import { Component, signal } from '@angular/core';
import { APP_PARAMS } from '../../@interfaces/const';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  // Using signals for reactive state
  readonly appName = signal<string>(APP_PARAMS.appName);
  readonly systemName = signal<string>(APP_PARAMS.systemName);
  readonly version = signal<string>(APP_PARAMS.version);
}
