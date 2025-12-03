### run

#### DEV: Chạy server local
1. setup
   - tạo sandbox: `python -m venv ./server/venv`
   - active sandbox: `./server/venv/Scripts/activate`
   - cài đặt dependencies: `pip install -r ./server/requirements.txt`
2. setup docker mysql db
   - chạy docker 
   - compose: `docker-compose -f ./server/docker-compose.yml up -d`
3. setup db:
   - áp dụng DB migrated 
   ```sh
      set FLASK_APP=server/app.py
      flask db upgrade
   ```

4. run server:
   `python ./server/app.py`

5. tạo admin API để lấy token admin:  
   `http://localhost:5000/api/dev/create-admin`
