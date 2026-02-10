const { createClient } = require('@sanity/client');
const path = require('path');
// Load .env.local
require('dotenv').config({
    path: path.join(__dirname, '..', '.env.local'),
    override: true
});

// Import shared logic
const {
    generateArticleWithGemini,
    markdownToPortableText,
    extractLocation,
    extractTitleKeywords,
    ensureKeywordCoverage,
    generateSlugForVideo
} = require('./check-youtube-and-create-articles.cjs');

// Sanity Client
const sanityToken = (process.env.SANITY_API_TOKEN || '').trim();
const sanityClient = createClient({
    projectId: 'aoxze287',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: sanityToken
});

// Parse args
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 1;
const targetIdArg = args.find(a => a.startsWith('--targetId='));
const targetId = targetIdArg ? targetIdArg.split('=')[1] : null;

async function main() {
    console.log('🚀 既存記事の更新スクリプトを開始します');
    console.log(`📊 設定:`);
    console.log(`  - Dry Run: ${isDryRun ? 'ON (書き込みません)' : 'OFF (Sanityを更新します)'}`);
    console.log(`  - Limit: ${limit}件`);
    console.log(`  - Target ID: ${targetId || '指定なし（最新から）'}\n`);

    try {
        // Fetch posts
        let query = `*[_type == "post"] | order(publishedAt desc)`;
        if (targetId) {
            query = `*[_type == "post" && _id == "${targetId}"]`;
        }

        // Fetch limited number first to minimize traffic, unless targeting specific ID
        // Note: optimization - fetch minimal fields needed
        const posts = await sanityClient.fetch(query + (targetId ? '' : `[0...${limit}]`) + `{
      _id,
      title,
      publishedAt,
      youtubeVideo,
      slug
    }`);

        if (posts.length === 0) {
            console.log('⚠️  更新対象の記事が見つかりませんでした。');
            return;
        }

        console.log(`📋 取得した記事: ${posts.length}件`);

        for (const post of posts) {
            console.log(`\n---------------------------------------------------`);
            console.log(`📝 処理中: ${post.title} (ID: ${post._id})`);

            if (!post.youtubeVideo) {
                console.log(`⏭️  スキップ: YouTube動画情報がありません`);
                continue;
            }

            const location = extractLocation(post.title);
            if (!location) {
                console.log(`⏭️  スキップ: 地域を特定できませんでした`);
                continue;
            }

            console.log(`📍 地域: ${location}`);

            // Generate new content
            // We reconstruct a video object compatible with generateArticleWithGemini
            const video = {
                title: post.youtubeVideo.title || post.title,
                description: post.youtubeVideo.description || '', // Usually missing in Sanity object unless we stored it, but title is most important
                videoId: post.youtubeVideo.videoId,
                url: post.youtubeVideo.url
            };

            const titleKeywords = extractTitleKeywords(video.title, location);

            console.log('🤖 Geminiで記事を再生成中...');
            const generatedMarkdown = await generateArticleWithGemini(video, location, titleKeywords);

            const { markdown: ensuredMarkdown } = ensureKeywordCoverage(generatedMarkdown, titleKeywords);
            const newBody = markdownToPortableText(ensuredMarkdown);

            // Excerpt generation (from first paragraph)
            const firstBodyBlock = newBody.find(
                block => (block.style || 'normal') === 'normal' && !block.listItem
            );
            const firstParagraph = firstBodyBlock
                ? firstBodyBlock.children.map(child => child.text || '').join('').trim()
                : '';
            const newExcerpt = firstParagraph
                ? `${firstParagraph.slice(0, 150)}...`
                : `${location}の魅力的なスポットをご紹介します。`;

            // Slug generation
            const newSlug = await generateSlugForVideo(video, location);
            console.log(`🔗 Slug: ${post.slug?.current} -> ${newSlug}`);

            if (isDryRun) {
                console.log(`✅ [Dry Run] 更新成功シミュレーション`);
                console.log(`New Slug: ${newSlug}`);
                console.log(`New Excerpt: ${newExcerpt.substring(0, 50)}...`);
                console.log(`Preview (first 200 chars):`);
                console.log(ensuredMarkdown.substring(0, 200) + '...');
            } else {
                await sanityClient
                    .patch(post._id)
                    .set({
                        body: newBody,
                        excerpt: newExcerpt,
                        slug: { _type: 'slug', current: newSlug }
                    })
                    .commit();
                console.log(`✅ Sanity更新完了`);
            }

            // Rate limit safety
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log(`\n🎉 全処理完了`);

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        process.exit(1);
    }
}

main();
