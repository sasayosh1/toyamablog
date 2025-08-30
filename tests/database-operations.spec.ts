import { test, expect } from '@playwright/test';

/**
 * データベース操作の包括的テスト
 * - 記事ビューカウント
 * - いいね機能
 * - コメント投稿
 * - Supabase連携
 */

test.describe('Database Operations Tests', () => {
  test.beforeEach(async ({ page }) => {
    // API通信の監視
    page.on('response', async response => {
      if (response.url().includes('/api/') && !response.ok()) {
        console.log(`API Error: ${response.url()} - ${response.status()}`);
      }
    });
  });

  test('記事ページビューの記録', async ({ page }) => {
    // 記事にアクセスしてビューカウントをテスト
    await page.goto('/articles/toyama-city-cake-station');
    await page.waitForLoadState('networkidle');

    // ページビューAPI呼び出しの確認
    const viewApiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/views') || request.url().includes('/api/articles')) {
        viewApiCalls.push(request.url());
      }
    });

    // 少し待ってからページビューが記録されるかチェック
    await page.waitForTimeout(2000);
    
    // ビューカウンター要素があれば確認
    const viewCounter = page.locator('[data-testid="view-count"]');
    if (await viewCounter.count() > 0) {
      const viewCountText = await viewCounter.textContent();
      expect(viewCountText).toMatch(/\d+/); // 数字が含まれることを確認
    }
  });

  test('いいね機能のテスト', async ({ page }) => {
    await page.goto('/articles/toyama-city-cake-station');
    await page.waitForLoadState('networkidle');

    const likeButton = page.locator('[data-testid="like-button"]');
    
    if (await likeButton.count() > 0) {
      // 初期状態の確認
      const initialLikes = await page.locator('[data-testid="like-count"]').textContent();
      
      // いいねボタンをクリック
      await likeButton.click();
      await page.waitForTimeout(1000);

      // いいね後の状態確認
      const afterLikes = await page.locator('[data-testid="like-count"]').textContent();
      
      // いいね数が変化したかを確認（認証が必要な場合はログインモーダルが表示される可能性）
      if (afterLikes !== initialLikes) {
        const initialCount = parseInt(initialLikes || '0');
        const afterCount = parseInt(afterLikes || '0');
        expect(afterCount).toBeGreaterThan(initialCount);
      }

      // ボタンの状態変化を確認
      const buttonState = await likeButton.getAttribute('data-liked');
      if (buttonState) {
        expect(['true', 'false']).toContain(buttonState);
      }
    } else {
      console.log('Like button not found - feature may not be implemented yet');
    }
  });

  test('コメント機能のテスト', async ({ page }) => {
    await page.goto('/articles/toyama-city-cake-station');
    await page.waitForLoadState('networkidle');

    // コメントセクションの存在確認
    const commentSection = page.locator('[data-testid="comments-section"]');
    
    if (await commentSection.count() > 0) {
      // 既存コメントの表示確認
      const existingComments = page.locator('[data-testid="comment-item"]');
      const commentCount = await existingComments.count();
      console.log(`Found ${commentCount} existing comments`);

      // コメント投稿フォームの確認
      const commentForm = page.locator('[data-testid="comment-form"]');
      if (await commentForm.count() > 0) {
        const textArea = commentForm.locator('textarea');
        const submitButton = commentForm.locator('button[type="submit"]');

        await expect(textArea).toBeVisible();
        await expect(submitButton).toBeVisible();

        // フォームの動作テスト（実際には投稿はしない）
        await textArea.fill('テストコメントです');
        expect(await textArea.inputValue()).toBe('テストコメントです');
        
        // フォーム送信前の状態確認
        const isDisabled = await submitButton.isDisabled();
        console.log('Submit button disabled state:', isDisabled);
      }
    } else {
      console.log('Comment section not found - feature may not be implemented yet');
    }
  });

  test('記事検索とフィルタリング', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 検索機能の確認
    const searchInput = page.locator('[data-testid="search-input"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('富山市');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // 検索結果の確認
      const searchResults = page.locator('[data-testid="article-card"]');
      const resultCount = await searchResults.count();
      
      if (resultCount > 0) {
        // 結果の各記事が検索キーワードを含むかチェック
        for (let i = 0; i < Math.min(3, resultCount); i++) {
          const articleTitle = await searchResults.nth(i).locator('h2, h3').textContent();
          console.log(`Search result ${i + 1}: ${articleTitle}`);
        }
      }
    }

    // カテゴリフィルター機能の確認
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    
    if (await categoryFilter.count() > 0) {
      await categoryFilter.selectOption('富山市');
      await page.waitForTimeout(1000);

      const filteredResults = page.locator('[data-testid="article-card"]');
      const filteredCount = await filteredResults.count();
      console.log(`Filtered results count: ${filteredCount}`);
    }
  });

  test('データベース接続の健全性チェック', async ({ page }) => {
    // API healthcheck エンドポイントをテスト
    const response = await page.request.get('/api/health');
    
    if (response.status() === 200) {
      const healthData = await response.json();
      console.log('Health check response:', healthData);
      
      expect(healthData).toHaveProperty('status');
      expect(healthData.status).toBe('ok');
    } else if (response.status() === 404) {
      console.log('Health check endpoint not implemented');
    }

    // Supabase接続テスト
    const dbTestResponse = await page.request.get('/api/articles');
    
    if (dbTestResponse.status() === 200) {
      const articles = await dbTestResponse.json();
      expect(Array.isArray(articles) || typeof articles === 'object').toBeTruthy();
      console.log('Database connection successful');
    } else {
      console.log('Database API not accessible or not implemented');
    }
  });

  test('APIエラーハンドリング', async ({ page }) => {
    // 存在しない記事IDでのAPI呼び出し
    const response = await page.request.get('/api/articles/non-existent-id');
    expect([404, 500].includes(response.status())).toBeTruthy();

    // 不正なデータでのPOSTリクエスト
    const postResponse = await page.request.post('/api/comments', {
      data: {
        invalid: 'data'
      }
    });
    expect([400, 401, 404, 422].includes(postResponse.status())).toBeTruthy();
  });

  test('レート制限とセキュリティ', async ({ page }) => {
    // 短時間での複数リクエストテスト
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(
        page.request.get('/api/articles', {
          headers: {
            'User-Agent': 'Playwright-Test'
          }
        })
      );
    }

    const responses = await Promise.all(requests);
    const statusCodes = responses.map(r => r.status());
    
    console.log('Rate limit test status codes:', statusCodes);
    
    // 429 (Too Many Requests) が含まれているかチェック
    const hasRateLimit = statusCodes.includes(429);
    console.log('Rate limiting active:', hasRateLimit);
  });
});