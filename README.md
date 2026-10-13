# Website Giới thiệu — Vũ Thiện Nhân

Một trang web giới thiệu cá nhân tĩnh, hiện đại, Responsive và hỗ trợ chế độ tối.
Không cần cài đặt hay build — chỉ cần HTML/CSS/JS thuần.

## Cấu trúc thư mục

```
gioi-thieu-vu-thien-nhan/
├── index.html    # Nội dung & bố cục trang
├── styles.css    # Giao diện, màu sắc, responsive, chế độ tối
├── script.js     # Tương tác (menu, đổi theme, hiệu ứng, đếm số)
└── README.md     # Tài liệu này
```

## Cách mở website

Cách đơn giản nhất: nháy đúp vào `index.html` để mở bằng trình duyệt.

Nếu muốn chạy bằng máy chủ tạm (khuyến khích), tại thư mục này chạy một trong các lệnh:

```bash
# Nếu đã cài Python
python -m http.server 8000

# Hoặc nếu đã cài Node.js
npx serve .
```

Sau đó mở trình duyệt tại địa chỉ hiển thị (ví dụ `http://localhost:8000`).

## Cách tuỳ chỉnh nội dung

Mở `index.html` và tìm các chú thích bắt đầu bằng **✏️** để thấy chỗ cần sửa:

| Vị trí | Nội dung cần đổi |
|--------|------------------|
| `.hero__name` | Tên hiển thị (mặc định: Vũ Thiện Nhân) |
| `.hero__role` | Dòng giới thiệu nghề nghiệp / vai trò |
| `#about` | Đoạn giới thiệu, sinh nhật, địa điểm, học vấn, sở thích |
| `#skills` | Tên tuyệt kỹ và mức độ `%` (đổi cả `style="--w:..%"`) |
| `#timeline` | Các mốc thời gian / hành trình |
| `#projects` | Các dịch vụ (bói bài, xem chỉ tay, tử vi…) |
| `#contact` | Email, số điện thoại, địa điểm, link mạng xã hôi |

### Thêm ảnh đại diện

Thay dòng `<svg class="hero__avatar-svg" ...>...</svg>` bên trong `.hero__avatar`
bằng thẻ ảnh của bạn:

```html
<img src="anh-cua-ban.jpg" alt="Vũ Thiện Nhân" style="width:100%;height:100%;object-fit:cover" />
```

> Hiện tại avatar là một nhân vật 3D được vẽ bằng SVG (không cần file ảnh, hoạt động offline).

## Tuỳ chỉnh màu sắc

Toàn bộ màu chủ đạo nằm ở đầu `styles.css` trong khối `:root`.
Đổi `--primary` và `--primary-2` để đổi toàn bộ tông màu trang.
