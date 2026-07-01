const express = require('express');
const router = express.Router();
const { userVerification } = require('../Middlewares/AuthMiddleware');
const OrderController = require('../Controllers/OrderController');

router.post('/place', userVerification, OrderController.placeOrder);
router.get('/open', userVerification, OrderController.getOpenOrders);
router.get('/history', userVerification, OrderController.getOrderHistory);
router.get('/:orderId', userVerification, OrderController.getOrderDetail);
router.delete('/:orderId', userVerification, OrderController.cancelOrder);

module.exports = router;
