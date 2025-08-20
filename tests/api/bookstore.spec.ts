// tests/api/bookstore.spec.ts
import { test, expect } from '@playwright/test';
import { DemoqaClient } from '../api/utils/demoqaClient';
import { uniqueUser } from '../api/utils/dataFactory';
import { BooksListSchema, BookSchema } from '../api/utils/schemas';
import { within } from '../api/utils/time';

const BASE = 'https://demoqa.com';

/**
 * ==========================
 *  BOOKSTORE – HAPPY FLOWS
 * ==========================
 */
test.describe.serial('BookStore – happy flows', () => {
  let client: DemoqaClient;
  let userId: string;
  let token: string;

  test.beforeAll(async ({ request }) => {
    client = new DemoqaClient(request);
    const creds = uniqueUser();
    const c = await client.createUser(creds.userName, creds.password);
    userId = c.userId;
    token = (await client.generateToken(creds.userName, creds.password)).token;
  });

  test('List -> add one -> verify -> delete one -> delete all', async () => {
    const { books } = await client.listBooks();
    expect(books.length).toBeGreaterThan(0);

    const firstIsbn = books[0].isbn;

    const added = await client.addBooks(userId, token, [firstIsbn]);
    expect(JSON.stringify(added)).toContain(firstIsbn);

    const userAfterAdd = await client.getUser(userId, token);
    const isbns = (userAfterAdd.books || []).map((b: any) => b.isbn);
    expect(isbns).toContain(firstIsbn);

    await client.deleteBook(userId, token, firstIsbn);
    await client.deleteAllBooks(userId, token);

    const userAfterDeleteAll = await client.getUser(userId, token);
    expect((userAfterDeleteAll.books || []).length).toBe(0);
  });

  test('Get a book by ISBN', async () => {
    const { books } = await client.listBooks();
    const isbn = books[0].isbn;
    const book = await client.getBook(isbn);
    expect(book.isbn).toBe(isbn);
    expect(book.title).toBeTruthy();
  });
});

/**
 * ==========================
 *  BOOKSTORE – EDGE/NEGATIVE
 * ==========================
 */
test.describe('BookStore – edge & negative cases', () => {
  let client: DemoqaClient;
  let userId: string;
  let token: string;

  test.beforeAll(async ({ request }) => {
    client = new DemoqaClient(request);
    const creds = uniqueUser();
    const c = await client.createUser(creds.userName, creds.password);
    userId = c.userId;
    token = (await client.generateToken(creds.userName, creds.password)).token;
  });

  test.afterAll(async () => {
    try { await client.deleteAllBooks(userId, token); } catch {}
  });

  test('Books schema and performance (< 1500ms)', async ({ request }) => {
    const start = Date.now();
    const res = await within(request.get(`${BASE}/BookStore/v1/Books`), 4000);
    expect(res.status()).toBe(200);
    const json = await res.json();
    BooksListSchema.parse(json);
    expect(Date.now() - start).toBeLessThan(1500);
    expect(res.headers()['content-type']).toMatch(/application\/json/i);
  });

  test('Add multiple ISBNs at once', async () => {
    const { books } = await client.listBooks();
    const toAdd = books.slice(0, 3).map(b => b.isbn);
    const added = await client.addBooks(userId, token, toAdd);
    const payload = JSON.stringify(added);
    for (const isbn of toAdd) expect(payload).toContain(isbn);
  });

  test('Add duplicate ISBN => 400 or not duplicated when reading back', async ({ request }) => {
    const { books } = await client.listBooks();
    const isbn = books[0].isbn;
    await client.addBooks(userId, token, [isbn]);

    const again = await request.post(`${BASE}/BookStore/v1/Books`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId, collectionOfIsbns: [{ isbn }] },
    });
    expect([400, 201]).toContain(again.status());

    if (again.status() === 201) {
      const user = await client.getUser(userId, token);
      const count = (user.books || []).filter((b: any) => b.isbn === isbn).length;
      expect(count).toBe(1);
    }
  });

  test('GET /Book with lowercase param name => 400/404', async ({ request }) => {
    const { books } = await client.listBooks();
    const isbn = books[0].isbn;
    const res = await request.get(`${BASE}/BookStore/v1/Book`, { params: { isbn } }); // wrong param name
    expect([400, 404]).toContain(res.status());
  });

  test('DELETE /Books is idempotent (twice)', async () => {
    await client.deleteAllBooks(userId, token);
    await client.deleteAllBooks(userId, token);
  });

  test('DELETE /Book without isbn in body => 400', async ({ request }) => {
    const res = await request.delete(`${BASE}/BookStore/v1/Book`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId }, // missing isbn
    });
    expect(res.status()).toBe(400);
  });

  test('Add book with invalid token => 401', async ({ request }) => {
    const { books } = await client.listBooks();
    const isbn = books[0].isbn;
    const res = await request.post(`${BASE}/BookStore/v1/Books`, {
      headers: { Authorization: 'Bearer invalid.token' },
      data: { userId, collectionOfIsbns: [{ isbn }] },
    });
    expect(res.status()).toBe(401);
  });

  test('Add non-existing ISBN => 400', async ({ request }) => {
    const res = await request.post(`${BASE}/BookStore/v1/Books`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { userId, collectionOfIsbns: [{ isbn: '0000000000000' }] },
    });
    expect(res.status()).toBe(400);
  });

  test('GET /Book returns a valid schema', async () => {
    const { books } = await client.listBooks();
    const b = await client.getBook(books[0].isbn);
    BookSchema.parse(b);
  });
});