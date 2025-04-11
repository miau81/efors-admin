import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
// import { MyMedia } from '../../../../../myerp-lib/dist/myerp-core/lib/components/media/media.component';
import { MyMedia, MyTranslatePipe } from 'myerp-core';



@NgModule({
  declarations: [],
  imports: [MyMedia, RouterLink, MyTranslatePipe],
  exports: [
    MyMedia,
    MyTranslatePipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    RouterLink
  ]
})
export class ShareModule { }
