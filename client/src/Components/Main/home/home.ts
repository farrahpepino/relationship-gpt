import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../Services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})

export class Home implements AfterViewChecked {
  constructor(private route: Router, private authService: Auth){}

  signOut(){
    this.authService.logout()
    this.route.navigate(['/']);
  }

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  opened = false;
  closed = true;

  messages = [
    { role: "user", text: "I just broke up with him" },
    { role: "agent", text: "I'm so sorry for that" }
  ];

  chats = [
    {
      id: 1,
      title: "Before Sunrise summary"
    }
  ]


  toggleSidebar(){
    this.opened = !this.opened;
  }

  toggleChats(){
    this.closed = !this.closed;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }











































































  private scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
  
}