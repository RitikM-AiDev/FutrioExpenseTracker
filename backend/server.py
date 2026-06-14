from fastapi import FastAPI,UploadFile,File
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from datetime import datetime,timedelta
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from validation import add_Expense_data
from paddleocr import PaddleOCR
from pydantic import BaseModel

load_dotenv()
app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR,exist_ok=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = db_client["Futrio-Expense-Tracker"]
users_collection = db["users"]
transaction_collection = db["transactions"]



@app.post("/addExpense")
async def add_expense(data: add_Expense_data):
    try:
        user = await transaction_collection.find_one({"email" : data.email})
        if user:
            await transaction_collection.update_one(
                {"email" : data.email},
                {
                    "$push" : {
                            "transactions" :  {
                            "title" : data.title,
                            "amount" : data.amount,
                            "date" : data.date,
                            "category" : data.category,
                            "type" : data.type
                        }
                    }
                }
                )
        else:
            await transaction_collection.insert_one(
                {
                    "email" : data.email,
                    "transactions" : [
                        {
                            "title" : data.title,
                            "amount" : data.amount,
                            "date" : data.date,
                            "category" : data.category,
                            "type" : data.type
                        }
                    ]

                    },

                )
            return {
         "message" : "Succesfully Updated!",
            }
    except Exception as e:
            return HTTPException(
                 status_code=404,
                 detail="Some Error Occured"
            )
    



@app.get("/transactions/daily/{email}")
async def get_transactions_daily(email : str):
    try:
        daily_array = []
        user = await transaction_collection.find_one(
            {"email" : email},
              {"_id" : 0, "transactions" : 1}
            )

        if not user:
            return {
                "transactions" : []
            }
        now = datetime.now()
        daily = now - timedelta(days=1)
        for t in user["transactions"]:
             if t["date"] >= daily:
                  daily_array.append(t)
        return {
            "transactions" : daily_array[::-1]
        }
    except Exception as e:
         print(e)
         raise HTTPException(
              status_code=500,
              detail="Error Occured"
         )
    
@app.get("/transactions/weekly/{email}")
async def get_transactions_weekly(email : str):
    try:
        week_array = []
       
        user = await transaction_collection.find_one(
            {"email" : email},
             {"_id" : 0, "transactions" : 1}
            )
        now = datetime.now()
        week_ = now - timedelta(days=7)
        if not user:
            return {
                "transactions" : []
            }
        for t in user["transactions"]:
                if t["date"] >= week_:
                     week_array.append(t)
        return {
            "transactions" : week_array[::-1]
        }
    except Exception as e:
         print(e)
         raise HTTPException(
              status_code=500,
              detail="Error Occured"
         )
    
@app.get("/transactions/monthly/{email}")
async def get_transactions_monthly(email : str):
    try:
        monthly_array = []
        user = await transaction_collection.find_one(
            {"email" : email},
            {"_id" : 0, "transactions" : 1}
            )
        if not user:
            return {
                "transactions" : []
            }
        now = datetime.now()
        year_ = now - timedelta(days=31)
        for t in user["transactions"]:
                if t["date"] >= year_:
                     monthly_array.append(t)
        return {
            "transactions" : monthly_array[::-1]
        }
    except Exception as e:
         raise HTTPException(
              status_code=500,
              detail="Error Occured"
         )
    
