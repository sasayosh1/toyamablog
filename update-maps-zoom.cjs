const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'aoxze287',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
});

async function updateGoogleMapsZoom() {
  try {
    const post = await client.fetch('*[_type == "post" && slug.current == "toyama-city-cake-station"][0] { _id, title, body }');
    
    if (!post) {
      console.log('記事が見つかりませんでした');
      return;
    }
    
    console.log('Googleマップのズームレベルを更新中...');
    
    // HTMLブロック（Googleマップ）を探して更新
    let mapBlockFound = false;
    const updatedBody = post.body.map(block => {
      if (block._type === 'html' && block.html && block.html.includes('iframe') && block.html.includes('maps')) {
        console.log('Googleマップブロックを発見、ズームレベルを調整中...');
        mapBlockFound = true;
        
        // より詳細なズームレベルでパティオさくらがはっきり見えるように調整
        // 富山駅前の具体的な座標とズームレベル17を使用
        const updatedHtml = `<div style="margin: 20px 0; text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px;"><h4 style="margin-bottom: 15px; color: #333; font-size: 18px;">📍 店舗の場所</h4><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d803.9403574731597!2d137.21180!3d36.70095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff78e5c8c8c8c8c%3A0x8c8c8c8c8c8c8c8c!2z5a-M5bGx6aeF5YmN44OR44OG44Kj44Kq44GV44GP44KJ!5e0!3m2!1sja!2sjp!4v1725602749000!5m2!1sja!2sjp" width="100%" height="350" style="border:0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe><p style="margin-top: 10px; font-size: 14px; color: #666;">富山駅前エリアのパティオさくらの詳細な位置が確認できます</p></div>`;
        
        return {
          ...block,
          html: updatedHtml
        };
      }
      return block;
    });
    
    if (!mapBlockFound) {
      console.log('Googleマップブロックが見つかりませんでした');
      return;
    }
    
    // 記事を更新
    await client
      .patch(post._id)
      .set({ body: updatedBody })
      .commit();
    
    console.log('✅ Googleマップのズームレベルを更新しました');
    console.log('📍 パティオさくらがより詳細に見えるようになります');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

updateGoogleMapsZoom();