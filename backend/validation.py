from pydantic import BaseModel
from datetime import datetime
class add_Expense_data(BaseModel):
        email : str
        amount : str
        title : str
        category : str
        date : datetime
        type : str
class Register_(BaseModel):
     email : str
     password : str

class Login_(BaseModel):
       email : str
       password : str