'use client';

import { useState, useCallback, useEffect } from 'react';
import { HSL, hslToHex, randomColor } from '@/lib/color-utils';
import { HarmonyMode, generateHarmony, getOptimalColorCount } from '@/lib/color-harmonies';

export interface Color {
  id: string;
  hex: string;
  hsl: HSL;
  locked: boolean;
}

export interface SavedPalette {
  id: string;
  name: string;
  colors: Color[];
  createdAt: number;
}

const MIN_COLORS = 2;
const MAX_COLORS = 10;

export function usePalette(initialCount = 4) {
  const [colors, setColors] = useState<Color[]>([]);
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('none');
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);

  // Initialize palette
  useEffect(() => {
    const initialColors = Array.from({ length: initialCount }, (_, i) => {
      const hsl = randomColor();
      return {
        id: `color-${Date.now()}-${i}`,
        hex: hslToHex(hsl.h, hsl.s, hsl.l),
        hsl,
        locked: false,
      };
    });
    setColors(initialColors);

    // Load saved palettes from localStorage
    try {
      const saved = localStorage.getItem('saved-palettes');
      if (saved) {
        setSavedPalettes(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved palettes:', error);
    }
  }, [initialCount]);

  // Save palettes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('saved-palettes', JSON.stringify(savedPalettes));
    } catch (error) {
      console.error('Failed to save palettes:', error);
    }
  }, [savedPalettes]);

  const addColor = useCallback(() => {
    if (colors.length >= MAX_COLORS) return;

    const newHsl = randomColor();
    const newColor: Color = {
      id: `color-${Date.now()}`,
      hex: hslToHex(newHsl.h, newHsl.s, newHsl.l),
      hsl: newHsl,
      locked: false,
    };

    setColors(prev => [...prev, newColor]);
  }, [colors.length]);

  const removeColor = useCallback(() => {
    if (colors.length <= MIN_COLORS) return;
    setColors(prev => prev.slice(0, -1));
  }, [colors.length]);

  const shuffleColors = useCallback(() => {
    setColors(prev => {
      // Always generate a fresh random base color, don't reuse existing colors
      const baseColor = randomColor();
      const newColors = generateHarmony(harmonyMode, baseColor, prev.length);
      
      let colorIndex = 0;
      return prev.map((color) => {
        if (color.locked) return color;
        
        // Assign next color from harmony to unlocked colors
        const hsl = newColors[colorIndex];
        colorIndex++;
        
        return {
          ...color,
          hsl,
          hex: hslToHex(hsl.h, hsl.s, hsl.l),
        };
      });
    });
  }, [harmonyMode]);

  const toggleLock = useCallback((id: string) => {
    setColors(prev =>
      prev.map(color =>
        color.id === id ? { ...color, locked: !color.locked } : color
      )
    );
  }, []);

  const updateColor = useCallback((id: string, hsl: HSL) => {
    setColors(prev =>
      prev.map(color =>
        color.id === id
          ? {
              ...color,
              hsl,
              hex: hslToHex(hsl.h, hsl.s, hsl.l),
            }
          : color
      )
    );
  }, []);

  const changeHarmonyMode = useCallback((mode: HarmonyMode) => {
    setHarmonyMode(mode);
    
    // Get optimal color count for this mode
    const optimalCount = getOptimalColorCount(mode);
    
    setColors(prev => {
      let adjustedColors = [...prev];
      
      // Adjust color count if needed
      if (optimalCount !== null) {
        const lockedColors = prev.filter(c => c.locked);
        const unlockedColors = prev.filter(c => !c.locked);
        
        if (unlockedColors.length > optimalCount) {
          // Remove excess unlocked colors from the right
          const toKeep = unlockedColors.slice(0, optimalCount);
          adjustedColors = [...lockedColors, ...toKeep];
        } else if (unlockedColors.length < optimalCount) {
          // Add colors to reach optimal count
          const toAdd = optimalCount - unlockedColors.length;
          adjustedColors = [...prev];
          for (let i = 0; i < toAdd; i++) {
            const hsl = randomColor();
            adjustedColors.push({
              id: `color-${Date.now()}-${i}`,
              hex: hslToHex(hsl.h, hsl.s, hsl.l),
              hsl,
              locked: false,
            });
          }
        } else {
          // Perfect count
          adjustedColors = [...prev];
        }
      }
      
      // Generate harmony with adjusted color count
      const baseColor = randomColor();
      const newColors = generateHarmony(mode, baseColor, adjustedColors.length);
      
      let colorIndex = 0;
      return adjustedColors.map((color) => {
        if (color.locked) return color;
        
        // Assign next color from harmony to unlocked colors
        const hsl = newColors[colorIndex];
        colorIndex++;
        
        return {
          ...color,
          hsl,
          hex: hslToHex(hsl.h, hsl.s, hsl.l),
        };
      });
    });
  }, []);

  const reorderColors = useCallback((newOrder: Color[]) => {
    setColors(newOrder);
  }, []);

  const savePalette = useCallback((name?: string) => {
    const palette: SavedPalette = {
      id: `palette-${Date.now()}`,
      name: name || `Palette ${savedPalettes.length + 1}`,
      colors: colors.map(c => ({ ...c })),
      createdAt: Date.now(),
    };

    setSavedPalettes(prev => [palette, ...prev]);
    return palette;
  }, [colors, savedPalettes.length]);

  const loadPalette = useCallback((palette: SavedPalette) => {
    setColors(palette.colors.map(c => ({ ...c })));
  }, []);

  const deletePalette = useCallback((id: string) => {
    setSavedPalettes(prev => prev.filter(p => p.id !== id));
  }, []);

  const exportPalette = useCallback((format: 'css' | 'json' | 'array') => {
    switch (format) {
      case 'css':
        return colors
          .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
          .join('\n');
      case 'json':
        return JSON.stringify(
          colors.map(c => ({
            hex: c.hex,
            hsl: c.hsl,
          })),
          null,
          2
        );
      case 'array':
        return JSON.stringify(colors.map(c => c.hex));
      default:
        return '';
    }
  }, [colors]);

  return {
    colors,
    harmonyMode,
    savedPalettes,
    addColor,
    removeColor,
    shuffleColors,
    toggleLock,
    updateColor,
    changeHarmonyMode,
    reorderColors,
    savePalette,
    loadPalette,
    deletePalette,
    exportPalette,
    canAddMore: colors.length < MAX_COLORS,
    canRemove: colors.length > MIN_COLORS,
  };
}

