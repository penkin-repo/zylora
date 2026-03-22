import { useState, useRef, useEffect } from "react";

interface RadioPluginProps {
  url: string;
  title?: string;
  editMode?: boolean;
  onRemove?: () => void;
}

export function RadioPlugin({ url, title, editMode, onRemove }: RadioPluginProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onpause = () => setPlaying(false);
      audioRef.current.onplay = () => setPlaying(true);
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [url]);

  const toggle = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(console.error);
    }
  };

  return (
    <div 
      className="flex items-center gap-3 px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl transition-all shadow-xl group min-w-[220px]" 
      style={{ height: 50 }}
    >
      {editMode && (
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onRemove?.(); }} // Prevent drag interaction
          className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 z-50 text-xs shadow-lg border border-red-500/30"
          title="Удалить плагин"
        >
          ✕
        </button>
      )}
      <button 
        onPointerDown={(e) => e.stopPropagation()} // Let user play/pause while edit mode is active, prevent drag overlap
        onClick={toggle} 
        className="w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
      >
        {playing ? (
          <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
        ) : (
          <svg className="w-4 h-4 ml-0.5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div className="flex flex-col min-w-0 flex-1 overflow-hidden select-none cursor-default">
        <span className="text-xs font-bold text-white/90 truncate uppercase tracking-widest">{title || "Радио"}</span>
        <span className={`text-[10px] uppercase font-bold tracking-widest mt-0.5 truncate leading-none transition-colors duration-300 ${playing ? "text-violet-400 drop-shadow-[0_0_5px_rgba(167,139,250,0.8)] animate-pulse" : "text-white/30"}`}>
           {playing ? "В эфире" : "Выкл"}
        </span>
      </div>
    </div>
  );
}
