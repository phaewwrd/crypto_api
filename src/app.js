const express = require('express');

const dotenv = require('dotenv');
const tradeRoutes = require('./routes/trade.js');
const authRoutes = require('./routes/auth.js');

const errorMiddleware = require('./middlewares/error');
const notFoundMiddleware = require('./middlewares/not-found');
dotenv.config();
const app = express();

app.use(express.json());
app.use('/trade', tradeRoutes);
app.use('/auth', authRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
