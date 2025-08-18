import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { PASSWORD_RULES, type RuleText } from './index';

export class SignUpPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly submitButton: Locator;
  private readonly signInLink: Locator;
  private readonly validationIcons: Locator;
  private readonly successIcons: Locator;
  readonly emailTooltip: Locator;
  readonly emailTooltipIcon: Locator;
  readonly firstNameTooltip: Locator;
  readonly firstNameTooltipIcon: Locator;
  readonly lastNameTooltip: Locator;
  readonly lastNameTooltipIcon: Locator;
  readonly showPwdTooltip: Locator;
  readonly showPwdTooltipIcon: Locator
  readonly hidePwdTooltip: Locator;
  readonly hidePwdTooltipIcon: Locator;

  private readonly togglePasswordBtn: Locator;
  passwordInput: Locator;

  constructor(page: Page) {
    super(page);
    
    this.emailInput = this.page.locator('input[type="email"]');
    this.firstNameInput = this.page.getByLabel(/first name/i);
    this.lastNameInput = this.page.getByLabel(/last name/i);
    this.passwordInput = this.page.locator('#rp, input[name="password"]');
    this.submitButton = this.page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Create account"), button:has-text("Start application")');
    this.signInLink = this.page.locator('a:has-text("Sign in"), a:has-text("Log in"), a:has-text("Login")');
    this.emailTooltip     = this.page.locator('.RyuScreenReaderOnly-dlAmnY').nth(0);
    this.emailTooltipIcon = this.page.locator('svg.RyuIconSvg--mail');
    this.firstNameTooltip = this.page.locator('.RyuScreenReaderOnly-dlAmnY').nth(1);
    this.firstNameTooltipIcon = this.page.locator('.RyuIconSvg--info').nth(0);
    this.lastNameTooltip  = this.page.locator('.RyuScreenReaderOnly-dlAmnY').nth(2);
    this.lastNameTooltipIcon = this.page.locator('.RyuIconSvg--info').nth(1);
    this.showPwdTooltip   = this.page.locator('.RyuScreenReaderOnly-dlAmnY').nth(3);
    this.showPwdTooltipIcon   = this.page.locator('svg.RyuIconSvg--eye');
    this.hidePwdTooltip   = this.page.locator('.RyuScreenReaderOnly-dlAmnY').nth(3);
    this.hidePwdTooltipIcon   = this.page.locator('svg.RyuIconSvg--eye-off');
    this.togglePasswordBtn = page.getByRole('button', { name: /show password|hide password/i })
    .or(page.locator('button[aria-label*="password" i], button[label*="password" i]'));
  }

  async navigate() {
    await this.goto('/sign-up');
    // await this.page.waitForLoadState('networkidle');
  }

  async verifyRequiredFieldsPresent() {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.firstNameInput);
    await this.waitForElement(this.lastNameInput);
    await this.waitForElement(this.passwordInput);
  }

  async fillEmail(email: string) {
    await this.fillField(this.emailInput, email);
    return email;
  }

  async fillFirstName(firstName: string) {
    await this.fillField(this.firstNameInput, firstName);
  }

  async fillLastName(lastName: string) {
    await this.fillField(this.lastNameInput, lastName);
  }

  async fillPassword(password: string) {
    await this.fillField(this.passwordInput, password);
  }

  async fillForm(userData: { firstName: string; lastName: string; password: string }) {
    const workEmail = await this.fillEmail(await this.generateRandomBusinessEmail());
    await this.fillFirstName(userData.firstName);
    await this.fillLastName(userData.lastName);
    await this.fillPassword(userData.password);
    return workEmail;
  }

  async getVerifyYourEmailLocators(email: string) {
    const heading = this.page.getByRole('heading', { name: /verify your email/i });
    const message = this.page.getByText(`Click the link in the confirmation email sent to ${email} to verify your account and continue with the application.`)
    const link    = this.page.getByRole('link', { name: /verify your Ramp account/i });
    return { heading, message, link };
  }
  async getVerifyYourEmailMsg(emailCreated: string, timeout = 30000): Promise<boolean> {
    const { heading, message, link } = await this.getVerifyYourEmailLocators(emailCreated);

    try {
      await Promise.all([
        heading.waitFor({ state: 'visible', timeout }),
        message.waitFor({ state: 'visible', timeout }),
        link.waitFor({ state: 'visible', timeout })
      ]);
      return true;
    } catch {
      return false;
    }
  }

  async submitForm() {
    if (await this.isElementVisible(this.submitButton)) {
      await this.clickElement(this.submitButton);
    }
  }

  
  async typePassword(pwd: string) {
    await this.passwordInput.fill('');
    await this.passwordInput.focus();
    await this.passwordInput.type(pwd, { delay: 10 });
}

  async clickTogglePassword() {
    await this.togglePasswordBtn.first().click();
  }

  async isPasswordMasked(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'password';
  }

  async isPasswordVisible(): Promise<boolean> {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }

  async getPasswordValue(): Promise<string> {
    return this.passwordInput.inputValue();
}

