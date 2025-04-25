const express = require('express');

const tradeController = require('../controllers/tradeController.js');
const router = express.Router();

router.post('/:orderId/buy', tradeController.buyCrypto);

router.post('/sell', tradeController.sellCrypto);

module.exports = router;
