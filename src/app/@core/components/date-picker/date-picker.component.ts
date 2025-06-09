import { CommonModule } from '@angular/common';
import { Component, Injectable, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
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
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MyTranslatePipe,
    NgbDatepicker],
  providers: [{ provide: NgbDateAdapter, useClass: CustomAdapter }],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class MyDatePicker {

  _TODAY: string = getTranslateJSON("_TODAY");
  _CLEAR: string = getTranslateJSON("_CLEAR");
  
  @Input() selectedDate?: Date;
  @Output("onChange") onChange: EventEmitter<any> = new EventEmitter();

  constructor(private adadper: NgbDateAdapter<Date>, private calendar: NgbCalendar,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(){
    console.log("date",this.selectedDate)
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes)
    const change = changes["selectedDate"];
    if (!change || change.firstChange) {
      return;
    }
    if (!change.currentValue) {
      this.onClear()
    }
  }


  onDateChange() {
    console.log(this.selectedDate)
    const strDate = dayjs(this.selectedDate).format("YYYY-MM-DD");
    this.onChange.emit(strDate);
  }

  onToday() {
    this.selectedDate = new Date();
    this.onDateChange();

  }

  onClear() {
    // dp['_service'].select(new NgbDate(1900, 1, 1));
    this.selectedDate = new Date("1900-01-01");
    setTimeout(() => {
      this.selectedDate = undefined;
      this.onChange.emit(undefined);
    }, 0);


  }

}




