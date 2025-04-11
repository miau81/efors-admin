import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'

@Component({
  selector: 'app-myerp-dialog',
  imports: [MatDialogModule],
  templateUrl: './myerp-dialog.component.html',
  styleUrl: './myerp-dialog.component.scss'
})
export class MyerpDialogComponent {
  data = inject(MAT_DIALOG_DATA);

}
