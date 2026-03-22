Мы разрабатываем расширение для браузера как стартовая страница. 
Все будет сохраняться в firebase
Сам UI уже собран
Далее нужно внедрение

Расширение будет называться Zylora

📋 Мини-промпт для продакшен версии
Вот готовый промпт, который ты можешь использовать:

Build a browser start page app called "Zylora".

Stack: React 18 + TypeScript + Vite + Tailwind CSS + Firebase (Auth + Firestore) + Chrome Extension MV3

Features:

Top bar with live clock, compact search input with instant multi-engine search (Google, Yandex, Bing, DuckDuckGo, Brave, YouTube, GitHub)
Full-screen bookmark grid organized by custom groups (themes)
Bookmark icons desktop-style (small, with favicon auto-fetch via Google Favicons API or emoji fallback, color picker background)
Add / Edit / Delete bookmarks with live preview modal (rendered via React Portal)
Drag-and-drop reorder of both groups and bookmarks (via @dnd-kit)
Edit mode with wiggle animation (iOS-style), delete (×) and edit (✎) buttons per icon
Background theme switcher (6 presets + custom color)
All data synced to Firestore per user (users/{uid}/bookmarkGroups/{id}/bookmarks/{id})
Firebase Auth (Google OAuth) — bookmarks sync across all devices
Offline support via Firestore cache + localStorage fallback
Deploy as Firebase Hosting + Chrome Extension (overrides chrome://newtab/)
Firestore schema:

text

users/{uid}/bookmarkGroups/{groupId}
  → title, emoji, color, order
  → bookmarks/{bookmarkId}
      → title, url, emoji, faviconUrl, bgColor, order
CI/CD: GitHub Actions → Firebase deploy on push to main

🗂️ Что добавить в продакшене сверху
Задача	Инструмент
Auth	firebase/auth + Google Provider
DB	firebase/firestore + onSnapshot
Offline	enableIndexedDbPersistence()
Extension	manifest.json MV3 + chrome_url_overrides: { newtab }
Deploy	firebase deploy / Vercel
Analytics	Firebase Analytics или Plausible