async getInputType(): Promise<string | null> {
  return this.passwordInput.first().getAttribute('type');
}
  async testInvalidEmail(invalidEmail: string) {
    await this.fillEmail(invalidEmail);
    
    await this.submitForm();
    
    const count = await this.page.getByText('Invalid email address').count();
    return count > 0;
  }

  async testWeakPassword(password: string): Promise<Record<RuleText, 'pass' | 'fail' | 'missing'>> {
    await this.passwordInput.fill('');
    await this.passwordInput.focus();
    await this.page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await this.page.keyboard.press('Backspace');
    await this.passwordInput.type(password, { delay: 10 });

    await this.fillPassword(password);

    const ruleItem = (rule: RuleText) => this.page.locator(`p:has-text("${rule}")`);
    const greenIcon = (rule: RuleText) => ruleItem(rule).locator('.RyuIconSvg--check-square');
    const redIcon = (rule: RuleText) => ruleItem(rule).locator('.RyuIconSvg--x-square');

    const status = {} as Record<RuleText, 'pass' | 'fail' | 'missing'>;

    for (const rule of PASSWORD_RULES) {
      const [isGreen, isRed] = await Promise.all([
        greenIcon(rule).isVisible(),
        redIcon(rule).isVisible(),
      ]);

      status[rule] =
        isGreen && !isRed ? 'pass' :
        isRed && !isGreen ? 'fail' :
        'missing'
  }

  return status;
}

  async hasErrorMessage(): Promise<boolean> {
    const errorMsgs = [
      'Enter an email address',
      'First name is required',
      'Last name is required'
    ];

    const notFound: string[] = [];

    for (const msg of errorMsgs) {
      const count = await this.page.getByText(msg).count();
      if (count === 0) {
        console.warn(`Error message not found: ${msg}`);
        notFound.push(msg);
      } else {
        console.log(`Error message found: ${msg}`);
      }
    }
    if (notFound.length > 0) {
      console.warn(`The following error messages were not found: ${notFound.join(', ')}`);
      return false;
    }
    return true;
  }

  async goToSignIn() {
    if (await this.isElementVisible(this.signInLink)) {
      await this.clickElement(this.signInLink);
      await this.page.waitForLoadState('networkidle');
    }
  }

  async hasSignInLink(): Promise<boolean> {
    return await this.isElementVisible(this.signInLink);
  }

  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getFirstNameValue(): Promise<string> {
    return await this.firstNameInput.inputValue();
  }

  async getLastNameValue(): Promise<string> {
    return await this.lastNameInput.inputValue();
  }

  async wasRedirectedAfterSubmission(timeout = 60000): Promise<boolean> {
    try {
      await this.page.waitForURL('https://app.ramp.com/verify-email', { timeout });
      return true;
    } catch {}
    return false;
  }

  async isResponsive(): Promise<boolean> {
    const container = this.page.locator('body, main, .container');
    await container.first().waitFor({ state: 'visible' });
    
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
    const body = this.page.locator('body');
    const main = this.page.locator('main, .main, #main');
    
    const bodyVisible = await body.isVisible();
    
    const mainCount = await main.count();
    const formCount = await this.page.locator('form').count();
    const containerCount = await this.page.locator('.container').count();
    
    const hasMainContent = mainCount > 0 || formCount > 0 || containerCount > 0;
    
    return bodyVisible && hasMainContent;
  }

  async hasApplyForRampHeading() {
    return this.page.locator('h2:has-text("Apply for Ramp")');
  }

  async hasValidationIcons(): Promise<boolean> {
    const count = await this.validationIcons.count();
    return count === 5;
  }

  async hasSuccessIcons(): Promise<boolean> {
    const count = await this.successIcons.count();
    return count === 5;
  }

  async hasEmptyFieldErrors(): Promise<boolean> {
    const emailError = await this.page.locator('text="Enter an email address"').isVisible();
    const firstNameError = await this.page.locator('text="First name is required"').isVisible();
    const lastNameError = await this.page.locator('text="Last name is required"').isVisible();
    return emailError && firstNameError && lastNameError;
  }

  async hasInvalidEmailError(): Promise<boolean> {
    return await this.page.locator('text="Invalid email address"').isVisible();
  }

  async hasOutlookEmailError(): Promise<boolean> {
    return await this.page.locator('text="Enter a valid business email (not outlook.com)"').isVisible();
  }

  async hasGmailEmailError(): Promise<boolean> {
    return await this.page.locator('text="Enter a valid business email (not gmail.com)"').isVisible();
  }

  async generateRandomBusinessEmail(): Promise<string> {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    return `test@work${randomNum}.com`;
  }

  generateStrongPassword(): string {
    return 'TestPassword123!';
  }

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