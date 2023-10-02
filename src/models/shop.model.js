'use strict'
// Trong javascript, strick mode là chế độ code nghiêm ngặt, nó bắt buộc lập trình viên phải tuân thủ theo quy tắc mà javascript đưa ra. Các lỗi cơ bản thường gặp như khai báo trùng tên biến và trùng tên hàm, sử dụng biến mà chưa được định nghĩa..

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

// ? !mdbgum install by Mongo Snippets for Node-js
// Declare the Schema of the Mongo model

const shopSchema = new Schema({
  name: {
    type: String,
    trim: true,
    maxLength: 150
  },
  email: {
    type: String,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
  },
  verify: {
    type: Schema.Types.Boolean,
    default: false
  },
  roles: {
    type: Array,
    default: []
  }

}, {
  timestamps: true,
  collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, shopSchema);