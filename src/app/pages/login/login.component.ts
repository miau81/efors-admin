import { Component, inject, signal } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { APP_PARAMS } from '../../@interfaces/const';

import { FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MyFormGenerator, MyFormGeneratorConfig } from '@myerp/components';
import { BaseService } from '../../services/base.service';


@Component({
  selector: 'app-login',
  imports: [ShareModule, MyFormGenerator],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Using signals for reactive state
  readonly appName = signal<string>(APP_PARAMS.appName);
  readonly systemName = signal<string>(APP_PARAMS.systemName);
  readonly slogan = signal<string>(APP_PARAMS.slogan);
  readonly tagline = signal<string>(APP_PARAMS.tagline);
  readonly version = signal<string>(APP_PARAMS.version);
  readonly formConfig = signal<MyFormGeneratorConfig | undefined>(undefined);

  // Using inject()
  private readonly authService = inject(AuthService);
  private readonly baseService = inject(BaseService);

  async ngOnInit() {
    let form!: FormGroup;
    const config: MyFormGeneratorConfig = {
      showValidation: true,
      form: form,
      tabs: [],
      sections: [],
      components: [
        {
          key: 'loginId',
          label: '{"en":"Email"}',
          required: true,
          sortOrder: 1,
          type: 'email',
        },
        {
          key: 'password',
          label: '{"en":"Password"}',
          required: true,
          sortOrder: 2,
          type: 'password',
          passwordConfig: {
            showHide: true,
            showPassword: false,
          },
        },
      ],
    };
    this.formConfig.set(config);
  }

  onLoginFormKeyUp(event: any) {
    if (event.component.key == 'password' && event.event.code == 'Enter') {
      this.onLogin();
    }
  }

  async onLogin() {
    const config = this.formConfig();
    if (!config?.generator?.validateForm()) {
      return;
    }
    try {
      await this.authService.login(config.form.value)
    } catch (error: any) {
      if (error.status == 401) {
        const message = "_USER_NOT_FOUND_OR_PASSWORD_NOT_CORRECT";
        this.baseService.showErrorMessage({ message: message, button: "OKOnly", type: "warning" });
      } else {
        this.baseService.showErrorMessage(error);
      }
    }
  }
}
