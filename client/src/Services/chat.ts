import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Chat {


  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  createConversation() {
    return this.http.post(`${this.baseUrl}/create-conversation`, {}, {
      headers: this.getHeaders()
    });
  }

  sendMessage(conversationId: string, input: string) {
    return this.http.post(
      `${this.baseUrl}/${conversationId}/send-message`,
      { input },
      { headers: this.getHeaders(), responseType: 'text' } 
    );
  }

  getMessages(conversationId: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  getConversations() {
    return this.http.get<any[]>(
      `${this.baseUrl}/conversations`,
      { headers: this.getHeaders() }
    );
  }

}


