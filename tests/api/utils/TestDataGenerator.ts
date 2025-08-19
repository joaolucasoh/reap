/**
 * Utility class for generating test data
 */
export class TestDataGenerator {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate valid username
   */
  static generateValidUsername(): string {
    return `testuser_${Date.now()}_${this.generateRandomString(5)}`;
  }

  /**
   * Generate valid password
   */
  static generateValidPassword(): string {
    const timestamp = Date.now();
    return `TestPass123!${timestamp}`;
  }

  /**
   * Generate invalid usernames for testing
   */
  static getInvalidUsernames(): string[] {
    return [
      '', // empty
      'a', // too short
      'ab', // too short
      'user with spaces', // contains spaces
      'user@domain.com', // contains special chars
      '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', // too long
      'user#test', // contains hash
      'user$test', // contains dollar sign
    ];
  }

  /**
   * Generate invalid passwords for testing
   */
  static getInvalidPasswords(): string[] {
    return [
      '', // empty
      '123', // too short
       'password', // no uppercase, no numbers, no special chars
       'PASSWORD', // no lowercase, no numbers, no special chars
      '12345678', // no letters, no special chars
      'Password', // no numbers, no special chars
      'Password123', // no special chars
      'password123!', // no uppercase
      'PASSWORD123!', // no lowercase
    ];
  }

  /**
   * Generate SQL injection payloads
   */
  static getSqlInjectionPayloads(): string[] {
    return [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' OR 1=1 --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "admin' #",
      "admin'/*",
      "' or 1=1#",
      "' or 1=1--",
      "') or '1'='1--",
      "') or ('1'='1--"
    ];
  }

  /**
   * Generate XSS payloads
   */
  static getXssPayloads(): string[] {
    return [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')",
      "<svg onload=alert('XSS')>",
      "<iframe src=javascript:alert('XSS')></iframe>",
      "<body onload=alert('XSS')>",
      "<input onfocus=alert('XSS') autofocus>",
      "<select onfocus=alert('XSS') autofocus>",
      "<textarea onfocus=alert('XSS') autofocus>",
      "<keygen onfocus=alert('XSS') autofocus>"
    ];
  }

  /**
   * Generate large payloads for testing limits
   */
  static generateLargePayload(size: number = 10000): string {
    return 'A'.repeat(size);
  }

  /**
   * Generate special characters payload
   */
  static getSpecialCharactersPayload(): string {
    return "!@#$%^&*()_+-=[]{}|;':,.<>?/~`";
  }

  /**
   * Generate Unicode characters payload
   */
  static getUnicodePayload(): string {
    return "测试用户名αβγδεζηθικλμνξοπρστυφχψω🚀🎉💻🔥";
  }

  /**
   * Generate null and undefined payloads
   */
  static getNullPayloads(): any[] {
    return [
      null,
      undefined,
      'null',
      'undefined',
      'NULL',
      'UNDEFINED'
    ];
  }

  /**
   * Generate boolean payloads
   */
  static getBooleanPayloads(): any[] {
    return [
      true,
      false,
      'true',
      'false',
      'TRUE',
      'FALSE',
      1,
      0
    ];
  }

  /**
   * Generate numeric payloads for testing
   */
  static getNumericPayloads(): any[] {
    return [
      0,
      -1,
      1,
      999999999999999999999999999999,
      -999999999999999999999999999999,
      3.14159,
      -3.14159,
      Number.MAX_SAFE_INTEGER,
      Number.MIN_SAFE_INTEGER,
      Infinity,
      -Infinity,
      NaN
    ];
  }

  /**
   * Generate common book ISBNs for testing
   */
  static getTestBookIsbns(): string[] {
    return [
      '9781449325862',
      '9781449331818',
      '9781449337711',
      '9781449365035',
      '9781491904244',
      '9781491950296',
      '9781593275846',
      '9781593277574'
    ];
  }

  /**
   * Generate invalid ISBN formats
   */
  static getInvalidIsbns(): string[] {
    return [
      '', // empty
      '123', // too short
      '12345678901234567890', // too long
      'invalid-isbn', // contains letters
      '978-1-449-32586-2', // contains hyphens
      '9781449325863', // invalid checksum
      'abcdefghijklm', // all letters
      '!@#$%^&*()', // special characters
    ];
  }
}