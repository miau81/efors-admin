"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DashboardComponent = void 0;
var core_1 = require("@angular/core");
var dialog_1 = require("@angular/material/dialog");
var components_1 = require("@myerp/components");
var DashboardComponent = /** @class */ (function () {
    function DashboardComponent(dialog) {
        this.dialog = dialog;
    }
    DashboardComponent_1 = DashboardComponent;
    DashboardComponent.prototype.ngOnInit = function () {
        this.formConfig = this.getConfig();
    };
    DashboardComponent.prototype.getConfig = function () {
        var form;
        var config = {
            form: form,
            tabs: [],
            sections: [],
            components: [
                {
                    key: 'email',
                    label: '{"en":"Email"}',
                    required: true,
                    sortOrder: 1,
                    type: 'email'
                },
                {
                    key: 'password',
                    label: '_PASSWORD',
                    required: true,
                    sortOrder: 2,
                    type: 'password',
                    passwordConfig: {
                        showHide: true,
                        showPassword: false
                    }
                },
            ]
        };
        return config;
    };
    DashboardComponent.prototype.onChange = function (e) {
        console.log("onChange", e);
    };
    DashboardComponent.prototype.onOpenModal = function () {
        var dialogRef = this.dialog.open(DashboardComponent_1, {
            data: { abc: "abc" },
            maxWidth: "90vw",
            maxHeight: "90vh",
            minHeight: "90vh",
            minWidth: "90vW"
        });
    };
    var DashboardComponent_1;
    DashboardComponent = DashboardComponent_1 = __decorate([
        core_1.Component({
            selector: 'app-dashboard',
            imports: [components_1.MyFormGenerator, dialog_1.MatDialogModule],
            templateUrl: './dashboard.component.html',
            styleUrl: './dashboard.component.scss'
        })
    ], DashboardComponent);
    return DashboardComponent;
}());
exports.DashboardComponent = DashboardComponent;
