/**
 * Arquivo de exportação para todas as classes Page Object
 * Facilita a importação das páginas nos testes
 */

export { BasePage } from './BasePage';
export { SignUpPage } from './SignUpPage';
export { SignInPage } from './SignInPage';

// Tipos para dados de teste
export interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Constantes úteis para testes
export const TEST_DATA = {
  VALID_USER: {
    email: 'teste@exemplo.com',
    firstName: 'João',
    lastName: 'Silva',
    password: 'MinhaSenh@123456'
  },
  INVALID_EMAIL: 'email-invalido',
  WEAK_PASSWORD: '123',
  TEST_CREDENTIALS: {
    email: 'teste@exemplo.com',
    password: 'senha123'
  }
};

export const TIMEOUTS = {
  DEFAULT: 5000,
  NAVIGATION: 10000,
  FORM_SUBMISSION: 3000
};

export const TOOLTIP_TEXTS = {
  EMAIL: 'This is the email you are using to apply to Ramp',
  FIRST_NAME: 'Your legal first name as listed on a driver’s license, passport, etc',
  LAST_NAME: 'Your legal last name as listed on a driver’s license, passport, etc',
  SHOW_PASSWORD: 'Show password',
  HIDE_PASSWORD: 'Hide password'
};

export const PASSWORD_RULES = [
  'At least 12 characters',
  'At least 1 lowercase character',
  'At least 1 uppercase character',
  'At least 1 number',
  'Not a commonly used password',
] as const;

export type RuleText = (typeof PASSWORD_RULES)[number];

export const PASSWORD_DATASETS: Array<{
  name: string;
  password: string;
  expected: Record<RuleText, 'pass' | 'fail'>;
}> = [
  {
    name: 'WEAK_123',
    password: '123',
    expected: {
      'At least 12 characters': 'fail',
      'At least 1 lowercase character': 'fail',
      'At least 1 uppercase character': 'fail',
      'At least 1 number': 'pass',
      'Not a commonly used password': 'fail',
    },
  },
  {
    name: 'LOWERCASE_12chars_no_number_no_upper',
    password: 'aaaaaaaaaaaa',
    expected: {
      'At least 12 characters': 'pass',
      'At least 1 lowercase character': 'pass',
      'At least 1 uppercase character': 'fail',
      'At least 1 number': 'fail',
      'Not a commonly used password': 'pass',
    },
  },
  {
    name: 'MIXEDCASE_12chars_no_number',
    password: 'AbcdefghijkL',
    expected: {
      'At least 12 characters': 'pass',
      'At least 1 lowercase character': 'pass',
      'At least 1 uppercase character': 'pass',
      'At least 1 number': 'fail',
      'Not a commonly used password': 'fail',
    },
  },
  {
    name: 'STRONG_valid_all_rules',
    password: 'Abcd1234Efgh',
    expected: {
      'At least 12 characters': 'pass',
      'At least 1 lowercase character': 'pass',
      'At least 1 uppercase character': 'pass',
      'At least 1 number': 'pass',
      'Not a commonly used password': 'pass',
    },
  },
];