import { test, expect } from '@playwright/test';

/**
 * 記事機能の包括的テスト
 * - YouTube動画の埋め込み表示
 * - Googleマップの正常表示 
 * - 記事コンテンツのレンダリング
 * - レスポンシブデザイン
 */

test.describe('Article Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Console errors の監視
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });

    // Network errors の監視
    page.on('requestfailed', request => {
      console.log('Request failed:', request.url());
    });
  });

  test('記事ページの基本レンダリング', async ({ page }) => {
    // まずサンプル記事にアクセス
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 記事リストから最初の記事をクリック
    const firstArticle = page.locator('[data-testid="article-card"]').first();
    if (await firstArticle.count() === 0) {
      // フォールバック: 直接記事URLにアクセス
      await page.goto('/articles/toyama-city-cake-station');
    } else {
      await firstArticle.click();
    }

    await page.waitForLoadState('networkidle');

    // 基本要素の存在確認
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="article-content"]')).toBeVisible();

    // SEO要素の確認
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(10);

    // メタデータの確認
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('YouTube動画の埋め込み機能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // YouTube動画がある記事を検索
    const videoArticle = page.locator('[data-testid="article-card"]:has([data-testid="youtube-badge"])').first();
    
    if (await videoArticle.count() > 0) {
      await videoArticle.click();
      await page.waitForLoadState('networkidle');

      // YouTube埋め込みの存在確認
      const youtubeFrame = page.locator('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
      await expect(youtubeFrame).toBeVisible();

      // iframe属性の検証
      const src = await youtubeFrame.getAttribute('src');
      expect(src).toMatch(/youtube\.com\/embed|youtu\.be/);

      // セキュリティ属性の確認
      const allowFullscreen = await youtubeFrame.getAttribute('allowfullscreen');
      expect(allowFullscreen).not.toBeNull();
    }
  });

  test('Googleマップの表示機能', async ({ page }) => {
    await page.goto('/articles/toyama-city-cake-station');
    await page.waitForLoadState('networkidle');

    // Googleマップ iframe の存在確認
    const mapFrame = page.locator('iframe[src*="google.com/maps"]');
    
    if (await mapFrame.count() > 0) {
      await expect(mapFrame).toBeVisible();

      // マップのセキュリティ属性確認
      const src = await mapFrame.getAttribute('src');
      expect(src).toMatch(/google\.com\/maps\/embed/);

      // loading="lazy" 属性の確認（パフォーマンス最適化）
      const loading = await mapFrame.getAttribute('loading');
      expect(loading).toBe('lazy');

      // referrerpolicy の確認（プライバシー保護）
      const referrerPolicy = await mapFrame.getAttribute('referrerpolicy');
      expect(referrerPolicy).toBe('no-referrer-when-downgrade');
    }
  });

  test('レスポンシブデザインの検証', async ({ page }) => {
    await page.goto('/articles/toyama-city-cake-station');

    // デスクトップサイズでの確認
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    
    const desktopLayout = await page.locator('[data-testid="article-content"]').boundingBox();
    expect(desktopLayout?.width).toBeGreaterThan(800);

    // タブレットサイズでの確認
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    const tabletLayout = await page.locator('[data-testid="article-content"]').boundingBox();
    expect(tabletLayout?.width).toBeLessThan(desktopLayout?.width || 0);

    // モバイルサイズでの確認
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    const mobileLayout = await page.locator('[data-testid="article-content"]').boundingBox();
    expect(mobileLayout?.width).toBeLessThan(tabletLayout?.width || 0);

    // モバイルでのiframe調整確認
    const iframes = page.locator('iframe');
    if (await iframes.count() > 0) {
      const iframe = iframes.first();
      const iframeBox = await iframe.boundingBox();
      expect(iframeBox?.width).toBeLessThanOrEqual(375);
    }
  });

  test('記事の読み込みパフォーマンス', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/articles/toyama-city-cake-station');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // 3秒以内の読み込み完了を期待
    expect(loadTime).toBeLessThan(3000);

    // Core Web Vitals の評価
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          resolve(entries);
        }).observe({ entryTypes: ['navigation', 'paint'] });
      });
    });

    console.log('Performance metrics:', performanceMetrics);
  });

  test('アクセシビリティの基本確認', async ({ page }) => {
    await page.goto('/articles/toyama-city-cake-station');
    await page.waitForLoadState('networkidle');

    // 見出し階層の確認
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1); // h1は1つだけ

    // alt属性の確認
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt === null || alt === '') {
        console.warn(`Image ${i} missing alt attribute`);
      }
    }

    // キーボードナビゲーション確認
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('404エラーハンドリング', async ({ page }) => {
    const response = await page.goto('/articles/non-existent-article', { 
      waitUntil: 'networkidle' 
    });
    
    expect(response?.status()).toBe(404);
    
    // カスタム404ページの確認
    const errorMessage = page.locator('text=404').or(page.locator('text=見つかりません'));
    await expect(errorMessage).toBeVisible();
  });
});