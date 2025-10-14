'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HarmonyMode, getAllHarmonyModes, getHarmonyName } from '@/lib/color-harmonies';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HarmonySelectorProps {
  currentMode: HarmonyMode;
  onChange: (mode: HarmonyMode) => void;
}

// Visual representation of each harmony mode
const harmonyIcons: Record<HarmonyMode, { icon: React.ReactNode; description: string }> = {
  none: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="18" cy="12" r="3" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    description: 'Completely random colors with no relationship. Any number of colors.',
  },
  monochromatic: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="6" width="4" height="12" fill="currentColor" opacity="0.3" />
        <rect x="10" y="6" width="4" height="12" fill="currentColor" opacity="0.6" />
        <rect x="16" y="6" width="4" height="12" fill="currentColor" opacity="1" />
      </svg>
    ),
    description: 'Same hue with varying saturation and lightness. Flexible number of colors.',
  },
  analogous: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="18" cy="8" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="6" cy="8" r="2.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    description: 'Adjacent colors on the color wheel (±30°). Uses 3 colors.',
  },
  complementary: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="12" cy="19" r="2.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    description: 'Opposite colors on the color wheel (180°). Uses 2 colors.',
  },
  'split-complementary': {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="17" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="7" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    description: 'Base color plus two adjacent to its complement (150° & 210°). Uses 3 colors.',
  },
  triadic: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="18.5" cy="15.5" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="5.5" cy="15.5" r="2.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    description: 'Three colors evenly spaced on the wheel (120° intervals). Uses 3 colors.',
  },
  tetradic: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2" fill="currentColor" />
        <circle cx="19" cy="12" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="5" cy="12" r="2" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    description: 'Four colors in rectangle pattern (90° & 180° offsets). Uses 4 colors.',
  },
  square: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="19" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="19" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="5" cy="12" r="2.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    description: 'Four colors evenly spaced on the wheel (90° intervals). Uses 4 colors.',
  },
};

export function HarmonySelector({ currentMode, onChange }: HarmonySelectorProps) {
  const modes = getAllHarmonyModes();

  const handleModeClick = (mode: HarmonyMode, event: React.MouseEvent<HTMLButtonElement>) => {
    // Toggle: if clicking the current mode, switch to 'none'
    if (mode === currentMode) {
      onChange('none');
    } else {
      onChange(mode);
    }
    
    // Immediately blur the button to prevent it from capturing keyboard events
    event.currentTarget.blur();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Mobile title */}
      <div className="md:hidden text-xs font-medium text-white/60 mb-2 bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 w-full text-center">
        Harmony Mode
      </div>
      
      {/* Harmony mode buttons - circular and horizontal */}
      <div className="flex md:flex-row flex-col gap-3">
        {modes.map((mode) => {
          const { icon, description } = harmonyIcons[mode];
          const isActive = currentMode === mode;

          return (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => handleModeClick(mode, e)}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  className={`w-12 h-12 rounded-full transition-all duration-200 shadow-lg flex items-center justify-center ${
                    isActive 
                      ? 'bg-white text-black hover:bg-white' 
                      : 'bg-black/60 backdrop-blur-md text-white hover:bg-black/80'
                  }`}
                >
                  {icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-semibold">{getHarmonyName(mode)}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      {/* Use arrows hint - Desktop only, centered below buttons */}
      <div className="hidden md:flex items-center gap-1.5 text-white/40 text-[10px]">
        <span className="uppercase tracking-wide">use arrows</span>
        <div className="flex items-center gap-0.5">
          <ChevronLeft className="h-3 w-3" />
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}
