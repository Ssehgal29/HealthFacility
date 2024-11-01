import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Octokit } from "octokit";
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class FetchDataService {
    apiUrl = 'https://671e6dac1dfc4299198246a8.mockapi.io/api/v1';
    octokit = new Octokit({
        auth: ""
    });
    private dataSubject = new BehaviorSubject<boolean>(false); // Initial value: false
    currentData$ = this.dataSubject.asObservable();

    constructor(private http: HttpClient) {}

    loginUser(data: any) {
        return this.http.get<any[]>(`${this.apiUrl}/users`, {params: data})
    }

    listingData(data: any) {
        return data.type === 'admin' ? 
            this.http.get<any[]>(`${this.apiUrl}/users`, {params: {type: 'caregiver'}})
            : this.http.get<any[]>(`${this.apiUrl}/patients`, {params: {caregiver_id: data.id}})
    }

    deleteData(data: any) {
        return data.type === 'patient' ? 
            this.http.delete<any[]>(`${this.apiUrl}/patients/${data.deleteId}`)
            : this.http.delete<any[]>(`${this.apiUrl}/users/${data.deleteId}`)
    } 

    addCareGiver(payload: any) {
        return this.http.post<any[]>(`${this.apiUrl}/users`, payload)
    }
    editCareGiver(payload: any) {
        return this.http.put<any[]>(`${this.apiUrl}/users/${payload.id}`, payload)
    }

    addPatients(payload: any) {
        return this.http.post<any[]>(`${this.apiUrl}/patients`, payload)
    }
    editPatients(payload: any) {
        return this.http.put<any[]>(`${this.apiUrl}/patients/${payload.id}`, payload)
    }

    uploadAudioFiles(base64data: string) {
        return this.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: 'Ssehgal29',
            repo: 'HealthFacility',
            branch: 'audio_files',
            path: `patients_${Date.now()}`,
            message: 'upload file',
            sha: "4f8a0fd8ab3537b85a64dcffa1487f4196164d78",
            content: base64data
          })
    }

    getUploadFiles(audio_file_path: string) {
        return this.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: 'Ssehgal29',
            repo: 'HealthFacility',
            ref: 'audio_files',
            path: audio_file_path,
                  headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
          })
    }

    updateTable(data: boolean) {
        this.dataSubject.next(data);
    }
    
}