import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MyFormGenerator, MyFormGeneratorConfig, MyMedia } from 'myerp-core';
// import {MyMedia} from '../../../../../myerp-lib/dist/myerp-comconents';
// import {MyMedia} from 'myerp-comconents';

@Component({
    selector: 'app-dashboard',
    imports: [MyFormGenerator],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    formConfig!: MyFormGeneratorConfig
    constructor() {

    }
    ngOnInit() {
        this.formConfig = this.getConfig();
    }

    getConfig() {
        let form!: FormGroup;
        const config: MyFormGeneratorConfig = {
            form: form,
            tabs:[{
                key:'',
                label:"",
                sections:[{
                    key:'',
                    label:'s',
                    components: [
                        {
                            key: 'email',
                            label: '{"en":"Email"}',
                            required: true,
                            sortOrder: 1,
                            type: 'email',
                        },
                        {
                            key: 'password',
                            label: '_PASSWORD',
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
        return config;
    }

}
