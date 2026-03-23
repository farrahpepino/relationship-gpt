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
  expandedChatId: string | null = null;

  toggleActions(id: string) {
    if (this.expandedChatId === id) {
      this.expandedChatId = null; 
    } else {
      this.expandedChatId = id; 
    }
  }

  messages: Message[] = [];
  chats: ChatResponse[] = [];
  currentConversationId: string | null = null;

  ngOnInit(): void {
      this.loading = true;
      this.chatService.getConversations().subscribe({
        next: (res)=>{
          this.chats = res;
        },
        error: (err)=>{
          console.error("Failed to fetch conversations:", err);
        }
      });  
      this.loading = false;    
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

updateChatTitle(chatId: string, newTitle: string) {
  const chat = this.chats.find(c => c.id === chatId);
  if (!chat) return;
  chat.title = newTitle;
  this.cdr.detectChanges(); 
}

typeAssistantChatTitle(chat: ChatResponse, speed: number = 50) {
  const originalTitle = chat.title;
  chat.title = ''; 

  let index = 0;
  const interval = setInterval(() => {
    if (index < originalTitle.length) {
      chat.title += originalTitle[index];
      index++;
      this.cdr.detectChanges(); 
    } else {
      clearInterval(interval);
      chat.last_opened = new Date(); 
      this.cdr.detectChanges();
    }
  }, speed);
}

  sendMessage(conversationId: string | null){
    const inputEl = document.querySelector('.input') as HTMLDivElement;
    if (!inputEl) return;
  
    const input = inputEl.innerText.trim();
    if (!input) return;
  
    inputEl.innerText = '';

    this.cdr.detectChanges(); 
    this.messages.push({
      id: null,
      conversation_id: conversationId,
      content: input,
      role: 'user',
      created_at: new Date()
    })

    if (conversationId==null){
      this.chatService.createConversation().subscribe({
        next: (res)=>{
          this.currentConversationId = res.id;
          this.chatService.sendMessage(res.id,input).subscribe({
            next: (response)=>{
              console.log(response)
              this.cdr.detectChanges(); 
              // this.messages.push(response[0]);
              this.scrollToBottom();
              this.typeAssistantMessage(response[1]);
              this.cdr.detectChanges(); 
              this.chats = [];
              this.chatService.getConversations().subscribe({
                next: (res)=>{
                  this.chats = res;
                  this.typeAssistantChatTitle(this.chats[0])
                  this.cdr.detectChanges(); 
                },
                error: (err)=>{
                  console.error("Failed to fetch chats:", err)
                }
              })
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
          this.cdr.detectChanges(); 
          // this.messages.push(response[0]);
          this.scrollToBottom();
          this.typeAssistantMessage(response[1]);
          this.cdr.detectChanges(); 
        }, 
        error: (err)=>{
          console.error("Failed to send message");
        }
      });

      
    }

    if (this.messages.length>=3 && this.messages.length==4 ){
      this.chats = [];
      this.chatService.getConversations().subscribe({
        next: (res)=>{
          this.chats = res;
          this.typeAssistantChatTitle(this.chats[0])
          this.cdr.detectChanges(); 
        },
        error: (err)=>{
          console.error("Failed to fetch chats:", err)
        }
      })
    }
  }

  selectChat(conversationId: string | null) {
    this.currentConversationId = conversationId;
    this.messages = [];
    if (conversationId!=null){
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
    
  }

  deleteConversation(id: string): void {
    this.chatService.deleteConversation(id).subscribe({
      next: () => {
        this.chats = this.chats.filter(chat => chat.id !== id);
  
        if (this.currentConversationId === id) {
          this.currentConversationId = null;
          this.messages = [];
        }
  
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Failed to delete conversation:", err);
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