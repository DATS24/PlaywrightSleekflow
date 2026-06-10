import { Page, Locator, expect } from '@playwright/test';

export class SignupPage {
  // -- Locators --
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly checkboxInput: Locator;
  readonly signupButton: Locator;
  readonly successfulMessage: Locator;

  constructor(private page: Page) {
 
    this.emailInput          = page.getByLabel(/email/i);
    this.passwordInput       = page.locator('#password');
    this.checkboxInput       = page.getByRole('checkbox', { name: /terms of service/i });
    this.signupButton        = page.getByRole('button', { name: /sign up/i });
    this.successfulMessage   = page.locator('//p[text()="Confirm your email address"]');
  }

  // -- Actions --

  // Perform signup action by filling in email, checking the terms checkbox, and submitting the form
  async signupEmail(options: 
    { email: string }) {
      const { email } = options;
    await this.emailInput.fill(email);
    await this.checkboxInput.check({force: true}); // Ensure the terms checkbox is checked before submitting
    await this.signupButton.click();
  }

  // Perform signup action by filling in email with an invalid format to test validation
  async signupInvalidEmail(email: string) {
    await this.emailInput.fill(email);
    await this.checkboxInput.check({force: true});
  }

  // Perform signup action by filling in email without checking the terms checkbox to test validation
  async signupEmailNoCheckbox(options: 
    { email: string }) {
      const { email } = options;
    await this.emailInput.fill(email);
    await this.signupButton.click();
  }

  // Perform signup action by filling in password and submitting the form, assuming email step is already completed
  async signupPassword(options: 
    { password: string }) {
      const { password } = options;
    await this.passwordInput.fill(password);
    await this.signupButton.click();
  }
  // -- Assertions --

  async expectSuccessfulSignup() {
    await expect(this.successfulMessage).toBeVisible();
  }

  async getValidationErrors(): Promise<string[]> {
    // Retrieve all visible validation error messages for more comprehensive assertions in tests
    const errors = this.page.locator('//div[@data-is-error="true"]').or(this.page.locator('//span[contains(@id, "error-element-email")]'));
    const count = await errors.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text?.trim()) texts.push(text.trim());
      console.log(`Validation error found: ${text?.trim()}`);
    }
    return texts;
  }
}
