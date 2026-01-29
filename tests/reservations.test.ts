// Tests for the Reservation API

import assert from 'node:assert';
import { beforeEach, test } from 'node:test';
import { buildApp } from '../src/app.js';
import { clearReservations } from '../src/db.js';

// Helper to create a future date
function getFutureDate(hoursFromNow: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
}

// Helper to create a future date with minute offset
function getFutureDateMinutes(minutesFromNow: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesFromNow);
  return date.toISOString();
}

beforeEach(() => {
  clearReservations();
});

test('POST /reservations - creates a valid reservation', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Team Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  assert.strictEqual(response.statusCode, 201);
  const body = response.json();
  assert.ok(body.id);
  assert.strictEqual(body.roomId, '1');
  assert.strictEqual(body.title, 'Team Meeting');
});

test('POST /reservations - rejects invalid room ID', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: 'invalid-room',
      title: 'Team Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  assert.ok(body.message.includes('Invalid room ID'));
});

test('POST /reservations - rejects room ID outside range 1-10', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '11',
      title: 'Team Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  assert.ok(body.message.includes('Valid room IDs are 1-10'));
});

test('POST /reservations - rejects reservation shorter than 5 minutes', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Quick Meeting',
      startTime: getFutureDateMinutes(60),
      endTime: getFutureDateMinutes(63), // Only 3 minutes
    },
  });

  assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  assert.ok(body.message.includes('at least 5 minutes'));
});

test('POST /reservations - allows exactly 5 minute reservation', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Quick Standup',
      startTime: getFutureDateMinutes(60),
      endTime: getFutureDateMinutes(65), // Exactly 5 minutes
    },
  });

  assert.strictEqual(response.statusCode, 201);
});

test('POST /reservations - rejects reservation in the past', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const pastDate = new Date();
  pastDate.setHours(pastDate.getHours() - 2);

  const endDate = new Date();
  endDate.setHours(endDate.getHours() - 1);

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Past Meeting',
      startTime: pastDate.toISOString(),
      endTime: endDate.toISOString(),
    },
  });

  assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  assert.ok(body.message.includes('past'));
});

test('POST /reservations - rejects when end time is before start time', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Invalid Meeting',
      startTime: getFutureDate(3),
      endTime: getFutureDate(2),
    },
  });

  assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  assert.ok(body.message.includes('before end time'));
});

test('POST /reservations - rejects overlapping reservations', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  // Create first reservation
  await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'First Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(3),
    },
  });

  // Try to create overlapping reservation
  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Overlapping Meeting',
      startTime: getFutureDate(2),
      endTime: getFutureDate(4),
    },
  });

  assert.strictEqual(response.statusCode, 400);
  const body = response.json();
  assert.ok(body.message.includes('overlaps'));
});

test('POST /reservations - allows back-to-back reservations (end time exclusive)', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  // Create first reservation ending at hour 2
  await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'First Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  // Create second reservation starting exactly when first ends (should work - end is exclusive)
  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Second Meeting',
      startTime: getFutureDate(2),
      endTime: getFutureDate(3),
    },
  });

  assert.strictEqual(response.statusCode, 201);
});

test('POST /reservations - allows non-overlapping reservations in same room', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  // Create first reservation
  await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'First Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  // Create non-overlapping reservation
  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Second Meeting',
      startTime: getFutureDate(3),
      endTime: getFutureDate(4),
    },
  });

  assert.strictEqual(response.statusCode, 201);
});

test('POST /reservations - allows same time in different rooms', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  // Create reservation in room 1
  await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Room 1 Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  // Create same time reservation in room 2
  const response = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '2',
      title: 'Room 2 Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  assert.strictEqual(response.statusCode, 201);
});

test('DELETE /reservations/:id - cancels existing reservation', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  // Create a reservation
  const createResponse = await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Meeting to Cancel',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  const { id } = createResponse.json();

  // Cancel it
  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: `/reservations/${id}`,
  });

  assert.strictEqual(deleteResponse.statusCode, 204);
});

test('DELETE /reservations/:id - returns 404 for non-existent reservation', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'DELETE',
    url: '/reservations/non-existent-id',
  });

  assert.strictEqual(response.statusCode, 404);
  const body = response.json();
  assert.ok(body.message.includes('not found'));
});

test('GET /rooms/:roomId/reservations - returns empty array when no reservations', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/rooms/1/reservations',
  });

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.json(), []);
});

test('GET /rooms/:roomId/reservations - returns reservations for specific room', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  // Create reservations in different rooms
  await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '1',
      title: 'Room 1 Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  await app.inject({
    method: 'POST',
    url: '/reservations',
    payload: {
      roomId: '2',
      title: 'Room 2 Meeting',
      startTime: getFutureDate(1),
      endTime: getFutureDate(2),
    },
  });

  // Get room-1 reservations
  const response = await app.inject({
    method: 'GET',
    url: '/rooms/1/reservations',
  });

  assert.strictEqual(response.statusCode, 200);
  const reservations = response.json();
  assert.strictEqual(reservations.length, 1);
  assert.strictEqual(reservations[0].roomId, '1');
  assert.strictEqual(reservations[0].title, 'Room 1 Meeting');
});

test('GET /health - returns ok status', async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: 'GET',
    url: '/health',
  });

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(response.json(), { status: 'ok' });
});
