const router = require('express').Router()
const { readToken } = require('../config')
const {transactionController} = require('../controllers') 

router.get('/get-cart', readToken, transactionController.getCart)
router.post('/post-cart', readToken, transactionController.addCart)
router.delete('/delete-cart/:idtb_cart', transactionController.deleteCart)
router.delete('/remove-cart', readToken, transactionController.removeCart)
router.patch('/update-qty', transactionController.updateCart)
router.post('/post-transaction', readToken, transactionController.addToTransaction)
router.get('/get', readToken, transactionController.getTransaction)
router.get('/get-alltrans', transactionController.getAllTransaction)
router.patch('/paid/:id', transactionController.PaidBtn)
router.patch('/confirm/:id', transactionController.ConfirmBtn)
router.get('/getId', transactionController.getIdCtg)

module.exports = router