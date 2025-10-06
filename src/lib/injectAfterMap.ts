/**
 * インジェクタ（Googleマップ直後への挿入）
 * HTML/Markdown コンテンツのGoogleマップ直後に宿泊リンクブロックを挿入
 */

export interface InjectOptions {
  /** HTML または Markdown コンテンツ */
  htmlOrMd: string;
  /** マップのアンカー（文字列または正規表現） */
  mapAnchor: string | RegExp;
  /** 挿入するブロック */
  blockToInsert: string;
  /** 重複挿入を防ぐためのID（data-attr等） */
  duplicateCheckId?: string;
}

/**
 * Googleマップ直後にブロックを挿入
 *
 * @param options - 挿入オプション
 * @returns 挿入後のコンテンツ
 *
 * @example
 * injectAfterMap({
 *   htmlOrMd: "## Googleマップ\n<iframe...></iframe>\n## 関連記事",
 *   mapAnchor: /##\s*Googleマップ/,
 *   blockToInsert: "📍宿泊リンク...",
 *   duplicateCheckId: "lodging-block"
 * })
 */
export function injectAfterMap(options: InjectOptions): string {
  const {
    htmlOrMd,
    mapAnchor,
    blockToInsert,
    duplicateCheckId = 'lodging-block:do-not-duplicate'
  } = options;

  // 既に同種ブロックが入っているかチェック
  if (htmlOrMd.includes(duplicateCheckId)) {
    console.log('injectAfterMap: 宿泊ブロックは既に挿入済みです');
    return htmlOrMd;
  }

  // マップアンカーを正規表現に変換
  const anchorRegex = typeof mapAnchor === 'string'
    ? new RegExp(mapAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    : mapAnchor;

  // マップ位置を検索
  const match = htmlOrMd.match(anchorRegex);

  if (!match) {
    console.warn('injectAfterMap: Googleマップアンカーが見つかりません');
    return htmlOrMd;
  }

  // マップブロックの終了位置を特定
  const mapStartIndex = match.index!;
  let mapEndIndex = mapStartIndex + match[0].length;

  // iframe終了タグまたは次の見出しまでを探索
  const afterMap = htmlOrMd.substring(mapEndIndex);

  // iframeがある場合は</iframe>まで
  const iframeEndMatch = afterMap.match(/<\/iframe>/i);
  if (iframeEndMatch) {
    mapEndIndex += iframeEndMatch.index! + iframeEndMatch[0].length;
  }

  // </div>がある場合は</div>まで
  const divEndMatch = afterMap.match(/<\/div>/i);
  if (divEndMatch && (!iframeEndMatch || divEndMatch.index! < iframeEndMatch.index!)) {
    mapEndIndex += divEndMatch.index! + divEndMatch[0].length;
  }

  // 挿入位置を確定（マップの直後）
  const insertionPoint = mapEndIndex;

  // ブロックを挿入
  const before = htmlOrMd.substring(0, insertionPoint);
  const after = htmlOrMd.substring(insertionPoint);

  // 改行を適切に調整
  let separator = '\n\n';
  if (after.startsWith('\n')) {
    separator = '\n';
  }

  const injected = before + separator + blockToInsert + after;

  console.log('injectAfterMap: 宿泊ブロックを挿入しました');
  return injected;
}

/**
 * 複数のブロックを順次挿入
 *
 * @param content - 元のコンテンツ
 * @param injections - 挿入設定の配列
 * @returns 全て挿入後のコンテンツ
 */
export function injectMultipleBlocks(
  content: string,
  injections: Omit<InjectOptions, 'htmlOrMd'>[]
): string {
  let result = content;

  for (const injection of injections) {
    result = injectAfterMap({
      htmlOrMd: result,
      ...injection
    });
  }

  return result;
}

/**
 * Portable Text形式のbodyに宿泊ブロックを挿入
 * （Sanity CMS用）
 *
 * @param body - Portable Text bodyブロック配列
 * @param lodgingBlock - 挿入する宿泊ブロック
 * @returns 挿入後のbody
 */
export function injectLodgingBlockToPortableText(
  body: any[],
  lodgingBlock: { _type: string; _key: string; code: string }
): any[] {
  // まとめセクション（H2）のインデックスを探す
  const summaryIndex = body.findIndex(
    block =>
      block._type === 'block' &&
      block.style === 'h2' &&
      block.children?.some((c: any) => c.text === 'まとめ')
  );

  if (summaryIndex === -1) {
    console.warn('injectLodgingBlockToPortableText: まとめセクションが見つかりません');
    return body;
  }

  // まとめ本文の次のインデックスを探す（通常はsummaryIndex + 2）
  let insertIndex = summaryIndex + 2;

  // 既に宿泊ブロックが存在するかチェック
  const hasLodgingBlock = body.some(
    block =>
      block._type === 'html' &&
      (block.code?.includes('lodging-block') || block.html?.includes('lodging-block'))
  );

  if (hasLodgingBlock) {
    console.log('injectLodgingBlockToPortableText: 宿泊ブロックは既に挿入済みです');
    return body;
  }

  // 空白ブロックを追加
  const spacerBlock = {
    _type: 'block',
    _key: `lodging-spacer-${Date.now()}`,
    style: 'normal',
    children: [{
      _type: 'span',
      _key: `lodging-spacer-span-${Date.now()}`,
      text: '',
      marks: []
    }],
    markDefs: []
  };

  // ブロックを挿入
  const newBody = [
    ...body.slice(0, insertIndex),
    spacerBlock,
    lodgingBlock,
    ...body.slice(insertIndex)
  ];

  console.log('injectLodgingBlockToPortableText: 宿泊ブロックを挿入しました');
  return newBody;
}
