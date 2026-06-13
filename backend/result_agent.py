from LLM import llm
from langchain_core.messages import SystemMessage, HumanMessage
import json

def generate_final_json(BILL_TEXT_HERE: str, email: str) -> list:

    messages = [
        SystemMessage(content=f"""
You are an intelligent bill extraction assistant.
CRITICAL RULES:
- Output ONLY raw JSON
- Do NOT use ``` or ```json
- Do NOT add explanations
- Do NOT wrap output in markdown
- Start output with [ and end with ]

Return ONLY a valid JSON array of objects.

Each object must follow this format:
{{
  "title": string,
  "amount": number,
  "type": string,
  "date": "ISO 8601 timestamp",
  "category": one of:
    - Food & Dining
    - Transport
    - Shopping
    - Entertainment
    - Health
    - Utilities
    - Credit,
  "email": "{email}"
}}

RULES:
- Extract clean title and amount from bill text
- Category must be from allowed list only
- Return ONLY JSON array, no explanation
"""),

        HumanMessage(content=f"""
Extract structured expenses from this bill text:

{BILL_TEXT_HERE}
""")
    ]
    result = llm.invoke(messages)
    print(result.content)
    return json.loads(result.content)