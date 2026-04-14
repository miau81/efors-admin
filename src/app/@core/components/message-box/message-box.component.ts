import { Component, inject, input } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MyColor, MyMessageBoxOption, MyMessageBoxResponse } from '../../services/message-box.service';
import { TranslateModule } from '@ngx-translate/core';
import { MyTranslatePipe } from '../../pipes/internal-translate.pipe';
import { getTranslateJSON } from '@myerp/utils/misc';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'my-message-box',
  imports: [TranslateModule, MatDialogModule, MyTranslatePipe, MatButtonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss'
})
export class MyMessageBox {
  // Using inject()
  readonly dialogRef = inject(MatDialogRef<MyMessageBox>)
  readonly option = inject(MAT_DIALOG_DATA);

  // Class properties
  color!: MyColor;
  icon?: string;
  confirmInput?: string = '';

  translateJson(key: string) {
    return getTranslateJSON(key);
  }

  ngOnInit() {
    const opt = this.option;
    switch (opt.type) {
      case "error":
        this.color = "danger";
        this.icon = "x-circle";
        break;
      case "info":
        this.color = "primary";
        this.icon = "info-circle";
        break;
      case "question":
        this.color = "secondary";
        this.icon = "question-circle";
        break;
      case "success":
        this.color = "success";
        this.icon = "check-circle";
        break;
      case "warning":
        this.color = "warning";
        this.icon = "exclamation-circle";
        break;
      case "loading":
        this.color = "primary";
        break;
      default:
        this.color = "dark";
    }
    opt.message = opt.message?.replace(/\n/g,"<br>");
  }

  onClick(response: MyMessageBoxResponse) {
    this.dialogRef.close(response);
  }

  onConfirmInputKeyUp(event: KeyboardEvent) {
    if (event.code == 'Enter') {
      this.onConfirmKeyCheck();
    }
  }

  onConfirmKeyCheck() {
    const opt = this.option;
    if (this.confirmInput == opt.confirmKey) {
      this.dialogRef.close("confirm");
    }
  }
}
