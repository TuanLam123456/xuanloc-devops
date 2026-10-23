# Hướng Dẫn Nghiệp Vụ — Hệ Thống Quản Lý Trung Tâm Ngoại Ngữ Xuân Lộc

> Mỗi mục dưới đây theo cấu trúc: **Trang (đường dẫn)** → **Bấm nút gì (đúng chữ hiển thị trên hệ thống)** → **Kết quả**. Toàn bộ nhãn nút đã được kiểm tra trực tiếp trên hệ thống thật, không suy đoán từ tên biến trong code.

## Tài khoản đăng nhập mẫu

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@xuanloc.edu.vn` | `123456` |
| Giáo viên | `teacher@xuanloc.edu.vn` | `123456` |
| Học viên | `student@xuanloc.edu.vn` | `123456` |

---

## Phần 0 — Truy cập công khai (chưa đăng nhập)

### 0.1. Trang chủ — `/`
Trang giới thiệu trung tâm. Thanh menu trên cùng có: **Trang chủ**, **Khóa học**, **Lớp học sắp mở**, **Xác minh chứng chỉ**, **Tư vấn ghi danh** (nút xanh), **Đăng nhập** (góc phải).

### 0.2. Xem khóa học / lớp học — `/courses`, `/classes`
Khách vãng lai xem được danh sách khóa học đang mở và lớp học sắp khai giảng, không cần đăng nhập.

### 0.3. Gửi yêu cầu tư vấn (tạo lead cho CRM)
1. Từ Trang chủ, bấm nút **Tư vấn ghi danh** (trên thanh menu) hoặc **Đăng ký tư vấn ngay** (trong banner đầu trang) — cả 2 đều cuộn xuống form "Đăng Ký Tư Vấn Miễn Phí" ở cuối trang.
2. Điền: **Khóa học quan tâm** (bắt buộc chọn), **Họ và tên**, **Số điện thoại**, **Địa chỉ Email**, **Ghi chú thêm** (tùy chọn).
3. Bấm **Gửi Yêu Cầu Tư Vấn Ngay**.
4. Kết quả: yêu cầu xuất hiện ngay trong mục **Tư vấn/CRM** của Admin (Phần I.5) với trạng thái "Chờ xử lý", để Admin xử lý tiếp.

### 0.4. Xác minh chứng chỉ — `/verify-certificate`
1. Vào trang **Xác minh chứng chỉ** (menu trên cùng), hoặc quét/mở link chứng chỉ dạng `/verify-certificate/<mã-chứng-chỉ>`.
2. Nhập mã chứng chỉ (ví dụ `XL-2026-000001`) vào ô nhập, bấm **Xác Minh**.
3. Kết quả: hiện thẻ xanh "Chứng Chỉ Hợp Lệ & Chính Thức!" kèm họ tên học viên, khóa học, ngày cấp — hoặc báo "Không Tìm Thấy Chứng Chỉ" nếu sai mã.

### 0.5. Đăng nhập / Quên mật khẩu — `/login`, `/forgot-password`
1. Bấm **Đăng nhập** (góc phải thanh menu) → vào `/login`.
2. Nhập Email + Mật khẩu → bấm **Đăng Nhập**.
3. Quên mật khẩu: bấm link **Quên mật khẩu?** ngay dưới ô mật khẩu → nhập Email → bấm **Gửi Mã Xác Nhận** → hệ thống gửi mã OTP qua email → nhập mã OTP + mật khẩu mới → bấm **Đặt Lại Mật Khẩu**.

---

## Phần I — Nghiệp vụ Quản Trị Viên (Admin)

Đăng nhập xong, hệ thống tự chuyển vào `/admin`. Menu bên trái có 12 mục.

### I.1. Tổng quan — `/admin`
Trang mặc định sau đăng nhập. Chỉ xem số liệu (học viên/giáo viên hoạt động, lớp đang mở, lead mới, doanh thu tháng, tỷ lệ điểm danh/nghỉ học, biểu đồ doanh thu) — không có thao tác chỉnh sửa ở đây.

### I.2. Khóa học — `/admin/courses`
- Bấm **+ Thêm khóa học** → điền Mã khóa học, Tên, Học phí, Số tháng học, Mô tả → **Lưu** → tạo khóa học mới.
- Mỗi dòng có 2 nút: **Sửa** (mở form sửa các trường trên) và **Xóa** (xóa vĩnh viễn, kèm hộp thoại xác nhận).
- Cột **Trạng thái** có công tắc gạt **Hoạt động / Đã ẩn** — gạt để ẩn khóa học khỏi trang công khai mà không xóa dữ liệu.

### I.3. Danh mục — `/admin/settings`
Có 2 tab, chuyển tab bằng cách bấm tên tab:

**Tab "Phòng học"**
- Bấm **+ Thêm phòng học** → nhập Tên phòng, Sức chứa, Ghi chú → **Lưu**.
- Mỗi dòng có nút **Sửa**; cột Trạng thái có công tắc **Hoạt động / Đã ẩn**.

**Tab "Voucher"**
- Bấm **+ Thêm voucher** → nhập Mã voucher, chọn Loại giảm giá (**Phần trăm** hoặc **Số tiền cố định**), Giá trị, Giới hạn số lượt dùng, khoảng ngày hiệu lực → **Lưu**.
- Công tắc **Hoạt động / Đã ẩn** để tạm ngưng voucher.

### I.4. Người dùng — `/admin/users`
- Bấm **+ Thêm người dùng** → điền thông tin, chọn Vai trò (Admin/Giáo viên/Học viên) → **Lưu**.
- Mỗi dòng có các nút:
  - **Sửa** — sửa thông tin cá nhân
  - **Reset MK** — đặt lại mật khẩu cho người dùng đó (không cần họ tự thao tác)
  - **Đơn giá/buổi** — chỉ hiện với vai trò Giáo viên, dùng để tính lương
  - **Xóa** — xóa vĩnh viễn tài khoản
  - Công tắc **Hoạt động / Ngừng** — khóa/mở tạm thời (không xóa dữ liệu). *Không thể tự khóa chính tài khoản Admin đang đăng nhập.*
- Nút **Xuất Excel** (đầu trang) — tải toàn bộ danh sách người dùng ra file Excel.

### I.5. Tư vấn/CRM — `/admin/registrations`
Danh sách các yêu cầu tư vấn gửi từ Phần 0.3. Mỗi dòng có 5 nút:

| Nút | Kết quả |
| --- | --- |
| **Duyệt** | Chuyển trạng thái sang "Đã duyệt" |
| **Từ chối** | Mở ô nhập lý do, sau đó chuyển trạng thái "Đã từ chối" |
| **Gán** | Mở hộp thoại **"Gán người phụ trách"** → chọn 1 Admin từ dropdown **"Chọn admin"** → xác nhận |
| **Hẹn** | Mở ô chọn ngày (**"Select date"**) để đặt lịch hẹn liên hệ lại |
| **Xóa** | Xóa vĩnh viễn yêu cầu này |

Cột **Ghi chú** hiển thị một số (đếm số ghi chú đã có) — **bấm vào số đó** để mở drawer **"Ghi chú — [Tên khách]"**, nhập nội dung vào ô **"Ghi chú chăm sóc mới..."** rồi bấm **Gửi** để thêm một dòng ghi chú mới (giữ lại lịch sử chăm sóc, không xóa ghi chú cũ).

### I.6. Lớp học — `/admin/classes`
- Bấm **+ Thêm lớp học** → chọn Khóa học, Giáo viên, Phòng học, nhập Sĩ số tối đa, Ngày khai giảng, Mô tả lịch học → **Lưu**.
- Mỗi dòng có: **Chi tiết**, **Sửa**, **Xóa**.
- Bấm **Chi tiết** mở drawer với 4 tab (chuyển tab bằng cách bấm tên tab):

**Tab "Lịch học"** — bấm **+ Thêm buổi học** → nhập Ngày, Giờ bắt đầu/kết thúc, Phòng, Ghi chú → **Lưu**. Mỗi buổi có nút **Sửa**/**Xóa**. *Sửa một buổi học sẽ tự động gửi email báo thay đổi lịch cho toàn bộ học viên đang học lớp đó.*

**Tab "Điểm danh"** — chọn ngày (mặc định hôm nay) → bảng hiện học viên đang học của lớp → chọn trạng thái từng người → bấm **Lưu điểm danh**.

**Tab "Danh sách chờ"** — mỗi dòng có 2 nút: **Thăng cấp** (chuyển học viên chờ thành học viên chính thức khi có chỗ trống) và **Xóa** (kèm hộp xác nhận "Xóa khỏi danh sách chờ?").

**Tab "Học viên"** — chỉ xem danh sách học viên đã ghi danh, không có thao tác.

### I.7. Ghi danh & Học phí — `/admin/enrollments`
Có 2 tab:

**Tab "Ghi danh"**
- Bấm **+ Ghi danh thủ công** → chọn Học viên + Lớp học → **Lưu** → xếp học viên vào lớp mà không cần họ tự đăng ký.
- Cột **Trạng thái** là ô dropdown ngay trong bảng (không cần mở Chi tiết) — chọn trực tiếp **Đang học / Đã nghỉ / Đã hoàn thành** để đổi trạng thái ghi danh ngay lập tức.
- Mỗi dòng có **Chi tiết** và **Xóa** (xóa mềm — vẫn giữ lịch sử học phí).
- Bấm **Chi tiết** mở drawer với các nút:

| Nút | Kết quả |
| --- | --- |
| **Miễn giảm** | Nhập số tiền giảm trực tiếp trên học phí gốc |
| **Áp voucher** | Nhập mã voucher đã tạo ở mục I.3 |
| **Ghi nhận thanh toán** | Mở form: chọn **Phương thức** (**Tiền mặt** hoặc **Chuyển khoản**), nhập **Số tiền thu**, **Ghi chú** → **Ghi nhận** (xem quy trình đầy đủ ở Phần IV) |
| **Hoàn tiền** | Nhập số tiền hoàn + lý do |
| **Cấp chứng chỉ** | Chỉ hiện khi ghi danh đang "Đã hoàn thành" và chưa từng được cấp |

Bên dưới hiển thị lịch sử thu tiền, lịch sử hoàn tiền, và bảng điểm — không cần bấm gì thêm, tự hiện khi mở drawer.

**Tab "Báo cáo công nợ"**
- Bảng danh sách học viên còn nợ học phí.
- Nút **Xuất Excel** — tải báo cáo công nợ ra file.
- Nút **Gửi nhắc nhở hàng loạt** — gửi email nhắc học phí đến toàn bộ học viên đang nợ trong bảng, chỉ 1 lần bấm.

**Công thức công nợ:** `Còn nợ = (Học phí gốc − Miễn giảm) − (Tổng đã đóng − Tổng đã hoàn)`

### I.8. Bảng lương — `/admin/payroll`
Chọn Tháng/Năm → bảng hiện Số buổi dạy, Đơn giá/buổi, Tổng lương của từng giáo viên. Bấm **Xuất Excel** để tải về.

### I.9. Đánh giá — `/admin/reviews`
Bảng đánh giá của học viên. Lọc theo lớp bằng dropdown. Mỗi dòng có nút **Xóa** để gỡ đánh giá không phù hợp.

### I.10. Chứng chỉ — `/admin/certificates`
- Bấm **+ Cấp chứng chỉ** → chọn 1 ghi danh đủ điều kiện (đã hoàn thành, chưa cấp) → **Lưu** → hệ thống tự sinh mã dạng `XL-năm-số thứ tự`.
- Mỗi dòng có: **Tải PDF** (tải file chứng chỉ) và **Sao chép link xác minh** (copy link công khai để gửi cho học viên/nhà tuyển dụng).

### I.11. Đề thi — `/admin/exams`
1. Chọn Khóa học từ ô tìm kiếm phía trên.
2. Bấm **+ Tạo đề thi** → đặt Tên đề, Thời gian làm bài (phút) → bấm thêm từng câu hỏi, mỗi câu nhập tối thiểu 2 phương án trả lời và đánh dấu đáp án đúng → **Lưu**.
3. Mỗi đề có các nút: **Xem đề** (xem chi tiết kèm đáp án đúng), **Bài nộp** (xem danh sách học viên đã làm + điểm), **Sửa**, **Xóa**.

### I.12. Nhật ký hoạt động — `/admin/audit-logs`
Chỉ xem, không có thao tác chỉnh sửa. Lọc theo **Hành động** hoặc **Đối tượng** bằng 2 dropdown đầu trang. Dùng để tra soát: ai đã làm gì, lúc nào, chi tiết dữ liệu thay đổi ra sao (cột "Chi tiết" hiển thị dạng JSON).

---

## Phần II — Nghiệp vụ Giáo Viên

Chỉ thao tác được trên lớp mình được phân công. Menu gồm 9 mục.

### II.1. Tổng quan — `/teacher`
Chỉ xem: số lớp đang/sắp dạy, tổng số lớp phụ trách, số buổi dạy sắp tới, bảng lịch dạy sắp tới.

### II.2. Lớp tôi dạy — `/teacher/classes`
Chỉ xem danh sách lớp dạng thẻ, không có thao tác.

### II.3. Lịch dạy — `/teacher/schedule`
Chỉ xem bảng lịch dạy tổng hợp tất cả các lớp.

### II.4. Điểm danh — `/teacher/attendance`
1. Chọn lớp từ dropdown **"Chọn lớp học"**.
2. Chọn ngày (ô ngày bên cạnh, mặc định hôm nay).
3. Với mỗi học viên đang học của lớp, chọn trạng thái ở cột **"Trạng thái"** (Có mặt/Vắng...), có thể gõ thêm ở cột **"Ghi chú"**.
4. Bấm **Lưu điểm danh** (góc trên bên phải) để lưu toàn bộ lớp cùng lúc.

> Vắng 3 buổi liên tiếp → hệ thống tự gửi email cảnh báo, giáo viên không cần làm gì thêm.

### II.5. Nhập điểm — `/teacher/grades`
1. Chọn lớp từ dropdown **"Chọn lớp học"**.
2. Bảng hiện danh sách học viên, mỗi dòng có nút **+ Thêm điểm**.
3. Bấm vào → nhập **Tên bài thi/kiểm tra**, **Điểm (0-10)**, **Nhận xét** → **Lưu điểm**.

### II.6. Bài giảng & Tài liệu — `/teacher/lessons`
1. Chọn lớp từ dropdown **"Chọn lớp học"**.
2. Mỗi bài giảng (do Admin tạo sẵn) có 2 nút:
   - **Cập nhật tiến độ** → mở form: chọn **Trạng thái** (Chưa dạy/Đã dạy/Bỏ qua), **Ngày dạy**, gõ **Bài tập về nhà** → **Lưu**.
   - **+ Thêm tài liệu** → nhập đường link tài liệu (Google Drive, YouTube...) → **Lưu**.

> Giáo viên **không tự tạo bài giảng mới** — nếu cần bổ sung bài giảng, phải liên hệ Admin.

### II.7. Đề thi — `/teacher/exams`
Thao tác giống hệt mục I.11 của Admin, nhưng chỉ với các khóa học mình đang dạy.

### II.8. Lương của tôi — `/teacher/payroll`
Chọn tháng → chỉ xem số buổi dạy, đơn giá, tổng lương của bản thân — không có thao tác.

### II.9. Hồ sơ cá nhân — `/teacher/profile`
Sửa Họ tên, SĐT, Chuyên môn, Bằng cấp, Tiểu sử → **Lưu**. Có ô đổi ảnh đại diện (bấm vào ảnh) và mục **Đổi mật khẩu** riêng.

---

## Phần III — Nghiệp vụ Học Viên

Chỉ xem/thao tác dữ liệu của chính mình. Menu gồm 8 mục.

### III.1. Tổng quan — `/student`
Chỉ xem: số lớp đang học, tổng học phí còn phải đóng (cộng dồn mọi lớp kể cả lớp đã hoàn thành), số buổi học sắp tới, bảng lịch học sắp tới.

### III.2. Lớp học của tôi — `/student/classes`
- Bấm **+ Đăng ký lớp học mới** → chọn 1 lớp đang mở tuyển sinh từ dropdown → **Đăng ký**. Nếu lớp đã đầy, hệ thống tự đưa vào danh sách chờ (không cần làm gì thêm).
- Mỗi lớp còn nợ học phí có nút **Chuyển khoản QR** (xem quy trình đầy đủ ở Phần IV).
- Lớp đã "Đã hoàn thành" có nút **Đánh giá lớp học** → chọn số sao + viết nhận xét → **Gửi đánh giá**.

### III.3. Lịch học — `/student/schedule`
Chỉ xem thời khóa biểu cá nhân, không có thao tác.

### III.4. Điểm danh — `/student/attendance`
Chỉ xem lịch sử điểm danh + thống kê tỷ lệ có mặt/số buổi vắng của bản thân.

### III.5. Điểm số — `/student/grades`
Chỉ xem bảng điểm cá nhân kèm nhận xét giáo viên.

### III.6. Đề thi — `/student/exams`
1. Chọn lớp từ dropdown **"Chọn lớp học để xem đề thi"**.
2. Với mỗi đề đang mở, bấm **Làm bài**.
3. Chọn đáp án cho từng câu (bắt buộc trả lời hết) → bấm **Nộp bài**.
4. Kết quả hiện ngay: đúng/sai từng câu + tổng điểm.

> Mỗi đề chỉ làm được **1 lần** — bấm Làm bài lại sẽ báo lỗi "Bạn đã làm bài kiểm tra này rồi."

### III.7. Chứng chỉ — `/student/certificates`
Với mỗi chứng chỉ đã được cấp: bấm **Tải PDF** để tải về, hoặc **Sao chép link xác minh** để gửi cho người khác kiểm tra (không cần đăng nhập).

### III.8. Hồ sơ cá nhân — `/student/profile`
Sửa Họ tên, SĐT, Ngày sinh, Tên/SĐT phụ huynh → **Lưu**. Có ô đổi ảnh đại diện và mục **Đổi mật khẩu** riêng.

---

## Phần IV — Quy trình Thanh toán học phí (chi tiết từng bước)

Hệ thống hỗ trợ 2 phương thức. Cả hai đều **chưa có xác nhận tự động** — nghĩa là dù học viên chuyển khoản qua QR (tiền đi qua internet/app ngân hàng bình thường), hệ thống vẫn **không tự biết** tiền đã về, vì chưa nối API/webhook với ngân hàng (khác với cổng thanh toán như VNPay/Momo/ZaloPay — nơi hệ thống tự động nhận báo có tiền ngay khi giao dịch thành công). Vì vậy mọi khoản thu, kể cả chuyển khoản, đều cần Admin xác nhận thủ công sau khi tự kiểm tra trên app ngân hàng.

### Cách 1 — Thu tiền mặt tại quầy
1. Admin vào `/admin/enrollments` → bấm **Chi tiết** ở dòng ghi danh của học viên.
2. Bấm **Ghi nhận thanh toán**.
3. Ở ô **Phương thức**, chọn **Tiền mặt**.
4. Nhập **Số tiền thu (đ)**, có thể gõ **Ghi chú**.
5. Bấm **Ghi nhận** → số dư cập nhật ngay.

### Cách 2 — Chuyển khoản qua mã VietQR (MB Bank)

**Bước 1 — Học viên tạo mã QR:**
1. Học viên vào `/student/classes`.
2. Bấm nút **Chuyển khoản QR** trên lớp đang nợ học phí.
3. Hệ thống hiện mã VietQR thật kèm: đúng số tiền còn nợ, tên/số tài khoản MB Bank nhận tiền, và **nội dung chuyển khoản có sẵn mã học viên** (ví dụ `HOCPHI HV-2026-0002`).
4. Học viên dùng app ngân hàng bất kỳ quét mã, kiểm tra đúng thông tin rồi chuyển khoản.

**Bước 2 — Admin xác nhận đã nhận tiền:**
1. Admin kiểm tra tin nhắn/app ngân hàng của trung tâm, đối chiếu nội dung chuyển khoản với mã học viên.
2. Vào `/admin/enrollments` → **Chi tiết** đúng dòng ghi danh đó → **Ghi nhận thanh toán**.
3. Ở ô **Phương thức**, chọn **Chuyển khoản (đã nhận tiền vào tài khoản)**.
4. Nhập đúng **Số tiền thu (đ)** đã nhận, có thể ghi chú mã giao dịch.
5. Bấm **Ghi nhận** → số dư của học viên cập nhật ngay, học viên sẽ thấy "Đã đóng" tăng lên khi vào lại `/student/classes`.

> **Lưu ý:** giao dịch chuyển khoản vẫn diễn ra online bình thường (qua app ngân hàng), nhưng vì tài khoản MB Bank ở đây là **tài khoản cá nhân** (không có API/webhook), hệ thống không có cách nào tự "nghe" được tiền đã vào — nên vẫn cần bước 2 (Admin tự kiểm tra rồi xác nhận tay), sẽ có độ trễ tùy tốc độ Admin kiểm tra. Muốn tự động hoàn toàn (hệ thống tự đánh dấu đã đóng ngay khi tiền về, không cần Admin bấm) cần đăng ký gói **MB Bank for Business** (có webhook) hoặc tích hợp một cổng thanh toán như VNPay/Momo — hiện chưa làm.

---

## Phần V — Giới hạn hiện tại (cần lưu ý khi vận hành)

- Chỉ có 3 vai trò: Admin, Giáo viên, Học viên — chưa có tài khoản riêng cho phụ huynh hoặc lễ tân/CRM.
- Chưa có "hộp thư thông báo" trong ứng dụng — mọi thông báo tự động chỉ gửi qua **email**.
- Nút **Xóa** ở Khóa học/Lớp học/Người dùng/Đề thi là xóa **vĩnh viễn**, không khôi phục được (khác với Xóa ghi danh — xóa mềm, phục hồi được).
- Trang Dashboard của Giáo viên/Học viên chỉ có 3 thẻ số liệu cơ bản, chưa nhiều tính năng như Dashboard của Admin.

---

## Phần VI — Quy trình nghiệp vụ trọn vẹn (theo dõi từng bước chuyển trang)

Phần I–IV mô tả từng trang riêng lẻ. Phần này nối các trang lại thành **hành trình đầy đủ từ đầu đến cuối** của một nghiệp vụ thật, ghi rõ mỗi bước đang ở URL nào, bấm gì, và có đổi sang URL khác hay không (nhiều thao tác chỉ mở Drawer/Modal — vẫn ở nguyên URL cũ, không phải chuyển trang).

### Quy trình 1 — Từ khách quan tâm đến học viên chính thức

| Bước | Đang ở trang (URL) | Bấm | Kết quả / chuyển đến |
| --- | --- | --- | --- |
| 1 | `/` (chưa đăng nhập) | **Tư vấn ghi danh** hoặc **Đăng ký tư vấn ngay** | Không đổi URL — cuộn xuống form ở cuối trang `/` |
| 2 | `/` | Điền form → **Gửi Yêu Cầu Tư Vấn Ngay** | Không đổi URL — hiện thông báo gửi thành công, dữ liệu lưu vào CRM |
| 3 | Admin đăng nhập → `/admin/registrations` | (không bấm gì, chỉ xem) | Thấy yêu cầu mới, trạng thái "Chờ xử lý" |
| 4 | `/admin/registrations` | **Gán** → chọn admin phụ trách | Không đổi URL — mở/đóng hộp thoại, cập nhật cột "Phụ trách" |
| 5 | `/admin/registrations` | Bấm số ở cột **Ghi chú** → nhập nội dung trao đổi → **Gửi** | Không đổi URL — mở/đóng drawer ghi chú |
| 6 | `/admin/registrations` | **Duyệt** | Không đổi URL — trạng thái chuyển "Đã duyệt" |
| 7 | Chuyển sang `/admin/users` (bấm mục **Người dùng** ở menu trái) | **+ Thêm người dùng** → tạo tài khoản Học viên | Không đổi URL — tài khoản mới xuất hiện trong danh sách |
| 8 | Chuyển sang `/admin/enrollments` (bấm mục **Ghi danh & Học phí**) | **+ Ghi danh thủ công** → chọn học viên vừa tạo + lớp phù hợp → **Lưu** | Không đổi URL — ghi danh mới xuất hiện trong bảng |
| **Kết thúc** | Học viên đăng nhập → `/student/classes` | — | Thấy lớp học của mình, có thể bắt đầu đóng học phí (nối sang Quy trình 3) |

### Quy trình 2 — Học viên tự đăng ký lớp học (không qua CRM)

| Bước | Đang ở trang (URL) | Bấm | Kết quả / chuyển đến |
| --- | --- | --- | --- |
| 1 | `/student/classes` | **+ Đăng ký lớp học mới** | Không đổi URL — mở hộp thoại chọn lớp |
| 2 | (trong hộp thoại) | Chọn lớp → **Đăng ký** | Không đổi URL — đóng hộp thoại |
| 3a | Nếu lớp còn chỗ | — | Lớp xuất hiện ngay trong danh sách với trạng thái "Đang học" — **kết thúc quy trình** |
| 3b | Nếu lớp đã đầy | — | Học viên vào danh sách chờ (học viên **không có trang riêng** để tự xem danh sách chờ của mình) |
| 4 | Admin: `/admin/classes` | **Chi tiết** lớp đó | Không đổi URL — mở drawer chi tiết lớp |
| 5 | (trong drawer) | Bấm tab **"Danh sách chờ"** → **Thăng cấp** | Không đổi URL — học viên chuyển thành ghi danh chính thức |
| **Kết thúc** | Học viên vào lại `/student/classes` | — | Thấy lớp đã chuyển sang trạng thái học chính thức |

### Quy trình 3 — Thu học phí qua chuyển khoản VietQR (2 vai trò, 2 phiên đăng nhập)

| Bước | Đang ở trang (URL) | Bấm | Kết quả / chuyển đến |
| --- | --- | --- | --- |
| 1 | Học viên: `/student/classes` | **Chuyển khoản QR** trên lớp còn nợ | Không đổi URL — mở modal hiện mã QR + số tiền + nội dung CK |
| 2 | (ngoài hệ thống) | Quét QR bằng app ngân hàng, chuyển khoản | — |
| 3 | Admin: `/admin/enrollments` | **Chi tiết** đúng ghi danh đó | Không đổi URL — mở drawer chi tiết học phí |
| 4 | (trong drawer) | **Ghi nhận thanh toán** → chọn phương thức **Chuyển khoản** → nhập số tiền → **Ghi nhận** | Không đổi URL — số dư cập nhật ngay trong drawer |
| **Kết thúc** | Học viên vào lại `/student/classes` | — | Thấy "Đã đóng" tăng lên, "Còn lại" giảm tương ứng |

### Quy trình 4 — Từ ghi danh đến cấp chứng chỉ hoàn thành khóa học

| Bước | Đang ở trang (URL) | Bấm | Kết quả / chuyển đến |
| --- | --- | --- | --- |
| 1 | Admin: `/admin/enrollments` | Ở cột **Trạng thái** của dòng ghi danh, chọn **"Đã hoàn thành"** trong dropdown | Không đổi URL — trạng thái cập nhật ngay trong bảng |
| 2 | Chuyển sang `/admin/certificates` (bấm mục **Chứng chỉ** ở menu trái) | **+ Cấp chứng chỉ** → chọn đúng ghi danh vừa hoàn thành → **Lưu** | Không đổi URL — chứng chỉ mới xuất hiện trong bảng với mã tự sinh |
| 3 | `/admin/certificates` | **Sao chép link xác minh** | Copy link dạng `/verify-certificate/<mã>` để gửi cho học viên |
| **Kết thúc** | Học viên vào `/student/certificates` | **Tải PDF** | Tải chứng chỉ về máy; bất kỳ ai mở link ở bước 3 (không cần đăng nhập) đều xác minh được tại `/verify-certificate` |

### Quy trình 5 — Giáo viên vận hành trọn vẹn một buổi học

| Bước | Đang ở trang (URL) | Bấm | Kết quả / chuyển đến |
| --- | --- | --- | --- |
| 1 | `/teacher/attendance` | Chọn lớp + ngày → đánh dấu từng học viên → **Lưu điểm danh** | Không đổi URL — điểm danh lưu cho cả lớp |
| 2 | Chuyển sang `/teacher/lessons` (bấm mục **Bài giảng & Tài liệu**) | Chọn lớp → **Cập nhật tiến độ** bài học đã dạy → chọn "Đã dạy" → **Lưu** | Không đổi URL |
| 3 | Chuyển sang `/teacher/grades` (bấm mục **Nhập điểm**) | Chọn lớp → **+ Thêm điểm** cho từng học viên → nhập điểm + nhận xét → **Lưu điểm** | Không đổi URL |
| **Kết thúc** | Học viên vào `/student/grades` | — | Thấy điểm mới ngay, đồng thời nhận được email thông báo có điểm mới tự động |

---

## Đối chiếu độ đầy đủ

Tài liệu này bao phủ toàn bộ menu điều hướng thực tế của hệ thống:
- **Admin:** 12/12 mục trong sidebar (`/admin/...`)
- **Giáo viên:** 9/9 mục trong sidebar (`/teacher/...`)
- **Học viên:** 8/8 mục trong sidebar (`/student/...`)
- **Công khai:** Trang chủ, Khóa học, Lớp học, Xác minh chứng chỉ, Đăng ký tư vấn, Đăng nhập/Quên mật khẩu
- **Quy trình trọn vẹn (Phần VI):** 5 hành trình xuyên trang phổ biến nhất — CRM đến ghi danh, học viên tự đăng ký, thu chuyển khoản, cấp chứng chỉ, vận hành 1 buổi học

Không bao gồm: **xác nhận thanh toán tự động** (tự động đối soát qua API/webhook ngân hàng hoặc cổng thanh toán VNPay/Momo/ZaloPay) — chuyển khoản QR hiện có vẫn cần Admin xác nhận thủ công, xem chi tiết ở Phần IV.
