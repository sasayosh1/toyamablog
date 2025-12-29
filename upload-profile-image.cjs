const {createClient} = require('@sanity/client');
const fs = require('fs');
const path = require('path');

function inboxProfilePath() {
  const root = process.env.ANTIGRAVITY_ROOT_DIR || path.join(require('os').homedir(), '_inbox', 'antigravity');
  return path.join(root, 'toyamablog', 'profile', 'profile.png');
}

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2023-05-03'
});

async function uploadProfileImage() {
  try {
    // 画像ファイルを読み込み
    // public/ には直接置かない運用。inbox をデフォルトにする（必要なら IMAGE_PATH で上書き可）。
    const imagePath = process.env.IMAGE_PATH || inboxProfilePath();
    const imageBuffer = fs.readFileSync(imagePath);
    
    console.log('画像をSanityにアップロード中...');
    
    // Sanityに画像をアップロード
    const imageAsset = await client.assets.upload('image', imageBuffer, {
      filename: 'profile.png',
      contentType: 'image/png'
    });
    
    console.log('画像アップロード完了:', imageAsset._id);
    
    // 作者ドキュメントを取得
    const authors = await client.fetch(`*[_type == "author"]`);
    console.log('既存の作者:', authors.length, '件');
    
    if (authors.length > 0) {
      // 最初の作者のプロフィール画像を更新
      const author = authors[0];
      const updatedAuthor = await client
        .patch(author._id)
        .set({
          image: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: imageAsset._id
            }
          }
        })
        .commit();
      
      console.log('プロフィール画像設定完了:', updatedAuthor.name);
    } else {
      // 作者が存在しない場合は新規作成
      const newAuthor = await client.create({
        _type: 'author',
        name: 'ささよし',
        slug: {
          _type: 'slug',
          current: 'sasayoshi'
        },
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        },
        bio: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: '富山県の魅力を動画で発信するローカルブロガー'
              }
            ]
          }
        ]
      });
      
      console.log('新規作者作成完了:', newAuthor.name);
    }
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

uploadProfileImage();
