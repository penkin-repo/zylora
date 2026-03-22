import { useState, useEffect, useCallback } from "react";
import { BookmarkGroup, Bookmark } from "../types";
import { defaultBookmarks } from "../data/defaultBookmarks";

const STORAGE_KEY = "neotab_bookmarks";

export function useBookmarks() {
  const [groups, setGroups] = useState<BookmarkGroup[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultBookmarks;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const addBookmark = useCallback((groupId: string, bookmark: Omit<Bookmark, "id">) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, bookmarks: [...g.bookmarks, { ...bookmark, id: crypto.randomUUID() }] }
          : g
      )
    );
  }, []);

  const updateBookmark = useCallback((groupId: string, bookmarkId: string, data: Partial<Omit<Bookmark, "id">>) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              bookmarks: g.bookmarks.map((b) =>
                b.id === bookmarkId ? { ...b, ...data } : b
              ),
            }
          : g
      )
    );
  }, []);

  const removeBookmark = useCallback((groupId: string, bookmarkId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, bookmarks: g.bookmarks.filter((b) => b.id !== bookmarkId) }
          : g
      )
    );
  }, []);

  const addGroup = useCallback((group: Omit<BookmarkGroup, "id" | "bookmarks">) => {
    setGroups((prev) => [
      ...prev,
      { ...group, id: crypto.randomUUID(), bookmarks: [] },
    ]);
  }, []);

  const removeGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const reorderGroups = useCallback((newGroups: BookmarkGroup[]) => {
    setGroups(newGroups);
  }, []);

  return { groups, addBookmark, updateBookmark, removeBookmark, addGroup, removeGroup, reorderGroups };
}
