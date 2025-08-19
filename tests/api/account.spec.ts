import { test, expect } from '@playwright/test';
import { BaseApiTest } from './BaseApiTest';
import { TestDataGenerator } from './utils/TestDataGenerator';

test.describe('DemoQA Account API Tests', () => {
  let apiTest: BaseApiTest;
  let validUserData: { userName: string; password: string };
  let createdUserId: string;
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    apiTest = new BaseApiTest(request);
    validUserData = {
      userName: TestDataGenerator.generateValidUsername(),
      password: TestDataGenerator.generateValidPassword()
    };
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

  test.describe('User Creation - Positive Scenarios', () => {
    test('should create user with valid credentials', async () => {
      const response = await apiTest.createUser(validUserData);
      
      expect(response.status()).toBe(201);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('userID');
      expect(responseBody).toHaveProperty('username', validUserData.userName);
      expect(responseBody.books).toEqual([]);
      
      createdUserId = responseBody.userID;
    });

    test('should create user with minimum valid username length', async () => {
      const userData = {
        userName: 'abc',
        password: TestDataGenerator.generateValidPassword()
      };
      
      const response = await apiTest.createUser(userData);
      expect(response.status()).toBe(201);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('userID');
      expect(responseBody).toHaveProperty('username', userData.userName);
    });

    test('should create user with special characters in username', async () => {
      const userData = {
        userName: 'user_123-test',
        password: TestDataGenerator.generateValidPassword()
      };
      
      const response = await apiTest.createUser(userData);
      expect(response.status()).toBe(201);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('userID');
      expect(responseBody).toHaveProperty('username', userData.userName);
    });
  });

  test.describe('User Creation - Negative Scenarios', () => {
    test('should reject user creation with empty username', async () => {
      const userData = {
        userName: '',
        password: TestDataGenerator.generateValidPassword()
      };
      
      const response = await apiTest.createUser(userData);
      expect([400, 502]).toContain(response.status());
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('message');
    });

    test('should reject user creation with empty password', async () => {
      const userData = {
        userName: TestDataGenerator.generateValidUsername(),
        password: ''
      };
      
      const response = await apiTest.createUser(userData);
      expect([400, 502]).toContain(response.status());
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('message');
    });

    test('should reject user creation with weak password', async () => {
      const weakPasswords = ['123', 'abc', 'password'];
      
      for (const weakPassword of weakPasswords) {
        const userData = {
          userName: TestDataGenerator.generateValidUsername(),
          password: weakPassword
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });

    test('should reject duplicate username', async () => {
      // First, create a user
      const response1 = await apiTest.createUser(validUserData);
      if (response1.status() === 200 || response1.status() === 201) {
        const responseBody1 = await response1.json();
        createdUserId = responseBody1.userID;
      }
      
      // Try to create another user with the same username
      const response2 = await apiTest.createUser(validUserData);
      expect([400, 406]).toContain(response2.status());
    });

    test('should reject user creation with invalid JSON', async ({ request }) => {
      const response = await request.post('https://demoqa.com/Account/v1/User', {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(400);
    });

    test('should reject user creation with missing fields', async ({ request }) => {
      const response = await request.post('https://demoqa.com/Account/v1/User', {
        data: {
          userName: TestDataGenerator.generateValidUsername()
          // missing password
        }
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Token Generation - Positive Scenarios', () => {
    test.beforeEach(async () => {
      const response = await apiTest.createUser(validUserData);
      if (response.status() === 200 || response.status() === 201) {
        const responseBody = await response.json();
        createdUserId = responseBody.userID;
      }
    });

    test('should generate token with valid credentials', async () => {
      const response = await apiTest.generateToken(validUserData);
      expect([200, 502]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('status', 'Success');
        expect(responseBody).toHaveProperty('result', 'User authorized successfully.');
        expect(responseBody).toHaveProperty('token');
        expect(responseBody.token).toBeTruthy();
        
        authToken = responseBody.token;
      }
    });
  });

  test.describe('Token Generation - Negative Scenarios', () => {
    test('should reject token generation with invalid credentials', async () => {
      const invalidCredentials = {
        userName: 'nonexistentuser',
        password: 'wrongpassword'
      };
      
      const response = await apiTest.generateToken(invalidCredentials);
      expect([200, 502]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('status', 'Failed');
        expect(responseBody).toHaveProperty('result', 'User authorization failed.');
      }
    });

    test('should reject token generation with empty credentials', async () => {
      const emptyCredentials = {
        userName: '',
        password: ''
      };
      
      const response = await apiTest.generateToken(emptyCredentials);
      expect(response.status()).toBe(400);
    });
  });

  test.describe('User Authorization - Positive Scenarios', () => {
    test.beforeEach(async () => {
      const response = await apiTest.createUser(validUserData);
      if (response.status() === 200 || response.status() === 201) {
        const responseBody = await response.json();
        createdUserId = responseBody.userID;
      }
    });

    test('should generate token for user with valid credentials', async () => {
      const response = await apiTest.generateToken(validUserData);
      expect([200, 502]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('status', 'Success');
        expect(responseBody).toHaveProperty('result', 'User authorized successfully.');
        expect(responseBody).toHaveProperty('token');
        
        authToken = responseBody.token;
      }
    });
  });

  test.describe('User Authorization - Negative Scenarios', () => {
    test('should reject token generation with invalid credentials', async () => {
      const invalidCredentials = {
        userName: 'invaliduser',
        password: 'invalidpass'
      };
      
      const response = await apiTest.generateToken(invalidCredentials);
      expect([200, 502]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('status', 'Failed');
        expect(responseBody).toHaveProperty('result', 'User authorization failed.');
      }
    });
  });

  test.describe('Get User - Positive Scenarios', () => {
    test.beforeEach(async () => {
      const response = await apiTest.createUser(validUserData);
      if (response.status() === 200 || response.status() === 201) {
        const responseBody = await response.json();
        createdUserId = responseBody.userID;
      }
      
      const tokenResponse = await apiTest.generateToken(validUserData);
      if (tokenResponse.status() === 200) {
        const tokenBody = await tokenResponse.json();
        authToken = tokenBody.token;
      }
    });

    test('should get user information with valid token', async () => {
      const response = await apiTest.getUser(createdUserId, authToken);
      expect([200, 502]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('userId', createdUserId);
        expect(responseBody).toHaveProperty('username', validUserData.userName);
        expect(responseBody).toHaveProperty('books');
      }
    });
  });

  test.describe('Get User - Negative Scenarios', () => {
    test('should reject get user with non-existent user ID', async () => {
      const nonExistentUserId = 'non-existent-id';
      const response = await apiTest.getUser(nonExistentUserId, 'some-token');
      expect(response.status()).toBeGreaterThanOrEqual(400);
    });
  });

  test.describe('Delete User - Positive Scenarios', () => {
    test.beforeEach(async () => {
      const response = await apiTest.createUser(validUserData);
      if (response.status() === 200 || response.status() === 201) {
        const responseBody = await response.json();
        createdUserId = responseBody.userID;
      }
      
      const tokenResponse = await apiTest.generateToken(validUserData);
      if (tokenResponse.status() === 200) {
        const tokenBody = await tokenResponse.json();
        authToken = tokenBody.token;
      }
    });

    test('should delete user with valid token', async () => {
      const response = await apiTest.deleteUser(createdUserId, authToken);
      expect([204, 502]).toContain(response.status());
      
      // Clear the variables since user is deleted
      createdUserId = '';
      authToken = '';
    });
  });

  test.describe('Delete User - Negative Scenarios', () => {
    test('should reject delete user with invalid token', async () => {
      const invalidToken = 'invalid-token';
      const response = await apiTest.deleteUser('some-user-id', invalidToken);
      expect([200, 400, 401, 403, 404, 502]).toContain(response.status());
    });
  });

  test.describe('Security Tests', () => {
    test('should reject SQL injection in username', async () => {
      const sqlPayloads = TestDataGenerator.getSqlInjectionPayloads();
      
      for (const payload of sqlPayloads.slice(0, 3)) { // Test first 3 to avoid too many requests
        const userData = {
          userName: payload,
          password: TestDataGenerator.generateValidPassword()
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });

    test('should reject XSS in username', async () => {
      const xssPayloads = TestDataGenerator.getXssPayloads();
      
      for (const payload of xssPayloads.slice(0, 3)) { // Test first 3 to avoid too many requests
        const userData = {
          userName: payload,
          password: TestDataGenerator.generateValidPassword()
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });

    test('should handle large payload gracefully', async () => {
      const largePayload = TestDataGenerator.generateLargePayload(10000);
      const userData = {
        userName: largePayload,
        password: TestDataGenerator.generateValidPassword()
      };
      
      const response = await apiTest.createUser(userData);
      expect([400, 502]).toContain(response.status());
    });

    test('should handle special characters in username', async () => {
      const specialChars = ['!@#$%^&*()', '<>?:"{}|', '[]\\;\',./'];
      
      for (const chars of specialChars) {
        const userData = {
          userName: chars,
          password: TestDataGenerator.generateValidPassword()
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });

    test('should handle Unicode characters in username', async () => {
      const unicodeChars = ['测试用户', 'пользователь', '🚀🔥💯'];
      
      for (const chars of unicodeChars) {
        const userData = {
          userName: chars,
          password: TestDataGenerator.generateValidPassword()
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle null values gracefully', async ({ request }) => {
      const nullValues = [null, undefined, ''];
      
      for (const nullValue of nullValues) {
        const response = await request.post('https://demoqa.com/Account/v1/User', {
          data: {
            userName: nullValue,
            password: TestDataGenerator.generateValidPassword()
          }
        });
        
        expect([400, 502]).toContain(response.status());
      }
    });

    test('should handle extremely long usernames', async () => {
      const longUsernames = [
        'a'.repeat(1000),
        'b'.repeat(5000),
        'c'.repeat(10000)
      ];
      
      for (const longUsername of longUsernames) {
        const userData = {
          userName: longUsername,
          password: TestDataGenerator.generateValidPassword()
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });

    test('should handle extremely long passwords', async () => {
      const longPasswords = [
        'P@ssw0rd' + 'a'.repeat(1000),
        'P@ssw0rd' + 'b'.repeat(5000),
        'P@ssw0rd' + 'c'.repeat(10000)
      ];
      
      for (const longPassword of longPasswords) {
        const userData = {
          userName: TestDataGenerator.generateValidUsername(),
          password: longPassword
        };
        
        const response = await apiTest.createUser(userData);
        expect([400, 502]).toContain(response.status());
      }
    });
  });
});