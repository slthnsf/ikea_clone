const express = require('express')
const { readToken } = require('../config')
const router = express.Router()
const { userController } = require('../controllers')

router.get('/get-all', userController.getUsers)
router.post('/login', userController.login)
router.post('/regis', userController.register)
router.post('/keep', readToken, userController.keepLogin)
router.patch('/verify', readToken, userController.verify)
router.patch('/reverify', userController.reverif)

module.exports = router