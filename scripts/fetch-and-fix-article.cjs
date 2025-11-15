const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function fetchArticle() {
  console.log('Searching for nursing assistant articles...');

  // First, search for all articles containing "看護助手"
  const searchQuery = `*[_type == "post" && title match "看護助手*"]{
    _id,
    title,
    "slug": slug.current
  }`;

  try {
    const articles = await client.fetch(searchQuery);

    if (articles.length === 0) {
      console.error('No articles found with "看護助手" in title!');
      return;
    }

    console.log(`\nFound ${articles.length} article(s):`);
    articles.forEach((a, i) => {
      console.log(`${i + 1}. "${a.title}"`);
      console.log(`   Slug: ${a.slug}`);
    });

    // Get the first article's full content
    const targetArticle = articles[0];
    console.log(`\nFetching full content for: ${targetArticle.title}`);

    const query = `*[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      body
    }`;

    const article = await client.fetch(query, { slug: targetArticle.slug });

    if (!article) {
      console.error('Article not found!');
      return;
    }

    console.log('\n=== Article Found ===');
    console.log('ID:', article._id);
    console.log('Title:', article.title);
    console.log('\n=== Body Structure ===');

    if (article.body && Array.isArray(article.body)) {
      article.body.forEach((block, index) => {
        if (block.style === 'h2') {
          console.log(`\n[${index}] H2: ${block.children?.[0]?.text || '(empty)'}`);
        } else if (block.style === 'h3') {
          console.log(`[${index}] H3: ${block.children?.[0]?.text || '(empty)'}`);
        } else if (block.style === 'normal') {
          const text = block.children?.[0]?.text || '';
          if (text.includes('次のステップ') || text.includes('次の')) {
            console.log(`[${index}] ⚠️  NEXT STEP CONTENT: ${text.substring(0, 50)}...`);
          }
        }
      });
    }

    // Write full article to file for analysis
    const fs = require('fs');
    fs.writeFileSync('/tmp/article-content.json', JSON.stringify(article, null, 2));
    console.log('\n✅ Full article content written to /tmp/article-content.json');

  } catch (error) {
    console.error('Error fetching article:', error);
  }
}

fetchArticle().catch(console.error);
