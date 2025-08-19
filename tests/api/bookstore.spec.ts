import { test, expect } from '@playwright/test';
import { BaseApiTest } from './BaseApiTest';
import { TestDataGenerator } from './utils/TestDataGenerator';

test.describe('DemoQA BookStore API Tests', () => {
  let apiTest: BaseApiTest;
  let validUserData: { userName: string; password: string };
  let createdUserId: string;
  let authToken: string;
  let availableBooks: any[];
  let testIsbn: string;

  test.beforeAll(async ({ request }) => {
    apiTest = new BaseApiTest(request);
    
    // Get available books for testing
    const booksResponse = await apiTest.getBooks();
    if (booksResponse.status() === 200) {
      const booksData = await booksResponse.json();
      availableBooks = booksData.books || [];
      if (availableBooks.length > 0) {
        testIsbn = availableBooks[0].isbn;
      }
    }
  });

  test.beforeEach(async ({ request }) => {
    apiTest = new BaseApiTest(request);
    validUserData = {
      userName: TestDataGenerator.generateValidUsername(),
      password: TestDataGenerator.generateValidPassword()
    };
    
    // Create user and get token for tests that need authentication
    const createResponse = await apiTest.createUser(validUserData);
    if (createResponse.status() === 201) {
      const createBody = await createResponse.json();
      createdUserId = createBody.userID;
      
      const tokenResponse = await apiTest.generateToken(validUserData);
      if (tokenResponse.status() === 200) {
        const tokenBody = await tokenResponse.json();
        authToken = tokenBody.token;
      }
    }
  });

  test.afterEach(async () => {
    // Cleanup: delete created user if exists
    if (createdUserId && authToken) {
      try {
        await apiTest.deleteUser(createdUserId, authToken);
      } catch (error) {
        console.log('Cleanup failed:', error);
      }
    }
  });

  test.describe('Get Books - Positive Scenarios', () => {
    test('should get all books successfully', async () => {
      const response = await apiTest.getBooks();
      
      expect([200, 502]).toContain(response.status());
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('books');
      expect(Array.isArray(responseBody.books)).toBe(true);
      
      if (responseBody.books.length > 0) {
        const book = responseBody.books[0];
        expect(book).toHaveProperty('isbn');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('subTitle');
        expect(book).toHaveProperty('author');
        expect(book).toHaveProperty('publish_date');
        expect(book).toHaveProperty('publisher');
        expect(book).toHaveProperty('pages');
        expect(book).toHaveProperty('description');
        expect(book).toHaveProperty('website');
      }
    });

    test('should get specific book by ISBN', async () => {
      test.skip(!testIsbn, 'No books available for testing');
      
      const response = await apiTest.getBook(testIsbn);
      
      expect(response.status()).toBe(200);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('isbn', testIsbn);
      expect(responseBody).toHaveProperty('title');
      expect(responseBody).toHaveProperty('author');
    });
  });

  test.describe('Get Books - Negative Scenarios', () => {
    test('should return 400 for invalid ISBN format', async () => {
      const invalidIsbns = TestDataGenerator.getInvalidIsbns();
      
      for (const invalidIsbn of invalidIsbns.slice(0, 3)) {
        const response = await apiTest.getBook(invalidIsbn);
        expect([400, 404, 502]).toContain(response.status());
      }
    });

    test('should return 400 for non-existent ISBN', async () => {
      const nonExistentIsbn = '9999999999999';
      const response = await apiTest.getBook(nonExistentIsbn);
      
      expect([400, 404, 502]).toContain(response.status());
    });

    test('should handle empty ISBN parameter', async () => {
      const response = await apiTest.getBook('');
      expect([400, 404, 502]).toContain(response.status());
    });
  });

  test.describe('Add Books to User - Positive Scenarios', () => {
    test('should add single book to user collection', async () => {
      test.skip(!testIsbn || !createdUserId || !authToken, 'Prerequisites not met');
      
      const response = await apiTest.addBooksToUser(createdUserId, [testIsbn], authToken);
      
      expect(response.status()).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('books');
      expect(responseBody.books).toHaveLength(1);
      expect(responseBody.books[0]).toHaveProperty('isbn', testIsbn);
    });

    test('should add multiple books to user collection', async () => {
      test.skip(!availableBooks || availableBooks.length < 2 || !createdUserId || !authToken, 'Prerequisites not met');
      
      const isbns = availableBooks.slice(0, 2).map(book => book.isbn);
      const response = await apiTest.addBooksToUser(createdUserId, isbns, authToken);
      
      expect(response.status()).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('books');
      expect(responseBody.books).toHaveLength(2);
    });
  });

  test.describe('Add Books to User - Negative Scenarios', () => {
    test('should reject adding books without authentication', async () => {
      test.skip(!testIsbn || !createdUserId, 'Prerequisites not met');
      
      const response = await apiTest.addBooksToUser(createdUserId, [testIsbn]);
      expect([401, 502]).toContain(response.status());
    });

    test('should reject adding books with invalid token', async () => {
      test.skip(!testIsbn || !createdUserId, 'Prerequisites not met');
      
      const response = await apiTest.addBooksToUser(createdUserId, [testIsbn], 'invalidtoken');
      expect([401, 502]).toContain(response.status());
    });

    test('should reject adding books with invalid user ID', async () => {
      test.skip(!testIsbn || !authToken, 'Prerequisites not met');
      
      const response = await apiTest.addBooksToUser('invalid-user-id', [testIsbn], authToken);
      expect(response.status()).toBe(401);
    });

    test('should reject adding books with invalid ISBN', async () => {
      test.skip(!createdUserId || !authToken, 'Prerequisites not met');
      
      const invalidIsbn = '9999999999999';
      const response = await apiTest.addBooksToUser(createdUserId, [invalidIsbn], authToken);
      
      expect([400, 404, 502]).toContain(response.status());
    });

    test('should reject adding empty book list', async () => {
      test.skip(!createdUserId || !authToken, 'Prerequisites not met');
      
      const response = await apiTest.addBooksToUser(createdUserId, [], authToken);
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('should handle duplicate book addition', async () => {
      test.skip(!testIsbn || !createdUserId || !authToken, 'Prerequisites not met');
      
      // Add book first time
      const response1 = await apiTest.addBooksToUser(createdUserId, [testIsbn], authToken);
      expect(response1.status()).toBe(201);
      
      // Try to add same book again
      const response2 = await apiTest.addBooksToUser(createdUserId, [testIsbn], authToken);
      expect([400, 409]).toContain(response2.status()); // Bad Request or Conflict
    });
  });

  test.describe('Delete Book from User - Positive Scenarios', () => {
    test.beforeEach(async () => {
      // Add a book first for deletion tests
      if (testIsbn && createdUserId && authToken) {
        await apiTest.addBooksToUser(createdUserId, [testIsbn], authToken);
      }
    });

    test('should delete book from user collection', async () => {
      test.skip(!testIsbn || !createdUserId || !authToken, 'Prerequisites not met');
      
      const response = await apiTest.deleteBookFromUser(createdUserId, testIsbn, authToken);
      expect(response.status()).toBe(204);
    });
  });

  test.describe('Delete Book from User - Negative Scenarios', () => {
    test('should reject deleting book without authentication', async () => {
      test.skip(!testIsbn || !createdUserId, 'Prerequisites not met');
      
      const response = await apiTest.deleteBookFromUser(createdUserId, testIsbn);
      expect([401, 502]).toContain(response.status());
    });

    test('should reject deleting book with invalid token', async () => {
      test.skip(!testIsbn || !createdUserId, 'Prerequisites not met');
      
      const response = await apiTest.deleteBookFromUser(createdUserId, testIsbn, 'invalidtoken');
      expect(response.status()).toBe(401);
    });

    test('should reject deleting non-existent book from user', async () => {
      test.skip(!createdUserId || !authToken, 'Prerequisites not met');
      
      const nonExistentIsbn = '9999999999999';
      const response = await apiTest.deleteBookFromUser(createdUserId, nonExistentIsbn, authToken);
      
      expect([400, 404, 502]).toContain(response.status());
    });
  });

  test.describe('Security Tests', () => {
    test('should reject SQL injection in ISBN parameter', async () => {
      const sqlPayloads = TestDataGenerator.getSqlInjectionPayloads();
      
      for (const payload of sqlPayloads.slice(0, 3)) {
        const response = await apiTest.getBook(payload);
        expect([400, 404, 502]).toContain(response.status());
      }
    });

    test('should reject XSS in ISBN parameter', async () => {
      const xssPayloads = TestDataGenerator.getXssPayloads();
      
      for (const payload of xssPayloads.slice(0, 3)) {
        const response = await apiTest.getBook(payload);
        expect([400, 404, 502]).toContain(response.status());
      }
    });

    test('should handle large ISBN payload gracefully', async () => {
      const largePayload = TestDataGenerator.generateLargePayload(1000);
      const response = await apiTest.getBook(largePayload);
      
      expect([400, 404, 413, 414, 502]).toContain(response.status());
    });

    test('should reject unauthorized access to user books', async () => {
      test.skip(!createdUserId || !testIsbn, 'Prerequisites not met');
      
      // Try to add book without proper authentication
      const response = await apiTest.addBooksToUser(createdUserId, [testIsbn], 'fake-token');
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Performance and Edge Cases', () => {
    test('should handle special characters in ISBN gracefully', async () => {
      const specialChars = TestDataGenerator.getSpecialCharactersPayload();
      const response = await apiTest.getBook(specialChars);
      
      expect([400, 404, 502]).toContain(response.status());
    });

    test('should handle Unicode characters in ISBN gracefully', async () => {
      const unicodePayload = TestDataGenerator.getUnicodePayload();
      const response = await apiTest.getBook(unicodePayload);
      
      expect([400, 404, 502]).toContain(response.status());
    });

    test('should handle null and undefined ISBN values', async () => {
      const nullPayloads = TestDataGenerator.getNullPayloads();
      
      for (const payload of nullPayloads.slice(0, 3)) {
        const response = await apiTest.getBook(payload);
        expect([400, 404, 502]).toContain(response.status());
      }
    });

    test('should handle numeric ISBN values', async () => {
      const numericPayloads = TestDataGenerator.getNumericPayloads();
      
      for (const payload of numericPayloads.slice(0, 3)) {
        const response = await apiTest.getBook(String(payload));
        expect([400, 404]).toContain(response.status());
      }
    });
  });

  test.describe('Rate Limiting and Throttling', () => {
    test('should handle multiple rapid requests gracefully', async () => {
      const promises: Promise<any>[] = [];
      
      // Make 10 rapid requests to get books
      for (let i = 0; i < 10; i++) {
        promises.push(apiTest.getBooks());
      }
      
      const responses = await Promise.all(promises);
      
      // Most should succeed, some might be rate limited
      const successCount = responses.filter(r => r.status() === 200).length;
      const rateLimitedCount = responses.filter(r => r.status() === 429).length;
      
      expect(successCount + rateLimitedCount).toBe(10);
      expect(successCount).toBeGreaterThan(0); // At least some should succeed
    });
  });
});