const express = require('express');
const { startPayment, createPayment, getPayment } = require('../controllers/payment');
const mid = require('../middleware/index')

const router = express.Router()

router.post('/', mid.requiresLogin ,startPayment );
router.get('/createPayment', mid.requiresLogin , createPayment);
router.get('/paymentDetails', mid.requiresLogin , getPayment);

module.exports = router;