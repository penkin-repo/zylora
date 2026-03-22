import { useState, useRef, useEffect } from "react";
import { searchEngines } from "../data/searchEngines";
import { SearchEngine } from "../types";

interface Props {
  compact?: boolean;
  activeEngineKey?: string;
  onEngineChange?: (key: string) => void;
}

function EngineIcon({ icon, name }: { icon: string; name?: string }) {
  if (icon.endsWith('.svg')) {
    return <img src={icon} alt={name || "icon"} className="w-[75%] h-[75%] object-contain" />;
  }
  return <>{icon}</>;
}

export function SearchBar({ compact, activeEngineKey, onEngineChange }: Props) {
  const [query, setQuery] = useState("");
  const defaultEngine = searchEngines.find((e) => e.key === activeEngineKey) ?? searchEngines[0];
  const [activeEngine, setActiveEngine] = useState<SearchEngine>(defaultEngine);
  const [showEngines, setShowEngines] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync engine when parent setting changes (e.g. on mount with saved preference)
  useEffect(() => {
    if (activeEngineKey) {
      const found = searchEngines.find((e) => e.key === activeEngineKey);
      if (found) setActiveEngine(found);
    }
  }, [activeEngineKey]);

  useEffect(() => {
    if (!compact) inputRef.current?.focus();
  }, [compact]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEngines(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const doSearch = (engine: SearchEngine, q: string) => {
    const text = q.trim() || query.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }
    if (/^https?:\/\//.test(text) || /^[\w-]+\.[\w-]/.test(text)) {
      const url = text.startsWith("http") ? text : `https://${text}`;
      window.location.href = url;
    } else {
      window.location.href = engine.url + encodeURIComponent(text);
    }
    setQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(activeEngine, query);
  };

  /* ── COMPACT (top bar) mode ──────────────────────────────── */
  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex items-center w-full max-w-2xl mx-auto">
        {/* Engine picker */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowEngines((v) => !v)}
            className="flex items-center gap-1 px-2 h-8 rounded-l-xl border border-r-0 border-white/15 bg-white/8 text-white hover:bg-white/15 transition-all text-xs"
          >
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold"
              style={{ background: activeEngine.color }}
            >
              <EngineIcon icon={activeEngine.icon} name={activeEngine.name} />
            </span>
            <svg className="w-2.5 h-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showEngines && (
            <div className="absolute top-10 left-0 z-50 bg-gray-900/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden w-48">
              {searchEngines.map((engine) => (
                <button
                  key={engine.key}
                  type="button"
                  onClick={() => {
                    setActiveEngine(engine);
                    setShowEngines(false);
                    onEngineChange?.(engine.key);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-all ${
                    activeEngine.key === engine.key
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: engine.color }}
                  >
                    <EngineIcon icon={engine.icon} name={engine.name} />
                  </span>
                  {engine.name}
                  {activeEngine.key === engine.key && (
                    <svg className="ml-auto w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Поиск в ${activeEngine.name}...`}
          className="flex-1 h-8 bg-white/8 border border-white/15 text-white placeholder-white/30 px-3 text-xs outline-none focus:bg-white/12 focus:border-white/30 transition-all min-w-0"
        />

        {/* Submit */}
        <button
          type="submit"
          className="h-8 px-3 rounded-r-xl bg-white/8 border border-l-0 border-white/15 text-white hover:bg-white/15 transition-all flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>

        {/* Quick engine buttons */}
        <div className="hidden lg:flex items-center gap-1 ml-2 flex-shrink-0">
          {searchEngines.map((engine) => (
            <button
              key={engine.key}
              type="button"
              onClick={() => {
                setActiveEngine(engine);
                doSearch(engine, query);
                onEngineChange?.(engine.key);
              }}
              title={`Искать в ${engine.name}`}
              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white transition-all border ${
                activeEngine.key === engine.key
                  ? "ring-1 ring-white/40 scale-110 border-white/30"
                  : "opacity-60 hover:opacity-100 hover:scale-110 border-transparent"
              }`}
              style={{ background: engine.color }}
            >
              <EngineIcon icon={engine.icon} name={engine.name} />
            </button>
          ))}
        </div>
      </form>
    );
  }

  /* ── FULL mode (fallback / not used currently) ───────────── */
  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative flex items-center gap-0">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowEngines((v) => !v)}
            className="flex items-center gap-1.5 px-3 h-12 rounded-l-2xl border border-r-0 border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-200 text-sm font-medium select-none"
            style={{ minWidth: 60 }}
          >
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: activeEngine.color }}
            >
              <EngineIcon icon={activeEngine.icon} name={activeEngine.name} />
            </span>
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showEngines && (
            <div className="absolute top-14 left-0 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden w-52">
              {searchEngines.map((engine) => (
                <button
                  key={engine.key}
                  type="button"
                  onClick={() => { setActiveEngine(engine); setShowEngines(false); }}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm text-left transition-all duration-150 ${
                    activeEngine.key === engine.key
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: engine.color }}
                  >
                    <EngineIcon icon={engine.icon} name={engine.name} />
                  </span>
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Поиск в ${activeEngine.name} или введите адрес...`}
          className="flex-1 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 px-4 text-sm outline-none focus:bg-white/15 focus:border-white/40 transition-all duration-200"
        />

        <button
          type="submit"
          className="h-12 px-5 rounded-r-2xl bg-white/10 backdrop-blur-md border border-l-0 border-white/20 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      </form>

      <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
        {searchEngines.map((engine) => (
          <button
            key={engine.key}
            type="button"
            onClick={() => { setActiveEngine(engine); doSearch(engine, query); }}
            title={`Искать в ${engine.name}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
              activeEngine.key === engine.key
                ? "bg-white/15 text-white border-white/30 shadow-lg"
                : "text-white/55 hover:text-white hover:bg-white/10 border-white/10 hover:border-white/25"
            }`}
          >
            <span
              className="w-3.5 h-3.5 rounded-sm inline-flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ background: engine.color }}
            >
              <EngineIcon icon={engine.icon} name={engine.name} />
            </span>
            {engine.name}
          </button>
        ))}
      </div>
    </div>
  );
}
