import { APIRequestContext, expect } from '@playwright/test';

export class DemoqaClient {
  constructor(private request: APIRequestContext, private baseURL = 'https://demoqa.com') {}

  // ===== Account =====
  async createUser(userName: string, password: string) {
    const res = await this.request.post(`${this.baseURL}/Account/v1/User`, {
      data: { userName, password },
    });
    expect(res.status(), 'create user status').toBe(201);
    return res.json() as Promise<{ userId: string; username: string; books: any[] }>;
  }

  async generateToken(userName: string, password: string) {
    const res = await this.request.post(`${this.baseURL}/Account/v1/GenerateToken`, {
      data: { userName, password },
    });
    expect(res.status(), 'generate token status').toBe(200);
    const body = await res.json() as { token: string; status: string; result: string; expires: string };
    expect(body.status).toBe('Success');
    expect(body.token).toBeTruthy();
    return body;
  }

  async isAuthorized(userName: string, password: string) {
    const res = await this.request.post(`${this.baseURL}/Account/v1/Authorized`, {
      data: { userName, password },
    });
    expect(res.status()).toBe(200);
    return res.json() as Promise<boolean>;
  }

  async getUser(userId: string, token: string) {
    const res = await this.request.get(`${this.baseURL}/Account/v1/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    return res.json();
  }

  async deleteUser(userId: string, token: string) {
    const res = await this.request.delete(`${this.baseURL}/Account/v1/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 204]).toContain(res.status());
    return res.json().catch(() => ({}));
  }

  // ===== BookStore =====
  async listBooks() {
    const res = await this.request.get(`${this.baseURL}/BookStore/v1/Books`);
    expect(res.status()).toBe(200);
    return res.json() as Promise<{ books: Array<{ isbn: string }> }>;
  }

  async getBook(isbn: string) {
    const res = await this.request.get(`${this.baseURL}/BookStore/v1/Book`, { params: { ISBN: isbn } });
    expect(res.status()).toBe(200);
    return res.json();
  }

  async addBooks(userId: string, token: string, isbns: string[]) {
    const res = await this.request.post(`${this.baseURL}/BookStore/v1/Books`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        userId,
        collectionOfIsbns: isbns.map(isbn => ({ isbn })),
      },
    });
    expect(res.status()).toBe(201);
    return res.json();
  }

  async deleteAllBooks(userId: string, token: string) {
    const res = await this.request.delete(`${this.baseURL}/BookStore/v1/Books`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { UserId: userId },
    });
    expect([200, 204]).toContain(res.status());
    return res.json().catch(() => ({}));
  }

  async deleteBook(userId: string, token: string, isbn: string) {
    const res = await this.request.delete(`${this.baseURL}/BookStore/v1/Book`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId, isbn },
    });
    expect([200, 204]).toContain(res.status());
    return res.json().catch(() => ({}));
  }
}