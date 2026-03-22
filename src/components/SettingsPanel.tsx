import { useRef, useState } from "react";
import { AppSettings } from "../hooks/useSettings";
import { searchEngines } from "../data/searchEngines";
// @ts-ignore
import packageJson from "../../package.json";

function EngineIcon({ icon, name }: { icon: string; name?: string }) {
  if (icon.endsWith('.svg')) {
    return <img src={icon} alt={name || "icon"} className="w-[75%] h-[75%] object-contain" />;
  }
  return <>{icon}</>;
}

export const BACKGROUNDS = [
  {
    label: "Фиолетовый",
    color: "#302b63",
    value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    label: "Синий",
    color: "#16213e",
    value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  },
  {
    label: "Тёмный",
    color: "#161b22",
    value: "linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1e2a3a 100%)",
  },
  {
    label: "Уголь",
    color: "#18181b",
    value: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #1c1917 100%)",
  },
  {
    label: "Пурпур",
    color: "#2d0f57",
    value: "linear-gradient(135deg, #1a0533 0%, #2d0f57 50%, #1a0533 100%)",
  },
  {
    label: "Ночное море",
    color: "#112240",
    value: "linear-gradient(135deg, #0a192f 0%, #112240 50%, #0a192f 100%)",
  },
];

interface Props {
  settings: AppSettings;
  onSave: (patch: Partial<AppSettings>) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onSave, onClose }: Props) {
  const colorRef = useRef<HTMLInputElement>(null);

  const [pluginMode, setPluginMode] = useState<'radio' | 'weather' | null>(null);
  const [radioTitle, setRadioTitle] = useState("");
  const [radioUrl, setRadioUrl] = useState("");
  const [weatherCity, setWeatherCity] = useState("Москва");
  const [weatherDays, setWeatherDays] = useState(3);

  return (
    <>
      {/* Invisible overlay to close when clicking outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Sidebar Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-gray-950/95 backdrop-blur-xl border-l border-white/10 p-6 shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">⚙️ Настройки</h2>
            <p className="text-white/40 text-xs mt-0.5">Всё сохраняется автоматически</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* ── Background section ─────────────────── */}
        <section className="mb-6">
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
            🎨 Фон
          </h3>

          {/* Preset swatches */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {BACKGROUNDS.map((bg, i) => {
              const isActive = settings.bgIndex === i && !settings.bgCustom;
              return (
                <button
                  key={i}
                  onClick={() => onSave({ bgIndex: i, bgCustom: "" })}
                  className={`relative h-14 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "border-violet-400 scale-[1.04] shadow-lg shadow-violet-500/30"
                      : "border-white/10 hover:border-white/30 hover:scale-[1.02]"
                  }`}
                  style={{ background: bg.value }}
                  title={bg.label}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                        <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-white/70 text-[10px]">
                    {bg.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom colour */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              settings.bgCustom
                ? "border-violet-400/60 bg-violet-500/10"
                : "border-white/10 bg-white/5 hover:bg-white/8"
            }`}
            onClick={() => colorRef.current?.click()}
          >
            <div
              className="w-8 h-8 rounded-lg border border-white/20 flex-shrink-0"
              style={{
                background: settings.bgCustom
                  ? settings.bgCustom
                  : "linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)",
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium">Свой цвет</p>
              <p className="text-white/30 text-xs truncate">
                {settings.bgCustom ? "Применён пользовательский градиент" : "Нажми чтобы выбрать"}
              </p>
            </div>
            {settings.bgCustom && (
              <button
                onClick={(e) => { e.stopPropagation(); onSave({ bgCustom: "" }); }}
                className="text-white/30 hover:text-white/60 transition-all text-xs px-2 py-1 rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            )}
            <input
              ref={colorRef}
              type="color"
              className="opacity-0 absolute w-0 h-0"
              onChange={(e) => {
                const c = e.target.value;
                onSave({ bgCustom: `linear-gradient(135deg, ${c}ee 0%, ${c}88 60%, ${c}44 100%)` });
              }}
            />
          </div>
        </section>

        {/* ── Search engine section ────────────────── */}
        <section>
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
            🔍 Поиск по умолчанию
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {searchEngines.map((engine) => {
              const isActive = settings.searchEngine === engine.key;
              return (
                <button
                  key={engine.key}
                  onClick={() => onSave({ searchEngine: engine.key })}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                    isActive
                      ? "border-violet-400/60 bg-violet-500/15 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90 hover:border-white/20"
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background: engine.color }}
                  >
                    <EngineIcon icon={engine.icon} name={engine.name} />
                  </span>
                  <span className="text-sm font-medium">{engine.name}</span>
                  {isActive && (
                    <svg className="ml-auto w-3.5 h-3.5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Plugins section ────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest">
              🧩 Плагины (Виджеты)
            </h3>
            <span className="text-xs text-white/40">{settings.plugins?.length || 0} активных</span>
          </div>

          {/* Active plugins list */}
          <div className="space-y-2 mb-3">
            {settings.plugins?.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-lg">{p.type === 'radio' ? '📻' : '⛅'}</span>
                  <div className="truncate min-w-0">
                    <p className="text-xs font-medium text-white truncate">{p.title || (p.type === 'weather' ? p.config?.city : 'Виджет')}</p>
                    <p className="text-[10px] text-white/40 truncate">{p.type === 'radio' ? p.config?.url : `Прогноз на ${p.config?.days} дн.`}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSave({ plugins: settings.plugins.filter((x) => x.id !== p.id) })}
                  className="text-white/20 hover:text-red-400 transition-colors px-2 py-1 flex-shrink-0"
                  title="Удалить"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Plugin UI */}
          {!pluginMode ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => setPluginMode('radio')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium"
              >
                + 📻 Радио
              </button>
              <button
                onClick={() => setPluginMode('weather')}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium"
              >
                + ⛅ Погода
              </button>
            </div>
          ) : (
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3 mt-2">
              <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-semibold text-white/80">{pluginMode === 'radio' ? '📻 Новое Радио' : '⛅ Погода (Meteo)'}</span>
                 <button onClick={() => setPluginMode(null)} className="text-white/40 hover:text-white text-xs">✕ Отмена</button>
              </div>

              {pluginMode === 'radio' && (
                <>
                  <input type="text" placeholder="Назв. (напр. SlamFM)" value={radioTitle} onChange={e => setRadioTitle(e.target.value)} className="w-full bg-white/10 border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-violet-500" />
                  <input type="text" placeholder="URL потока (https://...)" value={radioUrl} onChange={e => setRadioUrl(e.target.value)} className="w-full bg-white/10 border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-violet-500" />
                  <button 
                    disabled={!radioUrl}
                    onClick={() => {
                       onSave({ plugins: [...(settings.plugins || []), { id: crypto.randomUUID(), type: 'radio', title: radioTitle || 'Радио', config: { url: radioUrl } }] });
                       setPluginMode(null); setRadioTitle(''); setRadioUrl('');
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Добавить виджет
                  </button>
                </>
              )}

              {pluginMode === 'weather' && (
                <>
                  <input type="text" placeholder="Город (напр. Москва)" value={weatherCity} onChange={e => setWeatherCity(e.target.value)} className="w-full bg-white/10 border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-violet-500" />
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Дней прогноза: {weatherDays}</span>
                    <input type="range" min="1" max="7" value={weatherDays} onChange={e => setWeatherDays(parseInt(e.target.value))} className="w-24 accent-violet-500" />
                  </div>
                  <button 
                    disabled={!weatherCity}
                    onClick={() => {
                       onSave({ plugins: [...(settings.plugins || []), { id: crypto.randomUUID(), type: 'weather', config: { city: weatherCity, days: weatherDays } }] });
                       setPluginMode(null); setWeatherCity('Москва');
                    }}
                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Добавить виджет
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        <p className="text-white/20 text-xs text-center mt-auto pt-5 pb-2">
          Zylora v{packageJson.version} · Настройки сохраняются в браузере
        </p>
      </div>
    </>
  );
}
