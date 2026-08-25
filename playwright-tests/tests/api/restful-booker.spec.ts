import { test, expect, request } from '@playwright/test';
import { URLS } from '../../config/urls';

/**
 * API-layer tests for Restful-Booker using Playwright's request client.
 * This complements the Java/Rest Assured suite and proves API coverage in TypeScript too. 
 */
const BASE = URLS.restfulBooker;

// Restful-Booker returns 418 without an acceptable Accept header, so send one for all requests.
test.use({ extraHTTPHeaders: { Accept: 'application/json' } });

async function getToken(ctx: Awaited<ReturnType<typeof request.newContext>>): Promise<string> {
  const res = await ctx.post(`${BASE}/auth`, {
    data: { username: 'admin', password: 'password123' },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).token;
}

const samplePayload = {
  firstname: 'John',
  lastname: 'Doe',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2024-01-01', checkout: '2024-01-10' },
  additionalneeds: 'Breakfast',
};

test.describe('Restful-Booker API (via Playwright)', () => {
  test('GET /ping - health check', async ({ request }) => {
    const res = await request.get(`${BASE}/ping`);
    expect(res.status()).toBe(201);
  });

  test('POST /auth - returns a token', async ({ request }) => {
    const token = await getToken(request);
    expect(token).toBeTruthy();
  });

  test('POST /booking - creates a booking', async ({ request }) => {
    const res = await request.post(`${BASE}/booking`, { data: samplePayload });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking.firstname).toBe('John');
    expect(body.booking.totalprice).toBe(150);
  });

  test('GET /booking/:id - reads a created booking', async ({ request }) => {
    const created = await request.post(`${BASE}/booking`, { data: samplePayload });
    const { bookingid } = await created.json();

    const res = await request.get(`${BASE}/booking/${bookingid}`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.firstname).toBe('John');
    expect(body.bookingdates.checkin).toBe('2024-01-01');
  });

  test('PUT /booking/:id - full update with token', async ({ request }) => {
    const created = await request.post(`${BASE}/booking`, { data: samplePayload });
    const { bookingid } = await created.json();
    const token = await getToken(request);

    const res = await request.put(`${BASE}/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` },
      data: { ...samplePayload, firstname: 'Jane', totalprice: 250 },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.firstname).toBe('Jane');
    expect(body.totalprice).toBe(250);
  });

  test('DELETE /booking/:id - removes a booking', async ({ request }) => {
    const created = await request.post(`${BASE}/booking`, { data: samplePayload });
    const { bookingid } = await created.json();
    const token = await getToken(request);

    const del = await request.delete(`${BASE}/booking/${bookingid}`, {
      headers: { Cookie: `token=${token}` },
    });
    expect(del.status()).toBe(201);

    const check = await request.get(`${BASE}/booking/${bookingid}`);
    expect(check.status()).toBe(404);
  });

  test('DELETE without token is forbidden', async ({ request }) => {
    const created = await request.post(`${BASE}/booking`, { data: samplePayload });
    const { bookingid } = await created.json();

    const del = await request.delete(`${BASE}/booking/${bookingid}`);
    expect(del.status()).toBe(403);
  });
});
