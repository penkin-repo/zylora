import { BookmarkGroup } from "../types";

// Тестовые закладки — минимальный набор для демо.
// Пользователь добавит свои группы через UI.
export const defaultBookmarks: BookmarkGroup[] = [
  {
    id: "test-dev",
    title: "Разработка",
    emoji: "💻",
    color: "#8b5cf6",
    bookmarks: [
      { id: "td1", title: "GitHub", url: "https://github.com", emoji: "🐙", color: "#24292e" },
      { id: "td2", title: "Figma", url: "https://figma.com", emoji: "🎨", color: "#f24e1e" },
      { id: "td3", title: "MDN", url: "https://developer.mozilla.org", emoji: "📖", color: "#ff6611" },
    ],
  },
  {
    id: "test-ai",
    title: "AI",
    emoji: "🤖",
    color: "#6366f1",
    bookmarks: [
      { id: "ta1", title: "ChatGPT", url: "https://chat.openai.com", emoji: "🧠", color: "#10a37f" },
      { id: "ta2", title: "Claude", url: "https://claude.ai", emoji: "🟠", color: "#d97706" },
    ],
  },
];
