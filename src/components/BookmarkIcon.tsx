import { useState } from "react";
import { createPortal } from "react-dom";
import { Bookmark } from "../types";

interface Props {
  bookmark: Bookmark;
  groupColor: string;
  onRemove: () => void;
  onEdit: (data: Partial<Omit<Bookmark, "id">>) => void;
  editMode: boolean;
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}

export function BookmarkIcon({ bookmark, groupColor, onRemove, onEdit, editMode }: Props) {
  const [hovered, setHovered] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const faviconUrl = getFaviconUrl(bookmark.url);
  const showFavicon = !bookmark.emoji && !faviconError && faviconUrl;

  return (
    <>
      <div
        className="relative group flex flex-col items-center gap-1 cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: 60 }}
      >
        {/* Remove button */}
        {editMode && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-1 -right-1 z-20 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-lg hover:bg-red-600 transition-colors"
            style={{ lineHeight: 1 }}
            title="Удалить"
          >
            ✕
          </button>
        )}

        {/* Edit pen button */}
        {editMode && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}
            className="absolute -bottom-1 -right-1 z-20 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-lg hover:bg-blue-600 transition-colors"
            title="Редактировать"
          >
            ✎
          </button>
        )}

        {/* Icon */}
        <a
          href={bookmark.url}
          onClick={(e) => { if (editMode) e.preventDefault(); }}
          className="relative"
          tabIndex={editMode ? -1 : 0}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 overflow-hidden border border-white/10 ${
              hovered && !editMode ? "scale-110 shadow-xl brightness-110" : ""
            } ${editMode ? "animate-wiggle" : ""}`}
            style={{ background: bookmark.color || groupColor || "#334155" }}
          >
            {bookmark.emoji ? (
              <span className="text-xl select-none">{bookmark.emoji}</span>
            ) : showFavicon ? (
              <img
                src={faviconUrl!}
                alt={bookmark.title}
                className="w-7 h-7 object-contain"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <span className="text-white font-bold text-sm select-none">
                {bookmark.title[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </a>

        {/* Label */}
        <span className="text-white/80 text-[10px] font-medium text-center leading-tight max-w-[60px] truncate select-none drop-shadow-md">
          {bookmark.title}
        </span>

        {/* Tooltip */}
        {hovered && !editMode && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white text-[11px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none border border-white/10 z-20 shadow-xl">
            {bookmark.title}
          </div>
        )}
      </div>

      {/* Edit Modal — rendered via portal to avoid z-index clipping */}
      {showEditModal && createPortal(
        <EditBookmarkModal
          bookmark={bookmark}
          groupColor={groupColor}
          onSave={(data) => { onEdit(data); setShowEditModal(false); }}
          onClose={() => setShowEditModal(false)}
        />,
        document.body
      )}
    </>
  );
}

/* ─── Edit Modal ─────────────────────────────────────────────── */
interface EditModalProps {
  bookmark: Bookmark;
  groupColor: string;
  onSave: (data: Partial<Omit<Bookmark, "id">>) => void;
  onClose: () => void;
}

function EditBookmarkModal({ bookmark, groupColor, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url);
  const [emoji, setEmoji] = useState(bookmark.emoji || "");
  const [color, setColor] = useState(bookmark.color || groupColor || "#334155");
  const [faviconPreview, setFaviconPreview] = useState<string | null>(getFaviconUrl(bookmark.url));
  const [faviconError, setFaviconError] = useState(false);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setFaviconError(false);
    try {
      const domain = new URL(val.startsWith("http") ? val : `https://${val}`).hostname;
      setFaviconPreview(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
    } catch {
      setFaviconPreview(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    onSave({ title: title.trim(), url: normalizedUrl, emoji: emoji.trim(), color });
  };

  const showFavicon = !emoji && !faviconError && faviconPreview;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-white/15 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ zIndex: 10000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
          ✎ Редактировать закладку
        </h3>

        {/* Preview */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden"
              style={{ background: color }}
            >
              {emoji ? (
                <span className="text-2xl">{emoji}</span>
              ) : showFavicon ? (
                <img
                  src={faviconPreview!}
                  alt={title}
                  className="w-8 h-8 object-contain"
                  onError={() => setFaviconError(true)}
                />
              ) : (
                <span className="text-white font-bold text-lg">{title[0]?.toUpperCase()}</span>
              )}
            </div>
            <span className="text-white/70 text-xs max-w-[100px] truncate text-center">{title || "Название"}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название закладки"
              required
              autoFocus
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/40 transition-all"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs mb-1 block">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/40 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-white/50 text-xs mb-1 block">Эмодзи (вместо favicon)</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="🔗 (оставьте пустым)"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/40 transition-all"
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Цвет</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-9 rounded-xl border border-white/15 cursor-pointer bg-transparent"
                title="Цвет фона иконки"
              />
            </div>
          </div>

          {!emoji && (
            <p className="text-white/30 text-[11px] -mt-1">
              🌐 Favicon загрузится автоматически из URL
            </p>
          )}

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-white/15 text-white/50 hover:text-white/80 hover:bg-white/5 text-sm transition-all"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
