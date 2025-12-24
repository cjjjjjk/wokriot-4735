# docker deployment guide

## overview
hướng dẫn triển khai flask server với mysql sử dụng docker compose.

## prerequisites
- docker
- docker compose

## quick start

### 1. build và start services
```bash
docker compose up --build
```

hoặc chạy ở chế độ background:
```bash
docker compose up -d --build
```

### 2. stop services
```bash
docker compose down
```

### 3. stop và xóa volumes (xóa database)
```bash
docker compose down -v
```

## services

### mysql database
- **container name**: `mysql_iot_container`
- **port**: `3306`
- **database**: `iot-db`
- **username**: `admin`
- **password**: `admin`

### flask web server
- **container name**: `flask_iot_container`
- **port**: `5000`
- **api endpoint**: `http://localhost:5000/api`

## features

### automatic database migration
khi container flask khởi động, nó sẽ tự động:
1. đợi mysql sẵn sàng
2. chạy database migrations (`flask db upgrade`)
3. khởi động flask application

### health checks
mysql service có health check để đảm bảo database sẵn sàng trước khi flask server khởi động.

## useful commands

### view logs
```bash
# view all logs
docker compose logs

# view flask logs
docker compose logs web

# view mysql logs
docker compose logs db

# follow logs
docker compose logs -f web
```

### rebuild containers
```bash
docker compose up --build --force-recreate
```

### access mysql container
```bash
docker exec -it mysql_iot_container mysql -u admin -padmin iot-db
```

### access flask container
```bash
docker exec -it flask_iot_container bash
```

### run flask commands inside container
```bash
# create new migration
docker exec -it flask_iot_container flask db migrate -m "migration message"

# apply migrations
docker exec -it flask_iot_container flask db upgrade
```

## environment variables

environment variables được định nghĩa trong file `.env.docker`:
- `DATABASE_URL`: connection string cho mysql
- `SECRET_KEY`: flask secret key
- `JWT_SECRET_KEY`: jwt secret key
- `JWT_EXPIRATION_HOURS`: jwt token expiration time
- `MQTT_BROKER_URL`: mqtt broker url
- `MQTT_BROKER_PORT`: mqtt broker port

## troubleshooting

### container không khởi động
```bash
# check logs
docker compose logs

# rebuild containers
docker compose up --build --force-recreate
```

### database connection error
```bash
# check mysql is running
docker compose ps

# check mysql logs
docker compose logs db

# restart services
docker compose restart
```

### port already in use
nếu port 3306 hoặc 5000 đã được sử dụng, bạn có thể thay đổi trong `docker-compose.yaml`:
```yaml
ports:
  - "3307:3306"  # change host port to 3307
```

## development mode

để development với hot reload, volume mount đã được cấu hình:
```yaml
volumes:
  - .:/app
```

mọi thay đổi trong code sẽ tự động reload flask application.

## production deployment

để deploy production, cập nhật `.env.docker`:
- thay đổi `SECRET_KEY` và `JWT_SECRET_KEY` thành giá trị bảo mật
- set `FLASK_ENV=production`
- cập nhật mysql credentials
