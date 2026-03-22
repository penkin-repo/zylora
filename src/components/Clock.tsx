import { useState, useEffect } from "react";

interface Props {
  inline?: boolean;
}

export function Clock({ inline }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const monthNames = [
    "янв", "фев", "мар", "апр", "май", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек",
  ];
  const dayName = dayNames[now.getDay()];
  const dateStr = `${dayName}, ${now.getDate()} ${monthNames[now.getMonth()]}`;

  if (inline) {
    return (
      <div className="flex items-center gap-2 select-none">
        <span className="text-white/80 text-sm font-mono tabular-nums font-medium">
          {hours}:{minutes}
          <span className="text-white/40 text-xs">:{seconds}</span>
        </span>
        <span className="text-white/35 text-xs">{dateStr}</span>
      </div>
    );
  }

  return (
    <div className="text-center select-none">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-7xl font-thin text-white tracking-tight tabular-nums drop-shadow-2xl">
          {hours}:{minutes}
        </span>
        <span className="text-2xl font-thin text-white/50 tabular-nums mb-1">{seconds}</span>
      </div>
      <p className="text-white/60 text-sm font-light mt-1 tracking-wide">{dateStr}</p>
    </div>
  );
}
