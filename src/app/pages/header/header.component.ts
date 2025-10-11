import { Component, TemplateRef } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { NgbDropdown, NgbDropdownModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { APP_PARAMS } from '../../@interfaces/const';
import { AuthService } from '../../services/auth.service';
import { SideMenuComponent } from "../side-menu/side-menu.component";

@Component({
  selector: 'app-header',
  imports: [ShareModule, NgbDropdownModule, SideMenuComponent],
  providers: [NgbDropdown],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  public languages: any = [{ name: '', code: '' }];
  public showToggleMenu: boolean = false;
  public appName: string = APP_PARAMS.appName;
  public slogan: string = APP_PARAMS.slogan;
  public tagline: string = APP_PARAMS.tagline;
  public accountLink: string = '/doc/user/'

  constructor(private authService: AuthService, private offcanvasService: NgbOffcanvas) {

  }

  async ngOnInit() {
    const user = await this.authService.getLoginUser()!;
    this.accountLink = this.accountLink + user.id;
  }

  onChangeLanguage(code: string) { }

  onLogout() {
    this.authService.logout(false);
  }

  open(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title', panelClass: 'main-site-menu' })
  }
}
