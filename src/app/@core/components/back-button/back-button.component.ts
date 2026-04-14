import { Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'myerp-back-button',
  imports: [],
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class MyBackButton {
  // Using input() from Angular 17+
  defaultHref = input<string>('');

  // Using inject()
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  onClick() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.defaultHref()]);
    }
  }
}
