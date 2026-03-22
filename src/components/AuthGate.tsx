interface Props {
  onSignIn: () => void;
  loading?: boolean;
}

// ── Google Icon SVG ──────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.5c0-1.6-.14-3.2-.42-4.7H24v8.9h13.2c-.57 3-2.3 5.6-4.9 7.3v6h7.9c4.6-4.2 7.3-10.5 7.3-17.5z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 12-2.2 16-5.9l-7.9-6c-2.2 1.5-5 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H2.5v6.2C6.5 42.7 14.7 48 24 48z" fill="#34A853"/>
      <path d="M10.6 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.28-3.1.76-4.5v-6.2H2.5A24 24 0 0 0 0 24c0 3.9.93 7.5 2.5 10.7l8.1-6.2z" fill="#FBBC04"/>
      <path d="M24 9.6c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.3 2.5 13.3l8.1 6.2C12.5 13.8 17.8 9.6 24 9.6z" fill="#EA4335"/>
    </svg>
  );
}

// ── Floating particle ─────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-full bg-white pointer-events-none"
      style={style}
    />
  );
}

export function AuthGate({ onSignIn, loading = false }: Props) {
  const particles = Array.from({ length: 50 }, (_) => ({
    width: Math.random() * 2.5 + 0.5,
    height: Math.random() * 2.5 + 0.5,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.35 + 0.05,
    animation: `twinkle ${2 + Math.random() * 4}s ease-in-out ${Math.random() * 4}s infinite alternate`,
  }));

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Stars */}
      {particles.map((p, i) => (
        <Particle
          key={i}
          style={{
            width: p.width,
            height: p.height,
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            animation: p.animation,
          }}
        />
      ))}

      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center gap-8 p-10 rounded-3xl bg-white/[0.04] border border-white/[0.09] backdrop-blur-xl shadow-2xl max-w-sm w-full mx-4">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white text-3xl font-bold">Z</span>
          </div>
          <div className="text-center">
            <h1 className="text-white text-2xl font-bold tracking-tight">Zylora</h1>
            <p className="text-white/40 text-sm mt-1">Твоя стартовая страница</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 w-full">
          {[
            { icon: "🔖", text: "Закладки, синхронизированные между устройствами" },
            { icon: "⚡", text: "Мгновенный поиск по всем поисковикам" },
            { icon: "✨", text: "Живые часы, drag-and-drop, тёмная тема" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/50 text-sm">
              <span className="text-base flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.07]" />

        {/* Sign-in button */}
        <div className="w-full space-y-3">
          <button
            id="btn-google-signin"
            onClick={onSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all duration-150 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {loading ? "Входим..." : "Войти через Google"}
          </button>

          <p className="text-white/20 text-xs text-center">
            Данные хранятся только в твоём аккаунте Google
          </p>
        </div>
      </div>
    </div>
  );
}
