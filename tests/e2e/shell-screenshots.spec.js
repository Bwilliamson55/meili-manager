import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

/**
 * Smoke visual review for agents: captures connect/shell UI without Meili credentials.
 * Tag @visual so `npm run review:screenshots` can target this suite.
 */
test.describe('shell screenshots @visual', () => {
  test.beforeEach(async ({ page }) => {
    // Fresh browser context has empty localStorage (no saved instances / keys).
    await page.goto('/#/')
    await expect(page.getByLabel('Toggle navigation')).toBeVisible({
      timeout: 30_000,
    })
    await expect(
      page.getByRole('link', { name: /Meili(?:search)? Manager/ }),
    ).toBeVisible()
  })

  test('home shell (unconnected)', async ({ page }, testInfo) => {
    const project = testInfo.project.name
    await expect(page.getByText('Connect to Meilisearch')).toBeVisible()

    if (project === 'mobile') {
      // home-mobile must be drawer-closed; home-drawer-mobile is the open shot.
      // Drawer nav stays in the DOM when closed; use the mobile backdrop instead.
      const backdrop = page.locator('.q-drawer__backdrop')
      if (await backdrop.isVisible()) {
        await page.getByLabel('Toggle navigation').click()
        await expect(backdrop).toBeHidden()
      }
    }

    await page.screenshot({
      path: path.join(screenshotDir, `home-${project}.png`),
      fullPage: true,
    })

    if (project === 'mobile') {
      const backdrop = page.locator('.q-drawer__backdrop')
      await page.getByLabel('Toggle navigation').click()
      await expect(backdrop).toBeVisible()
      await page.screenshot({
        path: path.join(screenshotDir, `home-drawer-${project}.png`),
        fullPage: true,
      })
    }
  })

  test('instances page (unconnected)', async ({ page }, testInfo) => {
    const project = testInfo.project.name
    await page.goto('/#/instances')
    await expect(page.getByLabel('Toggle navigation')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Instances' })).toBeVisible()

    await page.screenshot({
      path: path.join(screenshotDir, `instances-${project}.png`),
      fullPage: true,
    })
  })
})
