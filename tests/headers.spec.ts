import { test, expect } from '@playwright/test';

/**
 * セキュリティヘッダー回帰テスト
 * Sanity Studio iframe 互換性を保持しつつ、セキュリティを確保する
 */

test.describe('Security Headers Regression Tests', () => {
  
  test('Root path should have X-Frame-Options: DENY', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['content-security-policy']).toBeUndefined();
  });

  test('Non-studio paths should have X-Frame-Options: DENY', async ({ request }) => {
    const testPaths = ['/about', '/blog', '/categories', '/privacy', '/terms'];
    
    for (const path of testPaths) {
      const response = await request.get(path);
      const headers = response.headers();
      
      expect(headers['x-frame-options'], `Path ${path} should have X-Frame-Options`).toBe('DENY');
      expect(headers['content-security-policy'], `Path ${path} should not have CSP`).toBeUndefined();
    }
  });

  test('Studio path should NOT have X-Frame-Options but should have CSP with frame-ancestors', async ({ request }) => {
    const response = await request.get('/studio');
    const headers = response.headers();
    
    // X-Frame-Options should not be set (allowing iframe embedding)
    expect(headers['x-frame-options']).toBeUndefined();
    
    // Content-Security-Policy should be set with frame-ancestors
    const csp = headers['content-security-policy'];
    expect(csp).toBeDefined();
    expect(csp).toContain('frame-ancestors');
    expect(csp).toContain('https://*.sanity.io');
    expect(csp).toContain('https://manage.sanity.io');
  });

  test('Studio subpaths should have correct CSP configuration', async ({ request }) => {
    const studioSubpaths = ['/studio/structure', '/studio/vision'];
    
    for (const path of studioSubpaths) {
      const response = await request.get(path);
      const headers = response.headers();
      
      expect(headers['x-frame-options'], `${path} should not have X-Frame-Options`).toBeUndefined();
      
      const csp = headers['content-security-policy'];
      expect(csp, `${path} should have CSP`).toBeDefined();
      expect(csp, `${path} should allow Sanity domains in frame-ancestors`).toContain('https://*.sanity.io');
    }
  });

  test('CSP should include required Sanity domains and directives', async ({ request }) => {
    const response = await request.get('/studio');
    const csp = response.headers()['content-security-policy'];
    
    // Required directives for Sanity Studio
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-eval' 'unsafe-inline'");
    expect(csp).toContain("https://cdn.sanity.io");
    expect(csp).toContain("https://*.sanity.io");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).toContain("https://*.sanity.dev");
  });

  test('All paths should have common security headers', async ({ request }) => {
    const testPaths = ['/', '/studio', '/about', '/blog'];
    
    for (const path of testPaths) {
      const response = await request.get(path);
      const headers = response.headers();
      
      expect(headers['x-content-type-options'], `${path} should have X-Content-Type-Options`).toBe('nosniff');
      expect(headers['referrer-policy'], `${path} should have Referrer-Policy`).toBe('strict-origin-when-cross-origin');
    }
  });

  test('Vercel configuration should not override Next.js studio headers', async ({ request }) => {
    // This test ensures vercel.json regex pattern excludes studio paths
    const response = await request.get('/studio');
    const headers = response.headers();
    
    // If X-Frame-Options is present, it means vercel.json is overriding Next.js config
    expect(headers['x-frame-options']).toBeUndefined();
  });

  test('Header configuration consistency across environments', async ({ request }) => {
    const studioResponse = await request.get('/studio');
    const rootResponse = await request.get('/');
    
    // Studio should have CSP but not X-Frame-Options
    expect(studioResponse.headers()['content-security-policy']).toBeDefined();
    expect(studioResponse.headers()['x-frame-options']).toBeUndefined();
    
    // Root should have X-Frame-Options but not CSP
    expect(rootResponse.headers()['x-frame-options']).toBe('DENY');
    expect(rootResponse.headers()['content-security-policy']).toBeUndefined();
  });

});