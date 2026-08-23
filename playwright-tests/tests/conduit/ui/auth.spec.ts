import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/conduit/LoginPage';
import { RegisterPage } from '../../../pages/conduit/RegisterPage';
import { newUser } from '../../../utils/testData';

test.describe('Conduit - Authentication (UI)', () => {
  test('sign-in page renders its form', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.expectLoaded();
    await expect(login.submitButton).toBeVisible();
  });

  test('invalid login shows an error message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();

    await login.login('does-not-exist@example.com', 'wrongpassword');

    await expect(login.errorMessages.first()).toBeVisible();
  });

  test('a new user can register and lands logged in', async ({ page }) => {
    const register = new RegisterPage(page);
    const user = newUser();

    await register.open();
    await register.expectLoaded();
    await register.register(user.username, user.email, user.password);

    // After a successful registration Conduit redirects to the home feed,
    // authenticated - the "New Article" and "Settings" links become visible.
    await register.expectLoggedIn();
  });
});
