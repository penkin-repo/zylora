import { useState, useEffect } from "react";
import {
  User,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

export interface CachedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AuthState = {
  user: User | CachedUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const LAST_USER_KEY = "zylora_last_user";

// ── Environment detection ─────────────────────────────────────────
// IS_CHROME_EXT: true only in real Chrome extension (not Edge)
const IS_CHROME_EXT =
  typeof chrome !== "undefined" &&
  typeof chrome.identity !== "undefined" &&
  typeof chrome.identity.getAuthToken === "function" &&
  /Chrome\//.test(navigator.userAgent) &&
  !/Edg\//.test(navigator.userAgent);

// IS_EDGE_EXT: Edge extension — chrome.runtime exists, but chrome.identity doesn't work
const IS_EDGE_EXT =
  typeof chrome !== "undefined" &&
  typeof chrome.runtime?.id === "string" &&
  /Edg\//.test(navigator.userAgent);

// IS_ANY_EXT: running inside any browser extension (for launchWebAuthFlow support)
const IS_ANY_EXT =
  typeof chrome !== "undefined" &&
  typeof chrome.runtime?.id === "string";

// ── Chrome Auth via chrome.identity.getAuthToken ──────────────────
// Works only in Chrome. Uses Chrome's built-in OAuth — no popup needed.
function signInViaChrome(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (result) => {
      const token = typeof result === "string" ? result : (result as { token?: string })?.token;
      if (chrome.runtime.lastError || !token) {
        const msg = chrome.runtime.lastError?.message ?? "No token returned";
        console.error("[Zylora] chrome.identity error:", msg);
        reject(new Error(msg));
        return;
      }
      try {
        const credential = GoogleAuthProvider.credential(null, token);
        await signInWithCredential(auth, credential);
        resolve();
      } catch (err) {
        console.error("[Zylora] signInWithCredential failed:", err);
        reject(err);
      }
    });
  });
}

// ── Universal Auth via External GitHub Pages proxy ────────────────
function signInViaExternalProxy(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!chrome?.runtime?.id) {
      reject(new Error("chrome.runtime is not available (dev mode)."));
      return;
    }
    const extId = chrome.runtime.id;
    
    // Страница Github Pages (когда вы выбираете папку /docs в настройках, GitHub выводит её в корень домена)
    const PROXY_URL = `https://penkin-repo.github.io/zylora/index.html?extId=${extId}`;
    
    const tokenListener = async (message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message && message.type === "AUTH_SUCCESS") {
        sendResponse({ status: "OK" });
        chrome.runtime.onMessageExternal.removeListener(tokenListener);
        
        try {
          const credential = GoogleAuthProvider.credential(message.idToken, message.accessToken);
          await signInWithCredential(auth, credential);
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    };
    
    chrome.runtime.onMessageExternal.addListener(tokenListener);
    window.open(PROXY_URL, "_blank");
  });
}

// ── Web Auth (signInWithPopup — dev / web mode) ───────────────────
async function signInViaWeb(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | CachedUser | null>(() => {
    try {
      const cached = localStorage.getItem(LAST_USER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem(LAST_USER_KEY);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const cached: CachedUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        localStorage.setItem(LAST_USER_KEY, JSON.stringify(cached));
        setUser(firebaseUser);
      } else {
        localStorage.removeItem(LAST_USER_KEY);
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (IS_CHROME_EXT) {
        // Chrome: fast, no popup, uses Chrome's built-in OAuth
        try {
          await signInViaChrome();
        } catch (chromeErr) {
          console.warn("[Zylora] Native Chrome Auth failed (e.g., Vivaldi, Brave or guest mode). Falling back to GitHub Proxy:", chromeErr);
          await signInViaExternalProxy();
        }
      } else if (IS_EDGE_EXT || IS_ANY_EXT) {
        // Edge/Firefox: universal GitHub Proxy approach
        await signInViaExternalProxy();
      } else {
        // Web / dev server: standard popup
        await signInViaWeb();
      }
    } catch (err) {
      console.error("[Zylora] Sign-in failed:", err);
    }
  };

  const logout = async () => {
    try {
      // Revoke cached Chrome token only in Chrome
      if (IS_CHROME_EXT) {
        chrome.identity.getAuthToken({ interactive: false }, (result) => {
          const token = typeof result === "string" ? result : (result as { token?: string })?.token;
          if (token) chrome.identity.removeCachedAuthToken({ token });
        });
      }
      await signOut(auth);
    } catch (err) {
      console.error("[Zylora] Sign-out failed:", err);
    }
  };

  return { user, loading, signInWithGoogle, logout };
}
