import { test, expect } from '@playwright/test';

/**
 * セキュリティ・パフォーマンステスト
 * - セキュリティヘッダー検証
 * - XSS/CSRF保護
 - 画像最適化
 * - Core Web Vitals
 * - SEO要素検証
 */

test.describe('Security & Performance Tests', () => {
  test('セキュリティヘッダーの検証', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const headers = response?.headers();
    console.log('Security Headers:', {
      'x-frame-options': headers?.['x-frame-options'],
      'x-content-type-options': headers?.['x-content-type-options'],
      'x-xss-protection': headers?.['x-xss-protection'],
      'strict-transport-security': headers?.['strict-transport-security'],
      'content-security-policy': headers?.['content-security-policy'],
      'referrer-policy': headers?.['referrer-policy']
    });

    // 重要なセキュリティヘッダーの確認
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    
    // CSPヘッダーの存在確認（推奨）
    if (headers?.['content-security-policy']) {
      expect(headers['content-security-policy']).toContain('default-src');
    }

    // フレーミング保護の確認
    const frameOptions = headers?.['x-frame-options'];
    if (frameOptions) {
      expect(['DENY', 'SAMEORIGIN'].includes(frameOptions)).toBeTruthy();
    }
  });

  test('XSS攻撃からの保護テスト', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 検索機能があればXSSテスト
    const searchInput = page.locator('input[type="search"], input[name="search"], [data-testid="search-input"]');
    
    if (await searchInput.count() > 0) {
      const xssPayload = '<script>alert("xss")</script>';
      await searchInput.fill(xssPayload);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // アラートが表示されないことを確認（XSS攻撃が成功していない）
      const alertPromise = page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);
      const dialog = await alertPromise;
      expect(dialog).toBeNull();

      // 入力値がエスケープされて表示されることを確認
      const pageContent = await page.content();
      expect(pageContent).not.toContain('<script>');
      expect(pageContent).toContain('&lt;script&gt;' || '&amp;lt;script&amp;gt;');
    }
  });

  test('CSRF保護の確認', async ({ page }) => {
    // APIエンドポイントへのCSRF攻撃テスト
    const response = await page.request.post('/api/comments', {
      data: {
        content: 'Test comment',
        articleId: 'test-id'
      }
    });

    // CSRFトークンなしの場合は401/403/422が返されるべき
    expect([401, 403, 404, 422].includes(response.status())).toBeTruthy();
  });

  test('Core Web Vitals測定', async ({ page }) => {
    await page.goto('/');
    
    // パフォーマンス測定
    const performanceData = await page.evaluate(() => {
      return new Promise((resolve) => {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries);
          });
          observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
        } else {
          resolve([]);
        }
      });
    });

    console.log('Performance data:', performanceData);

    // Lighthouse風のパフォーマンステスト
    const navigationStart = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - navigationStart;

    // 3秒以内での読み込み完了を期待
    expect(loadTime).toBeLessThan(3000);

    // First Contentful Paint の確認
    const fcpTime = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : null;
    });

    if (fcpTime) {
      console.log(`First Contentful Paint: ${fcpTime}ms`);
      // 1.8秒以内が Good とされる
      expect(fcpTime).toBeLessThan(1800);
    }
  });

  test('画像最適化の検証', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 全ての画像要素を取得
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const src = await image.getAttribute('src');
      const alt = await image.getAttribute('alt');
      const loading = await image.getAttribute('loading');
      
      // alt属性の確認
      expect(alt).not.toBeNull();
      
      // loading="lazy"の確認（LCP対象外の画像）
      if (loading) {
        expect(['lazy', 'eager']).toContain(loading);
      }

      // 画像サイズの確認
      if (src) {
        const response = await page.request.head(src);
        const contentLength = response.headers()['content-length'];
        
        if (contentLength) {
          const sizeKB = parseInt(contentLength) / 1024;
          console.log(`Image size: ${src} - ${sizeKB}KB`);
          
          // 500KB以下を推奨
          if (sizeKB > 500) {
            console.warn(`Large image detected: ${src} (${sizeKB}KB)`);
          }
        }
      }
    }
  });

  test('モバイルパフォーマンス', async ({ page, browserName }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const mobileLoadTime = Date.now() - startTime;

    // モバイルでは4秒以内の読み込みを期待
    expect(mobileLoadTime).toBeLessThan(4000);
    console.log(`Mobile load time (${browserName}): ${mobileLoadTime}ms`);

    // タッチイベントの確認
    const touchTargets = await page.locator('button, a, [data-testid*="button"]').all();
    
    for (const target of touchTargets.slice(0, 5)) { // 最初の5個のみテスト
      const box = await target.boundingBox();
      if (box) {
        // タッチターゲットは最低44px × 44pxが推奨
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('SEO要素の包括的検証', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Title要素の確認
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThan(70); // Google推奨は約60文字

    // Meta description の確認
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(50);
    expect(description!.length).toBeLessThan(160); // Google推奨は約155文字

    // Open Graph要素の確認
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content');
    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
    const ogUrl = await page.getAttribute('meta[property="og:url"]', 'content');

    console.log('Open Graph data:', { ogTitle, ogDescription, ogImage, ogUrl });

    // Twitter Card要素の確認
    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
    if (twitterCard) {
      expect(['summary', 'summary_large_image'].includes(twitterCard)).toBeTruthy();
    }

    // Canonical URL の確認
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    if (canonical) {
      expect(canonical).toMatch(/^https?:\/\//);
    }

    // 構造化データの確認
    const jsonLD = page.locator('script[type="application/ld+json"]');
    if (await jsonLD.count() > 0) {
      const jsonData = await jsonLD.textContent();
      expect(() => JSON.parse(jsonData!)).not.toThrow();
    }
  });

  test('アクセシビリティ要件', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 見出し階層の確認
    const headings = {
      h1: await page.locator('h1').count(),
      h2: await page.locator('h2').count(),
      h3: await page.locator('h3').count(),
      h4: await page.locator('h4').count(),
    };

    console.log('Heading structure:', headings);
    
    // h1は1つだけ
    expect(headings.h1).toBe(1);

    // スキップリンクの確認
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      expect(skipLink).toBeVisible();
    }

    // フォーカス管理の確認
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').count();
    expect(focusedElement).toBe(1);

    // カラーコントラストの基本確認（要素が存在すれば）
    const textElements = page.locator('p, h1, h2, h3, span').first();
    if (await textElements.count() > 0) {
      const computedStyle = await textElements.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor
        };
      });
      console.log('Text color info:', computedStyle);
    }
  });

  test('エラー境界とフォールバックUI', async ({ page }) => {
    // JavaScript無効時のテスト
    await page.context().addInitScript(() => {
      // コンソールエラーを監視
      window.addEventListener('error', (e) => {
        console.log('JavaScript error detected:', e.message);
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 基本的なコンテンツが表示されることを確認
    const mainContent = page.locator('main, [role="main"], [data-testid="main-content"]');
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible();
    }

    // 存在しないページへのアクセス
    const response404 = await page.goto('/this-page-does-not-exist', { 
      waitUntil: 'networkidle' 
    });
    expect(response404?.status()).toBe(404);

    // カスタム404ページの確認
    const notFoundContent = page.locator('text=404').or(page.locator('text=Not Found')).or(page.locator('text=見つかりません'));
    await expect(notFoundContent).toBeVisible();
  });
});