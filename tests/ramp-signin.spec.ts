import { test, expect } from '@playwright/test';
import { SignUpPage, SignInPage, TEST_DATA } from './pages';
import { PASSWORD_DATASETS, PASSWORD_RULES, type RuleText } from './pages/index';

test.describe('Ramp Sign In', () => {
    let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    await signInPage.navigate();
  });

  test.describe('Sign In Navigation', () => {
    test('should have link to sign in page', async ({ page }) => {
      // Verificar se há link para sign in
      const hasSignInLink = await signUpPage.hasSignInLink();
      
      if (hasSignInLink) {
        // Navegar para página de sign in
        await signUpPage.goToSignIn();
        
        // Verificar se navegou para página de login
        const currentUrl = signUpPage.getCurrentUrl();
        expect(currentUrl).toContain('sign-in');
      }
    });
  });

  test.describe('Sign In Page', () => {
    test('should navigate to sign in and display login form', async ({ page }) => {
      // Navegar diretamente para página de sign in
      await signInPage.navigate();
      
      // Verificar se a página carregou
      await signInPage.verifyTitle(/Ramp/);
      
      // Verificar se há campos de login
      await signInPage.verifyLoginFieldsPresent();
    });

    test('should attempt sign in with test credentials', async ({ page }) => {
      await signInPage.navigate();
      
      // Verificar se os campos estão visíveis
      const fieldsVisible = await signInPage.areLoginFieldsVisible();
      
      if (fieldsVisible) {
        // Realizar login com credenciais de teste
        await signInPage.login(TEST_DATA.TEST_CREDENTIALS);
        
        // Verificar se houve resposta do sistema (redirecionamento ou erro)
        const wasRedirected = await signInPage.wasRedirectedAfterLogin();
        const hasErrorMessage = await signInPage.hasErrorMessage();
        
        // O teste passa se houve alguma resposta do sistema
        expect(wasRedirected || hasErrorMessage).toBeTruthy();
      }
    });
  });

  test.describe('General UI Tests', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Configurar viewport mobile e navegar
      await signUpPage.setMobileViewport();
      await signUpPage.navigate();
      
      // Verificar se a página é responsiva
      const isResponsive = await signUpPage.isResponsive();
      expect(isResponsive).toBeTruthy();
    });

    test('should load page within reasonable time', async ({ page }) => {
      // Verificar tempo de carregamento da página
      const loadTime = await signUpPage.measureLoadTime();
      
      // Verificar se a página carregou em menos de 10 segundos
      expect(loadTime).toBeLessThan(10000);
    });

    test('should show validation errors and icons for empty form submission', async ({ page }) => {
      await signUpPage.submitForm();
      
      const hasEmptyFieldErrors = await signUpPage.hasEmptyFieldErrors();
      expect(hasEmptyFieldErrors).toBe(true);
      
      const hasValidationIcons = await signUpPage.hasValidationIcons();
      expect(hasValidationIcons).toBe(true);
    });

    test('should validate invalid email formats', async ({ page }) => {
      await signUpPage.navigate();
      
      const invalidEmails = ['test', 'test.@s.com', 'test@t'];
      
      for (const email of invalidEmails) {
        await signUpPage.fillEmail('');
        await signUpPage.fillEmail(email);
        await signUpPage.submitForm();
        
        const hasInvalidEmailError = await signUpPage.hasInvalidEmailError();
        expect(hasInvalidEmailError).toBe(true);
      }
    });

    test('should reject personal email addresses', async ({ page }) => {
      await signUpPage.navigate();
      
      await signUpPage.fillEmail('test@outlook.com');
      await signUpPage.submitForm();
      
      const hasOutlookError = await signUpPage.hasOutlookEmailError();
      expect(hasOutlookError).toBe(true);
      
      await signUpPage.fillEmail('');
      
      await signUpPage.fillEmail('test@gmail.com');
      await signUpPage.submitForm();
      
      const hasGmailError = await signUpPage.hasGmailEmailError();
      expect(hasGmailError).toBe(true);
    });

    test('should display tooltip for first name field', async ({ page }) => {
      await signUpPage.navigate();
      
      // Verificar tooltip do First Name
      const hasCorrectTooltip = await signUpPage.verifyFirstNameTooltip();
      expect(hasCorrectTooltip).toBe(true);
    });

    test('should display tooltip for last name field', async ({ page }) => {
      await signUpPage.navigate();
      
      // Verificar tooltip do Last Name
      const hasCorrectTooltip = await signUpPage.verifyLastNameTooltip();
      expect(hasCorrectTooltip).toBe(true);
    });
  });
});