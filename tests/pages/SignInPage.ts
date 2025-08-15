import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para a página de Sign In da Ramp
 * Contém todos os seletores e métodos específicos para login
 */
export class SignInPage extends BasePage {
  // Seletores dos elementos da página
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly useDifferentEmailLink: Locator;
  private readonly signInButton: Locator;
  private readonly resetPasswordLink: Locator;
  private readonly signInWithChromeButton: Locator;
  private readonly emailMeALinkButton: Locator;
  private readonly errorMessages: Locator;
  private readonly signUpLink: Locator;


  constructor(page: Page) {
    super(page, 'https://app.ramp.com');
    
    this.emailInput = this.page.locator('input[type="email"], input[name="email"]');
    this.passwordInput = this.page.locator('input[type="password"], input[name="password"]');
    this.signInButton = this.page.locator('data-test-id=sign-in-input-email-submit');
    this.useDifferentEmailLink = this.page.locator('data-test-id=use-a-different-email-link');
    this.errorMessages = this.page.locator('[role="alert"], .error, .invalid, .notification');
    this.resetPasswordLink = this.page.locator('a:has-text("Reset Password")');
    this.signInWithChromeButton = this.page.locator('button:has-text("Sign in with Google")');
    this.emailMeALinkButton = this.page.locator('button:has-text("Email me a link")');
    this.signUpLink = this.page.locator('data-test-id=sign-up-link');
  }

  async navigate(): Promise<void> {
    await this.page.goto('https://app.ramp.com/sign-in');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginFieldsPresent() {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.signInButton);
    await this.waitForElement(this.signUpLink);
  }

  /**
   * Preenche o campo de email
   */
  async fillEmail(email: string) {
    await this.fillField(this.emailInput, email);
  }

  /**
   * Preenche o campo de senha
   */
  async fillPassword(password: string) {
    await this.fillField(this.passwordInput, password);
  }

  /**
   * Preenche os campos de login
   */
  async fillLoginForm(credentials: {
    email: string;
    password: string;
  }) {
    await this.fillEmail(credentials.email);
    await this.fillPassword(credentials.password);
  }

  async submitLogin() {
    if (await this.isElementVisible(this.signInButton)) {
      await this.clickElement(this.signInButton);
    }
  }

  /**
   * Realiza login completo com credenciais
   */
  async login(credentials: {
    email: string;
    password: string;
  }) {
    await this.fillLoginForm(credentials);
    await this.submitLogin();
  }

  /**
   * Testa login com campos vazios
   */
  async testEmptyFieldsValidation() {
    await this.fillEmail('');
    await this.fillPassword('senha123');
    await this.submitLogin();
    
    return await this.hasValidationErrors();
  }

  /**
   * Testa login com email vazio
   */
  async testEmptyEmailValidation() {
    await this.fillEmail('');
    await this.fillPassword('');
    await this.submitLogin();
    
    return await this.hasValidationErrors();
  }

  /**
   * Testa login com senha vazia
   */
  async testEmptyPasswordValidation() {
    await this.fillEmail('teste@exemplo.com');
    await this.fillPassword('');
    await this.submitLogin();
    
    return await this.hasValidationErrors();
  }

  /**
   * Verifica se há mensagens de erro de validação
   */
  async hasValidationErrors(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessages);
  }

  /**
   * Verifica se há mensagem de erro
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessages);
  }

  /**
   * Clica no link para ir para página de sign up
   */
  async goToSignUp() {
    if (await this.isElementVisible(this.signUpLink)) {
      await this.clickElement(this.signUpLink);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Verifica se o link para sign up está presente
   */
  async hasSignUpLink(): Promise<boolean> {
    return await this.isElementVisible(this.signUpLink);
  }

  /**
   * Clica no link de esqueci minha senha
   */
  async clickForgotPassword() {
    if (await this.isElementVisible(this.resetPasswordLink)) {
      await this.clickElement(this.resetPasswordLink);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Verifica se o link de esqueci minha senha está presente
   */
  async hasForgotPasswordLink(): Promise<boolean> {
    return await this.isElementVisible(this.resetPasswordLink);
  }

  /**
   * Obtém o valor atual do campo email
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Obtém o valor atual do campo senha
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Verifica se houve redirecionamento após login
   */
  async wasRedirectedAfterLogin(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl !== 'https://app.ramp.com/sign-in';
  }

  /**
   * Verifica se o login foi bem-sucedido (redirecionamento ou ausência de erro)
   */
  async isLoginSuccessful(): Promise<boolean> {
    const wasRedirected = await this.wasRedirectedAfterLogin();
    const hasError = await this.hasErrorMessage();
    
    return wasRedirected || !hasError;
  }

  /**
   * Verifica se o login falhou (presença de erro e sem redirecionamento)
   */
  async isLoginFailed(): Promise<boolean> {
    const wasRedirected = await this.wasRedirectedAfterLogin();
    const hasError = await this.hasErrorMessage();
    
    return !wasRedirected && hasError;
  }

  /**
   * Dados de teste padrão para login
   */
  getTestCredentials() {
    return {
      email: 'teste@exemplo.com',
      password: 'senha123'
    };
  }

  /**
   * Dados de teste para credenciais inválidas
   */
  getInvalidCredentials() {
    return {
      email: 'usuario-inexistente@exemplo.com',
      password: 'senhaerrada123'
    };
  }

  /**
   * Verifica se os campos de login estão visíveis
   */
  async areLoginFieldsVisible(): Promise<boolean> {
    const emailVisible = await this.isElementVisible(this.emailInput);
    const passwordVisible = await this.isElementVisible(this.passwordInput);
    
    return emailVisible && passwordVisible;
  }

  /**
   * Limpa todos os campos do formulário
   */
  async clearForm() {
    await this.emailInput.fill('');
    await this.passwordInput.fill('');
  }
}