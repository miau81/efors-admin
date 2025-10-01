"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MyFormGenerator = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var tabs_1 = require("@angular/material/tabs");
var expansion_1 = require("@angular/material/expansion");
var ng_select_1 = require("@ng-select/ng-select");
var core_2 = require("@ngx-translate/core");
var dialog_1 = require("@angular/material/dialog");
var misc_1 = require("@myerp/utils/misc");
var pipes_1 = require("@myerp/pipes");
var forms_1 = require("@angular/forms");
var media_component_1 = require("../media/media.component");
var date_picker_component_1 = require("../date-picker/date-picker.component");
var editable_table_component_1 = require("../editable-table/editable-table.component");
var dayjs_1 = require("dayjs");
var MyFormGenerator = /** @class */ (function () {
    function MyFormGenerator(fb, decimalPipe, dialog) {
        this.fb = fb;
        this.decimalPipe = decimalPipe;
        this.dialog = dialog;
        this.dialogData = core_1.inject(dialog_1.MAT_DIALOG_DATA, { optional: true });
        this.dialogRef = core_1.inject(dialog_1.MatDialogRef < MyFormGenerator_1 > , { optional: true });
        this.ready = false;
        this.doneSetupForm = false;
        this.onFormReady = new core_1.EventEmitter();
        this.onFormChange = new core_1.EventEmitter();
        this.onFormKeyUp = new core_1.EventEmitter();
        this.onViewLinkDoc = new core_1.EventEmitter();
        this.openTableForm = new core_1.EventEmitter();
        this.removeTableRow = new core_1.EventEmitter();
        this.changeSignal = core_1.signal(true);
        this._PLEASE_INSERT_VALID_VALUE = misc_1.getTranslateJSON("_PLEASE_INSERT_VALID_VALUE");
    }
    MyFormGenerator_1 = MyFormGenerator;
    MyFormGenerator.prototype.ngOnInit = function () {
        console.log(this.config);
        this.initValue(this.config.initValue);
        if (!this.config.form) {
            this.setupForm();
        }
        this.config.generator = this;
        this.doneSetupForm = true;
        // this.config.form.valueChanges.subscribe(v => {
        //   console.log(v)
        // })
    };
    MyFormGenerator.prototype.ngOnChanges = function (changes) {
    };
    MyFormGenerator.prototype.initValue = function (value) {
        if (!value) {
            return;
        }
        for (var _i = 0, _a = Object.keys(value); _i < _a.length; _i++) {
            var key = _a[_i];
            var component = this.findComponentByKey(key);
            if (component) {
                if (component.type == 'currency' || component.type == 'readOnlyCurrency') {
                    component.value = this.getCurrencyValue(value[key]);
                }
                else {
                    component.value = value[key];
                }
            }
            ;
        }
    };
    MyFormGenerator.prototype.getCurrencyValue = function (value) {
        return this.decimalPipe.transform(value, "1.2-2");
    };
    MyFormGenerator.prototype.findComponentByKey = function (key) {
        // for (const t of this.config.tabs) {
        //   for (const s of t.sections) {
        //     const component = s.components.find(c => c.key == key);
        //     if (component) {
        //       return component;
        //     }
        //   }
        // }
        return this.config.components.find(function (c) { return c.key == key; });
        ;
    };
    MyFormGenerator.prototype.setupForm = function () {
        var _this = this;
        var group = {};
        // this.config.tabs.forEach(t => {
        //   t.sections.forEach(s => {
        //     s.components.forEach((c: MyFormComponent) => {
        //       group = this.setupFormComponent(c, group)
        //     });
        //   })
        // })
        this.config.components.forEach(function (c) {
            group = _this.setupFormComponent(c, group);
        });
        this.config.form = this.fb.group(group);
        this.onFormReady.emit();
    };
    MyFormGenerator.prototype.setupFormComponent = function (c, group) {
        var validators = [];
        if (c.required) {
            validators.push(forms_1.Validators.required);
        }
        if (c.type == "table") {
            group[c.key] = new forms_1.FormArray([], validators);
        }
        if (c.type == "email") {
            validators.push(forms_1.Validators.email);
        }
        if (c.type == "number") {
            validators.push(forms_1.Validators.min);
            validators.push(forms_1.Validators.max);
        }
        if (c.type == "checkboxGroup") {
            group[c.key] = new forms_1.FormArray([], validators);
        }
        else {
            if (c.type != "breakline") {
                if (c.type == "datetime-local") {
                    var date = dayjs_1["default"](c.value).format("YYYY-MM-DDThh:mm:ss");
                    group[c.key] = new forms_1.FormControl(date, { validators: validators });
                }
                else {
                    group[c.key] = new forms_1.FormControl({ value: c.value, disabled: c.disabled }, { validators: validators });
                }
            }
        }
        return group;
    };
    MyFormGenerator.prototype.onDatePickerChange = function (component, dt) {
        this.config.form.controls[component.key].setValue(dt);
        this.onChange(component);
    };
    MyFormGenerator.prototype.onKeyUp = function (component, e) {
        component.value = this.config.form.controls[component.key].value;
        this.onFormKeyUp.emit({ component: component, event: e });
    };
    MyFormGenerator.prototype.onBlur = function (component, e, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    MyFormGenerator.prototype.onChange = function (component, e, index) {
        return __awaiter(this, void 0, void 0, function () {
            var formArray, index_1, currency;
            return __generator(this, function (_a) {
                if (component.type == "checkboxGroup") {
                    formArray = this.config.form.get(component.key);
                    if (e.target.checked) {
                        formArray.push(this.fb.control(e.target.value));
                    }
                    else {
                        index_1 = formArray.controls.findIndex(function (x) { return x.value === e.target.value; });
                        formArray.removeAt(index_1);
                    }
                }
                else {
                    if (component.type != "image") {
                        if (component.type == 'currency' || component.type == 'readOnlyCurrency') {
                            currency = this.getCurrencyValue(this.config.form.controls[component.key].value);
                            component.value = currency;
                            this.config.form.controls[component.key].patchValue(currency);
                            console.log(currency);
                            this.changeSignal.set(false);
                        }
                        else {
                            component.value = this.config.form.controls[component.key].value;
                        }
                    }
                }
                this.onFormChange.emit({ component: component, isInit: false });
                return [2 /*return*/];
            });
        });
    };
    MyFormGenerator.prototype.multiNgSwitchCase = function (arr, type) {
        return arr.find(function (a) { return a == type; }) ? true : false;
    };
    MyFormGenerator.prototype.onShowPassword = function (component) {
        if (component.passwordConfig) {
            component.passwordConfig.showPassword = !component.passwordConfig.showPassword;
        }
    };
    MyFormGenerator.prototype.validateForm = function () {
        this.config.form.markAllAsTouched();
        return this.config.form.valid;
    };
    MyFormGenerator.prototype.getErrorFormControlKeys = function () {
        var controls = this.config.form.controls;
        var invalidControls = {};
        for (var _i = 0, _a = Object.keys(controls); _i < _a.length; _i++) {
            var key = _a[_i];
            if (controls[key].invalid) {
                invalidControls[key] = controls[key];
            }
        }
        return invalidControls;
    };
    MyFormGenerator.prototype.onImageClick = function (component) {
        var element = document.getElementById(component.key);
        element === null || element === void 0 ? void 0 : element.click();
    };
    MyFormGenerator.prototype.onRemoveImage = function (component) {
        this.config.form.controls[component.key].reset();
        component.value = this.config.form.controls[component.key].value;
        this.onFormChange.emit({ component: component });
    };
    MyFormGenerator.prototype.onFileSelected = function (e, component) {
        var _this = this;
        if (e.target.files && e.target.files[0]) {
            var reader = new FileReader();
            reader.onload = function (event) {
                component.value = event.target.result;
                // try {
                _this.config.form.controls[component.key].setValue(e.target.files[0]);
                _this.config.form.controls[component.key].updateValueAndValidity();
                // } catch {
                // }
                _this.onChange(component);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    MyFormGenerator.prototype.onImageError = function (e, component) {
        var _a;
        e.target.src = (_a = component.imageConfig) === null || _a === void 0 ? void 0 : _a.defaultImage;
    };
    MyFormGenerator.prototype.resetForm = function () {
        var _a;
        // for (const tab of this.config.tabs) {
        //   for (const section of tab.sections) {
        for (var _i = 0, _b = this.config.components; _i < _b.length; _i++) {
            var component = _b[_i];
            switch (component.type) {
                case "checkboxGroup":
                    component.options = (_a = component.options) === null || _a === void 0 ? void 0 : _a.map(function (o) { return __assign(__assign({}, o), { checked: false }); });
                    break;
                case "datePicker":
                    component.value = undefined;
            }
        }
        //   }
        // }
        this.config.form.reset();
    };
    MyFormGenerator.prototype.onChildTableChange = function (change, component) {
        this.config.form.controls[component.key].setValue(change.values);
        this.onFormChange.emit({ component: component, isInit: false, childTable: { row: change.row, component: change.component, index: change.index, isInit: false } });
    };
    MyFormGenerator.prototype.onRemoveTableRow = function () {
        this.removeTableRow.emit();
    };
    MyFormGenerator.prototype.onOpenTableForm = function (event, component) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                options = {
                    title: event.title,
                    document: event.document,
                    component: component,
                    callback: event.callback
                };
                // request.callback(res);
                this.openTableForm.emit(options);
                return [2 /*return*/];
            });
        });
    };
    MyFormGenerator.prototype.onSave = function () {
        if (!this.validateForm()) {
            return;
        }
    };
    MyFormGenerator.prototype.onViewDocumentClick = function (event) {
        this.onViewLinkDoc.emit(event);
    };
    MyFormGenerator.prototype.getChildTableFromArray = function (key) {
        return this.config.form.get(key);
    };
    MyFormGenerator.prototype.getSections = function (tab) {
        return this.config.sections.filter(function (s) { return s.parent == tab.key; });
    };
    MyFormGenerator.prototype.getComponents = function (section) {
        return this.config.components.filter(function (c) { return c.group == section.key; });
    };
    var MyFormGenerator_1;
    __decorate([
        core_1.Input()
    ], MyFormGenerator.prototype, "config");
    __decorate([
        core_1.Output("onFormReady")
    ], MyFormGenerator.prototype, "onFormReady");
    __decorate([
        core_1.Output("onChange")
    ], MyFormGenerator.prototype, "onFormChange");
    __decorate([
        core_1.Output("onKeyUp")
    ], MyFormGenerator.prototype, "onFormKeyUp");
    __decorate([
        core_1.Output("onViewLinkDoc")
    ], MyFormGenerator.prototype, "onViewLinkDoc");
    __decorate([
        core_1.Output("openTableForm")
    ], MyFormGenerator.prototype, "openTableForm");
    __decorate([
        core_1.Output("removeTableRow")
    ], MyFormGenerator.prototype, "removeTableRow");
    MyFormGenerator = MyFormGenerator_1 = __decorate([
        core_1.Component({
            selector: 'myerp-form-generator',
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                media_component_1.MyMedia,
                date_picker_component_1.MyDatePicker,
                pipes_1.MyTranslatePipe,
                tabs_1.MatTabsModule,
                expansion_1.MatExpansionModule,
                ng_select_1.NgSelectComponent,
                ng_select_1.NgOptionComponent,
                core_2.TranslateModule,
                editable_table_component_1.MyEditableTable,
            ],
            providers: [common_1.DecimalPipe],
            templateUrl: './form-generator.component.html',
            styleUrl: './form-generator.component.scss'
        })
    ], MyFormGenerator);
    return MyFormGenerator;
}());
exports.MyFormGenerator = MyFormGenerator;
