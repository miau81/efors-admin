"use strict";
exports.__esModule = true;
exports.isDesktop = exports.isMobile = exports.getTranslateJSON = exports.toReadableDateString = void 0;
var dayjs_1 = require("dayjs");
function toReadableDateString(date, type) {
    if (type === void 0) { type = "datetime"; }
    if (!date) {
        return date;
    }
    try {
        if (typeof date == "string") {
            date = new Date(date);
        }
        var format = void 0;
        switch (type) {
            case "date":
                format = "DD-MM-YYYY";
                break;
            case "time":
                format = "HH:mm A";
                break;
            default:
                format = "DD-MM-YYYY hh:mm A";
        }
        return dayjs_1["default"](date).format(format);
    }
    catch (_a) {
        return date;
    }
}
exports.toReadableDateString = toReadableDateString;
function getTranslateJSON(key) {
    var translate = {
        _TODAY: { en: 'Today', zh: '今天', zht: '今天', ms: 'Hari Ini' },
        _CLEAR: { en: 'Clear', zh: '清除', zht: '清除', ms: 'Bersih' },
        _PLEASE_INSERT_VALID_VALUE: { en: 'Please insert a valid value', zh: '请输入有效值', zht: '請輸入有效值', ms: 'Sila masuk nilai yang sah' },
        _OK: { en: 'OK', zh: '确认', zht: '確認', ms: 'OK' },
        _CANCEL: { en: 'Cancel', zh: '取消', zht: '取消', ms: 'OK' },
        _YES: { en: 'Yes', zh: '是', zht: '是', ms: 'OK' },
        _NO: { en: 'No', zh: '否', zht: '否', ms: 'OK' },
        _LOADING: { en: 'Loading...', zh: '努力加载中...', zht: '努力加載中...', ms: 'Sedang dimuat...' }
    };
    return JSON.stringify(translate[key]);
}
exports.getTranslateJSON = getTranslateJSON;
function isMobile() {
    var ua = navigator.userAgent;
    // Basic mobile detection
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return isMobile;
}
exports.isMobile = isMobile;
function isDesktop() {
    return !isMobile();
}
exports.isDesktop = isDesktop;
