import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../Services/auth';
import { Chat } from '../../../Services/chat';
import { ChatResponse } from '../../../Dtos/chat';
import { Message } from '../../../Dtos/message';

import { ChangeDetectorRef } from '@angular/core';
import { Loading } from '../../Shared/loading/loading';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Loading],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})

export class Home implements AfterViewChecked, OnInit {
  constructor(private cdr: ChangeDetectorRef, private route: Router, private authService: Auth, private chatService: Chat){}

  loading: boolean = true;

  signOut(){
    this.loading = true;
    this.authService.logout();
    this.loading = false;
    this.route.navigate(['/']);
  }

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  opened = false;
  closed = true;

  messages: Message[] = [];
  chats: ChatResponse[] = [];
  currentConversationId: string | null = null;

  ngOnInit(): void {
      this.loading = true;
      this.chatService.getConversations().subscribe({
        next: (res)=>{
          this.chats = res;
          if(res.length>0){
            this.currentConversationId = res[res.length-1].id
            this.chatService.getMessages(this.currentConversationId!).subscribe({
              next: (res)=> {
                this.messages = res;
                this.cdr.detectChanges(); 
                this.scrollToBottom();
              },
              error: (err) => {
                console.error("Failed to fetch messages:", err);
              }
            });
            this.loading = false;
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

// rxjs ngrz, azure, b2c, brent ozar
  sendMessage(conversationId: string | null){
    const inputEl = document.querySelector('.input') as HTMLDivElement;
    if (!inputEl) return;
  
    const input = inputEl.innerText.trim();
    if (!input) return;
  
    inputEl.innerText = '';


    if (conversationId==null){
      this.chatService.createConversation().subscribe({
        next: (res)=>{
          this.currentConversationId = res.id
          this.chatService.sendMessage(res.id,input).subscribe({
            next: (response)=>{
              console.log(response)
              this.messages.push(response[0]);
              this.scrollToBottom();
              this.typeAssistantMessage(response[1]);
              this.cdr.detectChanges(); 
            }, 
            error: (err)=>{
              console.error("Failed to send message");
            }
          });

        },
        error: (err)=>{
          console.error("Failed to create conversation");
        }
      })
    }

    if(this.currentConversationId==conversationId){
      this.chatService.sendMessage(conversationId!, input).subscribe({
        next: (response)=>{
          this.messages.push(response[0]);
          this.scrollToBottom();
          this.typeAssistantMessage(response[1]);
          this.cdr.detectChanges(); 
        }, 
        error: (err)=>{
          console.error("Failed to send message");
        }
      });
    }
  }

  selectChat(conversationId: string) {
    this.currentConversationId = conversationId;
    this.chatService.getMessages(this.currentConversationId!).subscribe({
      next: (res)=> {
        this.messages = res;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Failed to fetch messages:", err);
      }
    });
  }

  trackById(index: number, msg: Message) {
    return msg.id; 
  }


  typeAssistantMessage(message: Message, speed: number = 50) {
    const typedMessage: Message = { ...message, content: '' };
    this.messages.push(typedMessage);
  
    let index = 0;
    const interval = setInterval(() => {
      if (index < message.content.length) {
        typedMessage.content += message.content[index];
        index++;
        this.cdr.detectChanges(); 
        this.scrollToBottom();

      } else {
        clearInterval(interval);
        this.scrollToBottom();

      }
    }, speed);
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer.nativeElement;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'  
    });
  }
  
}