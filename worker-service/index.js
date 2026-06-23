const amqp = require('amqplib');
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  ticketId: String,
  status: { type: String, default: 'CONFIRMED' },
  createdAt: Date
});
const Order = mongoose.model('Order', orderSchema);

async function startWorker() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅ Connected to MongoDB");

  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue('order_queue');

  console.log("👂 Worker listening for orders...");

  channel.consume('order_queue', async (msg) => {
    if (msg !== null) {
      const orderData = JSON.parse(msg.content.toString());
      try {
        const newOrder = new Order({
          userId: orderData.userId,
          ticketId: orderData.ticketId,
          createdAt: new Date(orderData.timestamp)
        });
        await newOrder.save();
        console.log(`✅ Persisted order for User: ${orderData.userId}`);
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Failed to process order", error);
      }
    }
  });
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
