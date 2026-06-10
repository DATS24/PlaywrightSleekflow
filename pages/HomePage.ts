import { Page, Locator, expect, BrowserContext } from '@playwright/test';

export class HomePage {
  // -- Locators --
  readonly loginButton: Locator;
  readonly SignUpButton: Locator;


  constructor(private page: Page) {

    this.SignUpButton       = page.getByRole('link', { name: /start for free/i }).nth(0);
    this.loginButton      = page.getByRole('link', { name: /log in/i });
  }

  async gotoLoginPage(context: BrowserContext) {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      this.loginButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

  async gotoSignupPage(context: BrowserContext) {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      this.SignUpButton.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }

}
