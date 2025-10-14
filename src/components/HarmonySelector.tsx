'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HarmonyMode, getAllHarmonyModes, getHarmonyName } from '@/lib/color-harmonies';

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
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
        Harmony Mode
      </div>
      <div className="flex flex-col gap-1">
        {modes.map((mode) => {
          const { icon, description } = harmonyIcons[mode];
          const isActive = currentMode === mode;

          return (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={(e) => handleModeClick(mode, e)}
                  onKeyDown={(e) => {
                    // Prevent spacebar from triggering the button
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center justify-start gap-2 h-auto py-2 px-3 w-full ${
                    isActive ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  <div className="w-5 h-5 flex-shrink-0">{icon}</div>
                  <span className="text-xs leading-tight text-left flex-1">
                    {getHarmonyName(mode)}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="font-semibold">{getHarmonyName(mode)}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
