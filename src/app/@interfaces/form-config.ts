import { FormGroup } from "@angular/forms";

type FormCode = 'LOGIN';
export function getFormConfig(code: FormCode, initValue?: any) {
  switch (code) {
    case 'LOGIN':
      return login();
  }
}

function login() {
  // let form!: FormGroup;
  // const config: FormGeneratorConfig = {
  //   form: form,
  //   components: [
  //     {
  //       key: 'email',
  //       label: '_EMAIL',
  //       required: true,
  //       sortOrder: 1,
  //       type: 'email',
  //     },
  //     {
  //       key: 'password',
  //       label: '_PASSWORD',
  //       required: true,
  //       sortOrder: 2,
  //       type: 'password',
  //       passwordConfig: {
  //         showHide: true,
  //         showPassword: false,
  //       },
  //     },
  //   ],
  // };
  // return config;
}
