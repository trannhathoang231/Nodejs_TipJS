
require('dotenv').config()
const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')
const app = express()

// console.log(`Process::`, process.env);
// init middlewares
app.use(morgan("short")) //? de xem log
app.use(helmet()) // de bao mat
app.use(compression()) // middlewares sẽ cố gắng nén nội dung phản hồi cho tất cả yêu cầu đi qua phần mềm trung gian, dựa trên các tùy chọn đã cho.

// init db
require('./dbs/init.mongodb')
// const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad()
// init routes
app.use('', require('./routes'))

// handling error

module.exports = app