import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { APP_PARAMS } from '../../@interfaces/const';

@Component({
    selector: 'app-header',
    imports: [ShareModule, NgbDropdownModule],
    providers: [NgbDropdown],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public languages: any = [{ name: '', code: '' }];
  public showToggleMenu: boolean = false;
  public appName:string= APP_PARAMS.appName;

  onChangeLanguage(code: string) {}

  onLogout(){}
}
