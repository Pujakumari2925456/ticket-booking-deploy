# 🎟️ TicketFlow — Scalable Flash Sale Ticket Booking

A production-grade microservices architecture built for **System Design interviews**.  
Handles massive concurrent traffic (10K+ users) without crashing, overselling, or slowing down.

---

## 🏗️ Architecture

```
[Browser] → [Nginx :80] → [API Gateway :4000] → [Booking Service :4001]
                                    ↓                       ↓
                              Redis Rate Limit         Redis Cache (~1ms)
                                                            ↓
                                                       RabbitMQ Queue
                                                            ↓
                                                     Worker Service
                                                            ↓
                                                        MongoDB
```

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Express + HTML/CSS/JS | Live dashboard UI |
| Load Balancer | Nginx | Reverse proxy |
| API Gateway | Node.js + Express | Rate limiting (Redis-backed) |
| Booking Service | Node.js + Express | Cache check + queue publish |
| Worker Service | Node.js | Async MongoDB persistence |
| Cache | Redis | Inventory + rate limit store |
| Message Queue | RabbitMQ | Order shock absorber |
| Database | MongoDB | Permanent order storage |
| Infra | Docker + Docker Compose | One-command startup |

---

## 🚀 Run the Entire Project (One Command)

### Prerequisites
- Docker Desktop installed and **running**

### Start everything:
```bash
docker-compose up -d --build
```

Wait ~30 seconds for RabbitMQ to fully initialize, then open:

| URL | What you'll see |
|---|---|
| **http://localhost** | 🎯 Live Dashboard UI |
| http://localhost:4000 | API Gateway |
| http://localhost:4001 | Booking Service |
| http://localhost:3000 | Frontend (direct) |
| http://localhost:15672 | RabbitMQ Management UI (guest/guest) |

---

## 🧪 How to Demo in Interview

### 1. Show the Dashboard
Open **http://localhost** — shows live inventory, booking form, activity log, architecture flow.

### 2. Book a Ticket
- Fill userId + ticketId → click **Book Ticket**
- See `202 Accepted` response in ~68ms
- Inventory counter decrements in real time

### 3. Prove Rate Limiting
- Click **🚀 Fire Requests** (stress test — sends 6 requests)
- First 5 succeed → 6th gets `429 Too Many Requests`
- Watch the "Rate Limited" counter go up

### 4. Watch Worker Process Orders
```bash
docker-compose logs -f worker-service
```
See orders being pulled from RabbitMQ and saved to MongoDB.

### 5. Verify MongoDB Persistence
```bash
docker exec -it $(docker ps -qf name=mongodb) mongosh flashsale --eval "db.orders.find().pretty()"
```

---

## 📂 Project Structure

```
ticket-booking/
├── docker-compose.yml         ← Starts all 8 containers
├── nginx/
│   └── nginx.conf             ← Reverse proxy config
├── frontend-service/
│   ├── public/index.html      ← Dashboard UI
│   ├── server.js              ← Express static server
│   ├── package.json
│   └── Dockerfile
├── gateway-service/
│   ├── index.js               ← Rate limiter + proxy
│   ├── package.json
│   └── Dockerfile
├── booking-service/
│   ├── index.js               ← Redis check + RabbitMQ publish
│   ├── package.json
│   └── Dockerfile
└── worker-service/
    ├── index.js               ← RabbitMQ consumer + MongoDB write
    ├── package.json
    └── Dockerfile
```

---

## 🔑 Key System Design Concepts Demonstrated

**Cache-Aside Pattern** — Inventory lives in Redis RAM. Reads ~1ms. DECR is atomic, preventing overselling.

**Event-Driven Architecture** — RabbitMQ buffers 10K requests. Returns 202 instantly. Worker drains queue at safe pace.

**Distributed Rate Limiting** — Counts stored in Redis, not memory. Scales across multiple gateway instances.

**Eventual Consistency** — Redis is source of truth during flash sale. MongoDB syncs asynchronously.

**Dead Letter Queue** — Failed orders stay un-acked in RabbitMQ for retry (no data loss).

---

## 🛑 Stop Everything

```bash
docker-compose down
```

To also wipe data:
```bash
docker-compose down -v
```
