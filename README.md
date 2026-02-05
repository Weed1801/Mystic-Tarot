# Mystic Tarot 🔮

Ứng dụng xem bói Tarot huyền bí tích hợp trí tuệ nhân tạo (AI/Gemini) để luận giải chi tiết ý nghĩa các lá bài cho người dùng.

## 🌟 Tính năng chính

- **Trải bài Tarot 3 lá**: Xem về Quá khứ, Hiện tại, và Tương lai.
- **Luận giải AI**: Sử dụng Google Gemini để phân tích ý nghĩa các lá bài dựa trên câu hỏi của người dùng.
- **Hiệu ứng kĩ xảo (Visuals)**: Giao diện đậm chất huyền bí với các animation mượt mà (Framer Motion).
- **Hệ thống tài khoản**: Đăng ký, đăng nhập để lưu trữ lịch sử xem bói.
- **Nhật ký hành động (Action Items)**: Lưu lại các lời khuyên từ quẻ bói thành danh sách việc cần làm.

## 🛠 Công nghệ sử dụng

### Backend (`/TarotApi`)
- **Framework**: .NET 9 Web API
- **Database**: PostgreSQL (Supabase)
- **ORM**: Entity Framework Core
- **AI Integration**: Google Gemini API

### Frontend (`/TarotWeb`)
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks / Context

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Yêu cầu hệ thống
- .NET 9 SDK
- Node.js (v18+)
- PostgreSQL (hoặc tài khoản Supabase)

### 2. Thiết lập Backend
Di chuyển vào thư mục API:
```bash
cd TarotApi
```

Cập nhật chuỗi kết nối Database và API Keys trong `appsettings.json` (hoặc tạo `appsettings.Development.json` dựa trên `appsettings.Example.json`).

Chạy ứng dụng:
```bash
dotnet run
```
Backend sẽ chạy tại: `http://localhost:5164` (hoặc cổng cấu hình tương ứng).

### 3. Thiết lập Frontend
Di chuyển vào thư mục Web:
```bash
cd TarotWeb
```

Cài đặt các thư viện:
```bash
npm install
```

Chạy development server:
```bash
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`.

## 📂 Cấu trúc dự án

- `/TarotApi`: Chứa mã nguồn Backend (.NET API).
- `/TarotWeb`: Chứa mã nguồn Frontend (React).
- `/tools`: Các công cụ hỗ trợ (ví dụ: script đổi tên file ảnh).

## 📝 Ghi chú
- Đảm bảo bạn đã có API Key của Google Gemini và cấu hình nó trong Backend.
- Dự án sử dụng mô hình Database First hoặc Code First tùy thuộc vào cấu hình EF Core của bạn (hiện tại đang hướng tới Code First với Migrations). 

Dự án được xây dựng bởi Nguyễn Hải Anh 