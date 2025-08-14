import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object para a página de Sign Up da Ramp
 * Contém todos os seletores e métodos específicos para registro
 */
export class SignUpPage extends BasePage {
  // Seletores dos elementos da página
  private readonly emailInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly signInLink: Locator;
  private readonly errorMessages: Locator;
  private readonly validationIcons: Locator;
  private readonly successIcons: Locator;
  private readonly firstNameTooltipIcon: Locator;
  private readonly lastNameTooltipIcon: Locator;
  private readonly tooltipContent: Locator;

  constructor(page: Page) {
    super(page, 'https://app.ramp.com');
    
    // Inicializar seletores
    this.emailInput = this.page.locator('input[type="email"]');
    this.firstNameInput = this.page.getByLabel(/first name/i);
    this.lastNameInput = this.page.getByLabel(/last name/i);
    this.passwordInput = this.page.locator('input[type="password"]');
    this.submitButton = this.page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Create account"), button:has-text("Start application")');
    this.signInLink = this.page.locator('a:has-text("Sign in"), a:has-text("Log in"), a:has-text("Login")');
    this.errorMessages = this.page.locator('[role="alert"], .error, .invalid, [aria-invalid="true"]');
    this.validationIcons = this.page.locator('.RyuIconSvg--x-square');
    this.successIcons = this.page.locator('.RyuIconSvg--check-square');
    this.firstNameTooltipIcon = this.page.locator('.RyuIconSvg--info').first();
    this.lastNameTooltipIcon = this.page.locator('.RyuIconSvg--info').nth(1);
    this.tooltipContent = this.page.locator('.RyuScreenReaderOnly-dlAmnY');
  }

  /**
   * Navega para a página de sign up
   */
  async navigate() {
    await this.goto('/sign-up');
  }

