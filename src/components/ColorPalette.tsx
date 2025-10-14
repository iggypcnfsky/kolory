'use client';

import React, { useState } from 'react';
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
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ColorPaletteProps {
  colors: Color[];
  onToggleLock: (id: string) => void;
  onUpdateColor: (id: string, hsl: { h: number; s: number; l: number }) => void;
  onReorder: (colors: Color[]) => void;
  onDeleteColor: (id: string) => void;
  onAddColor: (insertIndex?: number) => void;
  canAddMore: boolean;
  canRemove: boolean;
}

function SortableColorColumn({
  color,
  onToggleLock,
  onUpdateColor,
  onDelete,
  canRemove,
}: {
  color: Color;
  onToggleLock: () => void;
  onUpdateColor: (hsl: { h: number; s: number; l: number }) => void;
  onDelete?: () => void;
  canRemove: boolean;
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
        onDelete={canRemove ? onDelete : undefined}
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
  onDeleteColor,
  onAddColor,
  canAddMore,
  canRemove,
}: ColorPaletteProps) {
  const [hoveredDivider, setHoveredDivider] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeIndexRef = React.useRef<number | null>(null);
  const initialWidthsRef = React.useRef<number[]>([]);
  const edgePercentAtDownRef = React.useRef<number>(0);
  const pendingInsertIndexRef = React.useRef<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
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

  // Reconcile widths when color count changes, support splitting at pending insert index
  React.useEffect(() => {
    const minWidth = 5;
    if (pendingInsertIndexRef.current !== null && columnWidths.length === colors.length - 1) {
      const insertIdx = pendingInsertIndexRef.current;
      const prev = columnWidths;
      const rightWidth = prev[insertIdx] ?? (100 / colors.length);
      let leftHalf = rightWidth / 2;
      let rightHalf = rightWidth - leftHalf;
      // Ensure non-negative halves (do not clamp to minWidth here to avoid breaking sum)
      if (leftHalf < 0) leftHalf = 0;
      if (rightHalf < 0) rightHalf = 0;
      const newWidths = [
        ...prev.slice(0, insertIdx),
        leftHalf,
        rightHalf,
        ...prev.slice(insertIdx + 1),
      ];
      initialWidthsRef.current = newWidths;
      setColumnWidths(newWidths);
      pendingInsertIndexRef.current = null;
      return;
    }
    if (columnWidths.length !== colors.length) {
      setColumnWidths([]);
      initialWidthsRef.current = [];
    }
  }, [colors.length]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = colors.findIndex((c) => c.id === active.id);
      const newIndex = colors.findIndex((c) => c.id === over.id);

      const newColors = arrayMove(colors, oldIndex, newIndex);
      onReorder(newColors);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    if (e.button !== 0) return; // Only left mouse button
    
    setIsResizing(true);
    resizeIndexRef.current = index;
    
    // Initialize column widths if not set, based on actual rendered widths
    if (columnWidths.length === 0 && containerRef.current) {
      const container = containerRef.current;
      const colorElements = container.querySelectorAll('.color-column');
      const containerWidth = container.getBoundingClientRect().width;
      
      const widths: number[] = [];
      colorElements.forEach((el) => {
        const width = el.getBoundingClientRect().width;
        widths.push((width / containerWidth) * 100);
      });
      
      if (widths.length === colors.length) {
        setColumnWidths(widths);
        initialWidthsRef.current = widths;
      } else {
        // Fallback to equal widths
        const equalWidths = colors.map(() => 100 / colors.length);
        setColumnWidths(equalWidths);
        initialWidthsRef.current = equalWidths;
      }
    } else {
      initialWidthsRef.current = [...columnWidths];
    }
    // Record edge percent at mousedown to avoid initial jump
    edgePercentAtDownRef.current = initialWidthsRef.current
      .slice(0, index + 1)
      .reduce((sum, w) => sum + w, 0);
    
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || resizeIndexRef.current === null || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const leftColumn = resizeIndexRef.current;
    const rightColumn = resizeIndexRef.current + 1;
    
    setColumnWidths(prev => {
      const baseWidths = initialWidthsRef.current;
      const newWidths = [...baseWidths];
      const minWidth = 5; // Minimum 5% width
      const threshold = 0.2; // do not resize unless moved at least this percent
      
      if (window.innerWidth >= 768) {
        // Desktop: horizontal resize
        const mousePercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const delta = mousePercent - edgePercentAtDownRef.current;
        if (Math.abs(delta) < threshold) return prev;
        if (leftColumn >= 0 && rightColumn < newWidths.length) {
          const nextLeft = Math.max(minWidth, baseWidths[leftColumn] + delta);
          const nextRight = Math.max(minWidth, baseWidths[rightColumn] - delta);
          if (nextLeft >= minWidth && nextRight >= minWidth) {
            newWidths[leftColumn] = nextLeft;
            newWidths[rightColumn] = nextRight;
          }
        }
      } else {
        // Mobile: vertical resize
        const mousePercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        const delta = mousePercent - edgePercentAtDownRef.current;
        if (Math.abs(delta) < threshold) return prev;
        if (leftColumn >= 0 && rightColumn < newWidths.length) {
          const nextLeft = Math.max(minWidth, baseWidths[leftColumn] + delta);
          const nextRight = Math.max(minWidth, baseWidths[rightColumn] - delta);
          if (nextLeft >= minWidth && nextRight >= minWidth) {
            newWidths[leftColumn] = nextLeft;
            newWidths[rightColumn] = nextRight;
          }
        }
      }
      return newWidths;
    });
    
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    resizeIndexRef.current = null;
  };

  React.useEffect(() => {
    if (!isResizing) return;
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
          <div ref={containerRef} className="flex md:flex-row flex-col w-full h-full relative">
            {colors.map((color, index) => (
              <React.Fragment key={color.id}>
                <div 
                  className="relative flex-1 color-column"
                  style={{
                    flexBasis: columnWidths.length > 0 ? `${columnWidths[index]}%` : undefined,
                    minWidth: '5%',
                    maxWidth: '95%'
                  }}
                >
                  <SortableColorColumn
                    color={color}
                    onToggleLock={() => onToggleLock(color.id)}
                    onUpdateColor={(hsl) => onUpdateColor(color.id, hsl)}
                    onDelete={() => onDeleteColor(color.id)}
                    canRemove={canRemove}
                  />

                  {/* Resize handles and add button overlays */}
                  {index < colors.length - 1 && (
                    <>
                      {/* Desktop vertical handle */}
                      <div
                        className="hidden md:flex absolute right-0 top-0 bottom-0 w-3 items-center justify-center z-30 cursor-col-resize"
                        onMouseEnter={() => setHoveredDivider(index)}
                        onMouseLeave={() => setHoveredDivider(null)}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                      >
                        <div className={`absolute inset-0 bg-white/20 transition-opacity duration-200 ${
                          hoveredDivider === index ? 'opacity-100' : 'opacity-0'
                        }`} />
                        {canAddMore && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  pendingInsertIndexRef.current = index + 1;
                                  onAddColor(index + 1);
                                }}
                                className={`h-12 w-12 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all duration-200 shadow-lg ${
                                  hoveredDivider === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                                }`}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add color or drag to resize</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {/* Mobile horizontal handle */}
                      <div
                        className="flex md:hidden absolute left-0 right-0 bottom-0 h-3 items-center justify-center z-30 cursor-row-resize"
                        onMouseEnter={() => setHoveredDivider(index)}
                        onMouseLeave={() => setHoveredDivider(null)}
                        onMouseDown={(e) => handleMouseDown(e, index)}
                      >
                        <div className={`absolute inset-0 bg-white/20 transition-opacity duration-200 ${
                          hoveredDivider === index ? 'opacity-100' : 'opacity-0'
                        }`} />
                        {canAddMore && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  pendingInsertIndexRef.current = index + 1;
                                  onAddColor(index + 1);
                                }}
                                className={`h-12 w-12 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all duration-200 shadow-lg ${
                                  hoveredDivider === index ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                                }`}
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Add color or drag to resize</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </TooltipProvider>
  );
}

