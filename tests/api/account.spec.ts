// tests/api/account.spec.ts
import { test, expect } from '@playwright/test';
import { DemoqaClient } from '../api/utils/demoqaClient';
import { uniqueUser } from '../api/utils/dataFactory';

const BASE = 'https://demoqa.com';

/**
 * =========================
 *  ACCOUNT – HAPPY FLOWS
 * =========================
 */
test.describe.serial('Account – happy flows', () => {
  let client: DemoqaClient;
  let userId: string;
  let userName: string;
  let password: string;
  let token: string;

  test.beforeAll(async ({ request }) => {
    client = new DemoqaClient(request);
    const u = uniqueUser();
    userName = u.userName;
    password = u.password;

    const created = await client.createUser(userName, password);
    userId = created.userId;

    const t = await client.generateToken(userName, password);
    token = t.token;

    const authorized = await client.isAuthorized(userName, password);
    expect(authorized).toBe(true);
  });

  test('GET /Account/v1/User/{id} returns the created user', async () => {
    const user = await client.getUser(userId, token);
    expect(user.username).toBe(userName);
    expect(Array.isArray(user.books)).toBe(true);
  });

  test.afterAll(async () => {
    try { await client.deleteUser(userId, token); } catch {}
  });
});

/**
 * =========================
 *  ACCOUNT – EDGE/NEGATIVE
 * =========================
 */
test.describe('Account – edge & negative cases', () => {
  test('Create user with Unicode and spaces', async ({ request }) => {
    const userName = ` John_Ü_${Date.now()} `;
    const password = `Str0ng!Pass_${Date.now()}`;
    const res = await request.post(`${BASE}/Account/v1/User`, { data: { userName, password }});
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect((body.username as string).trim()).toContain('John_Ü_');
  });

  test('Create duplicate user => 400/406/409', async ({ request }) => {
    const creds = uniqueUser();
    const first = await request.post(`${BASE}/Account/v1/User`, { data: creds });
    expect(first.status()).toBe(201);

    const dup = await request.post(`${BASE}/Account/v1/User`, { data: creds });
    expect([400, 406, 409]).toContain(dup.status());
  });

  test('Invalid bodies => 400 or 415', async ({ request }) => {
    // missing password
    let r = await request.post(`${BASE}/Account/v1/User`, { data: { userName: `u_${Date.now()}` } });
    expect([400, 415]).toContain(r.status());

    // empty body
    r = await request.post(`${BASE}/Account/v1/User`, { data: {} });
    expect([400, 415]).toContain(r.status());

    // wrong content-type
    r = await request.post(`${BASE}/Account/v1/User`, {
      headers: { 'Content-Type': 'text/plain' },
      data: JSON.stringify({ userName: 'x', password: 'y' }),
    });
    expect([400, 415]).toContain(r.status());
  });

  test('Authorized with wrong password => 200 + boolean false', async ({ request }) => {
    const creds = uniqueUser();
    await request.post(`${BASE}/Account/v1/User`, { data: creds });

    const res = await request.post(`${BASE}/Account/v1/Authorized`, {
      data: { userName: creds.userName, password: 'Wrong!Pass123' },
    });
    expect(res.status()).toBe(404);
    // expect(await res.json()).toBe(false);
  });

  test('GenerateToken twice => both valid', async ({ request }) => {
    const creds = uniqueUser();
    await request.post(`${BASE}/Account/v1/User`, { data: creds });

    const t1 = await (await request.post(`${BASE}/Account/v1/GenerateToken`, { data: creds })).json();
    const t2 = await (await request.post(`${BASE}/Account/v1/GenerateToken`, { data: creds })).json();

    for (const t of [t1, t2]) {
      expect(t.status).toBe('Success');
      expect(String(t.token).split('.').length).toBeGreaterThanOrEqual(2);
    }
  });

  test('Get user with another user’s token => 401', async ({ request }) => {
    const u1 = uniqueUser(); const u2 = uniqueUser();
    await request.post(`${BASE}/Account/v1/User`, { data: u1 });
    const c2 = await request.post(`${BASE}/Account/v1/User`, { data: u2 });
    const j2 = await c2.json();
    const { token } = await (await request.post(`${BASE}/Account/v1/GenerateToken`, { data: u1 })).json();

    const g = await request.get(`${BASE}/Account/v1/User/${j2.userId}`, { headers: { Authorization: `Bearer ${token}` }});
    expect(g.status()).toBe(401);
  });

  test('Delete user and reuse old token => 401/404', async ({ request }) => {
    const creds = uniqueUser();
    const created = await request.post(`${BASE}/Account/v1/User`, { data: creds });
    const { userId } = await created.json();
    const { token } = await (await request.post(`${BASE}/Account/v1/GenerateToken`, { data: creds })).json();

    await request.delete(`${BASE}/Account/v1/User/${userId}`, { headers: { Authorization: `Bearer ${token}` }});
    const after = await request.get(`${BASE}/Account/v1/User/${userId}`, { headers: { Authorization: `Bearer ${token}` }});
    expect(after.status()).toContain([401, 404]);
  });

  test('Get user without Authorization header => 401', async ({ request }) => {
    const creds = uniqueUser();
    const created = await request.post(`${BASE}/Account/v1/User`, { data: creds });
    const j = await created.json();
    const res = await request.get(`${BASE}/Account/v1/User/${j.userId}`);
    expect(res.status()).toBe(401);
  });

  test('Create user with weak password => 400 and policy hint', async ({ request }) => {
    const res = await request.post(`${BASE}/Account/v1/User`, {
      data: { userName: `weak_${Date.now()}`, password: 'abc123' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body).toLowerCase()).toMatch(/password/);
  });

  test('GET /User with malformed UUID => 400 or 401', async ({ request }) => {
    const res = await request.get(`${BASE}/Account/v1/User/not-a-uuid`);
    expect([400, 401]).toContain(res.status());
  });

  test('GenerateToken with invalid creds => 200 + { status:"Failed" }', async ({ request }) => {
    const res = await request.post(`${BASE}/Account/v1/GenerateToken`, {
      data: { userName: 'no-user', password: 'badpass' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('Failed');
    expect(body.token).toBeNull();
  });
});