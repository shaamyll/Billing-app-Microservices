# RouteGo - Distributed Bus Ticket Reservation System

A microservices-based bus ticket booking platform supporting multi-stop routes, segment-based seat availability, saga-orchestrated booking flow, and real-time payment processing.

## Why This Project

Unlike typical seat-booking systems that treat a seat as simply "booked" or "free," this platform models seat availability **per route segment**. A single seat can be booked by multiple passengers on the same trip as long as their journeys don't overlap (e.g., Seat 5 can be booked for Stop A → Stop C by one passenger and Stop C → Stop D by another, on the same bus, same trip). This segment-overlap model is the core technical differentiator of the system.

## How It Works — End-to-End Workflow

This is the complete journey a booking takes through the system, from a passenger opening the app to receiving a confirmed ticket.

### 1. Authentication
The passenger registers or logs in via the **User Service** (through the **API Gateway**). A successful login returns a short-lived **access token** and a long-lived **refresh token**. The access token is sent as a Bearer token on every subsequent request; the Gateway verifies it before forwarding requests to any downstream service.

### 2. Route & Trip Discovery
The passenger searches for a journey (e.g., "City A to City C, tomorrow"):
- The **Route Service** stores routes as an ordered sequence of stops, each with a `sequence_number` (e.g., A=1, B=2, C=3, D=4).
- The **Trip Service** stores actual scheduled trips — a specific bus running a specific route on a specific date — and exposes a search endpoint that returns trips whose route includes both the requested origin and destination stops, in the correct order.
- The response includes the trip's seat layout, so the passenger can see the bus's seat map.

### 3. Checking Seat Availability (the core technical piece)
For a chosen trip and a chosen seat, the passenger specifies their travel segment (from Stop A to Stop C). The **Booking Service** checks: does this segment overlap with any *existing* booking on that same seat for this trip?
```
overlaps = (existing.from_seq < new.to_seq) AND (new.from_seq < existing.to_seq)
```
If there's no overlap, the seat is available for that segment — even if it's already booked for a *different, non-overlapping* segment by someone else.

### 4. Holding the Seat (concurrency-safe)
When the passenger clicks "Book," the Booking Service doesn't immediately confirm — it first acquires a **Redis distributed lock** keyed by `trip_id:seat_id`, re-checks the segment overlap (to guard against a race with another passenger booking the same seat/segment at the same instant), and if it's still free, creates a time-limited `PENDING` hold on that seat/segment. The lock is released immediately after the hold is written — it's only needed for the brief check-and-write window, not for the whole payment process.

### 5. Payment (orchestrated saga)
The **Booking Orchestrator** now takes over:
- It calls the **Payment Service** to charge the passenger, passing an idempotency key so a retried request (e.g., due to a network blip) never double-charges.
- **If payment succeeds:** the booking's status is updated to `CONFIRMED`, and a `BookingConfirmed` event is published.
- **If payment fails:** the seat hold is released immediately (the segment becomes available again for others), the booking is marked `FAILED`, and a `BookingFailed` event is published.

This hold → charge → confirm-or-release sequence is the saga — a series of steps with an explicit compensating action (releasing the seat) if a later step fails.

### 6. Safety Net for Abandoned Holds
If the Orchestrator crashes mid-flow, or a passenger simply abandons the booking after holding a seat but before paying, that seat would stay locked forever without a cleanup mechanism. The **Scheduler Service** runs periodically, finds any `PENDING` holds older than their TTL, and releases them back to availability — this is what makes the system self-healing rather than requiring manual intervention.

### 7. Notification
The **Notification Service** listens on Kafka for `BookingConfirmed`, `BookingFailed`, and `BookingCancelled` events (published by the Orchestrator) and sends the passenger a confirmation, failure notice, or cancellation/refund notice accordingly — completely decoupled from the booking flow itself, so a slow email/SMS provider never blocks or delays the booking transaction.

### 8. Cancellation (mirrors the booking saga)
If a passenger cancels a confirmed booking, the Orchestrator triggers the reverse flow: call Payment Service to refund, mark the booking `CANCELLED`, release the seat/segment back to availability, and emit a `BookingCancelled` event for the Notification Service to pick up.

### Visual summary of the flow
```
Passenger
   │
   ▼
API Gateway ──► User Service (auth)
   │
   ▼
Route Service (stops) ──► Trip Service (search, seat layout)
   │
   ▼
Booking Service ──► [Redis lock: check overlap, create PENDING hold]
   │
   ▼
Booking Orchestrator
   │
   ├─► Payment Service (charge, idempotent)
   │       │
   │       ├── success ──► CONFIRMED ──► Kafka: BookingConfirmed
   │       └── failure ──► release hold ──► Kafka: BookingFailed
   │
   ▼
Scheduler Service (sweeps expired PENDING holds, safety net)
   │
   ▼
Notification Service (consumes Kafka events, notifies passenger)
```

