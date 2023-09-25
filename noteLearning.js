app.use(morgan("short")) //? de xem log
app.use(helmet()) // de bao mat
app.use(compression()) // middlewares sẽ cố gắng nén nội dung phản hồi cho tất cả yêu cầu đi qua phần mềm trung gian, dựa trên các tùy chọn đã cho.