import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HeadersComponent } from '../headers/headers.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [DashboardComponent, HeadersComponent, TranslateModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  providers: [TranslatePipe],
})
export class LayoutComponent implements OnInit {
  storeData: any;

  constructor(
    private router: Router,
    private translate: TranslatePipe
  ) {}

  ngOnInit(): void {
    const retrievedObject: any = localStorage.getItem('userData');
    this.storeData = JSON.parse(retrievedObject);
    if (!this.storeData?.id) {
      this.router.navigateByUrl('/');
    }
  }
}
