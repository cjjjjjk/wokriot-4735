# web-frontend - IoT Attendance System

react typescript frontend cho hệ thống điểm danh IoT.

## cấu trúc thư mục

```
src/
├── api/              # API client và các hàm gọi API
│   ├── client.ts     # axios instance với JWT interceptor
│   └── auth.ts       # authentication APIs
├── components/       # reusable components
│   └── ProtectedRoute.tsx
├── contexts/         # react contexts
│   └── AuthContext.tsx
├── pages/            # page components
│   ├── Login.tsx
│   ├── Login.css
│   ├── Dashboard.tsx
│   └── Dashboard.css
├── types/            # typescript type definitions
│   └── index.ts
├── App.tsx           # main app với routing
├── main.tsx          # entry point
└── index.css         # global styles
```

## cài đặt

```bash
# install dependencies
npm install

# copy environment variables
cp .env.example .env
```

## chạy development server

```bash
npm run dev
```

server sẽ chạy tại: http://localhost:5173

## build production

```bash
npm run build
```

## tính năng đã triển khai

### ✅ authentication
- login page với form validation
- JWT token management
- auto redirect khi unauthorized
- protected routes
- logout functionality

### ✅ dashboard
- hiển thị thông tin user
- responsive design
- modern UI với gradient và animations

## API integration

frontend kết nối với backend API tại `http://localhost:5000/api` (có thể cấu hình trong `.env`)

### endpoints đang sử dụng:
- `POST /api/login` - đăng nhập
- `GET /api/users/me` - lấy thông tin user hiện tại

## tech stack

- **react 18** - UI library
- **typescript** - type safety
- **react-router-dom** - routing
- **axios** - HTTP client
- **vite** - build tool

## demo account

- **email**: `admin`
- **password**: `1`

## notes

- token được lưu trong localStorage
- auto refresh token chưa implement
- các tính năng khác (user management, attendance logs, etc.) sẽ được thêm sau
