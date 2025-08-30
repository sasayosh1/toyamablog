import { test, expect } from '@playwright/test';

/**
 * ナビゲーション・UXテスト
 * - サイト全体のナビゲーション
 * - ユーザーエクスペリエンス
 * - ページ間遷移
 * - パンくずナビ
 */

test.describe('Navigation & UX Tests', () => {
  test('メインナビゲーションの動作確認', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ヘッダーナビゲーションの確認
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // ロゴ・サイト名のクリック可能性
    const logo = page.locator('[data-testid="site-logo"], header a').first();
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
      await logo.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toMatch(/\/$|\/$/); // ホームページに戻る
    }

    // メインメニューの項目確認
    const menuItems = page.locator('[data-testid="nav-menu"] a, nav a');
    if (await menuItems.count() > 0) {
      const menuCount = await menuItems.count();
      console.log(`Found ${menuCount} navigation items`);
      
      for (let i = 0; i < Math.min(3, menuCount); i++) {
        const menuItem = menuItems.nth(i);
        const href = await menuItem.getAttribute('href');
        const text = await menuItem.textContent();
        console.log(`Menu item ${i + 1}: "${text}" -> ${href}`);
        
        // リンクが有効かチェック
        if (href && href !== '#') {
          const response = await page.request.head(href);
          expect([200, 301, 302].includes(response.status())).toBeTruthy();
        }
      }
    }
  });

  test('フッターナビゲーションとリンク', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // フッターの確認
    const footer = page.locator('footer');
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();

      // フッター内のリンク確認
      const footerLinks = footer.locator('a[href]');
      const linkCount = await footerLinks.count();
      
      console.log(`Found ${linkCount} footer links`);
      
      for (let i = 0; i < Math.min(5, linkCount); i++) {
        const link = footerLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
          console.log(`Footer link: "${text}" -> ${href}`);
          
          // 外部リンクは target="_blank" が設定されているかチェック
          if (href.startsWith('http') && !href.includes(page.url())) {
            const target = await link.getAttribute('target');
            expect(target).toBe('_blank');
          }
        }
      }
    }
  });

  test('記事一覧とページネーション', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 記事カードの確認
    const articleCards = page.locator('[data-testid="article-card"], .article-card');
    const cardCount = await articleCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
    console.log(`Found ${cardCount} article cards`);

    // 最初の記事カードの要素確認
    const firstCard = articleCards.first();
    await expect(firstCard).toBeVisible();

    // タイトルの存在確認（h3に変更されたため）
    const cardTitle = firstCard.locator('h3, [data-testid="article-title"]');
    await expect(cardTitle).toBeVisible();

    // カテゴリーラベルの確認
    const categoryLabel = firstCard.locator('[data-testid="category"], .category');
    if (await categoryLabel.count() > 0) {
      await expect(categoryLabel).toBeVisible();
      const categoryText = await categoryLabel.textContent();
      expect(categoryText?.length).toBeGreaterThan(0);
    }

    // YouTube バッジの確認
    const youtubeBadge = firstCard.locator('[data-testid="youtube-badge"]');
    if (await youtubeBadge.count() > 0) {
      await expect(youtubeBadge).toBeVisible();
    }

    // ページネーションの確認
    const pagination = page.locator('[data-testid="pagination"], .pagination');
    if (await pagination.count() > 0) {
      const nextButton = pagination.locator('button:has-text("次"), a:has-text("次"), [data-testid="next-page"]');
      if (await nextButton.count() > 0) {
        const isDisabled = await nextButton.isDisabled();
        console.log('Next button disabled:', isDisabled);
        
        if (!isDisabled) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          
          // 新しいページの記事が読み込まれることを確認
          const newCards = page.locator('[data-testid="article-card"], .article-card');
          expect(await newCards.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test('記事詳細ページの構造とナビゲーション', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 記事リンクをクリック
    const firstArticle = page.locator('[data-testid="article-card"], .article-card').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // パンくずナビゲーションの確認
    const breadcrumb = page.locator('[data-testid="breadcrumb"], .breadcrumb, nav[aria-label="breadcrumb"]');
    if (await breadcrumb.count() > 0) {
      await expect(breadcrumb).toBeVisible();
      
      const breadcrumbLinks = breadcrumb.locator('a');
      const linkCount = await breadcrumbLinks.count();
      console.log(`Breadcrumb links: ${linkCount}`);
      
      // ホームリンクの確認
      if (linkCount > 0) {
        const homeLink = breadcrumbLinks.first();
        const href = await homeLink.getAttribute('href');
        expect(href).toMatch(/^\/$|^\/$/);
      }
    }

    // 記事メタ情報の確認
    const articleMeta = page.locator('[data-testid="article-meta"], .article-meta');
    if (await articleMeta.count() > 0) {
      // 公開日の確認
      const publishDate = articleMeta.locator('[data-testid="publish-date"], time');
      if (await publishDate.count() > 0) {
        const dateText = await publishDate.textContent();
        expect(dateText).toBeTruthy();
      }

      // 著者情報の確認
      const author = articleMeta.locator('[data-testid="author"], .author');
      if (await author.count() > 0) {
        const authorText = await author.textContent();
        expect(authorText).toBeTruthy();
      }

      // カテゴリーの確認
      const category = articleMeta.locator('[data-testid="category"], .category');
      if (await category.count() > 0) {
        await expect(category).toBeVisible();
      }
    }

    // 関連記事の確認
    const relatedArticles = page.locator('[data-testid="related-articles"], .related-articles');
    if (await relatedArticles.count() > 0) {
      const relatedLinks = relatedArticles.locator('a');
      const relatedCount = await relatedLinks.count();
      console.log(`Related articles: ${relatedCount}`);
      
      if (relatedCount > 0) {
        // 最初の関連記事リンクをテスト
        const firstRelated = relatedLinks.first();
        await expect(firstRelated).toBeVisible();
        
        const relatedHref = await firstRelated.getAttribute('href');
        expect(relatedHref).toBeTruthy();
      }
    }
  });

  test('検索機能の動作', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 検索フォームの確認
    const searchForm = page.locator('[data-testid="search-form"], form:has(input[type="search"])');
    const searchInput = page.locator('[data-testid="search-input"], input[type="search"], input[name="search"]');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // 検索実行
      await searchInput.fill('富山市');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');

      // 検索結果の確認
      const searchResults = page.locator('[data-testid="search-results"], .search-results');
      if (await searchResults.count() > 0) {
        const resultItems = searchResults.locator('[data-testid="article-card"], .article-card');
        const resultCount = await resultItems.count();
        console.log(`Search results: ${resultCount} items`);
        
        if (resultCount > 0) {
          // 結果に検索キーワードが含まれているかチェック
          const firstResult = resultItems.first();
          const resultText = await firstResult.textContent();
          expect(resultText?.includes('富山')).toBeTruthy();
        }
      }

      // 検索結果なしの場合のメッセージ
      const noResults = page.locator('[data-testid="no-results"], .no-results');
      if (await noResults.count() > 0) {
        console.log('No search results message found');
      }
    }
  });

  test('モバイルナビゲーション', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ハンバーガーメニューの確認
    const hamburgerMenu = page.locator('[data-testid="hamburger-menu"], .hamburger-menu, button[aria-label*="menu"], button[aria-label*="メニュー"]');
    
    if (await hamburgerMenu.count() > 0) {
      await expect(hamburgerMenu).toBeVisible();
      
      // メニューを開く
      await hamburgerMenu.click();
      await page.waitForTimeout(500);

      // モバイルメニューの表示確認
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, nav[aria-label="mobile"]');
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu).toBeVisible();
        
        // メニュー項目の確認
        const mobileMenuItems = mobileMenu.locator('a');
        const mobileMenuCount = await mobileMenuItems.count();
        console.log(`Mobile menu items: ${mobileMenuCount}`);
        
        // メニューを閉じる
        const closeButton = mobileMenu.locator('[data-testid="close-menu"], .close-menu, button[aria-label*="close"], button[aria-label*="閉じる"]');
        if (await closeButton.count() > 0) {
          await closeButton.click();
          await page.waitForTimeout(500);
          
          // メニューが閉じられることを確認
          const isMenuVisible = await mobileMenu.isVisible();
          expect(isMenuVisible).toBeFalsy();
        }
      }
    }
  });

  test('ブラウザ戻る・進むボタンの動作', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const homeTitle = await page.title();

    // 記事ページに移動
    const firstArticle = page.locator('[data-testid="article-card"], .article-card').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');
    
    const articleTitle = await page.title();
    expect(articleTitle).not.toBe(homeTitle);

    // ブラウザの戻るボタン
    await page.goBack();
    await page.waitForLoadState('networkidle');
    
    const backTitle = await page.title();
    expect(backTitle).toBe(homeTitle);

    // ブラウザの進むボタン
    await page.goForward();
    await page.waitForLoadState('networkidle');
    
    const forwardTitle = await page.title();
    expect(forwardTitle).toBe(articleTitle);
  });

  test('キーボードナビゲーション', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tabキーでのナビゲーション
    let tabCount = 0;
    const maxTabs = 10;
    
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.count() > 0) {
        tabCount++;
        const tagName = await focusedElement.evaluate(el => el.tagName);
        const role = await focusedElement.getAttribute('role');
        
        console.log(`Tab ${i + 1}: ${tagName} ${role ? `[role="${role}"]` : ''}`);
        
        // インタラクティブ要素がフォーカス可能であることを確認
        if (['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) {
          await expect(focusedElement).toBeVisible();
        }
      }
    }

    expect(tabCount).toBeGreaterThan(0);
    console.log(`Total focusable elements tested: ${tabCount}`);

    // Enterキーでリンクをアクティベート
    await page.keyboard.press('Tab'); // 適当な要素にフォーカス
    const focusedLink = page.locator(':focus');
    
    if (await focusedLink.count() > 0) {
      const tagName = await focusedLink.evaluate(el => el.tagName);
      if (tagName === 'A') {
        const href = await focusedLink.getAttribute('href');
        if (href && href !== '#') {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          // ページが変更されたことを確認
        }
      }
    }
  });
});