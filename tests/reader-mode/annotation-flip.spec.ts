import { test, expect, devices } from '@playwright/test'

test.use({ ...devices['iPhone 12'] })

test.describe('Annotation Display in Flip Mode', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: navigate to a chapter that has known annotations attached to specific pages
    // Example: await page.goto('/books/some-slug/read/interp/some-chapter')
    //          await page.getByTestId('reader-mode-flip').click()
  })

  test('annotations attached to the current flip page are visible', async ({ page }) => {
    // TODO: implement assertion
    // - Seed: chapter has annotation A on page 2, annotation B on page 5
    // - Navigate to data-page="2"
    // - Assert annotation A is rendered and B is not
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('annotations update when flipping to the next page', async ({ page }) => {
    // TODO: implement assertion
    // - Start on page 2 with annotation A visible
    // - Trigger next-page flip to data-page="3"
    // - Assert annotation A is hidden, page-3 annotations (if any) are shown
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('annotation panel Prev/Next buttons navigate between annotations', async ({ page }) => {
    // TODO: implement assertion
    // - Open annotation panel
    // - Click Next and assert the panel jumps to the next annotated page (and DOM reflects it)
    // - Click Prev and assert it returns to the previous annotation
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('annotation panel boundary: Prev on first annotation is a no-op', async ({ page }) => {
    // TODO: implement assertion
    // - On first annotation, click Prev
    // - Assert panel does not change / no error
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('annotation panel boundary: Next on last annotation is a no-op', async ({ page }) => {
    // TODO: implement assertion
    // - On last annotation, click Next
    // - Assert panel does not change / no error
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })

  test('annotation text and its source reference are rendered together', async ({ page }) => {
    // TODO: implement assertion
    // - On a page with an annotation, assert both the body text and the linked source ref are present
    test.skip(true, 'TODO: implement when e2e infrastructure is ready')
  })
})
