import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function checkRemaining() {
  const remaining = await client.fetch(`count(*[_type == "post" && !("youtubeShorts" in body[]._type)])`);
  const withYouTube = await client.fetch(`count(*[_type == "post" && "youtubeShorts" in body[]._type])`);
  const total = await client.fetch(`count(*[_type == "post"])`);
  
  console.log('📊 YouTube Shorts追加状況:');
  console.log(`✅ 追加済み: ${withYouTube}件`);
  console.log(`⏳ 未追加: ${remaining}件`);
  console.log(`📝 総記事数: ${total}件`);
  console.log(`📈 進捗率: ${Math.round(withYouTube/total*100)}%`);
}

checkRemaining();