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