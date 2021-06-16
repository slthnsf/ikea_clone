const express = require('express')
const router = express.Router()
const { productController } = require('../controllers')

router.post('/add', productController.addProduct)
router.get('/get', productController.getProduct)
router.patch('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteProduct)

module.exports = router