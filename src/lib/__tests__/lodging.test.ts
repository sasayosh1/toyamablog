/**
 * 宿泊リンクシステムの単体テスト
 * 仕様書記載の3ケースを実装
 */

import { extractAreaFromTitle } from '../extractArea';
import { makeLodgingLink } from '../lodgingLink';

describe('地域名抽出と宿泊リンク生成', () => {
  // テストケース1: タイトル "氷見の朝市ガイド" → area="氷見"、JTB既定
  test('ケース1: 氷見の朝市ガイド（JTB既定）', () => {
    const title = '氷見の朝市ガイド';

    // 地域名抽出
    const area = extractAreaFromTitle(title);
    expect(area).toBe('氷見');

    // 環境変数をモック
    process.env.NEXT_PUBLIC_DEFAULT_TRAVEL_PROVIDER = 'JTB';
    process.env.NEXT_PUBLIC_JTB_AFFILIATE_ID = 'test_jtb_id';

    // 宿泊リンク生成
    const link = makeLodgingLink({ area });

    expect(link.provider).toBe('JTB');
    expect(link.label).toBe('JTB');
    expect(link.url).toContain('keyword=%E6%B0%B7%E8%A6%8B'); // encodeURIComponent('氷見')
    expect(link.url).toContain('va=test_jtb_id');
    expect(link.md).toContain('📍氷見の宿泊先を探している方はこちら');
    expect(link.md).toContain('JTBで宿泊プランをチェックする');
  });

  // テストケース2: タイトル "金沢・近江町の食べ歩き" + frontmatter.provider="RAKUTEN"
  test('ケース2: 金沢・近江町の食べ歩き（楽天トラベル）', () => {
    const title = '金沢・近江町の食べ歩き';

    // 地域名抽出
    const area = extractAreaFromTitle(title);
    expect(area).toBe('金沢');

    // 環境変数をモック
    process.env.NEXT_PUBLIC_RAKUTEN_SID = 'test_rakuten_sid';

    // プロバイダー指定で宿泊リンク生成
    const link = makeLodgingLink({ area, provider: 'RAKUTEN' });

    expect(link.provider).toBe('RAKUTEN');
    expect(link.label).toBe('楽天トラベル');
    expect(link.url).toContain('f_query=%E9%87%91%E6%B2%A2'); // encodeURIComponent('金沢')
    expect(link.url).toContain('scid=test_rakuten_sid');
    expect(link.md).toContain('📍金沢の宿泊先を探している方はこちら');
    expect(link.md).toContain('楽天トラベルで宿泊プランをチェックする');
  });

  // テストケース3: タイトル "北陸の絶景スポット10選"（地名なし） → area="この周辺" fallback
  test('ケース3: 北陸の絶景スポット10選（地名なし・fallback）', () => {
    const title = '北陸の絶景スポット10選';

    // 地域名抽出（fallback）
    const area = extractAreaFromTitle(title, { fallback: 'この周辺' });
    expect(area).toBe('この周辺');

    // 環境変数をモック
    process.env.NEXT_PUBLIC_DEFAULT_TRAVEL_PROVIDER = 'JTB';
    process.env.NEXT_PUBLIC_JTB_AFFILIATE_ID = 'test_jtb_id';

    // 宿泊リンク生成
    const link = makeLodgingLink({ area });

    expect(link.provider).toBe('JTB');
    expect(link.url).toContain('keyword=%E3%81%93%E3%81%AE%E5%91%A8%E8%BE%BA'); // encodeURIComponent('この周辺')
    expect(link.md).toContain('📍この周辺の宿泊先を探している方はこちら');
  });

  // 追加テスト: 【】形式のタイトル
  test('追加: 【氷見市】朝市ガイド', () => {
    const title = '【氷見市】朝市ガイド';

    const area = extractAreaFromTitle(title);
    expect(area).toBe('氷見市');

    const link = makeLodgingLink({ area });
    expect(link.url).toContain('keyword=%E6%B0%B7%E8%A6%8B%E5%B8%82');
  });

  // 追加テスト: じゃらん
  test('追加: じゃらんプロバイダー', () => {
    const area = '富山市';

    process.env.NEXT_PUBLIC_JALAN_VOS = 'test_jalan_vos';

    const link = makeLodgingLink({ area, provider: 'JALAN' });

    expect(link.provider).toBe('JALAN');
    expect(link.label).toBe('じゃらん');
    expect(link.url).toContain('jalan.net');
    expect(link.url).toContain('vos=test_jalan_vos');
  });

  // 追加テスト: 一休.com
  test('追加: 一休.comプロバイダー', () => {
    const area = '高岡市';

    process.env.NEXT_PUBLIC_IKKYU_AID = 'test_ikkyu_aid';

    const link = makeLodgingLink({ area, provider: 'IKKYU' });

    expect(link.provider).toBe('IKKYU');
    expect(link.label).toBe('一休.com');
    expect(link.url).toContain('ikyu.com');
    expect(link.url).toContain('aid=test_ikkyu_aid');
  });

  // 追加テスト: forceUrl優先
  test('追加: forceUrl指定時は最優先', () => {
    const area = '氷見市';
    const forceUrl = 'https://example.com/custom-hotel-link';

    const link = makeLodgingLink({ area, forceUrl });

    expect(link.url).toBe(forceUrl);
  });
});
