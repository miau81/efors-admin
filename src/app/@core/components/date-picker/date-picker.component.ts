
import { Component, Injectable, inject, input, output, ChangeDetectorRef, effect, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbCalendar,  NgbDateAdapter, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';
import { getTranslateJSON } from '@myerp/utils/misc';
import { MyTranslatePipe } from '@myerp/pipes';


@Injectable()
export class CustomAdapter extends NgbDateAdapter<Date> {
  readonly DELIMITER = '-';

  fromModel(value: Date | null): NgbDateStruct | null {
    if (value) {
      const djs = dayjs(value);
      console.log(djs.date(), djs.month(), djs.year())
      return {
        day: djs.date(),
        month: djs.month() + 1,
        year: djs.year(),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): Date | null {
    if (date) {
      return dayjs(date.year + this.DELIMITER + date.month + this.DELIMITER + date.day).toDate();
    }
    return null;
  }
}


@Component({
  selector: 'myerp-datepicker',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MyTranslatePipe,
    NgbDatepicker
],
  providers: [{ provide: NgbDateAdapter, useClass: CustomAdapter }],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class MyDatePicker {
  // Using model() from Angular 17+ for two-way binding
  selectedDate = model<Date | undefined>(undefined);

  // Using output() from Angular 17+
  dateChange = output<any>();

  // Using signal for internal state
  readonly _TODAY = getTranslateJSON("_TODAY");
  readonly _CLEAR = getTranslateJSON("_CLEAR");

  // Using inject()
  private readonly adapter = inject(NgbDateAdapter<Date>);
  private readonly calendar = inject(NgbCalendar);
  private readonly cd = inject(ChangeDetectorRef);

  constructor() {
    // Effect to detect changes
    effect(() => {
      const date = this.selectedDate();
      this.cd.markForCheck();
    });
  }

  onDateChange() {
    const date = this.selectedDate();
    console.log(date);
    const strDate = dayjs(date).format("YYYY-MM-DD");
    this.dateChange.emit(strDate);
  }

  onToday() {
    this.selectedDate.set(new Date());
    this.onDateChange();
  }

  onClear() {
    this.selectedDate.set(new Date("1900-01-01"));
    setTimeout(() => {
      this.selectedDate.set(undefined);
      this.dateChange.emit(undefined);
    }, 0);
  }
}
