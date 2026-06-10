// Data generation and test credentials for login/signup tests
export interface UserCredentials {
  email: string;
  password: string;

}

//generate random disposable email addresses for signup tests to avoid polluting staging with test accounts
export function generateTestEmail(prefix = 'testuser'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);
  return `${prefix}+${timestamp}${random}@mailinator.com`;
}

// Generates a new user with random email for signup tests
export function generateNewUser(): UserCredentials {
  return {
    email: generateTestEmail(),
    password: 'TestPassword@123!',
  };
}

export function generateNewUserWeakPassword(): UserCredentials {
  return {
    email: generateTestEmail('weakpassword'), 
    password: 'Weak',
  };
}

export function getInvalidUsername(): UserCredentials {
  return {
    email: generateTestEmail('abc'), 
    password: 'ValidPassword123!',
  };
}

// Retrieves existing user credentials from environment variables for login tests
export function getExistingUser(): UserCredentials {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_EMAIL and TEST_PASSWORD must be set in your .env file.');
  }

  return { email, password };
}

// Invalid credential scenarios for negative login tests, covering wrong password, non-existent email, and malformed email cases
export const invalidCredentials = [
  {
    label: 'wrong password',
    email: process.env.TEST_EMAIL || 'valid@example.com',
    password: 'WrongPassword999!',
  },
  {
    label: 'non-existent email',
    email: 'doesnotexist@nowhere.com',
    password: 'SomePassword123!',
  },
  {
    label: 'malformed email',
    email: 'not-an-email',
    password: 'SomePassword123!',
  },
];
