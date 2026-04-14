import { Component, TemplateRef, inject, signal } from '@angular/core';
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
  // Using signals for reactive state
  readonly languages = signal<any[]>([{ name: '', code: '' }]);
  readonly showToggleMenu = signal<boolean>(false);
  readonly appName = signal<string>(APP_PARAMS.appName);
  readonly systemName = signal<string>(APP_PARAMS.systemName);
  readonly slogan = signal<string>(APP_PARAMS.slogan);
  readonly tagline = signal<string>(APP_PARAMS.tagline);
  readonly accountLink = signal<string>('/doc/user/');

  // Using inject()
  private readonly authService = inject(AuthService);
  private readonly offcanvasService = inject(NgbOffcanvas);

  async ngOnInit() {
    const user = await this.authService.getLoginUser()!;
    this.accountLink.set(this.accountLink() + user.id);
  }

  onChangeLanguage(code: string) { }

  onLogout() {
    this.authService.logout(false);
  }

  open(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { ariaLabelledBy: 'offcanvas-basic-title', panelClass: 'main-site-menu' })
  }
}
