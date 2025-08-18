import { test, expect } from '@playwright/test';
import { SignUpPage, SignInPage, TEST_DATA } from './pages';
import { TOOLTIP_TEXTS, PASSWORD_DATASETS, PASSWORD_RULES, type RuleText } from './pages/index';

test.describe('Ramp Sign Up', () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.navigate();
  });

  test.describe('Sign Up Page', () => {
    test('should display sign up form with all required fields', async ({ page }) => {
      const hasHeading = await signUpPage.hasApplyForRampHeading();
      expect(hasHeading).toBe(true);

      await signUpPage.verifyRequiredFieldsPresent();
    });

    test('should show validation errors for empty required fields', async ({ page }) => {
      await signUpPage.submitForm();
      
      const hasErrors = await signUpPage.hasErrorMessage();
      expect(hasErrors).toBeTruthy();
    });

    test('should validate email format', async () => {
      const invalidEmails = ["abc", "abc@", "abc@c", "abc@a."];

      for (const email of invalidEmails) {
        const isInvalid = await signUpPage.testInvalidEmail(email);
        expect(isInvalid, `The email "${email}" didn't shows the expected error message.`).toBeTruthy();
      }
    });

    test('should validate password requirements', async () => {
      for (const ds of PASSWORD_DATASETS) {
        const got = await signUpPage.testWeakPassword(ds.password);
        const mismatches: string[] = [];
        const missings: string[] = [];

        for (const rule of PASSWORD_RULES) {
          const expected = ds.expected[rule];
          const actual = got[rule];

          if (actual === 'missing') {
            missings.push(`- Rule "${rule}" not found in UI`);
          } else if (actual !== expected) {
            mismatches.push(`- Rule "${rule}" expected to be "${expected}" but got "${actual}"`);
          }
        }
        const problems = [...mismatches, ...missings];
        for( const rule of PASSWORD_RULES ) {
          const expected = ds.expected[rule];
          const actual = got[rule];
          if (actual !== expected) {
            problems.push(`- Rule "${rule}" expected to be "${expected}" but got "${actual}"`);
          }
        }
      }
    });

    test('should validate enabling and disabling shows password', async ({ page }) => {
      const pwd = 'Test@password123';

      await signUpPage.typePassword(pwd);
      const field = signUpPage['passwordInput'].first();

      await signUpPage.typePassword(pwd);
      await expect(field).toHaveAttribute('type', 'password', { timeout: 10_000 });

      await signUpPage.clickTogglePassword();
      await expect(field).toHaveAttribute('type', 'text', { timeout: 10_000 });
      await expect(field).toHaveValue(pwd);

      await signUpPage.clickTogglePassword();
      await expect(field).toHaveAttribute('type', 'password', { timeout: 10_000 });
    });

    test('should submit the form with valid data and ensure it was completed', async ({ page }) => {
      const emailCreated = await signUpPage.fillForm(TEST_DATA.VALID_USER);

      await signUpPage.submitForm();
      
      const wasRedirected = await signUpPage.wasRedirectedAfterSubmission();
      expect(wasRedirected).toBeTruthy();
      
      expect(await signUpPage.getVerifyYourEmailMsg(emailCreated)).toBeTruthy();
    });

    test.only('should display tooltip messages', async ( { page }) => {
      await signUpPage.emailTooltipIcon.hover();
      await page.waitForTimeout(2000);
      await expect(signUpPage.emailTooltip)
        .toHaveText(TOOLTIP_TEXTS.EMAIL);
      
      await signUpPage.firstNameTooltipIcon.hover();
      await page.waitForTimeout(2000);
      await expect(signUpPage.firstNameTooltip)
        .toHaveText(TOOLTIP_TEXTS.FIRST_NAME);

      await signUpPage.lastNameTooltipIcon.hover();
      await page.waitForTimeout(2000);  
      await expect(signUpPage.lastNameTooltip)
        .toHaveText(TOOLTIP_TEXTS.LAST_NAME);

      await signUpPage.passwordInput.fill(Math.random().toString(36).slice(-12));

      await signUpPage.showPwdTooltipIcon.hover();
      await page.waitForTimeout(2000);  
      await expect(signUpPage.hidePwdTooltip)
        .toHaveText(TOOLTIP_TEXTS.SHOW_PASSWORD);
      
      await signUpPage.clickTogglePassword();
      await signUpPage.passwordInput.click();
      await signUpPage.hidePwdTooltipIcon.hover();
      await page.waitForTimeout(2000);  
      await expect(signUpPage.hidePwdTooltip)
        .toHaveText(TOOLTIP_TEXTS.HIDE_PASSWORD);
    });
  });
});