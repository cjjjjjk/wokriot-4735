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
