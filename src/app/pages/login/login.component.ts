import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { APP_PARAMS } from '../../@interfaces/const';
import { MyCoreService, MyFormGenerator, MyFormGeneratorConfig } from 'myerp-core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ShareModule, MyFormGenerator],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public appName: string = APP_PARAMS.appName

  public formConfig!: MyFormGeneratorConfig;
  constructor(private myCoreService: MyCoreService, private authService: AuthService) {

  }

  async ngOnInit() {

    let form!: FormGroup;
    const config: MyFormGeneratorConfig = {
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
      console.log(error)
      if (error.status == 409) {
        const message = "_USER_NOT_FOUND_OR_PASSWORD_NOT_CORRECT";
        // this.baseService.showMessageBox({ message: message, button: "OKOnly", type: "warning" });
      } else {
        // this.baseService.showErrorMessageBox(error.message || error.error || error);
      }
    }
  }

}
