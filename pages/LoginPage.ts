import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  // -- Locators --
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly signinButton: Locator;
  readonly resetPasswordLink: Locator;
  readonly sendResetButton: Locator;

  constructor(private page: Page) {
    this.emailInput        = page.getByLabel(/email/i);
    this.passwordInput     = page.locator('#password');
    this.continueButton       = page.locator('._button-login-id');
    this.signinButton        = page.getByRole('button', { name: /sign in/i }); 
    this.resetPasswordLink = page.getByText(/reset password/i);
    this.sendResetButton   = page.getByRole('button', { name: /send link/i });
  }

  // -- Actions --

  // Perform login action by filling in email and clicking the continue button
  async loginEmail(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  // Perform login action by filling in password and clicking the sign in button, assuming email step is already completed
  async loginPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.signinButton.click();
  }

  async resetPassword(email: string) {
    await this.resetPasswordLink.click();
    await this.emailInput.fill(email);
    await this.sendResetButton.click();
  }

  // -- Assertions --

  async expectSuccessfulLogin() {
    // Wait for URL to change to a dashboard/home page pattern, indicating successful login and redirect
    await this.page.waitForURL(/register-company/i);
  }

  async expectResetPasswordSent() {
    // Wait for a confirmation message or URL change that indicates the password reset email has been sent successfully
    await expect(this.page.locator('//h1[contains(text(), "Check Your Email")]')).toBeVisible();
  }


  async getValidationErrors(): Promise<string[]> {
    // Retrieve all visible validation error messages for more comprehensive assertions in tests
    const errors = this.page.locator('//div[@data-is-error="true"]').or(this.page.locator('//span[contains(@id, "error-element-password")]'));
    const count = await errors.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text?.trim()) texts.push(text.trim());
    }
    return texts;
  }
}
