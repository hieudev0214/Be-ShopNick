# ShopNick Backend - API Hệ Thống Bán Tài Khoản Game Tự Động

Đây là kho lưu trữ mã nguồn (Repository) Backend của dự án **Shop Bán Tài Khoản Game Tự Động**, được xây dựng bằng các công nghệ NestJS, PostgreSQL và Prisma ORM.

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** NestJS (TypeScript)
- **Cơ sở dữ liệu:** PostgreSQL (Chạy trên Docker)
- **ORM:** Prisma
- **Xác thực người dùng:** JWT (JSON Web Tokens) & Passport
- **Tài liệu hóa API:** Swagger UI

## ✨ Các Tính Năng Chính Đã Triển Khai

- **Quản lý xác thực (Authentication):** Xử lý luồng Đăng nhập, Đăng xuất và Kiểm tra danh tính người dùng bảo mật thông qua mã JWT token đính kèm ở Header.
- **Quản lý đơn hàng (Order Management):** Phát triển tính năng thanh toán hàng loạt (gửi lên mảng `accountIds`), xử lý giao dịch đồng bộ bằng Prisma `$transaction` giúp đảm bảo tính toàn vẹn dữ liệu và chống lỗi bất đồng bộ số dư ví.
- **Hệ thống API Admin:** Cung cấp các endpoint bảo mật cho trang quản trị bao gồm: quản lý chuyên mục game, theo dõi danh sách tài khoản đã bán và tổng hợp dữ liệu thống kê doanh thu của shop.
- **Bảo mật hệ thống:** Tích hợp bộ lọc kiểm thử dữ liệu đầu vào (Payload Validation) chặt chẽ nhằm ngăn chặn việc giả mạo giá tiền từ phía Frontend.

## 🌐 Tài Liệu API (API Documentation)

Toàn bộ hệ thống API đã được tài liệu hóa trực quan bằng Swagger UI. Bạn có thể truy cập và kiểm thử các endpoint trực tuyến tại:
👉 **Link Swagger API thực tế:** [https://be-shopnick.onrender.com/api/docs](https://be-shopnick.onrender.com/api/docs)

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Bản sao mã nguồn (Clone project)

git clone [https://github.com/hieudev0214/Be-ShopNick.git](https://github.com/hieudev0214/Be-ShopNick.git)
cd Be-ShopNick

### 2. Cài đặt các thư viện phụ thuộc

npm install

### 3. Thiết lập Cơ sở dữ liệu (Qua Docker)

docker run --name pg_acc-game -e POSTGRES_USER=user_acc-game -e POSTGRES_PASSWORD=password_acc-game -e POSTGRES_DB=db_acc-game -p 5435:5432 -d postgres

### 4. Cấu hình biến môi trường

Tạo một file .env tại thư mục gốc của dự án (Tham khảo cấu trúc từ file .env.example) và điền thông số cấu hình thực tế

### 5. Khởi tạo Cơ sở dữ liệu với Prisma

# Tạo mã nguồn Prisma Client

npx prisma generate

# Chạy migration để đồng bộ bảng vào Database

npx prisma migrate dev

# Đẩy trực tiếp cấu trúc schema vào DB (Phương án thay thế nhanh)

npx prisma db push

### 6. Khởi chạy Ứng dụng

npm run start:dev

### 7. Kiểm tra dữ liệu trực quan

npx prisma studio
