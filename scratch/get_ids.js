const { Client } = require('pg');

async function queryRows(port, dbName, sql) {
  const client = new Client({
    connectionString: `postgresql://postgres:safeerapk11@localhost:${port}/${dbName}`
  });
  try {
    await client.connect();
    const result = await client.query(sql);
    await client.end();
    return result.rows;
  } catch (error) {
    await client.end().catch(() => {});
    return [];
  }
}

async function main() {
  console.log('====================================================');
  console.log('       RouteGo Microservices - Active Entity IDs     ');
  console.log('====================================================\n');

  // 1. Users
  const users = await queryRows(5433, 'busbooking_user_db', 'SELECT id, email, name, role FROM "User" LIMIT 5');
  console.log('--- 1. USERS (busbooking_user_db : 5433) ---');
  if (users.length === 0) {
    console.log('  (No users found)');
  } else {
    users.forEach(u => console.log(`  User ID : ${u.id} | Email: ${u.email} | Role: ${u.role}`));
  }

  // 2. Routes
  const routes = await queryRows(5434, 'busbooking_route_db', 'SELECT id, name FROM "Route" LIMIT 5');
  console.log('\n--- 2. ROUTES (busbooking_route_db : 5434) ---');
  if (routes.length === 0) {
    console.log('  (No routes found)');
  } else {
    routes.forEach(r => console.log(`  Route ID: ${r.id} | Name: ${r.name}`));
  }

  // 3. Buses & Seats
  const buses = await queryRows(5435, 'busbooking_trip_db', 'SELECT id, "registrationNumber", "busType" FROM "Bus" LIMIT 5');
  console.log('\n--- 3. BUSES (busbooking_trip_db : 5435) ---');
  if (buses.length === 0) {
    console.log('  (No buses found)');
  } else {
    buses.forEach(b => console.log(`  Bus ID  : ${b.id} | Reg: ${b.registrationNumber} | Type: ${b.busType}`));
  }

  const seats = await queryRows(5435, 'busbooking_trip_db', 'SELECT id, "seatNumber", "seatType", "busId" FROM "Seat" LIMIT 6');
  console.log('\n--- 4. SEATS (busbooking_trip_db : 5435) ---');
  if (seats.length === 0) {
    console.log('  (No seats found)');
  } else {
    seats.forEach(s => console.log(`  Seat ID : ${s.id} | Seat#: ${s.seatNumber} | Type: ${s.seatType} | Bus ID: ${s.busId}`));
  }

  // 4. Trips
  const trips = await queryRows(5435, 'busbooking_trip_db', 'SELECT id, "routeId", "busId", "departureDate", "departureTime", status FROM "Trip" LIMIT 5');
  console.log('\n--- 5. TRIPS (busbooking_trip_db : 5435) ---');
  if (trips.length === 0) {
    console.log('  (No trips found)');
  } else {
    trips.forEach(t => console.log(`  Trip ID : ${t.id} | Route: ${t.routeId} | Bus: ${t.busId} | Departure: ${t.departureDate.toISOString().slice(0, 10)} ${t.departureTime}`));
  }

  // 5. Bookings
  const bookings = await queryRows(5436, 'busbooking_booking_db', 'SELECT id, status, "tripId", "seatId", "fromStopSeq", "toStopSeq" FROM "Booking" LIMIT 5');
  console.log('\n--- 6. BOOKINGS (busbooking_booking_db : 5436) ---');
  if (bookings.length === 0) {
    console.log('  (No bookings found)');
  } else {
    bookings.forEach(b => console.log(`  Booking ID: ${b.id} | Status: ${b.status} | Trip: ${b.tripId} | Seat: ${b.seatId} | Stops: ${b.fromStopSeq}->${b.toStopSeq}`));
  }

  // 6. Payments
  const payments = await queryRows(5437, 'busbooking_payment_db', 'SELECT id, status, "bookingId", amount, currency FROM "Payment" LIMIT 5');
  console.log('\n--- 7. PAYMENTS (busbooking_payment_db : 5437) ---');
  if (payments.length === 0) {
    console.log('  (No payments found)');
  } else {
    payments.forEach(p => console.log(`  Payment ID: ${p.id} | Status: ${p.status} | Booking: ${p.bookingId} | Amount: ${p.amount} ${p.currency}`));
  }

  console.log('\n====================================================');
}

main().catch(console.error);
