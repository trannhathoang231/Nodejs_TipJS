app.use(morgan("short")) //? de xem log
app.use(helmet()) // de bao mat
app.use(compression()) // middlewares sẽ cố gắng nén nội dung phản hồi cho tất cả yêu cầu đi qua phần mềm trung gian, dựa trên các tùy chọn đã cho.

//! Section 5
/**
 * 1. Sign-up SHOP : luồng đăng ký của 1 shop, 
 * 2. JWT with rsa : cách thuật toán bất đối xứng tạo ra accessToken và refreshToken 
 * 3. JWT : lưu 1 file pem vào trong mongodb và lấy ra để code
 * 4. Tách biệt các module thành các gói khác nhau để tái sử dụng (folder utils)
 */