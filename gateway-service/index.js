const express = require('express');
const { createClient } = require('redis');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// app.use(cors());
// app.options('*', cors());
app.use(cors());

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  message: { error: "Too many requests. Please try again later." }
});

//app.use('/api', apiLimiter);
app.use('/api/book', apiLimiter);  // Only rate limit bookings, not inventory checks

const BOOKING_URL = process.env.BOOKING_URL || 'http://booking-service:4001';

app.use('/api/book', createProxyMiddleware({
  target: BOOKING_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/book': '/' }
}));

app.use('/api/inventory', createProxyMiddleware({
  target: BOOKING_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/inventory': '/inventory' }
}));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));