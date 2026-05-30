from pydantic import BaseModel
from datetime import datetime
class add_Expense_data(BaseModel):
        email : str
        amount : str
        title : str
        category : str
        date : datetime
        type : str