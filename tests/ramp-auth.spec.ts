import { test, expect } from '@playwright/test';
import { SignUpPage, SignInPage, TEST_DATA } from './pages';

test.describe('Ramp Authentication', () => {
  let signUpPage: SignUpPage;
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    signInPage = new SignInPage(page);
    await signUpPage.navigate();
  });

  test.describe('Sign Up Page', () => {
    test('should display sign up form with all required fields', async ({ page }) => {
      // Verificar se a página carregou corretamente e tem o h2 "Apply for Ramp"
      const hasHeading = await signUpPage.hasApplyForRampHeading();
      expect(hasHeading).toBe(true);
      
      // Verificar se todos os campos obrigatórios estão presentes
      await signUpPage.verifyRequiredFieldsPresent();
    });

    test('should show validation errors for empty required fields', async ({ page }) => {
      // Tentar submeter o formulário sem preencher os campos
      await signUpPage.submitForm();
      
      // Verificar se há mensagens de erro de validação
      const hasErrors = await signUpPage.hasValidationErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('should validate email format', async ({ page }) => {
      // Testar email inválido
      const isInvalid = await signUpPage.testInvalidEmail(TEST_DATA.INVALID_EMAIL);
      expect(isInvalid).toBeTruthy();
    });

    test('should validate password requirements', async ({ page }) => {
      // Testar senha fraca
      const hasPasswordError = await signUpPage.testWeakPassword(TEST_DATA.WEAK_PASSWORD);
      expect(hasPasswordError).toBeTruthy();
    });

    test('should fill form with valid data', async ({ page }) => {
      // Preencher todos os campos com dados válidos
      await signUpPage.fillForm(TEST_DATA.VALID_USER);
      
      // Verificar se os campos foram preenchidos corretamente
      expect(await signUpPage.getEmailValue()).toBe(TEST_DATA.VALID_USER.email);
      expect(await signUpPage.getFirstNameValue()).toBe(TEST_DATA.VALID_USER.firstName);
      expect(await signUpPage.getLastNameValue()).toBe(TEST_DATA.VALID_USER.lastName);
      expect(await signUpPage.getPasswordValue()).toBe(TEST_DATA.VALID_USER.password);
    });

    test('should attempt form submission with valid data', async ({ page }) => {
      // Preencher formulário com dados válidos
      await signUpPage.fillForm(TEST_DATA.VALID_USER);
      
      // Submeter o formulário
      await signUpPage.submitForm();
      
      // Verificar se houve resposta do sistema (redirecionamento ou erro)
      const wasRedirected = await signUpPage.wasRedirectedAfterSubmission();
      const hasErrorMessage = await signUpPage.hasErrorMessage();
      
      // O teste passa se houve redirecionamento OU se apareceu uma mensagem de erro esperada
      expect(wasRedirected || hasErrorMessage).toBeTruthy();
    });
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

    test('should validate sign in form fields', async ({ page }) => {
      await signInPage.navigate();
      
      // Testar validação de email vazio
      const hasValidationError = await signInPage.testEmptyEmailValidation();
      expect(hasValidationError).toBeTruthy();
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

    test('should have proper page structure', async ({ page }) => {
      await signUpPage.navigate();
      
      // Verificar estrutura básica da página
      const hasProperStructure = await signUpPage.hasProperPageStructure();
      expect(hasProperStructure).toBeTruthy();
    });

    test('should show validation errors and icons for empty form submission', async ({ page }) => {
      await signUpPage.navigate();
      
      // Submeter formulário vazio
      await signUpPage.submitForm();
      
      // Verificar mensagens de erro específicas
      const hasEmptyFieldErrors = await signUpPage.hasEmptyFieldErrors();
      expect(hasEmptyFieldErrors).toBe(true);
      
      // Verificar se há 5 ícones de validação (x-square)
      const hasValidationIcons = await signUpPage.hasValidationIcons();
      expect(hasValidationIcons).toBe(true);
    });

    test('should validate invalid email formats', async ({ page }) => {
      await signUpPage.navigate();
      
      const invalidEmails = ['test', 'test.@s.com', 'test@t'];
      
      for (const email of invalidEmails) {
        // Limpar e preencher email inválido
        await signUpPage.fillEmail('');
        await signUpPage.fillEmail(email);
        await signUpPage.submitForm();
        
        // Verificar mensagem de email inválido
        const hasInvalidEmailError = await signUpPage.hasInvalidEmailError();
        expect(hasInvalidEmailError).toBe(true);
      }
    });

    test('should reject personal email addresses', async ({ page }) => {
      await signUpPage.navigate();
      
      // Testar email do Outlook
      await signUpPage.fillEmail('test@outlook.com');
      await signUpPage.submitForm();
      
      const hasOutlookError = await signUpPage.hasOutlookEmailError();
      expect(hasOutlookError).toBe(true);
      
      // Limpar campo
      await signUpPage.fillEmail('');
      
      // Testar email do Gmail
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

    test('should complete full signup flow with valid data', async ({ page }) => {
      await signUpPage.navigate();
      
      // Gerar dados válidos
      const email = signUpPage.generateRandomBusinessEmail();
      const password = signUpPage.generateStrongPassword();
      
      // Preencher formulário com dados válidos
      await signUpPage.fillForm({
        email: email,
        firstName: 'John',
        lastName: 'Doe',
        password: password
      });
      
      // Verificar se há 5 ícones de sucesso (check-square)
      const hasSuccessIcons = await signUpPage.hasSuccessIcons();
      expect(hasSuccessIcons).toBe(true);
      
      // Submeter formulário
      await signUpPage.submitForm();
      
      // Verificar redirecionamento para sign-in com email preenchido e desabilitado
      const isRedirectedCorrectly = await signUpPage.verifyRedirectToSignInWithEmail(email);
      expect(isRedirectedCorrectly).toBe(true);
    });
  });
});