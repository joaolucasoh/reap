import * as dotenv from 'dotenv';
dotenv.config();
import { TEST_DATA } from '.';
import { test, expect } from '@playwright/test';
import { SignInPage } from '.';
import { env } from 'process';

test.describe('Ramp Sign In', () => {
    let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    await signInPage.navigate();
  });

  test.describe('Sign In Navigation', () => {
    test('should sign in with test credentials', async ({ page }) => {
      await signInPage.fillLoginForm(TEST_DATA.PROD_USER.email, TEST_DATA.PROD_USER.password);
      await signInPage.signInButton.click();
      await page.getByText('Verify your account');
      await signInPage.checkVerificationCodeSentMsg(TEST_DATA.PROD_USER.email);
    });

    test('should validate an error message after filling incorrect password', async ({ page }) => {
      await signInPage.fillLoginForm(TEST_DATA.PROD_USER.email, 'SenhaIncorreta@123');
      await page.getByText('We do not recognize this email password combination. Try again or reset your password.');
    });

    test('should get redirected to Verify Account page', async ({ page }) => {
      await signInPage.fillLoginForm(TEST_DATA.INCOMPLETE_USER.email, TEST_DATA.INCOMPLETE_USER.password);
      await signInPage.signInButton.click();
      await page.getByText('Verify your account');
      await signInPage.checkVerificationCodeSentMsg(TEST_DATA.INCOMPLETE_USER.email);
      await page.waitForURL('https://app.ramp.com/sign-in/mfa', { timeout: 10000 });
    });

    test('should validate the message filling an invalid verification code', async ({ page }) => {
      await signInPage.fillLoginForm(TEST_DATA.INCOMPLETE_USER.email, TEST_DATA.INCOMPLETE_USER.password);
      await signInPage.signInButton.click();
      await page.getByText('Verify your account');
      await signInPage.checkVerificationCodeSentMsg(TEST_DATA.INCOMPLETE_USER.email);
      await page.waitForURL('https://app.ramp.com/sign-in/mfa', { timeout: 10000 });

      await signInPage.verificationCodeInput.fill('000000');
      await page.getByText('This verification code is invalid or has expired.')
    });

    test('should ask for a new password when clicking on Reset Password link', async ({ page }) => {
      await signInPage.emailInput.fill(TEST_DATA.PROD_USER.email);
      await signInPage.continueButton.click();
      
      await page.click('text=Reset password');
      await page.getByText('Forgot password?');
      await page.getByText('Enter the email associated with your Ramp account to receive a password reset link.');
      await page.getByText('Reset password').click();

      await page.getByText('Reset link sent!');
      await page.getByText(`If ${TEST_DATA.PROD_USER.email} is associated with a Ramp account, we'll send a link and instructions to reset your password.`)

      await expect(page.getByRole('button', { name: /Back to login/i})).toBeVisible( { timeout: 15000});
    })
  });
});