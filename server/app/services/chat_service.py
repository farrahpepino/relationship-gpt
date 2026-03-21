from openai import OpenAI
from dotenv import load_dotenv
import os
from uuid import uuid4
from fastapi import HTTPException
from datetime import datetime, timedelta

from app.repositories.message_repository import Message_Repository
from app.repositories.conversation_repository import Conversation_Repository
from app.models.message import Message
from app.dtos.message_out import Message_Out

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
class Chat_Service:
    def __init__(self):
        self.message_repository = Message_Repository()
        self.conversation_repository = Conversation_Repository() 
        
    def create_conversation(self, db, user_id):
        return self.conversation_repository.create(db, user_id)

    def get_conversation(self, db, user_id, conversation_id):
        convo = self.conversation_repository.get_conversation(db, conversation_id)

        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if convo.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        return convo

    def get_messages(self, db, user_id, conversation_id):
        self.get_conversation(db, user_id, conversation_id)
        return self.message_repository.get_messages(db, conversation_id)

    def get_conversations(self, db, user_id):
        return self.conversation_repository.get_conversations(db, user_id)

    def send_message(self, db, user_id, conversation_id, user_input):
        conversation = self.get_conversation(db, user_id, conversation_id)

        messages = self.message_repository.get_messages(db, conversation_id)

        messages = messages[-10:]

        history = [
            {"role": m.role, "content": m.content}
            for m in messages
        ]

        history.append({"role": "user", "content": user_input})

        try:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=history
            )

            reply = response.output_text

        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail="AI failed")

        user_msg = Message(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role="user",
            content=user_input,
            created_at = datetime.now() 
        )
        self.message_repository.create(db,user_msg )

        assistant_msg = Message(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role="assistant",
            content=reply,
            created_at = datetime.now() + timedelta(seconds=1)
        )
        self.message_repository.create(db, assistant_msg)

        if len(messages) + 2 >= 4:
            self.generate_title(db, conversation_id)

        return [
            Message_Out.from_orm(user_msg),
            Message_Out.from_orm(assistant_msg)
        ]

    def generate_title(self, db, conversation_id):
        messages = self.message_repository.get_messages(db, conversation_id)

        messages = messages[-10:] 

        conversation_text = "\n".join([m.content for m in messages])

        try:
            response = client.responses.create(
                model="gpt-4o-mini",
                input=[
                    {
                        "role": "system",
                        "content": "Generate a short title (max 6 words) for this conversation. When you generate a title, please do not add double or single quotes like usual titles are. It is for a website."
                    },
                    {
                        "role": "user",
                        "content": conversation_text
                    }
                ]
            )

            title = response.output_text

            self.conversation_repository.update_title(db, conversation_id, title)

        except Exception as e:
            print("Title generation failed:", e)

        return title
    
    def delete_messages(self, db, conversation_id):
        self.message_repository.delete_messages(db, conversation_id)
        
    def delete_conversation(self, db, id):
        self.conversation_repository.delete_conversation(db, id)