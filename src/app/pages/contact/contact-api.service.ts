import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConsultationForm } from '../../interfaces';

export interface ContactSubmitResponse {
  id: string;
  reference: string;
  notificationDelivered: boolean;
  clientEmailDelivered?: boolean;
  warning?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactApiService {
  private readonly http = inject(HttpClient);
  private readonly contactUrl = `${environment.apiUrl.replace(/\/+$/, '')}/api/contact`;

  submit(form: ConsultationForm, turnstileToken = ''): Promise<ContactSubmitResponse> {
    return firstValueFrom(
      this.http.post<ContactSubmitResponse>(this.contactUrl, { ...form, turnstileToken }).pipe(timeout(15_000))
    );
  }
}
