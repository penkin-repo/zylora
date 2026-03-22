import { useState, useEffect } from "react";
import { BookmarkGroup as BookmarkGroupType, Bookmark } from "../types";
import { BookmarkIcon } from "./BookmarkIcon";

interface Props {
  group: BookmarkGroupType;
  editMode: boolean;
  onRemoveBookmark: (bookmarkId: string) => void;
  onUpdateBookmark: (bookmarkId: string, data: Partial<Omit<Bookmark, "id">>) => void;
  onAddBookmark: (bookmark: Omit<Bookmark, "id">) => void;
  onRemoveGroup: () => void;
  onUpdateGroup: (data: Partial<Pick<BookmarkGroupType, "title" | "emoji" | "color">>) => void;
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export function BookmarkGroup({
  group,
  editMode,
  onRemoveBookmark,
  onUpdateBookmark,
  onAddBookmark,
  onRemoveGroup,
  onUpdateGroup,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", emoji: "", color: group.color });
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  
  const [editTitle, setEditTitle] = useState(group.title);
  const [editEmoji, setEditEmoji] = useState(group.emoji);

  useEffect(() => { setEditTitle(group.title); }, [group.title]);
  useEffect(() => { setEditEmoji(group.emoji); }, [group.emoji]);

  const handleGroupUpdate = () => {
    if (editTitle !== group.title || editEmoji !== group.emoji) {
      onUpdateGroup({ title: editTitle, emoji: editEmoji });
    }
  };

  const handleUrlChange = (val: string) => {
    setForm((f) => ({ ...f, url: val }));
    setFaviconError(false);
    const fav = getFaviconUrl(val);
    setFaviconPreview(fav);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    const url = form.url.startsWith("http") ? form.url : `https://${form.url}`;
    onAddBookmark({
      title: form.title,
      url,
      emoji: form.emoji || "",
      color: form.color || group.color,
    });
    setForm({ title: "", url: "", emoji: "", color: group.color });
    setFaviconPreview(null);
    setFaviconError(false);
    setShowAdd(false);
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setForm({ title: "", url: "", emoji: "", color: group.color });
    setFaviconPreview(null);
    setFaviconError(false);
  };

  const showFaviconPreview = !form.emoji && !faviconError && faviconPreview;

  return (
    <div className="relative">
      {/* Group header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-5 rounded-full" style={{ background: group.color }} />
        {editMode ? (
          <div className="flex items-center gap-1 flex-1 min-w-0 mr-2">
            <input 
              value={editEmoji}
              onChange={(e) => setEditEmoji(e.target.value)}
              onBlur={handleGroupUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleGroupUpdate()}
              className="bg-white/10 hover:bg-white/20 focus:bg-white/20 w-7 text-center rounded outline-none text-xs transition-colors py-0.5" 
              maxLength={2}
            />
            <input 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleGroupUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handleGroupUpdate()}
              className="bg-white/10 hover:bg-white/20 focus:bg-white/20 flex-1 rounded outline-none font-semibold uppercase tracking-widest text-xs transition-colors py-0.5 px-2 min-w-0" 
            />
          </div>
        ) : (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs font-semibold uppercase tracking-widest text-left"
          >
            <span>{group.emoji}</span>
            <span>{group.title}</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {editMode && (
          <button
            onClick={onRemoveGroup}
            className="ml-auto mr-8 text-red-400 hover:text-red-300 text-xs px-2 py-0.5 rounded-lg border border-red-500/30 hover:border-red-400 transition-all"
          >
            Удалить группу
          </button>
        )}
      </div>

      {/* Bookmarks grid */}
      {!collapsed && (
        <div className="flex flex-wrap gap-x-3 gap-y-4 pl-3">
          {group.bookmarks.map((b) => (
            <BookmarkIcon
              key={b.id}
              bookmark={b}
              groupColor={group.color}
              editMode={editMode}
              onRemove={() => onRemoveBookmark(b.id)}
              onEdit={(data) => onUpdateBookmark(b.id, data)}
            />
          ))}

          {/* Add button */}
          {editMode && !showAdd && (
            <div className="flex flex-col items-center gap-1" style={{ width: 64 }}>
              <button
                onClick={() => setShowAdd(true)}
                className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/40 transition-all duration-200 text-xl"
              >
                +
              </button>
              <span className="text-white/30 text-[10px]">Добавить</span>
            </div>
          )}
        </div>
      )}

      {/* Add bookmark form */}
      {editMode && showAdd && (
        <div className="mt-4 pl-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
              Новая закладка
            </p>

            {/* Favicon preview block */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden flex-shrink-0"
                style={{ background: form.color || group.color }}
              >
                {form.emoji ? (
                  <span className="text-xl">{form.emoji}</span>
                ) : showFaviconPreview ? (
                  <img
                    src={faviconPreview!}
                    alt="favicon"
                    className="w-7 h-7 object-contain"
                    onError={() => setFaviconError(true)}
                  />
                ) : (
                  <span className="text-white/30 text-xl">🔗</span>
                )}
              </div>
              <div className="text-white/40 text-xs leading-relaxed">
                {form.url
                  ? showFaviconPreview
                    ? "✅ Favicon загружен автоматически"
                    : form.emoji
                    ? "🎨 Используется эмодзи"
                    : "⏳ Введите корректный URL для favicon"
                  : "Введите URL — favicon подтянется сам"}
              </div>
            </div>

            <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
              {/* URL first for auto favicon */}
              <div>
                <label className="text-white/40 text-[11px] mb-1 block">URL *</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={form.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 outline-none focus:border-white/35 transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-white/40 text-[11px] mb-1 block">Название *</label>
                <input
                  type="text"
                  placeholder="Название закладки"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 outline-none focus:border-white/35 transition-all"
                  required
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-white/40 text-[11px] mb-1 block">Эмодзи (вместо favicon)</label>
                  <input
                    type="text"
                    placeholder="🔗 (необязательно)"
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/25 outline-none focus:border-white/35 transition-all"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-[11px] mb-1 block">Цвет фона</label>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    className="w-10 h-9 rounded-xl border border-white/15 cursor-pointer bg-transparent"
                    title="Цвет фона иконки"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={cancelAdd}
                  className="flex-1 py-2 rounded-xl border border-white/15 text-white/40 hover:text-white/70 hover:bg-white/5 text-sm transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
