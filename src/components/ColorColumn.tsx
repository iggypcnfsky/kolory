'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Color } from '@/hooks/usePalette';
import { getContrastColor } from '@/lib/color-utils';
import { toast } from 'sonner';

interface ColorColumnProps {
  color: Color;
  onToggleLock: () => void;
  onUpdateColor: (hsl: { h: number; s: number; l: number }) => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
  isDragging?: boolean;
}

export function ColorColumn({
  color,
  onToggleLock,
  onUpdateColor,
  onDelete,
  style,
  isDragging,
}: ColorColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Local state for HSL sliders
  const [h, setH] = useState(color.hsl.h);
  const [s, setS] = useState(color.hsl.s);
  const [l, setL] = useState(color.hsl.l);

  const textColor = getContrastColor(color.hex);

  // Update local state when color changes
  useEffect(() => {
    setH(color.hsl.h);
    setS(color.hsl.s);
    setL(color.hsl.l);
  }, [color.hsl.h, color.hsl.s, color.hsl.l]);

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      toast.success(`Copied ${color.hex}`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy color');
    }
  };

  return (
    <div
      className="relative flex-1 h-full flex flex-col items-center justify-center transition-all duration-200 select-none"
      style={{
        backgroundColor: color.hex,
        ...style,
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hex Code and Controls - Center */}
      <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        {/* Lock and Delete Icons - Above Hex */}
        <div className="flex items-center gap-2">
          {/* Lock Button */}
          <div
            className={`transition-opacity duration-200 ${
              isHovered || color.locked ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleLock();
                  }}
                  className="hover:bg-white/20 h-9 w-9"
                  style={{ color: textColor }}
                >
                  {color.locked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{color.locked ? 'Unlock' : 'Lock'} color</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Delete Button */}
          {onDelete && (
            <div
              className={`transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="hover:bg-white/20 h-9 w-9"
                    style={{ color: textColor }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete color</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Hex Code */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopyHex();
              }}
              className="text-3xl font-semibold tracking-wider hover:scale-105 transition-transform cursor-pointer flex items-center gap-2"
              style={{ color: textColor }}
            >
              {color.hex.toUpperCase()}
              {copied && <Check className="h-6 w-6" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy</p>
          </TooltipContent>
        </Tooltip>

      </div>

      {/* HSL Sliders - Center (Vertical) */}
      <div
        className={`absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-black/70 backdrop-blur-md rounded-3xl shadow-xl p-4 flex gap-5">
          {/* Hue Slider */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90" style={{ color: textColor }}>
              Hue
            </span>
            <Slider
              value={[h]}
              onValueChange={([value]) => {
                setH(value);
                onUpdateColor({ h: value, s, l });
              }}
              min={0}
              max={360}
              step={1}
              orientation="vertical"
              className="cursor-pointer h-48 w-3"
            />
            <span className="text-sm font-mono font-medium" style={{ color: textColor }}>
              {Math.round(h)}°
            </span>
          </div>

          {/* Saturation Slider */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90" style={{ color: textColor }}>
              Sat
            </span>
            <Slider
              value={[s]}
              onValueChange={([value]) => {
                setS(value);
                onUpdateColor({ h, s: value, l });
              }}
              min={0}
              max={100}
              step={1}
              orientation="vertical"
              className="cursor-pointer h-48 w-3"
            />
            <span className="text-sm font-mono font-medium" style={{ color: textColor }}>
              {Math.round(s)}%
            </span>
          </div>

          {/* Lightness Slider */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-90" style={{ color: textColor }}>
              Light
            </span>
            <Slider
              value={[l]}
              onValueChange={([value]) => {
                setL(value);
                onUpdateColor({ h, s, l: value });
              }}
              min={0}
              max={100}
              step={1}
              orientation="vertical"
              className="cursor-pointer h-48 w-3"
            />
            <span className="text-sm font-mono font-medium" style={{ color: textColor }}>
              {Math.round(l)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

