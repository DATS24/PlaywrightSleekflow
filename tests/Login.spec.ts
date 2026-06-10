import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { getExistingUser, getInvalidUsername, invalidCredentials } from '../utils/testData';

test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Navigate to the base URL before each test
})

test.describe('Login — Successful for Valid Users', () => {

  test('should allow valid user to sign in', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoLoginPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    //On login page, we should see the email input, password input and reset password link
    const loginPage = new LoginPage(context.pages()[1]);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await expect(loginPage.resetPasswordLink).toBeVisible(); // Should display reset password link
    const user = getExistingUser();
    try {
      await loginPage.loginEmail(user.email);
      await context.pages()[1].waitForLoadState('networkidle');
      // After submitting the email, we should see the password input and sign in button for the next step of the login process
      await expect(loginPage.passwordInput).toBeVisible();
      await loginPage.loginPassword(user.password);
      await context.pages()[1].waitForLoadState('networkidle');
      // After submitting the password, we should be redirected to the dashboard/home page, indicating a successful login
      await loginPage.expectSuccessfulLogin();
    } catch (error) {
      // Capture screenshot on failure for debugging purposes, which can help identify issues such as incorrect credentials or unexpected validation errors during the login process
      await context.pages()[1].screenshot({ path: `test-results/login-failure-${Date.now()}.png` });
      throw error;
    }
  });

  test('should allow user to reset password', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoLoginPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const loginPage = new LoginPage(context.pages()[1]);
    const user = getExistingUser();
    await context.pages()[1].waitForLoadState('networkidle');
    // After clicking the reset password link, we should be redirected to a page that allows us to enter our email for password reset instructions
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await loginPage.resetPassword(user.email);
    await context.pages()[1].waitForLoadState('networkidle');
    // After submitting the email for password reset, we should see a confirmation message indicating that the reset instructions have been sent to the user's email address
    await loginPage.expectResetPasswordSent();
  });

});

test.describe('Login — Empty Inputs & Invalid Username', () => {

  test('should show error for empty email submission', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoLoginPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const loginPage = new LoginPage(context.pages()[1]);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await expect(loginPage.resetPasswordLink).toBeVisible(); // Should display reset password link;
    await loginPage.continueButton.click();
    const errors = await loginPage.getValidationErrors();
    const emailEmpty = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(errors.length > 0 || emailEmpty).toBeTruthy(); // Should show either custom error messages or rely on native HTML5 validation for empty fields
    expect(errors.some(error => error.toLowerCase().includes('please enter an email address'))).toBeTruthy(); // Should show an error message related to the email field being required or invalid 
  });

  test('should show error for empty password submission', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoLoginPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const loginPage = new LoginPage(context.pages()[1]);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await expect(loginPage.resetPasswordLink).toBeVisible(); // Should display reset password link
    const user = getExistingUser();
    await loginPage.loginEmail(user.email);
    await context.pages()[1].waitForLoadState('networkidle');
    await expect(loginPage.passwordInput).toBeVisible();
    await loginPage.signinButton.click();
    const errors = await loginPage.getValidationErrors();
    const passwordEmpty = await loginPage.passwordInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(errors.length > 0 || passwordEmpty).toBeTruthy();
    expect(errors.some(error => error.toLowerCase().includes('please enter a password'))).toBeTruthy(); // Should show an error message related to the password field being required or invalid
  });

  test('should show error for invalid username format', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoLoginPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const loginPage = new LoginPage(context.pages()[1]);
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.continueButton).toBeVisible();
    await expect(loginPage.resetPasswordLink).toBeVisible(); // Should display reset password link
    const user = getInvalidUsername();
    await loginPage.loginEmail(user.email);
    const errors = await loginPage.getValidationErrors();
    expect(errors.length > 0).toBeTruthy();
    expect(errors.some(error => error.toLowerCase().includes("username can only contain alphanumeric characters or: '_', '+', '-', '.', '!', '#', '$', '^', '`', '~', '@', '''. username should have between 5 and 128 characters."))).toBeTruthy(); // Should show an error message related to the email field being invalid
  });
});

test.describe('Login — Invalid Credentials', () => {

  for (const scenario of invalidCredentials) {
    test(`should show error for: ${scenario.label}`, async ({ page, context }) => {
      const homePage = new HomePage(page);
      await homePage.gotoLoginPage(context);
      const loginPage = new LoginPage(context.pages()[1]);
      await loginPage.loginEmail(scenario.email);
      await context.pages()[1].waitForLoadState('networkidle');
      await expect(loginPage.passwordInput).toBeVisible();
      await loginPage.loginPassword(scenario.password);
      // Wait for error message to appear and validate its presence and content
      const errors = await loginPage.getValidationErrors();
      const passwordEmpty = await loginPage.passwordInput.evaluate(
        (el: HTMLInputElement) => !el.validity.valid
      );
      expect(errors.length > 0 || passwordEmpty).toBeTruthy();
      expect(errors.some(error => error.toLowerCase().includes('wrong username or password'))).toBeTruthy(); // Should show an error message related to the password field being required or invalid
    });
  }
})