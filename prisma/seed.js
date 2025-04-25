// 📁 prisma/seed.js
const prisma = require('../src/models/prisma');

async function main() {
  await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@test.com',
      password_hash: 'hashed',
      fiatWallets: {
        create: { currency: 'THB', balance: 100000 }
      },
      cryptoWallets: {
        create: { coin: 'BTC', balance: 1 }
      },
      tradeOrders: {
        create: {
          type: 'sell',
          coin: 'BTC',
          amount: 0.1,
          price_per_unit: 1000000,
          status: 'open'
        }
      }
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
