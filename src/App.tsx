import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { SearchBar } from "./components/SearchBar";
import { BookmarkGroup } from "./components/BookmarkGroup";
import { AddGroupModal } from "./components/AddGroupModal";
import { SettingsPanel, BACKGROUNDS } from "./components/SettingsPanel";
import { AuthGate } from "./components/AuthGate";
import { Clock } from "./components/Clock";
import { useAuth, AuthState } from "./hooks/useAuth";
import { useFirestoreBookmarks } from "./hooks/useFirestoreBookmarks";
import { useSettings } from "./hooks/useSettings";
import { BookmarkGroup as BookmarkGroupType } from "./types";

/* ── Sortable group card ─────────────────────────────────────── */
function SortableGroupCard({
  group,
  editMode,
  onRemoveBookmark,
  onUpdateBookmark,
  onAddBookmark,
  onRemoveGroup,
  onUpdateGroup,
}: {
  group: BookmarkGroupType;
  editMode: boolean;
  onRemoveBookmark: (bid: string) => void;
  onUpdateBookmark: (bid: string, data: Partial<Omit<BookmarkGroupType["bookmarks"][0], "id">>) => void;
  onAddBookmark: (b: Omit<BookmarkGroupType["bookmarks"][0], "id">) => void;
  onRemoveGroup: () => void;
  onUpdateGroup: (data: Partial<Pick<BookmarkGroupType, "title" | "emoji" | "color">>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id, disabled: !editMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : "auto" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 hover:bg-white/[0.06] transition-colors duration-200 relative"
    >
      {editMode && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1.5 rounded-lg cursor-grab active:cursor-grabbing text-white/25 hover:text-white/60 hover:bg-white/10 transition-all"
          title="Перетащить группу"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="4" cy="3" r="1.2" />
            <circle cx="10" cy="3" r="1.2" />
            <circle cx="4" cy="7" r="1.2" />
            <circle cx="10" cy="7" r="1.2" />
            <circle cx="4" cy="11" r="1.2" />
            <circle cx="10" cy="11" r="1.2" />
          </svg>
        </div>
      )}

      <BookmarkGroup
        group={group}
        editMode={editMode}
        onRemoveBookmark={onRemoveBookmark}
        onUpdateBookmark={onUpdateBookmark}
        onAddBookmark={onAddBookmark}
        onRemoveGroup={onRemoveGroup}
        onUpdateGroup={onUpdateGroup}
      />
    </div>
  );
}

