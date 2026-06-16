import { test, expect, devices } from '@playwright/test'

test.use({ ...devices['iPhone 12'] })

test.describe('Reader Mode Switcher', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: navigate to a reader page with a known chapter
    // Example: await page.goto('/books/some-slug/read/interp/some-chapter')
  })

  test('toolbar renders all three mode buttons on mobile viewport', async ({ page }) => {
    // TODO: implement assertion
    // - Verify toolbar container is visible: data-testid="reader-mode-toolbar"
    // - Verify all 3 mode buttons present: scroll, smooth, flip
    // - Verify only one is marked as active at a time
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('clicking flip button switches the body container to flip mode', async ({ page }) => {
    // TODO: implement assertion
    // Example: await page.getByTestId('reader-mode-flip').click()
    //          await expect(page.locator('.flip-container')).toBeVisible()
    //          await expect(page.locator('.smooth-track')).toBeHidden()
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('clicking smooth button switches the body container to smooth mode', async ({ page }) => {
    // TODO: implement assertion
    // - Click data-testid="reader-mode-smooth"
    // - Assert .smooth-track is visible and .flip-container is hidden
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('clicking scroll button switches the body container to scroll mode', async ({ page }) => {
    // TODO: implement assertion
    // - Click data-testid="reader-mode-scroll"
    // - Assert .modal-body is visible and the other two containers are hidden
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('mode selection persists to localStorage', async ({ page }) => {
    // TODO: implement assertion
    // - Click data-testid="reader-mode-flip"
    // - Read localStorage key (e.g. "reader.mode") and assert value === "flip"
    // - Repeat for smooth and scroll to verify the key updates
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('initial active mode is read from localStorage on mount', async ({ page }) => {
    // TODO: implement assertion
    // - Seed localStorage with mode=smooth before page load
    // - Reload and assert data-testid="reader-mode-smooth" carries the active state
    // - Verify .smooth-track is the visible body container
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })
})
