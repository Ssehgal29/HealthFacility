import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FetchDataService } from '../../services/fetch-data.service';
import { HeadersComponent } from '../headers/headers.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    TranslateModule,
    NgIf,
    NgxSpinnerModule,
    NgClass,
    HeadersComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [FetchDataService, TranslatePipe]
})
export class LoginComponent {

  form = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(
    private router: Router,
    private fetchService: FetchDataService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private translate: TranslatePipe,
  ) {}

  login() {
    if (this.form.valid) {
      this.spinner.show();
      this.fetchService.loginUser(this.form.value).subscribe({
        next: (res) => {
          if(res.length) {
            this.toastr.success('Login Successfully', '', {
              timeOut: 3000,
            });
            const storageData: any = {...res[0]};
            delete storageData.password;
            localStorage.setItem('userData', JSON.stringify(storageData));
            this.router.navigateByUrl('/dashboard');
          } else {
            this.toastr.error('Please enter valid credentials', 'Invalid Credentials', {
              timeOut: 3000,
            });
          }
          this.spinner.hide();
        },
        error: (err) => {
          this.toastr.error ('Please enter valid credentials','Invalid Credentials', {
            timeOut: 3000,
          });
          this.spinner.hide();
        }
      })
    }
  }

  errorMessage(type: String) {
    return `${type} is required.`
  }

}
