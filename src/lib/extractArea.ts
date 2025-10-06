/**
 * 地域名抽出ユーティリティ
 * 記事タイトルから地域名を自動抽出する
 */

// 北陸地方の地域辞書（初期値）
const DEFAULT_DICTIONARY = [
  // 富山県
  "富山", "氷見", "高岡", "射水", "砺波", "南砺", "魚津", "黒部",
  "滑川", "立山", "舟橋", "上市", "小矢部",
  // 石川県
  "金沢", "白山", "野々市", "七尾", "輪島", "珠洲", "加賀",
  "能美", "羽咋", "かほく",
  // 福井県
  "福井", "あわら", "坂井", "永平寺", "勝山", "大野", "鯖江",
  "越前", "敦賀", "小浜"
];

// 地域名接尾辞パターン
const AREA_SUFFIX_PATTERN = /([一-龠々ぁ-んァ-ヶ]+(?:市|区|町|村|郡|県))/g;

export interface ExtractAreaOptions {
  /** 抽出に失敗した場合のフォールバック値 */
  fallback?: string;
  /** 最優先で使用する地域名（フロントマター等から） */
  override?: string;
  /** カスタム地域辞書（既定辞書に追加） */
  dictionary?: string[];
}

/**
 * タイトルから地域名を抽出
 *
 * @param title - 記事タイトル
 * @param opts - オプション
 * @returns 抽出された地域名
 *
 * @example
 * extractAreaFromTitle("【氷見市】朝市ガイド") // => "氷見市"
 * extractAreaFromTitle("金沢・近江町の食べ歩き") // => "金沢"
 * extractAreaFromTitle("北陸の絶景", { fallback: "この周辺" }) // => "この周辺"
 */
export function extractAreaFromTitle(
  title: string,
  opts: ExtractAreaOptions = {}
): string {
  // 1. override が指定されていれば最優先
  if (opts.override) {
    return opts.override;
  }

  // 2. 明示辞書からマッチング
  const dictionary = [...DEFAULT_DICTIONARY, ...(opts.dictionary || [])];
  for (const area of dictionary) {
    if (title.includes(area)) {
      // 接尾辞付きの形式もチェック（例: "氷見" → "氷見市"）
      const withSuffix = title.match(new RegExp(`(${area}[市区町村])`));
      if (withSuffix) {
        return withSuffix[1];
      }
      return area;
    }
  }

  // 3. 正規表現で地名パターンを抽出
  const matches = title.match(AREA_SUFFIX_PATTERN);
  if (matches && matches.length > 0) {
    // 複数マッチした場合は先頭を採用
    return matches[0];
  }

  // 4. 【】内の地域名を抽出（例: 【富山市】〇〇）
  const bracketMatch = title.match(/【(.+?)】/);
  if (bracketMatch) {
    return bracketMatch[1];
  }

  // 5. 見つからない場合はフォールバック
  return opts.fallback || "この周辺";
}

/**
 * タイトルから都道府県名を抽出
 *
 * @param title - 記事タイトル
 * @returns 都道府県名（見つからない場合は null）
 */
export function extractPrefecture(title: string): string | null {
  const prefectures = ["富山県", "石川県", "福井県"];

  for (const pref of prefectures) {
    if (title.includes(pref)) {
      return pref;
    }
  }

  return null;
}

/**
 * 地域名を正規化（市区町村接尾辞を統一）
 *
 * @param area - 地域名
 * @returns 正規化された地域名
 *
 * @example
 * normalizeArea("氷見") // => "氷見市"
 * normalizeArea("金沢市") // => "金沢市"
 */
export function normalizeArea(area: string): string {
  // 既に接尾辞がある場合はそのまま
  if (/[市区町村]$/.test(area)) {
    return area;
  }

  // 既知の地域名に市を付与
  if (DEFAULT_DICTIONARY.includes(area)) {
    // 富山県の主要都市は「市」を付与
    const cities = ["富山", "氷見", "高岡", "射水", "砺波", "南砺", "魚津", "黒部", "滑川", "小矢部"];
    if (cities.includes(area)) {
      return `${area}市`;
    }

    // 石川県の主要都市
    const ishikawaCities = ["金沢", "白山", "野々市", "七尾", "輪島", "珠洲", "加賀", "能美", "羽咋", "かほく"];
    if (ishikawaCities.includes(area)) {
      return `${area}市`;
    }

    // 福井県の主要都市
    const fukuiCities = ["福井", "あわら", "坂井", "勝山", "大野", "鯖江", "越前", "敦賀", "小浜"];
    if (fukuiCities.includes(area)) {
      return `${area}市`;
    }
  }

  return area;
}
