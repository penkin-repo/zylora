interface Props {
  onClose: () => void;
}

const stack = [
  {
    category: "Frontend",
    color: "#3b82f6",
    emoji: "🎨",
    items: [
      { name: "React 18", desc: "UI-библиотека, компонентная архитектура" },
      { name: "TypeScript", desc: "Типобезопасность кода" },
      { name: "Tailwind CSS", desc: "Utility-first стилизация" },
      { name: "Vite", desc: "Сборщик, dev-сервер" },
    ],
  },
  {
    category: "База данных",
    color: "#f59e0b",
    emoji: "🗄️",
    items: [
      { name: "Firebase Firestore", desc: "NoSQL БД в реальном времени от Google" },
      { name: "Firebase Auth", desc: "Авторизация (Google, Email, GitHub)" },
      { name: "Firebase Storage", desc: "Хранение иконок/фонов пользователей" },
    ],
  },
  {
    category: "Синхронизация",
    color: "#10b981",
    emoji: "🔄",
    items: [
      { name: "Firestore onSnapshot", desc: "Realtime подписки — данные обновляются мгновенно" },
      { name: "LocalStorage", desc: "Офлайн-кэш закладок (PWA fallback)" },
      { name: "React Query / SWR", desc: "Кэширование и синхронизация состояния с БД" },
    ],
  },
  {
    category: "Расширение браузера",
    color: "#8b5cf6",
    emoji: "🧩",
    items: [
      { name: "Chrome Extension MV3", desc: "override chrome://newtab/ на ваш Zylora" },
      { name: "Web Extension API", desc: "Работает в Firefox, Edge, Brave" },
      { name: "PWA (Progressive Web App)", desc: "Установка как приложение без расширения" },
    ],
  },
  {
    category: "Деплой",
    color: "#ec4899",
    emoji: "🚀",
    items: [
      { name: "Firebase Hosting", desc: "CDN-хостинг от Google, HTTPS из коробки" },
      { name: "Vercel", desc: "Альтернатива, автодеплой из GitHub" },
      { name: "GitHub Actions", desc: "CI/CD пайплайн" },
    ],
  },
];

export function StackInfo({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-auto">
      <div className="bg-gray-950/95 border border-white/10 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-xl">⚙️ Технический стек</h2>
            <p className="text-white/40 text-sm mt-1">Как это реализовать в продакшене</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {stack.map((section) => (
            <div key={section.category} className="border border-white/5 rounded-2xl overflow-hidden">
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{ background: section.color + "20", borderLeft: `3px solid ${section.color}` }}
              >
                <span className="text-base">{section.emoji}</span>
                <h3 className="text-white font-semibold text-sm">{section.category}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3 px-4 py-2.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: section.color }}
                    />
                    <div>
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-white/40 text-xs ml-2">— {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture note */}
        <div className="mt-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <p className="text-blue-300 text-xs font-medium mb-2">📐 Архитектура данных в Firestore</p>
          <div className="font-mono text-xs text-white/50 space-y-1 leading-relaxed">
            <p className="text-blue-400">users/</p>
            <p className="ml-3 text-white/60">{"{"} uid: "abc123" {"}"}</p>
            <p className="ml-6 text-yellow-400">bookmarkGroups/</p>
            <p className="ml-9 text-white/50">{"{"} id, title, emoji, color {"}"}</p>
            <p className="ml-12 text-green-400">bookmarks/</p>
            <p className="ml-15 text-white/40">{"{"} id, title, url, emoji, color {"}"}</p>
          </div>
        </div>

        <p className="text-white/20 text-xs text-center mt-4">
          Firebase Auth + Firestore подключены ✅
        </p>
      </div>
    </div>
  );
}
