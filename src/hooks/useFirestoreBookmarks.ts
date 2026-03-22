import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { BookmarkGroup, Bookmark } from "../types";
import { defaultBookmarks } from "../data/defaultBookmarks";

// ── Cache helpers (chrome.storage.local → localStorage fallback) ──
const CACHE_PREFIX = "zylora_bm_";
const LAST_SYNC_PREFIX = "zylora_sync_time_";

// We sync from DB once every 24 hours automatically
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function readCache(uid: string): Promise<BookmarkGroup[] | null> {
  const key = CACHE_PREFIX + uid;
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise<BookmarkGroup[] | null>((resolve) => {
        chrome.storage.local.get(key, (res) => resolve((res[key] as BookmarkGroup[] | null) ?? null));
      });
    }
  } catch { /* fall through */ }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function writeCache(uid: string, data: BookmarkGroup[]): Promise<void> {
  const key = CACHE_PREFIX + uid;
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: data }, resolve);
      });
    }
  } catch { /* fall through */ }
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const groupsRef = (uid: string) =>
  collection(db, "users", uid, "bookmarkGroups");

const groupRef = (uid: string, groupId: string) =>
  doc(db, "users", uid, "bookmarkGroups", groupId);

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────
export function useFirestoreBookmarks(user: { uid: string }) {
  const [groups, setGroups] = useState<BookmarkGroup[]>([]);
  const [ready, setReady] = useState(false);

  // We use this to only trigger the initial load sequence once per mount
  const initializedRef = useRef(false);

  // Sync cache -> local state
  const syncToCacheAndState = useCallback((newGroups: BookmarkGroup[]) => {
    setGroups(newGroups);
    writeCache(user.uid, newGroups);
  }, [user.uid]);

  const fetchFromFirestore = useCallback(async () => {
    try {
      const q = query(groupsRef(user.uid), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Seed initial data if DB is empty
        await seedDefaults(user.uid);
        return;
      }

      const loaded: BookmarkGroup[] = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<BookmarkGroup, "id">),
        id: d.id,
      }));

      syncToCacheAndState(loaded);
      localStorage.setItem(LAST_SYNC_PREFIX + user.uid, Date.now().toString());
    } catch (error) {
      console.error("Failed to fetch from Firestore:", error);
    }
  }, [user.uid, syncToCacheAndState]);

  useEffect(() => {
    if (initializedRef.current) return;

    readCache(user.uid).then((cached) => {
      // Show cache instantly if available
      if (cached && cached.length > 0) {
        setGroups(cached);
        setReady(true);
        initializedRef.current = true;

        // Check if we passed the 24h interval to sync in background
        const lastSyncStr = localStorage.getItem(LAST_SYNC_PREFIX + user.uid);
        const lastSync = lastSyncStr ? parseInt(lastSyncStr, 10) : 0;
        
        if (Date.now() - lastSync > SYNC_INTERVAL_MS) {
          fetchFromFirestore();
        }
      } else {
        // No cache -> fetch right away (will show loader until done)
        initializedRef.current = true;
        fetchFromFirestore().finally(() => setReady(true));
      }
    });
  }, [user.uid, fetchFromFirestore]);

  // Seed default bookmarks on first login
  const seedDefaults = async (uid: string) => {
    const batch = writeBatch(db);
    const newGroups = defaultBookmarks.map((g, i) => ({ ...g, order: i }));
    newGroups.forEach((group) => {
      const ref = doc(groupsRef(uid), group.id);
      batch.set(ref, {
        title: group.title,
        emoji: group.emoji,
        color: group.color,
        bookmarks: group.bookmarks,
        order: group.order,
        createdAt: serverTimestamp(),
      });
    });
    await batch.commit();
    syncToCacheAndState(newGroups);
    localStorage.setItem(LAST_SYNC_PREFIX + user.uid, Date.now().toString());
    setReady(true);
  };

  // ── CRUD ─────────────────────────────────────

  const addBookmark = useCallback(
    async (groupId: string, bookmark: Omit<Bookmark, "id">) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      
      const newBookmark: Bookmark = { ...bookmark, id: crypto.randomUUID() };
      const updatedBookmarks = [...group.bookmarks, newBookmark];

      // Optimistic update
      const newGroups = groups.map(g => g.id === groupId ? { ...g, bookmarks: updatedBookmarks } : g);
      syncToCacheAndState(newGroups);

      // We use updateDoc to preserve 'order' and 'createdAt'
      await updateDoc(groupRef(user.uid, groupId), {
        bookmarks: updatedBookmarks,
      });
    },
    [user.uid, groups, syncToCacheAndState]
  );

  const updateBookmark = useCallback(
    async (groupId: string, bookmarkId: string, data: Partial<Omit<Bookmark, "id">>) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      
      const updatedBookmarks = group.bookmarks.map((b) =>
        b.id === bookmarkId ? { ...b, ...data } : b
      );

      // Optimistic update
      const newGroups = groups.map(g => g.id === groupId ? { ...g, bookmarks: updatedBookmarks } : g);
      syncToCacheAndState(newGroups);

      await updateDoc(groupRef(user.uid, groupId), {
        bookmarks: updatedBookmarks,
      });
    },
    [user.uid, groups, syncToCacheAndState]
  );

  const removeBookmark = useCallback(
    async (groupId: string, bookmarkId: string) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;
      
      const updatedBookmarks = group.bookmarks.filter((b) => b.id !== bookmarkId);

      // Optimistic update
      const newGroups = groups.map(g => g.id === groupId ? { ...g, bookmarks: updatedBookmarks } : g);
      syncToCacheAndState(newGroups);

      await updateDoc(groupRef(user.uid, groupId), {
        bookmarks: updatedBookmarks,
      });
    },
    [user.uid, groups, syncToCacheAndState]
  );

  const addGroup = useCallback(
    async (groupData: Omit<BookmarkGroup, "id" | "bookmarks">) => {
      const id = crypto.randomUUID();
      const newGroup: BookmarkGroup = { ...groupData, id, bookmarks: [] };
      const order = groups.length;

      // Optimistic update
      const newGroups = [...groups, newGroup];
      syncToCacheAndState(newGroups);

      await setDoc(groupRef(user.uid, id), {
        title: groupData.title,
        emoji: groupData.emoji,
        color: groupData.color,
        bookmarks: [],
        order,
        createdAt: serverTimestamp(),
      });
    },
    [user.uid, groups, syncToCacheAndState]
  );

  const removeGroup = useCallback(
    async (groupId: string) => {
      // Optimistic update
      const newGroups = groups.filter(g => g.id !== groupId);
      syncToCacheAndState(newGroups);

      await deleteDoc(groupRef(user.uid, groupId));
    },
    [user.uid, groups, syncToCacheAndState]
  );

  const reorderGroups = useCallback(
    async (newGroups: BookmarkGroup[]) => {
      // Optimistic update
      syncToCacheAndState(newGroups);

      const batch = writeBatch(db);
      newGroups.forEach((group, i) => {
        batch.update(groupRef(user.uid, group.id), { order: i });
      });
      await batch.commit();
    },
    [user.uid, syncToCacheAndState]
  );

  return {
    groups,
    ready,
    addBookmark,
    updateBookmark,
    removeBookmark,
    addGroup,
    removeGroup,
    reorderGroups,
  };
}
