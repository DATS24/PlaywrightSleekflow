import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SignupPage } from '../pages/SignUpPage';
import { generateNewUser, generateNewUserWeakPassword, getExistingUser, invalidCredentials } from '../utils/testData';

test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Navigate to the base URL before each test
})

test.describe('Signup — Valid User', () => {

  test('should allow valid user to sign up', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context); 
    await context.pages()[1].waitForLoadState('networkidle');
    //on signup page, we should see the email input, password input, checkbox, and submit button
    const signupPage = new SignupPage(context.pages()[1]);
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.checkboxInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
    const user = generateNewUser();
    try {
      await signupPage.signupEmail({
        email: user.email,
      });    
      await context.pages()[1].waitForLoadState('networkidle');
      // After submitting the email, we should see the password input and signup button for the next step of the signup process
      await expect(signupPage.passwordInput).toBeVisible();
      await signupPage.signupPassword({
        password: user.password,
      });
      await context.pages()[1].waitForLoadState('networkidle');
      // After submitting the password, we should see a successful signup message that prompts the user to confirm their email address 
      await expect(signupPage.successfulMessage).toBeVisible(); // Should display login link for users who already have an account
    } catch (error) {
      // Capture screenshot on failure for debugging purposes, which can help identify issues such as non-unique email addresses or unexpected validation errors during the signup process
      await context.pages()[1].screenshot({ path: `test-results/signup-failure-${Date.now()}.png` });
      throw error;
    }
  });
});

test.describe('Signup — Invalid Inputs', () => {

  test('should show error for empty email submission', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const signupPage = new SignupPage(context.pages()[1]);
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
    await signupPage.signupButton.click();
    const errors = await signupPage.getValidationErrors();
    const emailEmpty = await signupPage.emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(errors.length > 0 || emailEmpty).toBeTruthy(); // Should show either custom error messages or rely on native HTML5 validation for empty fields
    expect(errors.some(error => error.toLowerCase().includes('please enter an email address'))).toBeTruthy(); // Should show an error message related to the email field being required or invalid
    expect(errors.some(error => error.toLowerCase().includes('this is required'))).toBeTruthy(); // Should show an error message related to accepting terms and conditions if the checkbox is not checked
  });

  test('should show error for invalid email format', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const signupPage = new SignupPage(context.pages()[1]);
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
    const user = invalidCredentials[2]; // Using the malformed email scenario from test data
    await signupPage.signupInvalidEmail(user.email);
    const errors = await signupPage.getValidationErrors();
    const emailInvalid = await signupPage.emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(errors.length > 0 || emailInvalid).toBeTruthy(); // Should show either custom error messages or rely on native HTML5 validation for invalid email formats
    expect(errors.some(error => error.toLowerCase().includes('email is not valid'))).toBeTruthy(); // Should show an error message related to the email field being invalid
  }); 

  test('should show error for valid email submission without checking the checkbox', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const signupPage = new SignupPage(context.pages()[1]);
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
    const user = generateNewUser();
    await signupPage.signupEmailNoCheckbox({
        email: user.email,
      });    
    const errors = await signupPage.getValidationErrors();
    const emailEmpty = await signupPage.emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(errors.length > 0 || emailEmpty).toBeTruthy(); // Should show either custom error messages or rely on native HTML5 validation for empty fields
    expect(errors.some(error => error.toLowerCase().includes('this is required'))).toBeTruthy(); // Should show an error message related to accepting terms and conditions if the checkbox is not checked
  });

  test('should show error for empty password submission', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context);
    await context.pages()[1].waitForLoadState('networkidle');
    const signupPage = new SignupPage(context.pages()[1]);
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.signupButton).toBeVisible();
    const user = generateNewUser();
    await signupPage.signupEmail({
        email: user.email,
      });    
    await context.pages()[1].waitForLoadState('networkidle');
    // After submitting the email, we should see the password input and signup button for the next step of the signup process
    await expect(signupPage.passwordInput).toBeVisible();
    await signupPage.signupButton.click();
    const errors = await signupPage.getValidationErrors();
    const passwordInvalid = await signupPage.passwordInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(errors.length > 0 || passwordInvalid).toBeTruthy(); // Should show either custom error messages or rely on native HTML5 validation for empty fields
    expect(errors.some(error => error.toLowerCase().includes('password is required'))).toBeTruthy(); // Should show an error message related to the password field being required
  });

  test('should reject a weak password', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context); 
    const signupPage = new SignupPage(context.pages()[1]);
    const user = generateNewUserWeakPassword();
    await signupPage.signupEmail({
      email: user.email,
    });
    await context.pages()[1].waitForLoadState('networkidle');
    // After submitting the email, we should see the password input and signup button for the next step of the signup process
    await expect(signupPage.passwordInput).toBeVisible();
    await signupPage.signupPassword({
        password: user.password,
      });
    const errors = await signupPage.getValidationErrors();
    expect(errors.some(error => error.toLowerCase().includes('the password is too weak'))).toBeTruthy(); // Should show an error message indicating that the password does not meet the required strength criteria, which helps ensure that users choose secure passwords during the signup process
  });

  test('should reject a duplicate email address', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.gotoSignupPage(context);
    const signupPage = new SignupPage(context.pages()[1]);
    const user = getExistingUser();
    await signupPage.signupEmail({
        email: user.email,
      });    
    await context.pages()[1].waitForLoadState('networkidle');
    // After submitting the email, we should see the password input and signup button for the next step of the signup process
    await expect(signupPage.passwordInput).toBeVisible();
    await signupPage.signupPassword({
      password: user.password,
    });
    const errors = await signupPage.getValidationErrors();
    console.log('Validation Errors:', errors);
    expect(errors.some(error => error.toLowerCase().includes("we couldn’t complete your registration. please try again or contact us for support."))).toBeTruthy(); // Should show an error message indicating that the email address is already in use, which helps prevent duplicate accounts and encourages users to log in instead if they already have an account
  });

});
