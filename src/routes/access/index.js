'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const router = express.Router()
const {asyncHandler} = require('../../auth/checkAuth')

//Sign up
router.post('/shop/signup', asyncHandler(accessController.signUp))
router.post('/shop/login', asyncHandler(accessController.login))

module.exports = router