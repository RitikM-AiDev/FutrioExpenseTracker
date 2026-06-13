from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()
import os

llm = ChatOpenAI(
    api_key=os.getenv("API"),
    base_url=os.getenv("BASE"),
    model="gemini-2.5-flash-lite",
    temperature=0.0
)

