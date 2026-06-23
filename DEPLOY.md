# 🚀 TicketFlow — Deployment Guide

## Your Cloud Credentials (Already configured in .env.render files)

| Service | Provider | Status |
|---|---|---|
| MongoDB | Atlas (cluster0.eec1oii.mongodb.net) | ✅ Ready |
| Redis | Upstash (fit-kangaroo-68773.upstash.io) | ✅ Ready |
| RabbitMQ | CloudAMQP (warthog.lmq.cloudamqp.com) | ✅ Ready |

---

## STEP 1 — Push to GitHub

```bash
git init
git add .
git commit -m "ticketflow deployment ready"
```

Go to github.com → New repository → name: ticketflow → Create

```bash
git remote add origin https://github.com/YOURUSERNAME/ticketflow.git
git push -u origin main
```

---

## STEP 2 — Deploy booking-service on Render (FIRST)

1. Go to https://render.com → Sign up with GitHub
2. New → Web Service → Connect GitHub repo
3. Settings:
   - Root Directory: booking-service
   - Build Command: npm install
   - Start Command: node index.js
4. Environment Variables (copy from booking-service/.env.render):
   - REDIS_URL = rediss://default:gQAAAAAAAQylAAIgcDI1YzNiYmMwNzdkOWI0ZjY4YjU5MTdlNzAwZTFjOTgxZg@fit-kangaroo-68773.upstash.io:6379
   - RABBITMQ_URL = amqps://gpsrjtbp:hRsVtVbYiYjHxrKf3IM6GYbu78diryqL@warthog.lmq.cloudamqp.com/gpsrjtbp
5. Click Create Web Service
6. ✅ COPY YOUR URL → looks like: https://ticketflow-booking.onrender.com

---

## STEP 3 — Deploy gateway-service on Render

1. New → Web Service → same repo
2. Settings:
   - Root Directory: gateway-service
   - Build Command: npm install
   - Start Command: node index.js
3. Environment Variables (copy from gateway-service/.env.render):
   - REDIS_URL = rediss://default:gQAAAAAAAQylAAIgcDI1YzNiYmMwNzdkOWI0ZjY4YjU5MTdlNzAwZTFjOTgxZg@fit-kangaroo-68773.upstash.io:6379
   - BOOKING_URL = https://ticketflow-booking.onrender.com  ← PASTE YOUR BOOKING URL HERE
4. Click Create Web Service
5. ✅ COPY YOUR URL → looks like: https://ticketflow-gateway.onrender.com

---

## STEP 4 — Deploy worker-service on Render

1. New → Web Service → same repo
2. Settings:
   - Root Directory: worker-service
   - Build Command: npm install
   - Start Command: node index.js
3. Environment Variables (copy from worker-service/.env.render):
   - MONGODB_URL = mongodb+srv://puja:Ticket123@cluster0.eec1oii.mongodb.net/flashsale
   - RABBITMQ_URL = amqps://gpsrjtbp:hRsVtVbYiYjHxrKf3IM6GYbu78diryqL@warthog.lmq.cloudamqp.com/gpsrjtbp
4. Click Create Web Service

---

## STEP 5 — Update Frontend with Gateway URL

Open frontend-service/public/index.html
Find this line near the bottom in the <script> tag:
   const API = '';

Change it to:
   const API = 'https://ticketflow-gateway.onrender.com';  ← YOUR GATEWAY URL

Commit and push:
```bash
git add .
git commit -m "add gateway url to frontend"
git push
```

---

## STEP 6 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. New Project → Import your ticketflow repo
3. Settings:
   - Root Directory: frontend-service
   - Build Command: npm install
   - Output Directory: public
4. Click Deploy
5. ✅ Your live URL: https://ticketflow-xxxx.vercel.app

---

## ✅ Final Check

Open your Vercel URL → you should see the TicketFlow dashboard
- Inventory shows 100 tickets
- Click Book Ticket → 202 Accepted
- Click Fire Requests → 6th request gets 429

🎉 Your app is live on the internet!
