const { createClient } = require('@sanity/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env.local'),
    override: true
});

const sanityClient = createClient({
    projectId: 'aoxze287',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gemini 2.5 Flash is highly capable at structured JSON tasks
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * プレーンテキストの翻訳（Title, Excerpt用）
 */
async function translateText(text, type) {
    if (!text) return '';
    const prompt = `You are a professional travel writer and translator. Translate the following Japanese ${type} into natural, highly engaging, and SEO-friendly English.
Output ONLY the translated text, no conversational filler.

Text:
${text}`;

    try {
        const result = await model.generateContent(prompt);
        let translated = result.response.text().trim();
        return translated;
    } catch (error) {
        console.error(`❌ Translation error (${type}):`, error);
        return '';
    }
}

/**
 * Sanity Portable Text (JSON配列) の翻訳
 * Contextを維持しつつマークアップ構造を崩さずに翻訳する高度なタスク
 */
async function translatePortableTextJSON(blocks) {
    if (!blocks || !blocks.length) return [];

    const prompt = `You are an expert translator and JSON parser. I am providing you with a JSON array that represents "Sanity Portable Text", containing a Japanese blog post.
Your task is to translate the Japanese text into highly readable, natural English, while STRICTLY keeping the exact JSON structure.

RULES:
1. ONLY translate the Japanese string values found inside the "text" property of objects where "_type": "span".
2. DO NOT modify ANY other keys ("_key", "_type", "style", "marks", "markDefs", "listItem", "level", "html" etc.).
3. DO NOT map, filter, or restructure the arrays. Keep the exact same number of blocks and spans.
4. For embedded HTML/Iframe or [[MAP: ...]] strings, leave them completely untouched.
5. Return ONLY a valid, raw JSON array. DO NOT wrap the output in markdown code blocks like \`\`\`json. Output MUST start with [ and end with ].

JSON to translate:
${JSON.stringify(blocks, null, 2)}`;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Clean up code block wrappers if Gemini ignored the rule
        if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '').trim();
        }

        const translatedBlocks = JSON.parse(responseText);
        return translatedBlocks;
    } catch (error) {
        console.error(`❌ PortableText translation error/JSON parse error:`, error.message);
        // If it fails, fallback to original Japanese to avoid deleting content
        return null;
    }
}

async function main() {
    console.log('🚀 過去記事の一括翻訳バッチ処理を開始...');

    // titleEn が無い記事を全て取得
    const query = `*[_type == "post" && !defined(titleEn)][0...1000] {
    _id,
    title,
    excerpt,
    body
  }`;

    const posts = await sanityClient.fetch(query);
    console.log(`📦 翻訳対象の記事: ${posts.length}件\n`);

    let successCount = 0;
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        console.log(`[${i + 1}/${posts.length}] 🔄 翻訳中: ${post.title}`);

        try {
            // 1. Title
            const titleEn = await translateText(post.title, 'title');

            // 2. Excerpt
            const excerptEn = await translateText(post.excerpt, 'short excerpt description');

            // 3. Body (Portable Text)
            const bodyEn = await translatePortableTextJSON(post.body);

            if (!bodyEn) {
                console.log(`⚠️ 本文の翻訳JSONパースに失敗したため、この記事 (${post.title}) はスキップします。`);
                continue;
            }

            // SanityをPatchして更新
            await sanityClient.patch(post._id)
                .set({
                    titleEn: titleEn || post.title,
                    excerptEn: excerptEn || post.excerpt,
                    bodyEn: bodyEn
                })
                .commit();

            console.log(`✅ 保存完了: ${titleEn}`);
            successCount++;

            // Gemini APIのRate Limit回避 (1分間15リクエスト対策に余裕を持たせる)
            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (err) {
            console.error(`❌ エラー (${post.title}):`, err.message);
        }
    }

    console.log(`\n🎉 バッチ処理完了`);
    console.log(`  - 成功: ${successCount}件`);
    console.log(`  - 対象外/スキップ: ${posts.length - successCount}件`);
    console.log('ターミナルから npm run translate:all でいつでも再実行できます。');
}

main().catch(console.error);
