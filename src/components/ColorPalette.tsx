'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Color } from '@/hooks/usePalette';
import { ColorColumn } from './ColorColumn';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ColorPaletteProps {
  colors: Color[];
  onToggleLock: (id: string) => void;
  onUpdateColor: (id: string, hsl: { h: number; s: number; l: number }) => void;
  onReorder: (colors: Color[]) => void;
}

function SortableColorColumn({
  color,
  onToggleLock,
  onUpdateColor,
}: {
  color: Color;
  onToggleLock: () => void;
  onUpdateColor: (hsl: { h: number; s: number; l: number }) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: color.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-1 h-full"
      {...attributes}
      {...listeners}
    >
      <ColorColumn
        color={color}
        onToggleLock={onToggleLock}
        onUpdateColor={onUpdateColor}
        isDragging={isDragging}
      />
    </div>
  );
}

export function ColorPalette({
  colors,
  onToggleLock,
  onUpdateColor,
  onReorder,
}: ColorPaletteProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = colors.findIndex((c) => c.id === active.id);
      const newIndex = colors.findIndex((c) => c.id === over.id);

      const newColors = arrayMove(colors, oldIndex, newIndex);
      onReorder(newColors);
    }
  };

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={colors.map((c) => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex w-full h-full">
            {colors.map((color) => (
              <SortableColorColumn
                key={color.id}
                color={color}
                onToggleLock={() => onToggleLock(color.id)}
                onUpdateColor={(hsl) => onUpdateColor(color.id, hsl)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </TooltipProvider>
  );
}