@app.get("/transactions/history/{email}")
async def get_transactions_history(email : str):
    try:
        user = await transaction_collection.find_one(
            {"email" : email},
            {"_id" : 0, "transactions" : 1}
            )
        credited = await transaction_collection.aggregate([
             {"$match" : {"email" : email}},
             {"$unwind" : "$transactions"},
             {"$match" : {"transactions.type" : "credit"}},
             {"$group" : {
                  "_id" : None,
                  "total_credit" : {"$sum" : {"$toInt" : "$transactions.amount"}}
             }}
        ]).to_list(1)
        total_credit = credited[0]["total_credit"] if credited else 0
        print(total_credit)
        debited = await transaction_collection.aggregate([
             {"$match" : {"email" : email}},
              {"$unwind" : "$transactions"},
              {"$match" : {"transactions.type" : "debit"}},
              {"$group" : {
                   "_id" : None,
                   "total_debit" : {
                        "$sum" : {"$toInt" : "$transactions.amount"}
                   }
              }}
        ]).to_list(1)
        total_debit = debited[0]["total_debit"] if debited else 0
        print(total_debit)
        food_category = await transaction_collection.aggregate([
             {"$match" : {"email" : email}},
              {"$unwind" : "$transactions"},
              {"$match" : {"transactions.category" : "Food & Dining"}},
              {"$group" : {
                   "_id" : None,
                   "total_debit" : {
                        "$sum" : {"$toInt" : "$transactions.amount"}
                   }
              }}
        ]).to_list(1)
        food_category_amnt = food_category[0]["total_debit"] if food_category else 0
        print(food_category_amnt)
        transportcategory = await transaction_collection.aggregate([
             {"$match" : {"email" : email}},
              {"$unwind" : "$transactions"},
              {"$match" : {"transactions.category" : "Transport"}},
              {"$group" : {
                   "_id" : None,
                   "total_debit" : {
                        "$sum" : {"$toInt" : "$transactions.amount"}
                   }
              }}
        ]).to_list(1)
        transport_category_amnt = transportcategory[0]["total_debit"] if transportcategory else 0
        print(transport_category_amnt)
        Shopping_category = await transaction_collection.aggregate([
             {"$match" : {"email" : email}},
              {"$unwind" : "$transactions"},
              {"$match" : {"transactions.category" : "Shopping"}},
              {"$group" : {
                   "_id" : None,
                   "total_debit" : {
                        "$sum" : {"$toInt" : "$transactions.amount"}
                   }
              }}
        ]).to_list(1)
        shopping_category_amnt = Shopping_category[0]["total_debit"] if Shopping_category else 0
        print(shopping_category_amnt)
        Entertainment_category = await transaction_collection.aggregate([
     {"$match" : {"email" : email}},
     {"$unwind" : "$transactions"},
     {"$match" : {"transactions.category" : "Entertainment"}},
     {"$group" : {
          "_id" : None,
          "total_debit" : {
               "$sum" : {"$toInt" : "$transactions.amount"}
          }
     }}
]).to_list(1)

        entertainment_category_amnt = Entertainment_category[0]["total_debit"] if Entertainment_category else 0
        print(entertainment_category_amnt)


        Health_category = await transaction_collection.aggregate([
            {"$match" : {"email" : email}},
            {"$unwind" : "$transactions"},
            {"$match" : {"transactions.category" : "Health"}},
            {"$group" : {
                "_id" : None,
                "total_debit" : {
                    "$sum" : {"$toInt" : "$transactions.amount"}
                }
            }}
        ]).to_list(1)

        health_category_amnt = Health_category[0]["total_debit"] if Health_category else 0
        print(health_category_amnt)


        Utilities_category = await transaction_collection.aggregate([
            {"$match" : {"email" : email}},
            {"$unwind" : "$transactions"},
            {"$match" : {"transactions.category" : "Utilities"}},
            {"$group" : {
                "_id" : None,
                "total_debit" : {
                    "$sum" : {"$toInt" : "$transactions.amount"}
                }
            }}
        ]).to_list(1)

        utilities_category_amnt = Utilities_category[0]["total_debit"] if Utilities_category else 0
        print(utilities_category_amnt)
        balance = total_credit - total_debit
        if not user:
            return {
                "transactions" : [],
                "Credited" : 0,
                "Debited" : 0,
                "Balance" : 0,
                "Food & dinner": 0,
                "Transport": 0,
                "Utilites": 0,
                "Shopping": 0,
                "entertainment": 0,
                "health": 0
}
                
        return {
            "transactions" : user["transactions"][::-1],
            "Credited" : total_credit,
            "Debited" : total_debit,
            "Balance" : balance,
            "Food & dinner" : food_category_amnt,
            "Transport" : transport_category_amnt,
            "Utilites" : utilities_category_amnt,
            "Shopping"  :shopping_category_amnt,
            "entertainment" : entertainment_category_amnt,
            "health" : health_category_amnt
        }
    except Exception as e:
         print(e)
         raise HTTPException(
              status_code=500,
              detail="Error Occured"
         )
    

import shutil
from paddle_ import analysis_image
from result_agent import generate_final_json
from datetime import timezone


@app.post("/upload/image")
async def upload_image(image : UploadFile = File(...)):
        file_path = os.path.join(UPLOAD_DIR,image.filename)
        with open(file_path,"wb") as buffer:
             shutil.copyfileobj(image.file, buffer)
        text = analysis_image(file_path)
        final_result = generate_final_json(text, "hello@gmail.com")
        for i in final_result:
              await transaction_collection.update_one(
            {"email": i["email"]},  
            {
                "$push": {
                    "transactions": {
                        "title": i["title"],
                        "amount": i["amount"],
                        "date": datetime.now(timezone.utc),
                        "category": i["category"],
                        "type": "debit"
                    }
                }
            },
            upsert=True
        )
        print(final_result)
        # os.remove(file_path)
        return {
             "message": "Image saved successfully",
            "filename": image.filename
        }

from passlib.context import CryptContext
hash_func = CryptContext(schemes=["argon2"], deprecated="auto")
def hash_pass(passowrd):
     hashed_pass = hash_func.hash(passowrd)
     return hashed_pass

def verify_hash(user_pass,stored_pass):
     isverified = hash_func.verify(user_pass ,stored_pass)
     return isverified

from validation import Register_,Login_
@app.post("/futrio/register")
async def register(data : Register_):
        print(data.password)
        user = await users_collection.find_one({"email" : data.email})
        if not user:
            password = hash_pass(data.password)
            await users_collection.insert_one({
                  "email" : data.email ,
                 "password" : password
                 })
            return {
                 "message" : "Data Insertion Successful"
            }
        else:
             raise HTTPException(
                  status_code=409,
                  detail="User already Exists"
             )


@app.post("/futrio/login")
async def register(data : Login_):
        user = await users_collection.find_one({"email" : data.email})
        if user:
            stored_pass = user["password"]
            entered_pass = data.password
            isverified = verify_hash(entered_pass,stored_pass)
            if isverified:
                return {
                    "message" : "Data Insertion Successful"
                }
            else:
                 raise HTTPException(
                      status_code=500,
                      detail="Password Incorrect"
                 )
        else:
             raise HTTPException(
                  status_code=409,
                  detail="User Not Found"
             )
     