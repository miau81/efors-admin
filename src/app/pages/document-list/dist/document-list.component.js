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
exports.DocumentListComponent = void 0;
var core_1 = require("@angular/core");
var share_module_1 = require("../../@modules/share/share.module");
var components_1 = require("@myerp/components");
var DocumentListComponent = /** @class */ (function () {
    function DocumentListComponent(route, api, baseService) {
        this.route = route;
        this.api = api;
        this.baseService = baseService;
        this.title = '';
        this.documentTypeId = '';
        this.docs = [];
        this.filter = {};
    }
    DocumentListComponent.prototype.flush = function () {
        this.filterConfig = undefined;
        this.filter = {};
        this.docs = [];
        this.datagridConfig = undefined;
        this.pagination = { page: 1, limit: 10 };
    };
    DocumentListComponent.prototype.ngOnInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.baseService.subscribeParam(this.route, function (p) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.documentTypeId = p['documentType'];
                                this.flush();
                                return [4 /*yield*/, this.getDocumentType()];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this.getDocuments()];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    DocumentListComponent.prototype.getDocumentType = function () {
        return __awaiter(this, void 0, void 0, function () {
            var documentType, fields, columns, filterFields, form, components;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.getDocumentType(this.documentTypeId)];
                    case 1:
                        documentType = _a.sent();
                        this.title = documentType.label;
                        fields = documentType.fields.sort(function (a, b) { return (a.sorting || 0) - (b.sorting || 0); }).filter(function (f) { return !f.isHidden && f.showInTable && _this.validTypeForTable(f.type); });
                        columns = fields.map(function (f) {
                            return {
                                key: f.id,
                                label: f.label || '',
                                type: f.type,
                                width: f.tableColumnWidth || 100
                            };
                        });
                        this.datagridConfig = {
                            columns: columns,
                            defaultSortKey: documentType.defaultSorting || "id",
                            defaultSortBy: documentType.defaultSortBy || "ASC",
                            paginationOption: {
                                length: 0,
                                pageIndex: 0,
                                pageSize: 10,
                                pageSizeOptions: [10, 20, 50, 100]
                            }
                        };
                        filterFields = documentType.fields.filter(function (f) { return f.showInFilter; }).map(function (m) {
                            return __assign(__assign({}, m), { type: m.type == "datetime" ? "date" : m.type, defaultValue: undefined, formColumnSize: "col-6 col-md-3 col-lg-2", mandatory: false, showInForm: true });
                        });
                        if (filterFields.length > 0) {
                            form = void 0;
                            components = filterFields.map(function (f) { return _this.populateFieldsToFormComponent(f); });
                            this.filterConfig = {
                                form: form,
                                tabs: [],
                                sections: [],
                                components: components
                            };
                        }
                        this.pagination['sortField'] = documentType.defaultSorting || "id";
                        this.pagination['sortBy'] = documentType.defaultSortBy || "ASC";
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentListComponent.prototype.populateFieldsToFormComponent = function (f) {
        var component = {
            key: f.id,
            label: f.label,
            col: f.formColumnSize || 'col-12 col-sm-6 col-md-4 col-lg-4',
            required: f.mandatory,
            value: f.defaultValue,
            sortOrder: f.sorting,
            type: this.populateFormType(f),
            options: f.options
        };
        return component;
    };
    DocumentListComponent.prototype.populateFormType = function (field) {
        if (field.isHidden || !field.showInForm) {
            return "hidden";
        }
        return field.formComponentType || this.convertFieldTypeToFormComponentType(field.type);
    };
    DocumentListComponent.prototype.convertFieldTypeToFormComponentType = function (type) {
        switch (type) {
            case "boolean":
                return "checkbox";
            case "currency":
                return "currency";
            case "number":
                return "number";
            case "date":
                return "date";
            case "time":
                return "time";
            case "datetime":
                return "datetime-local";
            case "link":
                return "select";
            case "table":
                return "table";
            case "breakline":
                return "breakline";
            default:
                return "text";
        }
    };
    DocumentListComponent.prototype.getDocuments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var params, doclist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign(__assign({}, this.filter), this.pagination);
                        console.log(params, this.filter);
                        return [4 /*yield*/, this.api.getDocuments(this.documentTypeId, params)];
                    case 1:
                        doclist = _a.sent();
                        this.docs = doclist.records;
                        this.datagridConfig.paginationOption.length = doclist.totalRecord;
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentListComponent.prototype.validTypeForTable = function (type) {
        switch (type) {
            case "section":
            case "tab":
            case "table":
            case "breakline":
                return false;
            default:
                return true;
        }
    };
    DocumentListComponent.prototype.onSelect = function (data) {
        this.baseService.navigateTo("/doc/" + this.documentTypeId + "/" + data['id']);
    };
    DocumentListComponent.prototype.onPageChange = function (pagination) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (pagination.pageSize >= pagination.length) {
                            pagination.pageIndex = 0;
                        }
                        this.pagination["page"] = pagination.pageIndex + 1;
                        this.pagination["limit"] = pagination.pageSize;
                        return [4 /*yield*/, this.getDocuments()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentListComponent.prototype.onSort = function (sort) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.pagination["sortField"] = sort.sortField;
                        this.pagination["sortBy"] = sort.sortBy;
                        return [4 /*yield*/, this.getDocuments()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentListComponent.prototype.onFilter = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var filterPrefix;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        switch (e.component.type) {
                            case "text":
                                filterPrefix = "tf_";
                                this.filter["op_" + e.component.key] = "like";
                                console.log(this.filter, e.component.type);
                                break;
                            case "date":
                                filterPrefix = "df_";
                                this.filter["type_" + e.component.key] = "date";
                                break;
                            case "datetime-local":
                                filterPrefix = "df_";
                                this.filter["type_" + e.component.key] = "datetime";
                                break;
                            default:
                                filterPrefix = "tf_";
                        }
                        if (e.component.value) {
                            this.filter["" + filterPrefix + e.component.key] = e.component.value;
                        }
                        else {
                            delete this.filter["" + filterPrefix + e.component.key];
                        }
                        return [4 /*yield*/, this.getDocuments()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DocumentListComponent.prototype.onAddNew = function () {
        this.baseService.navigateTo("/doc/new/" + this.documentTypeId);
    };
    DocumentListComponent = __decorate([
        core_1.Component({
            selector: 'app-document-list',
            imports: [share_module_1.ShareModule, components_1.MyDataGridView, components_1.MyFormGenerator],
            templateUrl: './document-list.component.html',
            styleUrl: './document-list.component.scss'
        })
    ], DocumentListComponent);
    return DocumentListComponent;
}());
exports.DocumentListComponent = DocumentListComponent;
