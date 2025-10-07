const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const SANITY_CONFIG = {
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'skpy5lLrdlyPXi4i21H3DQzW2OSh1pO403clgPMrXPHlBkiIYbykaEWtZjzXfGFMDlJ1fj4CTUZswmYnpOyoHHEw6ngyJ7VKRr4VzWZl1PfETQLUkb5sk3SWUfDd2DErdUeNQnyGyMaFpQwBIQPKkBb49Y0v5C4qY0eql2FtJ58cCGbhlN0P' // Note: For long-term use, this should be an environment variable.
};

const OUTPUT_DIR = path.join(__dirname, '..', 'content', 'articles');
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'sasakiyoshimasa_article_template_gemini.md');

const improvedSlugs = {
  "KUicFOD7RY1X6oGsdMKJVX": "go-for-kogei-2025",
  "o031colbTiBAm1wuPGaiX7": "iox-arosa",
  "o031colbTiBAm1wuPGalht": "great-buddha-in-great-buddha-head",
  "o031colbTiBAm1wuPGbVUb": "kira-kira-mission-2023",
  "vTFXi0ufHZhGd7mVymFm4h": "en-cos-japan-2024-in-toyama",
  "vTFXi0ufHZhGd7mVymFyk2": "money-exchange-70myr-rate-26-07-1824jpy",
  "vTFXi0ufHZhGd7mVymG1mQ": "the-field"
};

// --- Helper Functions ---

function portableTextToMarkdown(body) {
  if (!body || !Array.isArray(body)) return '';
  return body.map(block => {
    if (block._type !== 'block' || !block.children) return '';
    const text = block.children.map(child => child.text || '').join('');
    if (!text) return '';
    switch (block.style) {
      case 'h2': return `## ${text}`;
      case 'h3': return `### ${text}`;
      case 'h4': return `#### ${text}`;
      case 'blockquote': return `> ${text}`;
      default: return text;
    }
  }).filter(Boolean).join('\n\n');
}

function getYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*$/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// --- Main Logic ---

async function syncAllArticles() {
  console.log("Starting full article sync process...");
  const client = createClient(SANITY_CONFIG);

  // 1. Fetch all articles
  console.log("Fetching all articles from Sanity...");
  let allArticles = [];
  let page = 0;
  const pageSize = 100;
  while (true) {
    const start = page * pageSize;
    const end = start + pageSize;
    const query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(_updatedAt desc) [${start}...${end}]`;
    const articles = await client.fetch(query);
    if (articles && articles.length > 0) {
      allArticles = allArticles.concat(articles);
      page++;
    } else {
      break;
    }
  }
  console.log(`Fetched a total of ${allArticles.length} articles.`);

  // 2. Read template
  let templateContent;
  try {
    templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  } catch (error) {
    console.error(`FATAL: Could not read template file at ${TEMPLATE_PATH}. Aborting.`, error);
    return;
  }
  const templateFooter = templateContent.substring(templateContent.indexOf('<!-- 🗺 Googleマップ'));

  // 3. Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 4. Generate files
  console.log("Generating markdown files...");
  for (const article of allArticles) {
    if (!article.slug || !article.slug.current) {
        console.log(`Skipping article with missing slug: ${article.title}`);
        continue;
    }
    const slug = improvedSlugs[article._id] || article.slug.current;
    const filename = `${slug}.md`;
    const filepath = path.join(OUTPUT_DIR, filename);

    let frontmatter = '---' + '\n';
    frontmatter += `title: "${(article.title || '').replace(/"/g, '\"')}"` + '\n';
    frontmatter += `tags: [${(article.tags || []).map(t => `"${t}"`).join(', ')}]` + '\n';
    frontmatter += '---' + '\n\n';

    const bodyMarkdown = portableTextToMarkdown(article.body);
    const firstParagraphEnd = bodyMarkdown.indexOf('\n\n');
    const introText = firstParagraphEnd !== -1 ? bodyMarkdown.substring(0, firstParagraphEnd) : bodyMarkdown;
    const restOfBody = firstParagraphEnd !== -1 ? bodyMarkdown.substring(firstParagraphEnd + 2) : '';

    const youtubeId = getYouTubeId(article.youtubeUrl);
    const youtubeEmbed = youtubeId 
      ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeId}" title="YouTube video player" frameborder="0" allowfullscreen></iframe>`
      : '<!-- No YouTube URL provided -->';

    let finalContent = frontmatter + `${introText}\n\n---\n\n` + `<!-- 🎥 YouTube動画埋め込み -->\n${youtubeEmbed}\n\n---\n\n` + restOfBody + `\n\n---\n\n${templateFooter}`;

    try {
      fs.writeFileSync(filepath, finalContent);
      console.log(`Successfully created/updated: ${filename}`);
    } catch (error) {
      console.error(`Error writing file ${filename}:`, error);
    }
  }

  console.log("Article sync process finished.");
}

syncAllArticles();