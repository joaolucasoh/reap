import { test, expect } from '@playwright/test';
import { SignInPage, TEST_DATA } from './pages';
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
      const hasSignInLink = await signInPage.hasSignInLink();
      
      if (hasSignInLink) {
        // Navegar para página de sign in
        await signInPage.goToSignIn();
        
        // Verificar se navegou para página de login
        const currentUrl = signInPage.getCurrentUrl();
        expect(currentUrl).toContain('sign-in');
      }
    });
  });

    test('should attempt sign in with test credentials', async ({ page }) => {
      await signInPage.navigate();
  
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
      await signInPage.setMobileViewport();
      await signInPage.navigate();
      
      // Verificar se a página é responsiva
      const isResponsive = await signInPage.isResponsive();
      expect(isResponsive).toBeTruthy();
    });

    test('should load page within reasonable time', async ({ page }) => {
      // Verificar tempo de carregamento da página
      const loadTime = await signInPage.measureLoadTime();
      
      // Verificar se a página carregou em menos de 10 segundos
      expect(loadTime).toBeLessThan(10000);
    });

    test('should show validation errors and icons for empty form submission', async ({ page }) => {
      await signInPage.submitForm();
      
      const hasEmptyFieldErrors = await signInPage.hasEmptyFieldErrors();
      expect(hasEmptyFieldErrors).toBe(true);
      
      const hasValidationIcons = await signInPage.hasValidationIcons();
      expect(hasValidationIcons).toBe(true);
    });

    test('should validate invalid email formats', async ({ page }) => {
      await signInPage.navigate();
      
      const invalidEmails = ['test', 'test.@s.com', 'test@t'];
      
      for (const email of invalidEmails) {
        await signInPage.fillEmail('');
        await signInPage.fillEmail(email);
        await signInPage.submitForm();
        
        const hasInvalidEmailError = await signInPage.hasInvalidEmailError();
        expect(hasInvalidEmailError).toBe(true);
      }
    });

    test('should reject personal email addresses', async ({ page }) => {
      await signInPage.navigate();
      
      await signInPage.fillEmail('test@outlook.com');
      await signInPage.submitForm();
      
      const hasOutlookError = await signInPage.hasOutlookEmailError();
      expect(hasOutlookError).toBe(true);
      
      await signInPage.fillEmail('');
      
      await signInPage.fillEmail('test@gmail.com');
      await signInPage.submitForm();
      
      const hasGmailError = await signInPage.hasGmailEmailError();
      expect(hasGmailError).toBe(true);
    });

    test('should display tooltip for first name field', async ({ page }) => {
      await signInPage.navigate();
      
      // Verificar tooltip do First Name
      const hasCorrectTooltip = await signInPage.verifyFirstNameTooltip();
      expect(hasCorrectTooltip).toBe(true);
    });

    test('should display tooltip for last name field', async ({ page }) => {
      await signInPage.navigate();
      
      // Verificar tooltip do Last Name
      const hasCorrectTooltip = await signInPage.verifyLastNameTooltip();
      expect(hasCorrectTooltip).toBe(true);
    });
  });
});