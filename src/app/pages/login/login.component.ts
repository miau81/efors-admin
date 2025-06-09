import { Component } from '@angular/core';
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

  public appName: string = APP_PARAMS.appName

  public formConfig!: MyFormGeneratorConfig;
  constructor( private authService: AuthService,private baseService:BaseService) {

  }

  async ngOnInit() {

    let form!: FormGroup;
    const config: MyFormGeneratorConfig = {
      showValidation:true,
      form: form,
      tabs: [{
        key: '',
        label: "",
        sections: [{
          key: '',
          label: '',
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
        }]
      }]
    };
    this.formConfig = config;

  }

  onLoginFormKeyUp(event: any) {
    if (event.component.key == 'password' && event.event.code == 'Enter') {
      this.onLogin();
    }
  }

  async onLogin() {
    if (!this.formConfig.generator?.validateForm()) {
      return;
    }
    try {
      await this.authService.login(this.formConfig.form.value)
      // this.baseService.showToast({ message: "_WELCOME_BACK", color: "success" });
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
