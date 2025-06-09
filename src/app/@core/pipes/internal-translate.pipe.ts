import { inject, Pipe, PipeTransform } from '@angular/core';
import { InterpolationParameters, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Pipe({
  name: 'mytranslate',
})
export class MyTranslatePipe implements PipeTransform {
  translateService: TranslateService = inject(TranslateService);

  transform(value: any, lang?: string, replace?: InterpolationParameters, isMultiple?: boolean) {
    if (!lang) {
      lang = this.translateService.currentLang || 'en';
    }
    if (!value || value == 'null') {
      return null;
    }
    if (isMultiple) {
      const result = [];
      const values = value?.split('|');
      for (let val of values) {
        result.push(this.translate(val, lang, replace));
      }
      return result.join(',');
    }
    return this.translate(value, lang, replace);
  }

  translate(value: string, lang: string, replace?: InterpolationParameters) {
    if (this.isParsableJson(value)) {
      const translationObj = JSON.parse(value);
      return (
        translationObj[lang] || Object.values(translationObj).find((val) => val) || translationObj
      );
    } else {
      return this.translateService.instant(value, replace);
    }
  }

  isParsableJson(data: any) {
    if (!data) return false;

    try {
      JSON.parse(data);
      return true;
    } catch (error) {
      return false;
    }
  }

}
