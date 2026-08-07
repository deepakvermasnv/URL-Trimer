import { LanguageToolMatch } from './types';

/**
 * HighlightRenderer
 * Responsible for mapping plain text character offsets from LanguageTool matches
 * to ProseMirror document node positions (from/to) for decoration rendering.
 */

export interface PosMapping {
  text: string;
  indexToPos: (index: number) => number;
}

export class HighlightRenderer {
  /**
   * Extracts plain text from ProseMirror document and generates an exact
   * index-to-position mapping function.
   */
  public static extractTextAndMap(doc: any): PosMapping {
    let text = '';
    const posMap: number[] = [];

    if (!doc) {
      return {
        text: '',
        indexToPos: () => 1,
      };
    }

    doc.descendants((node: any, pos: number) => {
      if (node.isText) {
        const nodeText = node.text || '';
        for (let i = 0; i < nodeText.length; i++) {
          posMap.push(pos + i);
        }
        text += nodeText;
      } else if (node.isBlock && text.length > 0 && !text.endsWith('\n')) {
        text += '\n';
        posMap.push(pos);
      }
    });

    return {
      text,
      indexToPos: (index: number) => {
        if (posMap.length === 0) return 1;
        if (index < 0) return posMap[0];
        if (index >= posMap.length) return posMap[posMap.length - 1] + 1;
        return posMap[index];
      },
    };
  }

  /**
   * Maps LanguageTool matches with character offsets into enriched matches
   * containing ProseMirror `from` and `to` node positions.
   */
  public static mapMatchesToProseMirrorPositions(
    matches: LanguageToolMatch[],
    mapping: PosMapping
  ): LanguageToolMatch[] {
    const docLength = mapping.text.length;
    const result: LanguageToolMatch[] = [];

    for (const match of matches) {
      if (match.offset < 0 || match.offset >= docLength) continue;

      const endOffset = Math.min(match.offset + match.length, docLength);
      const from = mapping.indexToPos(match.offset);
      const to = mapping.indexToPos(endOffset);

      if (from >= to) continue;

      result.push({
        ...match,
        from,
        to,
      });
    }

    return result;
  }
}
