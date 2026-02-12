const { createClient } = require('@sanity/client');
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
    token: (process.env.SANITY_API_TOKEN || '').trim()
});

async function main() {
    try {
        const posts = await sanityClient.fetch(`*[_type == "post" && defined(youtubeVideo)] | order(publishedAt asc)[0...5] {
      _id,
      title,
      publishedAt,
      slug
    }`);

        console.log('Older Articles:');
        posts.forEach(p => console.log(`ID: ${p._id} | Slug: ${p.slug?.current} | Title: ${p.title}`));
    } catch (error) {
        console.error(error);
    }
}

main();
