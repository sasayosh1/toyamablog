const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// .env.prodからトークンを抽出する簡易関数
function getStoredToken() {
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '.env.prod'), 'utf8');
        const match = envContent.match(/SANITY_API_TOKEN="(.+?)"/);
        if (match && match[1]) {
            // \n などのエスケープシーケンスが含まれている可能性を考慮して置換
            return match[1].replace(/\\n/g, '').trim();
        }
    } catch (e) {
        console.error('Error reading .env.prod:', e.message);
    }
    return null;
}

// 環境変数からトークンを取得。設定されていなければ .env.prod から取得。
const token = process.env.SANITY_API_TOKEN || getStoredToken();
console.log('Using Token:', token ? token.substring(0, 10) + '...' : 'NONE');

if (!token) {
    console.error('Token not found in .env.prod');
    process.exit(1);
}

const client = createClient({
    projectId: 'aoxze287',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: token
});

async function test() {
    try {
        const posts = await client.fetch('*[_type == "post"][0...1] { title }');
        console.log('✅ Connection Success!');
        console.log('First Post Title:', posts[0]?.title);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.statusCode);
            console.error('Body:', JSON.stringify(error.response.body, null, 2));
        }
    }
}

test();
