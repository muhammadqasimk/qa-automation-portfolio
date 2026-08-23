import { test, expect } from '@playwright/test';
import { HomePage } from '../../../pages/conduit/HomePage';

test.describe('Conduit - Home page (UI)', () => {
  test('loads the banner and global feed', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    await home.expectLoaded();
    await expect(home.homeLink).toBeVisible();
    await expect(home.signInLink).toBeVisible();
    await expect(home.signUpLink).toBeVisible();
  });

  test('shows a list of article previews', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    await expect(home.articlePreviews.first()).toBeVisible();
    expect(await home.articleCount()).toBeGreaterThan(0);
  });

  test('displays popular tags in the sidebar', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();

    await expect(page.getByText('Popular Tags')).toBeVisible();
  });

  test('opens an article from the feed', async ({ page }) => {
    const home = new HomePage(page);
    await home.open();
    await expect(home.articlePreviews.first()).toBeVisible();

    await home.openFirstArticle();

    await expect(page).toHaveURL(/\/article\//);
  });
});
