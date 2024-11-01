import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-headers',
  standalone: true,
  imports: [NgIf, FormsModule, TranslateModule],
  templateUrl: './headers.component.html',
  styleUrl: './headers.component.scss',
  providers: [TranslatePipe]
})
export class HeadersComponent implements OnInit {
  storeData: any;
  i18nLang: any;
  constructor(
    private router: Router,
    public translate: TranslatePipe,
    public translateS: TranslateService
  ) { }

  ngOnInit(): void {
    const retrievedObject: any = localStorage.getItem('userData');
    this.storeData = JSON.parse(retrievedObject);
    this.i18nLang = localStorage.getItem('i18nLang');
  }

  onChange(event: Event) {
    const selectedVal = (event.target as HTMLInputElement).value
    this.translateS.use(selectedVal);
    localStorage.setItem('i18nLang', selectedVal);
  }

  logout() {
    localStorage.removeItem('userData');
    this.router.navigateByUrl('/');
  }
}
