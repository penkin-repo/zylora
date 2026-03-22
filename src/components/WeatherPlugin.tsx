import { useState, useEffect } from "react";

interface WeatherPluginProps {
  city: string;
  days: number;
  editMode?: boolean;
  onRemove?: () => void;
}

const WMO_CODES: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌧️", 53: "🌧️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️",
  71: "❄️", 73: "❄️", 75: "❄️",
  95: "🌩️", 96: "🌩️", 99: "🌩️"
};

export function WeatherPlugin({ city, days, editMode, onRemove }: WeatherPluginProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchWeather() {
      try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`);
        const geoData = await geoRes.json();
        if (!geoData.results?.length) throw new Error("Город не найден");
        
        const { latitude, longitude, name } = geoData.results[0];

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=${days}`);
        const weatherData = await weatherRes.json();
        
        if (active) {
          setData({ name, daily: weatherData.daily });
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    }
    fetchWeather();
    return () => { active = false; };
  }, [city, days]);

  return (
    <div 
      className="flex items-center gap-3 px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl transition-all shadow-xl group min-w-[200px]" 
      style={{ minHeight: 50 }}
    >
      {editMode && (
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 z-50 text-xs shadow-lg border border-red-500/30"
          title="Удалить виджет"
        >
          ✕
        </button>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-400 text-xs font-medium">
          ⚠️ Ошибка загрузки
        </div>
      ) : (
        <div className="flex flex-col min-w-0 pr-2 pb-0.5 w-full">
          <div className="text-xs font-bold text-white/90 truncate uppercase tracking-widest mb-1.5">{data.name}</div>
          <div className="flex items-center gap-3 w-full justify-between">
            {data.daily.time.slice(0, days).map((time: string, i: number) => {
              const max = Math.round(data.daily.temperature_2m_max[i]);
              const min = Math.round(data.daily.temperature_2m_min[i]);
              const code = data.daily.weathercode[i];
              const emoji = WMO_CODES[code] || "🌤️";
              const date = new Date(time).toLocaleDateString("ru-RU", { weekday: "short" });
              
              return (
                <div key={time} className="flex flex-col items-center">
                  <span className="text-[9px] text-white/40 uppercase font-semibold mb-0.5">{date}</span>
                  <span className="text-sm mb-0.5" title={emoji}>{emoji}</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-white font-bold">{max > 0 ? `+${max}` : max}°</span>
                    <span className="text-white/30">{min > 0 ? `+${min}` : min}°</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
