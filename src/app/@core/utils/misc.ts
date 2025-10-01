import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { PLATFORM_ID } from "@angular/core";
import dayjs from "dayjs";




export function toReadableDateString(date: Date | string | undefined, type: "date" | "time" | "datetime" = "datetime") {
    if (!date) {
        return date;
    }
    try {
                console.log(date)
        if (typeof date == "string") {
            date = new Date(date);
        }
        console.log(date)
        let format: string;
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
        return dayjs(date).format(format)

    } catch {
        return date;
    }
}


export function getTranslateJSON(key: string) {
    const translate: any = {
        _TODAY: { en: 'Today', zh: '今天', zht: '今天', ms: 'Hari Ini' },
        _CLEAR: { en: 'Clear', zh: '清除', zht: '清除', ms: 'Bersih' },
        _PLEASE_INSERT_VALID_VALUE: { en: 'Please insert a valid value', zh: '请输入有效值', zht: '請輸入有效值', ms: 'Sila masuk nilai yang sah' },
        _OK: { en: 'OK', zh: '确认', zht: '確認', ms: 'OK' },
        _CANCEL: { en: 'Cancel', zh: '取消', zht: '取消', ms: 'OK' },
        _YES: { en: 'Yes', zh: '是', zht: '是', ms: 'OK' },
        _NO: { en: 'No', zh: '否', zht: '否', ms: 'OK' },
        _LOADING: { en: 'Loading...', zh: '努力加载中...', zht: '努力加載中...', ms: 'Sedang dimuat...' },
    }
    return JSON.stringify(translate[key]);
}

export function isMobile() {
    const ua = navigator.userAgent;
    
    // Basic mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    return isMobile;

}

export function isDesktop() {
    return !isMobile();
}