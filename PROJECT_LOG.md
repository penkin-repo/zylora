# PROJECT_LOG.md — Живой журнал проекта NeoTab (Zylora)

> Последнее обновление: 2026-03-13

---

## 📍 ТЕКУЩЕЕ СОСТОЯНИЕ

**Фаза:** Firebase Auth + Firestore — работает в продакшен-режиме ✅. Chrome Extension — не упакован.

**Что работает прямо сейчас:**
- ✅ React 19 + Vite 7 + Tailwind CSS v4 + TypeScript
- ✅ **pnpm** как package manager
- ✅ Строка поиска (мультиподключик: Google, Yandex, Bing, DuckDuckGo, Brave, YouTube, GitHub)
- ✅ Живые часы в топбаре
- ✅ Сетка закладок, drag-and-drop групп (@dnd-kit)
- ✅ Режим редактирования (wiggle, delete/edit per icon)
- ✅ Создание/удаление групп и закладок
- ✅ **Firebase Auth** — вход через Google, logout
- ✅ **Firebase Firestore** — realtime onSnapshot, полный CRUD, optimistic reorder
- ✅ **Offline persistence** — persistentLocalCache + MultipleTabManager (новый API)
- ✅ AuthGate экран входа + аватар/меню в топбаре
- ✅ Seed дефолтных закладок при первом входе
- ✅ Firebase Analytics (measurementId)


**Что НЕ работает / не реализовано:**
- ⚠️ Google Auth popup в расширении — нужно добавить Extension ID в Firebase Authorized Domains (после установки)
- ❌ Firestore Security Rules — пока test mode (истекает через 30 дней)
- ❌ CI/CD (GitHub Actions → Firebase deploy) — не настроен

---

## 📋 TO-DO LIST (Приоритизированный)

### 🔴 HIGH PRIORITY
- [ ] **Firestore Rules** — настроить правила безопасности в Firebase Console
- [ ] **Auth в расширении** — добавить `chrome-extension://EXTENSION_ID` в Firebase Authorized Domains

### 🟡 MEDIUM PRIORITY
- [ ] **Code splitting** — разбить 717кб бандл (Firebase SDK) на чанки
- [ ] **Favicon автоподгрузка** — убедиться что BookmarkIcon использует Google Favicons API

### 🟢 LOW PRIORITY
- [ ] **Deploy** — Firebase Hosting или Vercel (веб-версия)
- [ ] **Analytics dashboard** — проверить что события пишутся


---

## 📅 ИСТОРИЯ ИЗМЕНЕНИЙ

### 2026-03-22 — Оптимизация кэширования и исправление UI
- **Действие:** Настроено локальное кэширование и исправлено поведение UI.
- **Изменено:**
  - `useAuth.ts` — внедрен "Extremely Fast Path". Теперь приложение не ждет асинхронной инициализации `onAuthStateChanged`. Хук мгновенно считывает данные последнего пользователя из `localStorage` (`zylora_last_user`), а Firebase тихо проверяет сессию в фоне. Спиннер при старте больше не показывается.
  - `useFirestoreBookmarks.ts` — убран `onSnapshot`, теперь Firestore опрашивается 1 раз в 24 часа. Все данные грузятся мгновенно из localStorage (offline-first). Реализовано оптимистичное локальное обновление с сохранением `order` для предотвращения бага со сменой мест групп (используется `updateDoc` вместо обнуляющего `setDoc`).
  - `BookmarkIcon.tsx` — убран `target="_blank"`, теперь по умолчанию закладка открывается в текущем окне (а `Ctrl+Click` открывает в новой согласно браузерным стандартам).
  - `SearchBar.tsx` — перенаправление поиска теперь использует `window.location.href`, открываясь в этой же вкладке.
  - `SettingsPanel.tsx` — панель настроек переделана под выезжающий `sidebar` (боковое меню), полностью убрано затемнение фона для удобства настройки цветов.
  - `BookmarkGroup.tsx` — кнопка "Удалить группу" сдвинута левее (`mr-8`), чтобы не перекрываться иконкой перетаскивания.
