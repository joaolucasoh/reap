import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class SignInPage extends BasePage {
  private readonly welcomeLabel: Locator;
  private readonly emailInput: Locator;
  private readonly continueButton: Locator;
  private readonly signUpLink: Locator
  private readonly passwordInput: Locator;
  private readonly useDifferentEmailLink: Locator;
  private readonly signInButton: Locator;
  private readonly resetPasswordLink: Locator;
  private readonly signInWithChromeButton: Locator;
  private readonly emailMeALinkButton: Locator;
  private readonly errorMessages: Locator;

  constructor(page: Page) {
    super(page);
    
    this.welcomeLabel = this.page.locator('h1', { hasText: 'Welcome to Ramp' });
    this.emailInput = this.page.locator('input[type="email"], input[name="email"]');
    this.continueButton = this.page.locator('data-test-id=sign-in-input-email-submit');
    this.signUpLink = this.page.locator('data-test-id=sign-up-link');
    this.passwordInput = this.page.locator('input[type="password"], input[name="password"]');
    this.useDifferentEmailLink = this.page.locator('data-test-id=use-a-different-email-link');
    this.resetPasswordLink = this.page.locator('a:has-text("Reset Password")');
    this.signInWithChromeButton = this.page.locator('button:has-text("Sign in with Google")');
    this.emailMeALinkButton = this.page.locator('button:has-text("Email me a link")');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginFieldsPresent() {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.signInButton);
    await this.waitForElement(this.signUpLink);
  }

  async fillEmail(email: string) {
    await this.fillField(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.fillField(this.passwordInput, password);
  }

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

  async login(credentials: {
    email: string;
    password: string;
  }) {
    await this.fillLoginForm(credentials);
    await this.submitLogin();
  }

  async testEmptyFieldsValidation() {
    await this.fillEmail('');
    await this.fillPassword('senha123');
    await this.submitLogin();
    
    return await this.hasValidationErrors();
  }

  async testEmptyEmailValidation() {
    await this.fillEmail('');
    await this.fillPassword('');
    await this.submitLogin();
    
    return await this.hasValidationErrors();
  }

  async testEmptyPasswordValidation() {
    await this.fillEmail('teste@exemplo.com');
    await this.fillPassword('');
    await this.submitLogin();
    
    return await this.hasValidationErrors();
  }

  async hasValidationErrors(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessages);
  }

  async hasErrorMessage(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessages);
  }

  async goToSignUp() {
    if (await this.isElementVisible(this.signUpLink)) {
      await this.clickElement(this.signUpLink);
      await this.page.waitForLoadState('networkidle');
    }
  }

  async hasSignUpLink(): Promise<boolean> {
    return await this.isElementVisible(this.signUpLink);
  }

  async clickForgotPassword() {
    if (await this.isElementVisible(this.resetPasswordLink)) {
      await this.clickElement(this.resetPasswordLink);
      await this.page.waitForLoadState('networkidle');
    }
  }

  async hasForgotPasswordLink(): Promise<boolean> {
    return await this.isElementVisible(this.resetPasswordLink);
  }

  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async wasRedirectedAfterLogin(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl !== 'https://app.ramp.com/sign-in';
  }

  async isLoginSuccessful(): Promise<boolean> {
    const wasRedirected = await this.wasRedirectedAfterLogin();
    const hasError = await this.hasErrorMessage();
    
    return wasRedirected || !hasError;
  }

  async isLoginFailed(): Promise<boolean> {
    const wasRedirected = await this.wasRedirectedAfterLogin();
    const hasError = await this.hasErrorMessage();
    
    return !wasRedirected && hasError;
  }

  getTestCredentials() {
    return {
      email: 'teste@exemplo.com',
      password: 'senha123'
    };
  }

  getInvalidCredentials() {
    return {
      email: 'usuario-inexistente@exemplo.com',
      password: 'senhaerrada123'
    };
  }

  async areLoginFieldsVisible(): Promise<boolean> {
    const emailVisible = await this.isElementVisible(this.emailInput);
    const passwordVisible = await this.isElementVisible(this.passwordInput);
    
    return emailVisible && passwordVisible;
  }

  async clearForm() {
    await this.emailInput.fill('');
    await this.passwordInput.fill('');
  }
}