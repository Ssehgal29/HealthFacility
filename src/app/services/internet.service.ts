import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { fromEvent, map, merge, Observable, Observer } from 'rxjs';

@Injectable()
export class InternetService {

    internetStatus: any;
    constructor(
        private toastr: ToastrService
    ) {}

    createOnline$() {
        return merge(
          fromEvent(window, 'offline').pipe(map(() => false)),
          fromEvent(window, 'online').pipe(map(() => true)),
          new Observable((sub: Observer<boolean>) => {
            sub.next(navigator.onLine);
            sub.complete();
          })
        );
      }

    setInternetStatus(status: Boolean) {
        this.internetStatus = status;
    }

    getInternetStatus() {
        return this.internetStatus;
    }

    checkInternetStatus() {
        if (!this.internetStatus) {
            this.toastr.warning('Please check your internet connection', 'Internet Connection', {
                timeOut: 2000
            });
            return false;
        }
        return true;
    }
}