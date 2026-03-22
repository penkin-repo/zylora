export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  emoji?: string;
  color?: string;
}

export interface BookmarkGroup {
  id: string;
  title: string;
  emoji: string;
  color: string;
  bookmarks: Bookmark[];
}

export type SearchEngine = {
  name: string;
  key: string;
  url: string;
  icon: string;
  color: string;
};
