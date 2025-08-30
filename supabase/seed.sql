-- 富山ブログ用初期データ投入

-- カテゴリの投入
INSERT INTO public.categories (name, slug, description) VALUES
('富山市', 'toyama-city', '富山県の県庁所在地'),
('高岡市', 'takaoka-city', '歴史ある工芸の街'),
('射水市', 'imizu-city', '新湊大橋で有名'),
('氷見市', 'himi-city', 'ひみ寒ぶりで有名'),
('砺波市', 'tonami-city', 'チューリップの街'),
('黒部市', 'kurobe-city', '黒部ダムで有名'),
('南砺市', 'nanto-city', '合掌造りの里'),
('滑川市', 'namerikawa-city', 'ほたるいかで有名'),
('魚津市', 'uozu-city', 'しんきろうで有名'),
('小矢部市', 'oyabe-city', 'メルヘンの街'),
('立山町', 'tateyama-town', '立山黒部アルペンルート'),
('入善町', 'nyuzen-town', '入善ジャンボ西瓜'),
('朝日町', 'asahi-town', 'ヒスイ海岸'),
('舟橋村', 'funahashi-village', '日本一小さな村'),
('上市町', 'kamiichi-town', '剱岳の麓'),
('八尾町', 'yatsuo-town', 'おわら風の盆')
ON CONFLICT (slug) DO NOTHING;

-- デモユーザーの作成
INSERT INTO public.users (id, email, name, avatar_url) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'sasayoshi@toyamablog.com', 'ささよし', 'https://example.com/avatar.jpg')
ON CONFLICT (email) DO NOTHING;

-- 一部記事データの投入（Sanity連携用）
INSERT INTO public.articles (sanity_id, title, slug, category_id, author_id, published_at, tags, youtube_url, has_map) VALUES
('qszvaZusvE4KvujKB63yBo', '富山駅前の隠れ家ケーキ店で至福のひととき', 'charlotte-patio-sakura', 1, '550e8400-e29b-41d4-a716-446655440000', '2024-08-01 10:00:00+09', ARRAY['富山市','スイーツ','ケーキ店'], 'https://youtu.be/example1', true),
('7gNGK9M49tqCuJRraovihd', 'うさぎ推し必見！パティスリーまちなみラパン', 'patisserie-lapin', 7, '550e8400-e29b-41d4-a716-446655440000', '2024-07-15 14:30:00+09', ARRAY['南砺市','スイーツ','うさぎ'], 'https://youtu.be/example2', true),
('4zxT7RlbAnSlGPWZgbkwGk', '安田城月見の宴のYOSAKOIが盛り上がりすぎた', 'yasuda-castle-yosakoi', 1, '550e8400-e29b-41d4-a716-446655440000', '2024-08-31 20:00:00+09', ARRAY['富山市','YOSAKOI','祭り'], 'https://youtu.be/8xqKdkD6sxE', true)
ON CONFLICT (sanity_id) DO NOTHING;

-- 初期統計データ
INSERT INTO public.page_views (article_id, ip_address, user_agent) 
SELECT 
    a.id,
    '192.168.1.100',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
FROM articles a
LIMIT 10;

-- 更新用関数の作成
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

-- トリガー設定
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();