import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RadioPlugin } from "./RadioPlugin";
import { WeatherPlugin } from "./WeatherPlugin";
import { AppPlugin } from "../hooks/useSettings";

function SortablePluginWrapper({ id, plugin, editMode, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: !editMode });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1, zIndex: isDragging ? 50 : ("auto" as const) };
  
  return (
    <div ref={setNodeRef} style={style} className={`relative flex-shrink-0 flex items-center ${editMode ? "cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-white/20 rounded-2xl" : ""}`} {...attributes} {...listeners}>
      {plugin.type === 'radio' && <RadioPlugin url={plugin.config?.url} title={plugin.title} editMode={editMode} onRemove={onRemove} />}
      {plugin.type === 'weather' && <WeatherPlugin city={plugin.config?.city} days={plugin.config?.days} editMode={editMode} onRemove={onRemove} />}
    </div>
  );
}

export function PluginBar({ plugins = [], setPlugins, editMode }: { plugins: AppPlugin[], setPlugins: (p: AppPlugin[]) => void, editMode: boolean }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  if (!plugins.length && !editMode) return null;

  return (
    <div className="w-full flex justify-center pb-6 z-10 relative">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
          const oldIndex = plugins.findIndex(p => p.id === active.id);
          const newIndex = plugins.findIndex(p => p.id === over.id);
          setPlugins(arrayMove(plugins, oldIndex, newIndex));
        }
      }}>
        <SortableContext items={plugins.map(p => p.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-6xl px-4">
            {plugins.map(p => (
              <SortablePluginWrapper 
                key={p.id} 
                id={p.id} 
                plugin={p} 
                editMode={editMode} 
                onRemove={() => setPlugins(plugins.filter(x => x.id !== p.id))} 
              />
            ))}
            {editMode && !plugins.length && (
              <div className="h-[50px] w-full max-w-[300px] flex items-center justify-center border-2 border-dashed border-white/20 rounded-2xl px-6 text-white/40 text-xs font-semibold uppercase tracking-widest bg-black/10">
                🧩 Зона плагинов пуста
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
