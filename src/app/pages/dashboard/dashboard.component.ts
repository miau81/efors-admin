import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MyFormGenerator, MyFormGeneratorConfig } from '@myerp/components';


@Component({
    selector: 'app-dashboard',
    imports: [MyFormGenerator, MatDialogModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
    formConfig!: MyFormGeneratorConfig

    constructor(private dialog: MatDialog) {

    }
    ngOnInit() {
        this.formConfig = this.getConfig();
    }

    getConfig() {
        let form!: FormGroup;
        const config: MyFormGeneratorConfig = {
            form: form,
            tabs: [],
            sections: [],
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
        };
        return config;
    }

    onChange(e: any) {
        console.log("onChange", e);
    }

    onOpenModal() {
        const dialogRef = this.dialog.open(DashboardComponent, {
            data: { abc: "abc" },
            maxWidth: "90vw",
            maxHeight: "90vh",
            minHeight: "90vh",
            minWidth: "90vW"

        });
    }

}
