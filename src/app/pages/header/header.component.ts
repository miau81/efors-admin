import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { APP_PARAMS } from '../../@interfaces/const';
import { AuthService } from '../../services/auth.service';

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
  public appName: string = APP_PARAMS.appName;
  public accountLink: string = '/doc/user/'

  constructor(private authService: AuthService) {

  }

  async ngOnInit() {
    const user = await this.authService.getLoginUser()!;
    this.accountLink = this.accountLink + user.id;
  }

  onChangeLanguage(code: string) { }

  onLogout() {
    this.authService.logout(false);
  }
}
