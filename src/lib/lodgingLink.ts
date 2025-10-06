/**
 * 宿泊リンク生成ユーティリティ（ASP切替対応）
 * JTB / 楽天トラベル / じゃらん / 一休.com のDeeplinkを生成
 */

export type TravelProvider = 'JTB' | 'RAKUTEN' | 'JALAN' | 'IKKYU';

export interface LodgingLinkOptions {
  /** 地域名 */
  area: string;
  /** 旅行予約サイト（既定: JTB） */
  provider?: TravelProvider;
  /** トラッキング情報 */
  track?: Record<string, string>;
  /** 強制的に使用するURL（指定時はDeeplink生成をスキップ） */
  forceUrl?: string;
}

export interface LodgingLinkResult {
  /** 生成されたURL */
  url: string;
  /** プロバイダーラベル */
  label: string;
  /** HTML形式 */
  html: string;
  /** Markdown形式 */
  md: string;
  /** プロバイダー */
  provider: TravelProvider;
}

// プロバイダー別ラベル
const PROVIDER_LABELS: Record<TravelProvider, string> = {
  JTB: 'JTB',
  RAKUTEN: '楽天トラベル',
  JALAN: 'じゃらん',
  IKKYU: '一休.com'
};

// URLテンプレート（環境変数のIDを使用）
const URL_TEMPLATES: Record<TravelProvider, (area: string) => string> = {
  JTB: (area: string) => {
    const affiliateId = process.env.NEXT_PUBLIC_JTB_AFFILIATE_ID || '';
    const encodedArea = encodeURIComponent(area);
    return `https://www.jtb.co.jp/search/hotel.aspx?keyword=${encodedArea}&va=${affiliateId}`;
  },
  RAKUTEN: (area: string) => {
    const sid = process.env.NEXT_PUBLIC_RAKUTEN_SID || '';
    const encodedArea = encodeURIComponent(area);
    return `https://hotel.travel.rakuten.co.jp/hotelinfo/search/area/keyword?f_teikei=&f_query=${encodedArea}&scid=${sid}`;
  },
  JALAN: (area: string) => {
    const vos = process.env.NEXT_PUBLIC_JALAN_VOS || '';
    const encodedArea = encodeURIComponent(area);
    return `https://www.jalan.net/uw/uwp1700/uww1701.do?keyword=${encodedArea}&vos=${vos}`;
  },
  IKKYU: (area: string) => {
    const aid = process.env.NEXT_PUBLIC_IKKYU_AID || '';
    const encodedArea = encodeURIComponent(area);
    return `https://www.ikyu.com/search/?st=${encodedArea}&aid=${aid}`;
  }
};

/**
 * 宿泊リンクを生成
 *
 * @param options - 生成オプション
 * @returns 生成結果
 *
 * @example
 * makeLodgingLink({ area: "氷見市", provider: "JTB" })
 * // => { url: "https://www.jtb.co.jp/...", label: "JTB", ... }
 */
export function makeLodgingLink(options: LodgingLinkOptions): LodgingLinkResult {
  const {
    area,
    provider = (process.env.NEXT_PUBLIC_DEFAULT_TRAVEL_PROVIDER as TravelProvider) || 'JTB',
    forceUrl
  } = options;

  // forceUrlが指定されている場合は最優先
  const url = forceUrl || URL_TEMPLATES[provider](area);
  const label = PROVIDER_LABELS[provider];

  // Markdown形式（文例①）
  const md = `📍${area}の宿泊先を探している方はこちら\n👉 [${label}で宿泊プランをチェックする](${url})`;

  // HTML形式
  const html = `
<div class="lodging-link-block" data-area="${area}" data-provider="${provider}">
  <p>📍${area}の宿泊先を探している方はこちら</p>
  <p>👉 <a href="${url}" target="_blank" rel="nofollow noopener noreferrer">${label}で宿泊プランをチェックする</a></p>
</div>`.trim();

  return {
    url,
    label,
    html,
    md,
    provider
  };
}

/**
 * 複数プロバイダーのリンクを生成
 *
 * @param area - 地域名
 * @param providers - プロバイダーリスト
 * @returns 生成結果の配列
 */
export function makeMultipleLodgingLinks(
  area: string,
  providers: TravelProvider[] = ['JTB', 'RAKUTEN', 'JALAN', 'IKKYU']
): LodgingLinkResult[] {
  return providers.map(provider => makeLodgingLink({ area, provider }));
}

/**
 * 環境変数の設定状況を確認
 *
 * @returns 設定状況オブジェクト
 */
export function checkProviderConfig(): Record<TravelProvider, boolean> {
  return {
    JTB: !!process.env.NEXT_PUBLIC_JTB_AFFILIATE_ID,
    RAKUTEN: !!process.env.NEXT_PUBLIC_RAKUTEN_SID,
    JALAN: !!process.env.NEXT_PUBLIC_JALAN_VOS,
    IKKYU: !!process.env.NEXT_PUBLIC_IKKYU_AID
  };
}

/**
 * 利用可能なプロバイダーを取得
 *
 * @returns 設定済みプロバイダーのリスト
 */
export function getAvailableProviders(): TravelProvider[] {
  const config = checkProviderConfig();
  return (Object.keys(config) as TravelProvider[]).filter(key => config[key]);
}
