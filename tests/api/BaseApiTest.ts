import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * Base class for API tests providing common functionality
 */
export class BaseApiTest {
  protected request: APIRequestContext;
  protected baseURL: string;

  constructor(request: APIRequestContext, baseURL: string = 'https://demoqa.com') {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Create a new user account
   */
  async createUser(userData: {
    userName: string;
    password: string;
  }) {
    const response = await this.request.post(`${this.baseURL}/Account/v1/User`, {
      data: userData,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  }

  /**
   * Generate authentication token
   */
  async generateToken(credentials: {
    userName: string;
    password: string;
  }) {
    const response = await this.request.post(`${this.baseURL}/Account/v1/GenerateToken`, {
      data: credentials,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  }

  /**
   * Authorize user
   */
  async authorizeUser(credentials: {
    userName: string;
    password: string;
  }) {
    const response = await this.request.post(`${this.baseURL}/Account/v1/Authorized`, {
      data: credentials,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  }

  /**
   * Get user information
   */
  async getUser(userId: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.request.get(`${this.baseURL}/Account/v1/User/${userId}`, {
      headers
    });
    return response;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.request.delete(`${this.baseURL}/Account/v1/User/${userId}`, {
      headers
    });
    return response;
  }

  /**
   * Get all books
   */
  async getBooks() {
    const response = await this.request.get(`${this.baseURL}/BookStore/v1/Books`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  }

  /**
   * Get specific book
   */
  async getBook(isbn: string) {
    const response = await this.request.get(`${this.baseURL}/BookStore/v1/Book`, {
      params: { ISBN: isbn },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response;
  }

  /**
   * Add books to user collection
   */
  async addBooksToUser(userId: string, isbns: string[], token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.request.post(`${this.baseURL}/BookStore/v1/Books`, {
      data: {
        userId,
        collectionOfIsbns: isbns.map(isbn => ({ isbn }))
      },
      headers
    });
    return response;
  }

  /**
   * Delete book from user collection
   */
  async deleteBookFromUser(userId: string, isbn: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.request.delete(`${this.baseURL}/BookStore/v1/Book`, {
      data: {
        userId,
        isbn
      },
      headers
    });
    return response;
  }

  /**
   * Replace book in user collection
   */
  async replaceBook(userId: string, oldIsbn: string, newIsbn: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.request.put(`${this.baseURL}/BookStore/v1/Books/${oldIsbn}`, {
      data: {
        userId,
        isbn: newIsbn
      },
      headers
    });
    return response;
  }

  /**
   * Delete all books from user collection
   */
  async deleteAllBooksFromUser(userId: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.request.delete(`${this.baseURL}/BookStore/v1/Books`, {
      params: { UserId: userId },
      headers
    });
    return response;
  }

  /**
   * Generate random user data for testing
   */
  generateRandomUserData() {
    const timestamp = Date.now();
    return {
      userName: `testuser_${timestamp}`,
      password: `TestPass123!${timestamp}`
    };
  }

  /**
   * Validate response status and structure
   */
  async validateResponse(response: any, expectedStatus: number, expectedFields?: string[]) {
    expect(response.status()).toBe(expectedStatus);
    
    if (expectedFields && response.status() === 200) {
      const responseBody = await response.json();
      expectedFields.forEach(field => {
        expect(responseBody).toHaveProperty(field);
      });
    }
  }

  /**
   * Validate error response
   */
  async validateErrorResponse(response: any, expectedStatus: number, expectedMessage?: string) {
    expect(response.status()).toBe(expectedStatus);
    
    if (expectedMessage) {
      const responseBody = await response.json();
      expect(responseBody.message || responseBody.error).toContain(expectedMessage);
    }
  }
}