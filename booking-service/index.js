const express = require('express');
const { createClient } = require('redis');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let rabbitChannel;

async function init() {
  const redisClient = createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();
  await redisClient.set('ticket_inventory', 100);

  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  rabbitChannel = await connection.createChannel();
  await rabbitChannel.assertQueue('order_queue');

  return redisClient;
}

init().then(redisClient => {
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/inventory', async (req, res) => {
    const stock = await redisClient.get('ticket_inventory');
    res.json({ available: parseInt(stock) });
  });

  app.post('/', async (req, res) => {
    const { userId, ticketId } = req.body;
    if (!userId || !ticketId) {
      return res.status(400).json({ message: "userId and ticketId are required." });
    }
    const stock = await redisClient.get('ticket_inventory');
    if (parseInt(stock) <= 0) {
      return res.status(400).json({ message: "Sold out!" });
    }
    await redisClient.decr('ticket_inventory');
    const orderData = { userId, ticketId, timestamp: Date.now() };
    rabbitChannel.sendToQueue('order_queue', Buffer.from(JSON.stringify(orderData)));
    res.status(202).json({
      message: "Order received. Processing in background.",
      orderId: `ORD-${Date.now()}`,
      userId,
      ticketId
    });
  });

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => console.log(`Booking Service on port ${PORT}`));
}).catch(err => {
  console.error('Failed to init:', err);
  process.exit(1);
});
