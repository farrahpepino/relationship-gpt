import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../../Services/auth';

import { environment } from '../../../environments/environment';
import { User } from '../../../Dtos/user';

declare const google: any;


@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{
  constructor(private route: Router, private http: HttpClient, private authService: Auth){}


  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: this.handleCredentialResponse.bind(this)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-auth'),
      { theme: 'filled_black', size: 'large',shape: 'rectangular' }
    );
  }

  handleCredentialResponse(response: any) {
    const token = response.credential;

    this.http.post<User>('http://localhost:8000/auth/google', { token })
      .subscribe({
        next: (res) => {
          this.authService.setUser(res);
          this.route.navigateByUrl('/home', { replaceUrl: true });
        },
        error: (err) => {
          console.error('Login failed', err);
        }
      });
  }
  
}
