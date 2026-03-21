import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ChatResponse } from '../Dtos/chat';
import { Observable } from 'rxjs';
import { Message } from '../Dtos/message';
import { forkJoin } from 'rxjs';
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

  createConversation(): Observable<ChatResponse>  {
    return this.http.post<ChatResponse>(`${this.baseUrl}/create-conversation`, {}, {
      headers: this.getHeaders()
    });
  }

  sendMessage(conversationId: string, input: string): Observable<Message[]>{
    return this.http.post<Message[]>(
      `${this.baseUrl}/${conversationId}/send-message`,
      { input },
      { headers: this.getHeaders() } 
    );
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${this.baseUrl}/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
  }

  getConversations(): Observable<ChatResponse[]> {
    return this.http.get<ChatResponse[]>(
      `${this.baseUrl}/conversations`,
      { headers: this.getHeaders() }
    );
  }

  deleteConversation(id: string) {
    return forkJoin([
      this.http.delete(`${this.baseUrl}/conversation/${id}`, {
        headers: this.getHeaders()
      }),
      this.http.delete(`${this.baseUrl}/messages/${id}`, {
        headers: this.getHeaders()
      })
    ]);
  }
}


