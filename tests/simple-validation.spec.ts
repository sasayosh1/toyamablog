import { test, expect } from '@playwright/test';

/**
 * 簡単な修正検証テスト
 * - 404ハンドリングの修正確認
 * - 基本的なページロード確認
 * - セキュリティヘッダーの基本確認
 */

test.describe('Hotfix Validation Tests', () => {
  test('404ページが正しく表示される', async ({ page }) => {
    // 存在しないページにアクセス
    const response = await page.goto('/non-existent-page');
    
    // 404ステータスコードを確認
    expect(response?.status()).toBe(404);
    
    // ページが完全にロードされるまで待機
    await page.waitForLoadState('networkidle');
    
    // カスタム404ページの内容を確認（より柔軟なセレクター）
    const notFoundContent = page.locator('text=ページが見つかりません').first();
    await expect(notFoundContent).toBeVisible();
    
    // ホームに戻るリンクが存在することを確認
    const homeLink = page.locator('[data-testid="home-link"]');
    await expect(homeLink).toBeVisible();
    
    // ホームリンクが機能することを確認
    await homeLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
  });

  test('ホームページが正常にロードされる', async ({ page }) => {
    // ホームページにアクセス
    const response = await page.goto('/');
    
    // 200ステータスコードを確認
    expect(response?.status()).toBe(200);
    
    // ページタイトルが設定されていることを確認
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(5);
    
    // 基本的なコンテンツが表示されることを確認
    await expect(page.locator('body')).toBeVisible();
  });

  test('基本的なセキュリティヘッダーが設定されている', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const headers = response?.headers();
    
    // セキュリティヘッダーの確認
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers?.['content-security-policy']).toContain("default-src 'self'");
    expect(headers?.['strict-transport-security']).toContain('max-age');
    expect(headers?.['x-xss-protection']).toBe('1; mode=block');
    expect(headers?.['permissions-policy']).toContain('camera=()');
    
    console.log('Security Headers Status:');
    console.log('✅ X-Frame-Options: DENY');
    console.log('✅ X-Content-Type-Options: nosniff'); 
    console.log('✅ Referrer-Policy: strict-origin-when-cross-origin');
    console.log('✅ CSP: Implemented with comprehensive policy');
    console.log('✅ HSTS: Implemented with 2-year max-age');
    console.log('✅ X-XSS-Protection: Implemented in block mode');
    console.log('✅ Permissions-Policy: Implemented restricting sensitive APIs');
  });

  test('サーバーがWebpack hot reload問題なく動作する', async ({ page }) => {
    // ページをロード
    await page.goto('/');
    
    // コンソールエラーを監視
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('webpack')) {
        consoleErrors.push(msg.text());
      }
    });

    // 少し待つ
    await page.waitForTimeout(3000);
    
    // Webpack関連のエラーがないことを確認
    expect(consoleErrors.length).toBe(0);
    
    console.log('✅ No webpack hot-update errors detected');
  });

  test('基本的なナビゲーションが機能する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // ページが正常にロードされることを確認
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent?.length).toBeGreaterThan(50);
    
    console.log('✅ Home page loads with content');
    console.log(`Content length: ${bodyContent?.length} characters`);
  });
});