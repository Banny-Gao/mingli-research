import { test, expect, devices } from '@playwright/test'

test.use({ ...devices['iPhone 12'] })

test.describe('Search Result Flash in Flip Mode', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: navigate to a reader page in flip mode with a known chapter
    // Example: await page.goto('/books/some-slug/read/interp/some-chapter')
    //          await page.getByTestId('reader-mode-flip').click()
  })

  test('opening a search result jumps the reader to the target page', async ({ page }) => {
    // TODO: implement assertion
    // - Trigger global search for a query that lives on a known page (e.g. page 4)
    // - Click that result
    // - Assert the reader opens in flip mode at data-page="4"
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('matched text is highlighted with a yellow flash for ~4 seconds', async ({ page }) => {
    // TODO: implement assertion
    // - Jump to a search hit
    // - Assert a flash element (e.g. class .search-flash or data-testid="search-flash") appears
    // - Assert its background is yellow (or matches the design token)
    // - Wait ~4s and assert the flash disappears
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('flash is removed earlier if the user flips to another page', async ({ page }) => {
    // TODO: implement assertion
    // - Trigger flash, then immediately flip to the next page
    // - Assert flash no longer renders on the new page (within < 4s)
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('opening a cross-chapter search result lands on the first page of that chapter', async ({ page }) => {
    // TODO: implement assertion
    // - Click a search hit pointing to a different chapter
    // - Assert chapter updates and the page index is the chapter-local target page
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })
})