  /**
   * Verifica se todos os campos obrigatórios estão presentes
   */
  async verifyRequiredFieldsPresent() {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.firstNameInput);
    await this.waitForElement(this.lastNameInput);
    await this.waitForElement(this.passwordInput);
  }

  /**
   * Preenche o campo de email
   */
  async fillEmail(email: string) {
    await this.fillField(this.emailInput, email);
  }

  /**
   * Preenche o campo de primeiro nome
   */
  async fillFirstName(firstName: string) {
    await this.fillField(this.firstNameInput, firstName);
  }

  /**
   * Preenche o campo de último nome
   */
  async fillLastName(lastName: string) {
    await this.fillField(this.lastNameInput, lastName);
  }

  /**
   * Preenche o campo de senha
   */
  async fillPassword(password: string) {
    await this.fillField(this.passwordInput, password);
  }

  /**
   * Preenche todos os campos do formulário
   */
  async fillForm(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }) {
    await this.fillEmail(userData.email);
    await this.fillFirstName(userData.firstName);
    await this.fillLastName(userData.lastName);
    await this.fillPassword(userData.password);
  }

  /**
   * Submete o formulário de registro
   */
  async submitForm() {
    if (await this.isElementVisible(this.submitButton)) {
      await this.clickElement(this.submitButton);
    }
  }

  /**
   * Testa validação de email inválido
   */
  async testInvalidEmail(invalidEmail: string) {
    await this.fillEmail(invalidEmail);
    await this.emailInput.blur();
    
    const isInvalid = await this.emailInput.getAttribute('aria-invalid');
    return isInvalid === 'true';
  }

  /**
   * Testa validação de senha fraca
   */
  async testWeakPassword(weakPassword: string) {
    await this.fillPassword(weakPassword);
    await this.passwordInput.blur();
    
    // Verifica se há indicação de senha inválida
    const passwordError = this.page.locator('text=/at least.*characters/i, text=/password.*requirements/i, [aria-invalid="true"]');
    return await this.isElementVisible(passwordError);
  }

  /**
   * Verifica se há mensagens de erro de validação
   */
  async hasValidationErrors(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessages);
  }

  /**
   * Clica no link para ir para página de sign in
   */
  async goToSignIn() {
    if (await this.isElementVisible(this.signInLink)) {
      await this.clickElement(this.signInLink);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Verifica se o link para sign in está presente
   */
  async hasSignInLink(): Promise<boolean> {
    return await this.isElementVisible(this.signInLink);
  }

  /**
   * Obtém o valor atual do campo email
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Obtém o valor atual do campo primeiro nome
   */
  async getFirstNameValue(): Promise<string> {
    return await this.firstNameInput.inputValue();
  }

  /**
   * Obtém o valor atual do campo último nome
   */
  async getLastNameValue(): Promise<string> {
    return await this.lastNameInput.inputValue();
  }

  /**
   * Obtém o valor atual do campo senha
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Verifica se houve redirecionamento após submissão
   */
  async wasRedirectedAfterSubmission(): Promise<boolean> {
    const currentUrl = this.getCurrentUrl();
    return currentUrl !== 'https://app.ramp.com/sign-up';
  }

  /**
   * Dados de teste padrão para formulário válido
   */
  getValidTestData() {
    return {
      email: 'teste@exemplo.com',
      firstName: 'João',
      lastName: 'Silva',
      password: 'MinhaSenh@123456'
    };
  }

  /**
   * Dados de teste para email inválido
   */
  getInvalidEmailData() {
    return 'email-invalido';
  }

  /**
   * Dados de teste para senha fraca
   */
  getWeakPasswordData() {
    return '123';
  }

  async isResponsive(): Promise<boolean> {
    // Verificar se a página é responsiva
    const container = this.page.locator('body, main, .container');
    await container.first().waitFor({ state: 'visible' });
    
    // Verificar se não há scroll horizontal
    const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await this.page.evaluate(() => window.innerWidth);
    
    return bodyWidth <= viewportWidth;
  }

  async measureLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.navigate();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async hasProperPageStructure(): Promise<boolean> {
    // Verificar elementos estruturais básicos
    const body = this.page.locator('body');
    const main = this.page.locator('main, .main, #main');
    
    const bodyVisible = await body.isVisible();
    
    // Verificar se há pelo menos um elemento principal de conteúdo
    const mainCount = await main.count();
    const formCount = await this.page.locator('form').count();
    const containerCount = await this.page.locator('.container').count();
    
    const hasMainContent = mainCount > 0 || formCount > 0 || containerCount > 0;
    
    return bodyVisible && hasMainContent;
  }

  /**
   * Verifica se o h2 "Apply for Ramp" está presente na página
   */
  async hasApplyForRampHeading(): Promise<boolean> {
    const heading = this.page.locator('h2:has-text("Apply for Ramp")');
    return await heading.isVisible();
  }

  /**
   * Verifica se há 5 ícones de validação (x-square) visíveis
   */
  async hasValidationIcons(): Promise<boolean> {
    const count = await this.validationIcons.count();
    return count === 5;
  }

  /**
   * Verifica se há 5 ícones de sucesso (check-square) visíveis
   */
  async hasSuccessIcons(): Promise<boolean> {
    const count = await this.successIcons.count();
    return count === 5;
  }

  /**
   * Verifica mensagens de erro específicas para campos vazios
   */
  async hasEmptyFieldErrors(): Promise<boolean> {
    const emailError = await this.page.locator('text="Enter an email address"').isVisible();
    const firstNameError = await this.page.locator('text="First name is required"').isVisible();
    const lastNameError = await this.page.locator('text="Last name is required"').isVisible();
    return emailError && firstNameError && lastNameError;
  }

  /**
   * Verifica mensagem de email inválido
   */
  async hasInvalidEmailError(): Promise<boolean> {
    return await this.page.locator('text="Invalid email address"').isVisible();
  }

  /**
   * Verifica mensagem de email pessoal (outlook.com)
   */
  async hasOutlookEmailError(): Promise<boolean> {
    return await this.page.locator('text="Enter a valid business email (not outlook.com)"').isVisible();
  }

  /**
   * Verifica mensagem de email pessoal (gmail.com)
   */
  async hasGmailEmailError(): Promise<boolean> {
    return await this.page.locator('text="Enter a valid business email (not gmail.com)"').isVisible();
  }

  /**
   * Faz hover no ícone de tooltip do First Name e verifica a mensagem
   */
  async verifyFirstNameTooltip(): Promise<boolean> {
    await this.firstNameTooltipIcon.hover();
    const tooltipText = await this.tooltipContent.textContent();
    return tooltipText?.includes('Your legal first name as listed on a driver\'s license, passport, etc') || false;
  }

  /**
   * Faz hover no ícone de tooltip do Last Name e verifica a mensagem
   */
  async verifyLastNameTooltip(): Promise<boolean> {
    await this.lastNameTooltipIcon.hover();
    const tooltipText = await this.tooltipContent.textContent();
    return tooltipText?.includes('Your legal last name as listed on a driver\'s license, passport, etc') || false;
  }

  /**
   * Gera um email corporativo aleatório
   */
  generateRandomBusinessEmail(): string {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    return `test@work${randomNum}.com`;
  }

  /**
   * Gera uma senha forte seguindo os critérios especificados
   */
  generateStrongPassword(): string {
    return 'TestPassword123!';
  }

  /**
   * Verifica se foi redirecionado para sign-in com email preenchido e desabilitado
   */
  async verifyRedirectToSignInWithEmail(email: string): Promise<boolean> {
    const currentUrl = this.page.url();
    const isSignInPage = currentUrl.includes('sign-in');
    
    if (!isSignInPage) return false;
    
    const emailInput = this.page.locator('.RyuInputBaseInputRoot-dNhEFm');
    const emailValue = await emailInput.inputValue();
    const isDisabled = await emailInput.isDisabled();
    
    return emailValue === email && isDisabled;
  }
}