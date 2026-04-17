from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import vertexai
from vertexai.generative_models import GenerativeModel, Content, Part
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ID = os.getenv("PROJECT_ID")
LOCATION = os.getenv("LOCATION")
vertexai.init(project=PROJECT_ID, location=LOCATION)

system_instruction = "You are a concise technical assistant."
model = GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=system_instruction
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message]

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    contents = []
    for msg in request.history:
        vertex_role = "model" if msg.role == "assistant" else "user"
        contents.append(Content(role=vertex_role, parts=[Part.from_text(msg.content)]))
    
    contents.append(Content(role="user", parts=[Part.from_text(request.message)]))

    def generate_chunks():
        responses = model.generate_content(contents, stream=True)
        for chunk in responses:
            if chunk.text:
                yield chunk.text

    return StreamingResponse(generate_chunks(), media_type="text/plain")