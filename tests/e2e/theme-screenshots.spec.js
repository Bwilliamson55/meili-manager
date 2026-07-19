import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotDir = path.join(__dirname, 'screenshots')

const HOME_THEMES = [
  'weeumson-dark',
  'weeumson-light',
  'slate-light',
  'high-contrast',
]

/**
 * Desktop theme catalog shots for visual QA.
 * Sets localStorage before navigation so Pinia + boot theme agree.
 */
test.describe('theme catalog screenshots @visual', () => {
  for (const themeId of HOME_THEMES) {
    test(`home desktop (${themeId})`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'desktop-only theme review')

      await page.addInitScript((id) => {
        localStorage.setItem('meili-manager-theme', id)
        localStorage.setItem('settings', JSON.stringify({ themeId: id }))
      }, themeId)

      await page.goto('/#/')
      await expect(page.getByLabel('Toggle navigation')).toBeVisible({
        timeout: 30_000,
      })
      await expect(page.locator('html')).toHaveAttribute('data-theme', themeId)
      await expect(page.getByText('Connect to Meilisearch')).toBeVisible()

      await page.screenshot({
        path: path.join(screenshotDir, `theme-home-${themeId}-desktop.png`),
        fullPage: true,
      })
    })
  }

  test('theme picker open (desktop)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop-only theme review')

    await page.addInitScript(() => {
      localStorage.setItem('meili-manager-theme', 'weeumson-dark')
      localStorage.setItem(
        'settings',
        JSON.stringify({ themeId: 'weeumson-dark' }),
      )
    })

    await page.goto('/#/')
    await expect(page.getByLabel('Toggle navigation')).toBeVisible({
      timeout: 30_000,
    })

    await page.getByLabel('Theme').click()
    await expect(page.getByText('Weeumson Dark')).toBeVisible()
    await expect(page.getByText('Weeumson Light')).toBeVisible()
    await expect(page.getByText('Slate Light')).toBeVisible()

    await page.screenshot({
      path: path.join(screenshotDir, 'theme-picker-open-desktop.png'),
      fullPage: true,
    })
  })
})
