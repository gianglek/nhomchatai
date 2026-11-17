# Nhóm chat AI

Trang chat tĩnh bằng tiếng Việt, nơi bạn có thể hỏi Gemini và Groq cùng lúc hoặc cho hai AI thảo luận theo lượt. Không cần cài đặt, build hay chạy server.

## Bắt đầu

1. Tạo `config.js` từ file mẫu:

   ```powershell
   Copy-Item config.example.js config.js
   ```

2. Mở `config.js`, điền API key cho Gemini và Groq. Bạn có thể đổi model tại đây.
3. Mở `index.html` bằng trình duyệt.

`config.js` đã được thêm vào `.gitignore`. Không commit file này.

## Cách dùng

- Nhập tin nhắn rồi bấm **Gửi**. Không thêm tag thì cả Gemini và Groq cùng trả lời.
- Dùng `@gemini` hoặc `@groq` để gọi riêng. `@llama` cũng gọi Groq; `@all` gọi cả hai.
- Bấm **Thảo luận** để hai AI trao đổi về tin nhắn mới nhất hoặc chủ đề bạn nhập. Chọn số lượt tối đa trước khi bắt đầu.
- Trong lúc thảo luận, gửi tin nhắn để chen ý kiến. Bấm **Dừng** để kết thúc.
- Dán ảnh vào ô chat bằng `Ctrl+V` trên Windows/Linux hoặc `Cmd+V` trên macOS. Xóa ảnh trong phần xem trước nếu cần.
- Nhấn `Enter` để gửi, `Shift+Enter` để xuống dòng. **Xóa chat** bắt đầu cuộc trò chuyện mới.

## Cấu hình

`config.js` cần có các trường sau. `config.example.js` đã chứa cấu trúc và giá trị model mặc định.

```js
var CONFIG = {
  gemini: { key: "API_KEY", model: "gemini-3.5-flash-lite" },
  groq: {
    key: "API_KEY",
    model: "llama-3.1-8b-instant",
    visionModel: "qwen/qwen3.8-27b"
  }
}
```

Gemini dùng `model` cho văn bản và ảnh. Groq dùng `model` cho văn bản, `visionModel` cho tin nhắn có ảnh. Cập nhật các model trong `config.js` nếu nhà cung cấp thay đổi model khả dụng.

## Bảo mật

Trang gọi API trực tiếp từ trình duyệt. API key trong `config.js` vì vậy có thể bị xem bởi người truy cập máy hoặc trang đang chạy. `.gitignore` chỉ ngăn Git thêm file vào commit mới, không xóa file khỏi lịch sử đã commit. Lịch sử và việc công khai repo trước đây chưa được xác minh; nếu key từng bị lộ, hãy thu hồi và tạo key mới tại nhà cung cấp.

## Tệp chính

- `index.html`: cấu trúc trang và điểm khởi chạy.
- `styles.css`: giao diện và bố cục cho màn hình nhỏ.
- `app.js`: gửi tin, gọi API, thảo luận và xử lý ảnh.
- `config.example.js`: mẫu cấu hình không chứa key.
- `config.js`: cấu hình riêng trên máy, không commit.
