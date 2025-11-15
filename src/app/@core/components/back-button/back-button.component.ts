import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'myerp-back-button',
  imports: [],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class MyBackButton {

  @Input() defaultHref:string='';
  constructor(private router: Router, private location: Location) {

  }

  onClick() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.defaultHref]);
    }
  }
}
