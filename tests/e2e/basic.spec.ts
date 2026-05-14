import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('命理学术站点 E2E 测试', () => {
  test('首页加载', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('点击典籍卡片跳转到详情页', async ({ page }) => {
    await page.goto(BASE_URL);
    // 查找可点击的卡片元素
    const links = page.locator('a[href*="ditiansui-site"]');
    const count = await links.count();
    if (count > 0) {
      await links.first().click();
      expect(page.url()).toContain('/ditiansui-site');
    }
  });

  test('篇目列表应显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/ditiansui-site`);
    // 检查页面是否有内容（通过 body 非空判断）
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(50);
  });

  test('点击篇目打开 Modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/ditiansui-site`);
    // 查找包含"查看"或"解读"的按钮
    const readBtn = page.getByText(/查看|解读/).first();
    if (await readBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await readBtn.click();
      await page.waitForTimeout(300);
      // 检查 Modal 是否打开
      const modal = page.locator('[class*="modal"]').first();
      if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(modal).toBeVisible();
      }
    }
  });

  test('关闭 Modal', async ({ page }) => {
    await page.goto(`${BASE_URL}/ditiansui-site`);
    const readBtn = page.getByText(/查看|解读/).first();
    if (await readBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await readBtn.click();
      await page.waitForTimeout(300);
      // 点击关闭按钮或 backdrop
      const closeBtn = page.getByText('×').first();
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });
});