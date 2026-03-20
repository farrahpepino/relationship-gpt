import { Injectable } from '@angular/core';
import { User } from '../Dtos/user';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private user: User| null = null;

  setUser(user: User){
    this.user = user;
  }

  getUser(): User | null{
    return this.user
  }

  isLoggedIn(): boolean {
    return !!this.user;
  }

  logout() {
    this.user = null;
  }

}
