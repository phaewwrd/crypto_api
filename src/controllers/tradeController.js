const prisma = require('../models/prisma');

const tradeController = {};

tradeController.buyCrypto = async (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const buyerId = req.body.userId;

  const order = await prisma.tradeOrder.findUnique({ where: { id: orderId } });
  if (!order || order.status !== 'open' || order.type !== 'sell') {
    return res.status(400).json({ error: 'Invalid trade order' });
  }

  const sellerId = order.userId;
  const totalPrice = order.amount * order.price_per_unit;

  const buyerFiat = await prisma.fiatWallet.findFirst({
    where: { userId: buyerId, currency: 'THB' }
  });

  if (!buyerFiat || buyerFiat.balance < totalPrice) {
    return res.status(400).json({ error: 'Insufficient fiat balance' });
  }

  const sellerCrypto = await prisma.cryptoWallet.findFirst({
    where: { userId: sellerId, coin: order.coin }
  });

  if (!sellerCrypto || sellerCrypto.balance < order.amount) {
    return res.status(400).json({ error: 'Seller has insufficient crypto' });
  }

  try {
    await prisma.$transaction([
      prisma.fiatWallet.update({
        where: { id: buyerFiat.id },
        data: { balance: { decrement: totalPrice } }
      }),
      prisma.fiatWallet.updateMany({
        where: { userId: sellerId, currency: 'THB' },
        data: { balance: { increment: totalPrice } }
      }),
      prisma.cryptoWallet.update({
        where: { id: sellerCrypto.id },
        data: { balance: { decrement: order.amount } }
      }),
      prisma.cryptoWallet.upsert({
        where: {
          userId_coin: {
            userId: buyerId,
            coin: order.coin
          }
        },
        update: { balance: { increment: order.amount } },
        create: {
          userId: buyerId,
          coin: order.coin,
          balance: order.amount
        }
      }),
      prisma.transaction.create({
        data: {
          fromUserId: sellerId,
          toUserId: buyerId,
          type: 'trade',
          coin: order.coin,
          fiat_currency: 'THB',
          amount: totalPrice,
          status: 'completed'
        }
      }),
      prisma.tradeOrder.update({
        where: { id: orderId },
        data: { status: 'completed' }
      })
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

tradeController.sellCrypto = async (req, res) => {
  const { userId, coin, amount, price_per_unit } = req.body;

  const userCrypto = await prisma.cryptoWallet.findFirst({
    where: { userId, coin }
  });

  if (!userCrypto || userCrypto.balance < amount) {
    return res.status(400).json({ error: 'Insufficient crypto balance' });
  }

  try {
    await prisma.$transaction([
      prisma.cryptoWallet.update({
        where: { id: userCrypto.id },
        data: { balance: { decrement: amount } }
      }),
      prisma.tradeOrder.create({
        data: {
          userId,
          type: 'sell',
          coin,
          amount,
          price_per_unit,
          status: 'open',
          expiredAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      })
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = tradeController;
