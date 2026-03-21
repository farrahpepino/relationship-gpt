import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../Services/auth';
import { Chat } from '../../../Services/chat';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})

export class Home implements AfterViewChecked, OnInit {
  constructor(private route: Router, private authService: Auth, private chatService: Chat){}

  signOut(){
    this.authService.logout()
    this.route.navigate(['/']);
  }

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  opened = false;
  closed = true;

  messages: any[] = [];
  chats: any[] = [];
  currentConversationId: string | null = null;

  ngOnInit(): void {
      this.chatService.getConversations().subscribe({
        next: (res)=>{
          this.chats = res;
          if(res.length>0){
            this.currentConversationId = res[res.length-1].id
            this.chatService.getMessages(this.currentConversationId!).subscribe({
              next: (res)=> {
                console.log(res)
              },
              error: (err) => {
                console.error("Failed to fetch messages:", err);
              }
            });
          }
        },
        error: (err)=>{
          console.error("Failed to fetch conversations:", err);
        }
      });
      
  }

  toggleSidebar(){
    this.opened = !this.opened;
  }

  toggleChats(){
    this.closed = !this.closed;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  sendMessage(){

    

    // create conversation if no chats ,
    // send message
  }










































































  private scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
  
}