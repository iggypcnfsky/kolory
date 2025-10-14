'use client';

import { useState } from 'react';
import { Lock, Unlock, Settings, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Color } from '@/hooks/usePalette';
import { getContrastColor } from '@/lib/color-utils';
import { ColorAdjuster } from './ColorAdjuster';
import { toast } from 'sonner';

interface ColorColumnProps {
  color: Color;
  onToggleLock: () => void;
  onUpdateColor: (hsl: { h: number; s: number; l: number }) => void;
  style?: React.CSSProperties;
  isDragging?: boolean;
}

export function ColorColumn({
  color,
  onToggleLock,
  onUpdateColor,
  style,
  isDragging,
}: ColorColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adjusterOpen, setAdjusterOpen] = useState(false);

  const textColor = getContrastColor(color.hex);

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
      {/* Lock Button - Top Left */}
      <div
        className={`absolute top-4 left-4 transition-opacity duration-200 ${
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
              className="hover:bg-white/20"
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

      {/* Adjust Button - Top Right */}
      <div
        className={`absolute top-4 right-4 transition-opacity duration-200 ${
          isHovered || adjusterOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Popover open={adjusterOpen} onOpenChange={setAdjusterOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="hover:bg-white/20"
              style={{ color: textColor }}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <ColorAdjuster
              color={color}
              onUpdate={onUpdateColor}
              onClose={() => setAdjusterOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Hex Code - Center */}
      <div className="flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
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

        {/* Copy Button - Below hex */}
        <div
          className={`transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyHex();
            }}
            className="hover:bg-white/20"
            style={{ color: textColor }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>

      {/* HSL Values - Bottom Center */}
      <div
        className={`absolute bottom-4 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-sm font-mono" style={{ color: textColor }}>
          HSL({Math.round(color.hsl.h)}, {Math.round(color.hsl.s)}%, {Math.round(color.hsl.l)}%)
        </div>
      </div>
    </div>
  );
}

