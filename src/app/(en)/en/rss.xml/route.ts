import { getAllPosts } from '@/lib/sanity';
import { NextResponse } from 'next/server';

export async function GET() {
    const posts = await getAllPosts();
    const site_url = 'https://sasakiyoshimasa.com/en';

    const feedItems = posts
        .map((post) => {
            // 英語版のタイトルが存在する記事のみを抽出
            if (!post.titleEn) return null;

            const description = post.excerptEn || post.description || post.displayExcerpt || '';

            return `
      <item>
        <title><![CDATA[${post.titleEn}]]></title>
        <link>${site_url}/blog/${post.slug?.current}</link>
        <description><![CDATA[${description}]]></description>
        <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        <guid>${site_url}/blog/${post.slug?.current}</guid>
      </item>
    `;
        })
        .filter(Boolean)
        .join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title><![CDATA[Do you like Toyama? - AMAZING TOYAMA]]></title>
        <link>${site_url}</link>
        <description><![CDATA[A YouTube Shorts linked blog discovering the sightseeing spots, gourmet, and culture of Toyama Prefecture.]]></description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${site_url}/rss.xml" rel="self" type="application/rss+xml"/>
        ${feedItems}
      </channel>
    </rss>`;

    return new NextResponse(rss, {
        headers: {
            'Content-Type': 'text/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        },
    });
}
