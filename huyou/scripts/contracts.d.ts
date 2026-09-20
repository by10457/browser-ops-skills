/** 数据契约；公开函数及调用方式见 references/orchestration.md。 */
export interface Post {
  id: string;
  author: {id: string|null; name: string; avatar: string|null};
  text: string;
  textTruncated: boolean;
  publishedLabel: string|null;
  recommended: boolean;
}
export interface Comment {
  id: null;
  index: number;
  authorName: string;
  avatar: string|null;
  text: string;
  stickers: string[];
  time: string;
  isReply: boolean;
  parentIndex: number|null;
}
export interface PostQueryResult {
  posts: Post[];
  complete: boolean;
  stopReason: string;
  warnings: string[];
  scanned: number;
  loads: number;
}
export type InteractionAction = 'like-post'|'like-comment'|'comment'|'reply'|'publish'|'follow-user';
export type NextDecision = 'continue'|'reconcile'|'stop';
