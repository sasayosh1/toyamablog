'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { GA_ID, pageview } from '@/lib/gtag';

export default function GAProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ページ読み込み時に gtag を初期化（send_page_view は抑制）
  // 以降はルート変化で pageview を送信
  useEffect(() => {
    // 初回マウント時にも一度送信
    const url =
      (pathname || '/') +
      (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="gtag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: false });
          `,
        }}
      />
    </>
  );
}