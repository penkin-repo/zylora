import { useState } from "react";
import { BookmarkGroup } from "../types";

interface Props {
  onAdd: (group: Omit<BookmarkGroup, "id" | "bookmarks">) => void;
  onClose: () => void;
}

const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16"
];

export function AddGroupModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), emoji, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 border border-white/10 rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="text-white font-semibold text-base mb-5">Новая группа</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-16 bg-white/10 border border-white/20 rounded-xl px-2 py-2 text-white text-center text-lg outline-none focus:border-white/40"
            />
            <input
              type="text"
              placeholder="Название группы"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-white/40"
              required
              autoFocus
            />
          </div>

          <div>
            <p className="text-white/40 text-xs mb-2">Цвет группы</p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? "scale-125 border-white" : "border-transparent"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-xl transition-all"
            >
              Создать
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-sm py-2 rounded-xl transition-all"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