## Current Build Progress

- ✅ **API Gateway** — request proxying via a reusable `proxyFactory`
- ✅ **User Service** — registration, login, JWT auth (access + refresh), Postgres via Prisma, repository pattern
- ✅ **Shared `utils` package** — `hashPassword`, `jwt`, `http.errors`, `http.response`, `logger`, `PrismaRepositoryAdapter`
- ⏳ **Route Service** — next up
- ⏳ **Trip Service**
- ⏳ **Booking Service** (segment-overlap logic + Redis lock)
- ⏳ **Booking Orchestrator**
- ⏳ **Payment Service**
- ⏳ **Notification Service**
- ⏳ **Scheduler Service**

## Project Structure

```
bus-booking-microservice/
├── api-gateway/
│   └── src/ (config, proxy, routes, app.ts, server.ts)
├── user-service/
│   ├── prisma/ (schema, migrations)
│   └── src/ (config, controllers, interface, repositories, routes, services)
├── route-service/          (to be built)
├── trip-service/           (to be built)
├── booking-service/        (to be built)
├── booking-orchestrator/   (to be built)
├── payment-service/        (to be built)
├── notification-service/   (to be built)
├── scheduler-service/      (to be built)
├── utils/
│   └── src/ (hashPassword, jwt, http.errors, http.response, logger, PrismaRepositoryAdapter)
├── proto/                  (gRPC contracts for internal service-to-service calls)
├── docs/, scripts/
├── docker-compose.yml
└── package.json
```

## Core Domain Model

```
stops        : id, name, sequence_number (per route)
routes       : id, name, list of ordered stops
trips        : id, route_id, bus_id, departure_date, total_seats
seats        : id, trip_id, seat_number
bookings     : id, trip_id, seat_id, from_stop_seq, to_stop_seq, status, user_id
```

## Why Microservices (Not Just "Because")

- **Booking/seat logic** needs strict transactional locking under contention — isolated so this rigor doesn't burden the rest of the system
- **Payment** depends on an external gateway with its own latency/failure profile — isolated so a gateway hiccup never blocks trip browsing or search
- **Notification** depends on external SMS/email providers — isolated so a slow provider never blocks booking confirmation
- **Search/browsing traffic** is far higher-volume than booking-write traffic — separable so only the busy service needs to scale
- **Independent deployability** — payment provider changes, notification template changes, etc. ship without touching booking logic

*(For this project's actual scale, a monolith would work fine — this architecture is a deliberate choice to practice designing service boundaries, failure isolation, and scaling strategy the way a production system at real scale would require.)*

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Caching/Locking**: Redis
- **Messaging**: Kafka
- **Inter-service communication**: REST (Gateway → services), gRPC via `proto/` (internal calls, e.g. Booking → Trip)
- **Authentication**: JWT (access + refresh tokens)
- **Containerization**: Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+, Docker & Docker Compose
- PostgreSQL, Redis, Kafka (or use Docker Compose)

### Development Setup
```bash
cd api-gateway && npm install && cd ..
cd user-service && npm install && cd ..
cd utils && npm install && cd ..
```

### Start with Docker Compose
```bash
docker-compose up -d
```

### Health Checks
```bash
curl http://localhost:3000/api/health   # API Gateway
curl http://localhost:3001/health       # User Service
```

## API Endpoints

### User Service *(done)*
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/profile`

### Route Service *(planned)*
- `POST /routes` — create a route with ordered stops
- `GET /routes`
- `GET /routes/:id/stops`

### Trip Service *(planned)*
- `POST /trips`
- `GET /trips?from=&to=&date=`
- `GET /trips/:id/seats`

### Booking Service *(planned)*
- `GET /trips/:id/availability?from=&to=`
- `POST /bookings/hold`

### Booking Orchestrator *(planned)*
- `POST /bookings/confirm`
- `POST /bookings/:id/cancel`

### Payment Service *(planned)*
- `POST /payments/charge`
- `POST /payments/refund`

## Environment Variables

```env
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://localhost:5432/routego-<service>
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
JWT_SECRET=your-secret-key
```

## Next Steps

1. Build **Route Service** — same structure as User Service (Prisma schema, repository pattern, own `.env`)
2. Build **Trip Service** — depends on Route Service for stop sequences
3. Build **Booking Service** — implement and unit-test the segment-overlap availability logic first, in isolation
4. Add Redis distributed locking around the seat-hold operation
5. Build the **Booking Orchestrator** saga (hold → pay → confirm/compensate)
6. Wire up Kafka events between Orchestrator and Notification Service
7. Add the **Scheduler Service** to sweep expired seat holds
8. Extend the API Gateway's `proxyFactory` to route to each new service
9. Add integration tests, especially concurrency tests for simultaneous seat-hold attempts 