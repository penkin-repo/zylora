# PROJECT_LOG_HOW.md — Свод правил и архитектура Zylora (NeoTab)

> Последнее обновление: 2026-03-13

---

## 🗂️ ЧТО МЫ СТРОИМ

**NeoTab** — браузерное расширение (Chrome Extension MV3), заменяющее стандартную страницу новой вкладки.
Продукт рабочее название в папке: `Zylora`.

**Ключевые возможности:**
- Живые часы + строка поиска (мультиподключик: Google, Yandex, Bing, DuckDuckGo, Brave, YouTube, GitHub)
- Сетка закладок с группами (drag-and-drop)
- Режим редактирования (iOS-style wiggle, delete/edit per icon)
- Смена фона (6 пресетов + кастомный цвет)
- Синхронизация данных через Firebase Firestore (per user)
- Firebase Auth (Google OAuth)
- Офлайн поддержка (IndexedDB + localStorage fallback)

---

## 🛠️ СТЕК ТЕХНОЛОГИЙ

| Слой | Технология | Версия |
|------|-----------|--------|
| UI Framework | React | 19.x |
| Язык | TypeScript | 5.x |
| Сборщик | Vite | 7.x |
| Стили | Tailwind CSS | 4.x |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable | 6.x / 10.x |
| БД / Синхр. | Firebase Firestore | (pending) |
| Аутентификация | Firebase Auth (Google OAuth) | (pending) |
| Сборка в один файл | vite-plugin-singlefile | 2.x |
| Утилиты | clsx, tailwind-merge | last |

**Package manager:** npm (есть package-lock.json)

---

## 📁 СТРУКТУРА ПРОЕКТА

```
Zylora/
├── MASTER_PROMPT.md          # Глобальная точка входа (описание продукта)
├── PROJECT_LOG_HOW.md        # ← этот файл (правила, архитектура, стандарты)
├── PROJECT_LOG.md            # Живой журнал (текущее состояние, задачи, баги)
├── index.html                # Точка входа Vite
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx              # React root
    ├── App.tsx               # Корневой компонент (топбар, DnD-контекст, сетка групп)
    ├── index.css             # Глобальные стили + Tailwind directives
    ├── types.ts              # Все TS-интерфейсы (Bookmark, BookmarkGroup, SearchEngine)
    ├── components/
    │   ├── SearchBar.tsx     # Поисковая строка (компактный режим в топбаре)
    │   ├── BookmarkGroup.tsx # Карточка группы с заголовком
    │   ├── BookmarkIcon.tsx  # Иконка-закладка (favicon, emoji, edit/delete)
    │   ├── AddGroupModal.tsx # Модалка создания новой группы
    │   ├── Clock.tsx         # Живые часы (инлайновый режим для топбара)
    │   └── StackInfo.tsx     # Модалка с инфо о стеке (⚙️ кнопка)
    ├── hooks/
    │   └── useBookmarks.ts   # useState + localStorage (CRUD закладок, групп, reorder)
    ├── data/
    │   ├── defaultBookmarks.ts # Дефолтные закладки при первом запуске
    │   └── searchEngines.ts    # Конфиги поисковиков (name, key, url, icon, color)
    └── utils/                  # (пока пустая — готова для утилит)
```

---

## 🏛️ АРХИТЕКТУРНЫЕ РЕШЕНИЯ

### 1. Хранилище данных
- **Текущее состояние:** localStorage через хук `useBookmarks.ts`
- **Целевое состояние:** Firebase Firestore (per user, синхронизация между устройствами)
- **Правило:** При внедрении Firebase — `useBookmarks` заменяется на `useFirestoreBookmarks` с тем же API, чтобы не ломать компоненты.

### 2. Компонентная архитектура
- `App.tsx` — только layout-логика и DnD-контекст. Бизнес-логика — в хуках.
- Компоненты — презентационные (props down, callbacks up).
- Модальные окна рендерятся через React Portal (или условный рендер в корневом App).

### 3. Стили
- Tailwind CSS v4 (atomic классы в JSX).
- Никаких инлайн style-объектов кроме динамических (градиенты, позиции звёзд).
- Glassmorphism UI: `bg-white/[0.04]`, `backdrop-blur-md`, `border border-white/[0.08]`.
- Цветовая палитра: тёмная (deep space). Акценты: голубой, фиолетовый, оранжевый (edit-mode).

### 4. Chrome Extension
- MV3: `manifest.json` + `chrome_url_overrides: { newtab }`
- Сборка через `vite-plugin-singlefile` → один HTML-файл без внешних зависимостей
- `vite.config.ts` должен использовать `singleFile()` плагин

### 5. Firebase (планируется)
- Firestore-схема:
  ```
  users/{uid}/bookmarkGroups/{groupId}
    → title, emoji, color, order
    → bookmarks/{bookmarkId}
        → title, url, emoji, faviconUrl, bgColor, order
  ```
- Auth: Google OAuth Provider
- Офлайн: `enableIndexedDbPersistence()`

---

## ✏️ СТАЙЛГАЙД / СТАНДАРТЫ КОДА

### TypeScript
- Строгая типизация. Все интерфейсы — в `src/types.ts`.
- Не использовать `any`. При необходимости — `unknown` + type guard.
- Имена компонентов: `PascalCase`. Хуки: `use` префикс + camelCase.

### React
- Функциональные компоненты + хуки. Классовые компоненты — запрещены.
- `useCallback` / `useMemo` — только там где есть реальная необходимость (не проактивно).
- Пропсы типизируются inline-интерфейсом прямо в компоненте (не выносить наружу если не переиспользуется).

### Файлы
- Один компонент — один файл.
- Новые утилиты → `src/utils/`.
- Новые типы → добавлять в `src/types.ts`.
- Новые данные/константы → `src/data/`.

### Коммиты (если используем git)
- `feat:` — новая функциональность
- `fix:` — исправление бага
- `refactor:` — рефакторинг
- `chore:` — конфиги, зависимости

---

## 🔄 WORKFLOW РАЗРАБОТКИ

1. **Читать** `PROJECT_LOG.md` → понять текущее состояние и задачи
2. **Кодить** → следовать правилам этого файла
3. **Записывать** результат в `PROJECT_LOG.md` (что сделано, что изменено)
4. **Обновлять** этот файл при изменении стека или архитектуры

---

## 🚧 ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ / ТЕХНИЧЕСКИЙ ДОЛГ

| Проблема | Приоритет | Статус |
|---------|-----------|--------|
| Firebase не подключён — данные только в localStorage | High | В очереди |
| manifest.json не существует — расширение нельзя установить | High | В очереди |
| Звёзды в App.tsx рендерятся через Math.random() — мерцают при ре-ренедре | Low | Нужно useMemo |
| StackInfo.tsx — захардкожен стек, не подтягивает из package.json | Low | Косметика |
