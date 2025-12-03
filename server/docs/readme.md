## flask | mysql
*Note: dev-mode show env file*

### setup
1. install dependencies:
   - Tạo sandbox: `python -m venv venv`
   - Active sandbox: `venv\Scripts\activate`
   - Cài đặt dependencies: `pip install -r requirements.txt`
2. setup docker mysql db
   `docker-compose up -d`
3. setup db:
   - Áp dụng DB migrated: `flask db upgrade` 
   - Các thao tác migration:
      - Tạo migration: `flask db migrate -m "migration mesage"`
      - Áp dụng migration cho db: `flask db upgrade`

4. run server:
   `python app.py`

### Mô tả:
- Admin/user
- Chỉ admin tạo tk, user chỉ có login

### APIs 
#### 1. Users
- dev:
   - **`GET`** `/api/dev/create-admin`: tạo nhanh 1 tài khoản admin
- **`POST`** `/api/users`: create user (password default: "1")
   - Body: `{ "rfid_uid": "_", "email": "_" }`
- **`GET`** `/api/users?page=1&per_page=10`: get users
- **`GET`** `/api/users/<id>`: get user theo id
- **`GET`** `/api/users/me`: get crr user inf
- **`PUT`** `/api/users/<id>`: update user theo id
   - Body: `{ "full_name": "_", "rfid_uid": "_", ... }`
- **`DELETE`** `/api/users/<id>`: delete user theo id  
- auth:
   - **`POST`** `/api/login`: login
      - Body: `{ "email": "_", "password": "_" }`