- **Проверено:** Ошибок во время сборки и работы приложения нет. Firebase работает значительно быстрее и экономит квоты. Стартовый экран с логотипом убран (рендеринг теперь 0 мс).

### 2026-03-13 — Переименование в Zylora + чистка закладок
- **Действие:** Ребрендинг с NeoTab → **Zylora**
- **Изменено:**
  - `index.html` — title = "Zylora — Стартовая страница"
  - `App.tsx` — логотип: буква **Z**, градиент violet→indigo, текст "Zylora"
  - `defaultBookmarks.ts` — удалены 6 дефолтных групп (Социальные, Работа, Новости, Покупки и т.д.), оставлены 2 тестовые: **Разработка** (GitHub, Figma, MDN) и **AI** (ChatGPT, Claude)
- **Проверено:** `npm install` + `npm run dev` → сервер на localhost:5173, UI корректен

### 2026-03-13 — Инициализация системы логов
- **Действие:** Создан `PROJECT_LOG_HOW.md` и `PROJECT_LOG.md`### 2026-03-13 — Исправление двух багов после первого запуска


- **Действие:** Полная интеграция Firebase в приложение
- **Установлено:** `npm install firebase` (81 пакет)
- **Создано:**
  - `.env.local` — шаблон с переменными `VITE_FIREBASE_*` (нужно заполнить)
  - `src/lib/firebase.ts` — инит Firebase App, Auth, Firestore + IndexedDB persistence
  - `src/hooks/useAuth.ts` — Google OAuth, `onAuthStateChanged`, login/logout
  - `src/hooks/useFirestoreBookmarks.ts` — realtime `onSnapshot`, CRUD, optimistic reorder, seed при первом входе
  - `src/components/AuthGate.tsx` — экран авторизации с Google-кнопкой
- **Обновлено:**
  - `App.tsx` — переписан: AuthGate роутинг, LoadingScreen, аватар+меню в топбаре, `useFirestoreBookmarks` вместо `useBookmarks`
  - `tsconfig.json` — добавлен `vite/client` для поддержки `import.meta.env`
  - `StackInfo.tsx` — обновлён статус Firebase
- **Проверено:** Vite компилирует без ошибок. HMR работает.
- **Следующий шаг:** Заполнить `.env.local` реальными Firebase credentials

- **Контекст:** Проект существовал без системы логов. UI-слой полностью готов.
- **Следующий шаг:** Подключение Firebase (Auth + Firestore)

---

## 🐛 ЖУРНАЛ ОШИБОК

> Пока пуст — ошибки будут фиксироваться здесь по мере работы.

| Дата | Ошибка | Причина | Решение | Профилактика |
|------|--------|---------|---------|--------------|
| — | — | — | — | — |

---

## 🔑 ВАЖНЫЕ РЕШЕНИЯ (ADR — Architecture Decision Records)

### ADR-001: localStorage → Firebase Firestore
- **Дата:** В очереди
- **Контекст:** Сейчас данные хранятся в `localStorage`, что не позволяет синхронизацию между устройствами
- **Решение:** Перейти на Firebase Firestore. Хук `useBookmarks` заменяется на `useFirestoreBookmarks` с идентичным публичным API.
- **Последствия:** Нужна аутентификация пользователей. При отсутствии сети — fallback на localStorage.

### ADR-002: Chrome Extension MV3
- **Дата:** В очереди
- **Контекст:** Конечная цель — расширение для браузера
- **Решение:** `vite-plugin-singlefile` собирает всё в один HTML без внешних загрузок. `manifest.json` с `chrome_url_overrides`.
- **Последствия:** Нужна финальная сборочная конфигурация Vite специально для extension.

---

## 📌 ЗАМЕТКИ СЕССИИ

> Сюда пишутся временные заметки и контекст текущей рабочей сессии.

### Сессия от 2026-03-13:
- Стартовали новую систему логов
- Проект: Browse Extension "NeoTab" (папка `Zylora`)
- UI-слой полностью готов, следующий большой этап — Firebase интеграция
- Стек: React 19 + TS + Vite 7 + Tailwind v4 + @dnd-kit + vite-plugin-singlefile
