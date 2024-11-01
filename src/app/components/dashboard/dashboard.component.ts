import { Component, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { FetchDataService } from '../../services/fetch-data.service';
import { DetailsComponent } from '../details/details.component';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { InternetService } from '../../services/internet.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatTableModule, ModalModule, NgxSpinnerModule, DetailsComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [BsModalService, TranslatePipe]
})
export class DashboardComponent implements OnInit {
  @Input() storeData: any;
  dataSource: any;
  displayedColumns: string[]= [ 'name', 'action'];
  inputData: any;

  constructor(
    private fetchService: FetchDataService,
    private spinner: NgxSpinnerService,
    public modalService: BsModalService,
    public modalRef: BsModalRef,
    public translate: TranslatePipe,
    private internetService: InternetService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getListData();
    this.fetchService.currentData$.subscribe(res => {
      this.getListData();
    })
  }

  getListData() {
    this.spinner.show();
    this.dataSource = [];
    this.fetchService.listingData({type: this.storeData.type, id: this.storeData.id}).subscribe({
      next: (res) => {
        this.dataSource = res;
        this.spinner.hide();
      },
      error: (err) => {
        this.dataSource = [];
        this.spinner.hide();
      }
    })
  }

  addData(template: TemplateRef<any>) {
    if (!this.internetService.checkInternetStatus()) return;
    this.modalRef = this.modalService.show(template); 
  }

  OpenModal(template: TemplateRef<any>, data?: any) {
    if (!this.internetService.checkInternetStatus()) return;
    this.inputData = data;
    this.modalRef = this.modalService.show(template); 
  }

  closeModal() {
    this.inputData = null;
    this.modalRef.hide();
  }

  updateTable() {
    this.inputData = null;
    this.modalRef.hide();
    this.getListData();
  }

  deleteData(element: any) {
    if (!this.internetService.checkInternetStatus()) return;
    this.spinner.show();
    this.fetchService.deleteData({type: element.type, deleteId: element.id}).subscribe({
      next: (res) => {
        this.toastr.success('Data deleted successfully', '', {
          timeOut: 2000
        });
        this.getListData();
      },
      error: (err) => {
        this.spinner.hide();
      }
    })
  }

}
