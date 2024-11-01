import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { from, Observable } from 'rxjs';
import { AudioRecordingService } from '../../services/audio-recording.service';
import { FetchDataService } from '../../services/fetch-data.service';
import { InternetService } from '../../services/internet.service';



@Component({
  selector: 'app-details',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, NgxSpinnerModule, TranslateModule],
  providers: [AudioRecordingService, TranslatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  uploadNow = false;
  isPlaying = false;
  displayControls = true;
  isAudioRecording = false;
  audioRecordedTime: any;
  audioBlobUrl: any;
  audioBlob: any;
  audioName: any;
  audioStream: any;
  audioConf = { audio: true };
  @Output() closeModal = new EventEmitter<string>();
  @Output() updateTable = new EventEmitter<string>();
  @Input() inputData: any;
  form = new FormGroup({
    first_name: new FormControl('', Validators.required),
    last_name: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  storeData: any;

  constructor(
    private audioRecordingService: AudioRecordingService,
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private spinner: NgxSpinnerService,
    private fetchService: FetchDataService,
    private toastr: ToastrService,
    public translate: TranslatePipe,
    public internetService: InternetService,
    private dbService: NgxIndexedDBService,
  ) { }

  ngOnInit(): void {
    const retrievedObject: any = localStorage.getItem('userData')
    this.storeData = JSON.parse(retrievedObject);

    if (this.inputData?.audio_file_path && this.inputData?.audio_file_path.split('_')[0] === 'patients') {
      this.getAudioFile();
    }

    this.audioRecordingService.recordingFailed().subscribe(() => {
      this.isAudioRecording = false;
      this.ref.detectChanges();
    });

    this.audioRecordingService.getRecordedTime().subscribe((time) => {
      this.audioRecordedTime = time;
      this.ref.detectChanges();
    });

    this.audioRecordingService.getRecordedBlob().subscribe((data) => {

      this.audioBlob = data.blob;
      this.audioName = data.title;
      this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
      this.ref.detectChanges();
    });

    if (this.inputData) this.form.patchValue(this.inputData);
  }

  startAudioRecording() {
    if (!this.isAudioRecording) {
      this.uploadNow = true;
      this.isAudioRecording = true;
      this.audioRecordingService.startRecording();
    }
  }

  abortAudioRecording() {
    if (this.isAudioRecording) {
      this.isAudioRecording = false;
      this.audioRecordingService.abortRecording();
    }
  }

  stopAudioRecording() {
    if (this.isAudioRecording) {
      this.audioRecordingService.stopRecording();
      this.isAudioRecording = false;
    }
  }

  clearAudioRecordedData() {
    this.audioBlobUrl = null;
  }

  downloadAudioRecordedData() {
    this._downloadFile(this.audioBlob, 'audio/ogg', this.audioName);
  }

  _downloadFile(data: any, type: string, filename: string): any {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  close() {
    this.closeModal.emit();
  }

  getAudioFile() {
    this.spinner.show();
    const reqData: any = this.fetchService.getUploadFiles(this.inputData.audio_file_path);
    reqData.then(async (e: any) => {
      const t = await this.toBlob(`data:audio/wav;base64,${e.data.content}`).subscribe({
        next: (blob: any) => {
          this.audioBlob = blob;
          this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
          this.spinner.hide();
        },
        error: (err) => {
          console.log(err);
        }
      })
    });
  }

  toBlob(file: string): Observable<Blob> {
    return from(
      fetch(file)
        .then((res) => res.blob())
        .then((blob) => blob)
    );
  }

  submitData() {
    if (this.form.valid) {
      this.spinner.show();
      if (this.audioBlobUrl && this.uploadNow) {
        var reader = new FileReader();
        reader.readAsDataURL(this.audioBlob);
        const that = this;
        reader.onloadend = async function () {
          var base64data: any = reader.result;
          const base64String = base64data.split(",")[1];
          that.internetService.getInternetStatus() ? that.onlineAudio(base64String) : that.offlineAudio(base64String)
        }
      } else {
        this.internetService.getInternetStatus() ? this.savePayload() : this.offlineAudio();
      }
    }
  }

  offlineAudio(base64String?: string) {
    let payload: any = {
      ...this.form.value
    }

    payload['id'] = this.inputData?.id ? this.inputData.id : `user_${Date.now()}`;

    if (this.storeData.type === 'admin') {
      payload['type'] = 'caregiver';
    } else if (this.storeData.type === 'caregiver') {
      payload['caregiver_id'] = this.storeData.id;
      payload['type'] = 'patient';
    }

    if (base64String) {
      payload['base64String'] = base64String;
    } else if (this.inputData?.audio_file_path) {
      payload['audio_file_path'] = this.inputData?.audio_file_path;
    }

    this.dbService.add('data', payload)?.subscribe({
      next: (res) => {
        this.toastr.warning("Don't Worry! Your data has been saved locally", 'No Internet Connection', {
          timeOut: 2000
        });
        this.closeModal.emit();
        this.spinner.hide();
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onlineAudio(base64String: any, element?: any) {
    const reqData: any = this.fetchService.uploadAudioFiles(base64String);
    reqData.then((e: any) => {
      this.uploadNow = false;
      element ? this.saveIndexDBData(element) : this.savePayload(e.data.content.path);
    });
  }

  savePayload(path?: string) {
    let payload: any = {
      ...this.form.value
    }
    path ? payload['audio_file_path'] = path : this.inputData?.audio_file_path || false;
    this.inputData?.id ? payload['id'] = this.inputData.id : '';
    let apiCall: any;

    if (this.storeData.type === 'admin') {
      payload['type'] = 'caregiver';
      apiCall = this.inputData?.id
        ? this.fetchService.editCareGiver(payload)
        : this.fetchService.addCareGiver(payload)
    } else if (this.storeData.type === 'caregiver') {
      payload['caregiver_id'] = this.storeData.id;
      payload['type'] = 'patient';
      apiCall = this.inputData?.id
        ? this.fetchService.editPatients(payload)
        : this.fetchService.addPatients(payload)
    }
    apiCall.subscribe({
      next: (res: any) => {
        this.toastr.success('Data added / updated successfully', '', {
          timeOut: 3000,
        });
        this.updateTable.emit();
      },
      error: (err: any) => {
        this.toastr.error('Please try again later', '', {
          timeOut: 3000,
        });
        this.spinner.hide();
      }
    })
  }

  saveIndexDBData(element: any) {
    let apiCall: any;
    if (element.type === 'caregiver') {
      apiCall = element?.id
        ? this.fetchService.editCareGiver(element)
        : this.fetchService.addCareGiver(element)
    } else if (element.type === 'caregiver') {
      apiCall = element?.id
        ? this.fetchService.editPatients(element)
        : this.fetchService.addPatients(element)
    }
    apiCall.subscribe({
      next: (res: any) => {
        this.toastr.success('Data added / updated successfully', '', {
          timeOut: 3000,
        });
        this.updateTable.emit();
      },
      error: (err: any) => {
        this.toastr.error('Please try again later', '', {
          timeOut: 3000,
        });
        this.spinner.hide();
      }
    })
  }

  ngOnDestroy(): void {
    this.abortAudioRecording();
  }

}
