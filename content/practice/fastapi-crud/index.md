---
title: "CRUD API với FastAPI"
categories: ["practice", "backend"]
tags: ["fastapi", "python", "rest", "api"]
---

## 1. Mục tiêu

- Xây dựng REST API CRUD cơ bản
- Hiểu cách FastAPI xử lý request / response
- Nắm được routing và schema dữ liệu

---

## 2. Chuẩn bị môi trường

Yêu cầu:

- Python >= 3.9

Tạo virtual environment và cài đặt FastAPI:

```bash
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn
```

---

## 3. Tạo ứng dụng FastAPI cơ bản

Tạo file `main.py`:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello FastAPI"}
```

Chạy server:

```bash
uvicorn main:app --reload
```

Truy cập:

- http://127.0.0.1:8000
- http://127.0.0.1:8000/docs

---

## 4. Mô hình dữ liệu (Schema)

```python
from pydantic import BaseModel

class Item(BaseModel):
    id: int
    name: str
```

---

## 5. CRUD API (in-memory)

```python
items: list[Item] = []

@app.post("/items", response_model=Item)
def create_item(item: Item):
    items.append(item)
    return item

@app.get("/items", response_model=list[Item])
def get_items():
    return items

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    for item in items:
        if item.id == item_id:
            return item
    return {"error": "Item not found"}

@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, updated_item: Item):
    for index, item in enumerate(items):
        if item.id == item_id:
            items[index] = updated_item
            return updated_item
    return {"error": "Item not found"}

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    for index, item in enumerate(items):
        if item.id == item_id:
            items.pop(index)
            return {"message": "Deleted"}
    return {"error": "Item not found"}
```

---

## 6. Kiểm tra API

- POST `/items`
- GET `/items`
- GET `/items/{id}`
- PUT `/items/{id}`
- DELETE `/items/{id}`

Sử dụng Swagger UI tại `/docs`.

---

## 7. Giới hạn

- In-memory
- Không database
- Không authentication
- Không xử lý concurrency

---

## 8. Hướng mở rộng

- Database (PostgreSQL / SQLite)
- ORM (SQLAlchemy)
- JWT Authentication
- Docker