/**
 * useSettings — persists user preferences to chrome.storage.local (extension)
 * or localStorage (web/dev fallback). Reactive across the app.
 */

import { useState, useEffect, useCallback } from "react";

export interface AppPlugin {
  id: string;
  type: "radio" | "weather" | "other";
  title?: string;
  config?: Record<string, any>;
}

export interface AppSettings {
  bgIndex: number;      // index into BACKGROUNDS array
  bgCustom: string;     // custom CSS gradient/color string, or ""
  searchEngine: string; // key of active search engine
  plugins: AppPlugin[]; // user active plugins
}

const DEFAULTS: AppSettings = {
  bgIndex: 0,
  bgCustom: "",
  searchEngine: "google",
  plugins: [],
};

const STORAGE_KEY = "zylora_settings";

// ── Storage abstraction: prefers chrome.storage.local, falls back to localStorage
const storage = {
  async get(): Promise<AppSettings> {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage?.local
      ) {
        return new Promise((resolve) => {
          chrome.storage.local.get(STORAGE_KEY, (result) => {
            resolve({ ...DEFAULTS, ...(result[STORAGE_KEY] ?? {}) });
          });
        });
      }
    } catch {
      // fall through to localStorage
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return { ...DEFAULTS };
  },

  async set(settings: AppSettings): Promise<void> {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage?.local
      ) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [STORAGE_KEY]: settings }, resolve);
        });
      }
    } catch {
      // fall through to localStorage
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  },
};

// ── Hook ─────────────────────────────────────────────────────────
export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    storage.get().then((s) => {
      setSettingsState(s);
      setLoaded(true);
    });
  }, []);

  const setSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...patch };
        storage.set(next); // fire and forget
        return next;
      });
    },
    []
  );

  return { settings, setSettings, loaded };
}
