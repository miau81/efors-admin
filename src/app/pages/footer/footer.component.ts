import { Component } from '@angular/core';
import { APP_PARAMS } from '../../@interfaces/const';
import { version } from '../../../../package.json'

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {

  public appName: string = APP_PARAMS.appName;
  public version = `V${version}`;

}