/* ── Loading spinner ─────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-xl font-bold">Z</span>
        </div>
        <div className="w-6 h-6 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
      </div>
    </div>
  );
}

/* ── App (authenticated) ─────────────────────────────────────── */
function AppContent({ user, logout }: Pick<AuthState, "user" | "logout">) {
  const { groups, ready, addBookmark, updateBookmark, removeBookmark, addGroup, removeGroup, reorderGroups, updateGroup } =
    useFirestoreBookmarks(user!);

  // syncing = true until first server-confirmed snapshot arrives (cache shown before this)
  const [synced, setSynced] = useState(false);
  useEffect(() => { if (ready) setSynced(true); }, [ready]);
  const isSyncing = !synced;

  const { settings, setSettings, loaded } = useSettings();

  const [editMode, setEditMode] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const background = loaded
    ? settings.bgCustom || BACKGROUNDS[settings.bgIndex]?.value || BACKGROUNDS[0].value
    : "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = groups.findIndex((g) => g.id === active.id);
      const newIndex = groups.findIndex((g) => g.id === over.id);
      reorderGroups(arrayMove(groups, oldIndex, newIndex));
    },
    [groups, reorderGroups]
  );

  const activeGroup = activeId ? groups.find((g) => g.id === activeId) : null;

  return (
    <div
      className="min-h-screen w-full relative flex flex-col overflow-auto"
      style={{ background, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-md border-b border-white/[0.07]">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-1 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">Z</span>
          </div>
          <span className="text-white/50 text-xs font-medium hidden sm:block">Zylora</span>
          {/* Sync indicator — pulses while awaiting server confirmation */}
          {isSyncing && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse hidden sm:block"
              title="Синхронизация..."
            />
          )}
        </div>

        {/* Search bar — center, passes current engine from settings */}
        <div className="flex-1 min-w-0">
          <SearchBar compact activeEngineKey={settings.searchEngine} onEngineChange={(key) => setSettings({ searchEngine: key })} />
        </div>

        {/* Clock */}
        <div className="flex-shrink-0 hidden md:block">
          <Clock inline />
        </div>

        {/* Settings button */}
        <button
          id="btn-settings"
          onClick={() => setShowSettings(true)}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-all text-xs flex-shrink-0"
          title="Настройки"
        >
          ⚙️
        </button>

        {/* Edit mode */}
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all text-xs font-medium flex-shrink-0 ${
            editMode
              ? "bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30"
              : "bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:bg-white/10"
          }`}
        >
          {editMode ? "✓ Готово" : "✏️"}
        </button>

        {/* User avatar / menu */}
        <div className="relative flex-shrink-0">
          <button
            id="btn-user-menu"
            onClick={() => setShowUserMenu((v) => !v)}
            className="w-7 h-7 rounded-full overflow-hidden border border-white/20 hover:border-white/40 transition-all flex-shrink-0"
            title={user?.displayName ?? "Аккаунт"}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.displayName?.[0] ?? "U"}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-10 bg-gray-950/95 border border-white/10 rounded-2xl p-3 w-52 shadow-2xl z-50 backdrop-blur-md">
              <div className="mb-2 px-1">
                <p className="text-white text-sm font-medium truncate">{user?.displayName}</p>
                <p className="text-white/40 text-xs truncate">{user?.email}</p>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <button
                id="btn-logout"
                onClick={() => { logout(); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all"
              >
                Выйти из аккаунта
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── BOOKMARKS AREA ───────────────────────────────────────── */}
      <div className="flex-1 pt-14 pb-4 px-4 sm:px-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={groups.map((g) => g.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-3">
              {groups.map((group) => (
                <SortableGroupCard
                  key={group.id}
                  group={group}
                  editMode={editMode}
                  onRemoveBookmark={(bid) => removeBookmark(group.id, bid)}
                  onUpdateBookmark={(bid, data) => updateBookmark(group.id, bid, data)}
                  onAddBookmark={(b) => addBookmark(group.id, b)}
                  onRemoveGroup={() => removeGroup(group.id)}
                  onUpdateGroup={(data) => updateGroup(group.id, data)}
                />
              ))}

              {editMode && (
                <button
                  onClick={() => setShowAddGroup(true)}
                  className="bg-white/[0.02] backdrop-blur-md border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[100px] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 group"
                >
                  <span className="text-3xl text-white/20 group-hover:text-white/40 transition-all">+</span>
                  <span className="text-white/30 text-xs group-hover:text-white/50 transition-all">Новая группа</span>
                </button>
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeGroup && (
              <div className="bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl ring-2 ring-violet-500/40 opacity-90">
                <div className="flex items-center gap-2 mb-2">
                  <span>{activeGroup.emoji}</span>
                  <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">{activeGroup.title}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeGroup.bookmarks.slice(0, 8).map((b) => (
                    <div
                      key={b.id}
                      className="w-10 h-10 rounded-xl"
                      style={{ background: b.color || activeGroup.color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {showAddGroup && (
        <AddGroupModal
          onAdd={(group) => addGroup(group as Omit<BookmarkGroupType, "id" | "bookmarks">)}
          onClose={() => setShowAddGroup(false)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Close user menu on outside click */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}
    </div>
  );
}

/* ── Root App — Auth router ──────────────────────────────────── */
export function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle();
    setSigningIn(false);
  };

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthGate onSignIn={handleSignIn} loading={signingIn} />;
  return <AppContent user={user} logout={logout} />;
}
