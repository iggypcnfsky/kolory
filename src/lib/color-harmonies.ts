// Color harmony algorithms for generating palettes

import { HSL, normalizeHue, randomColor, clamp } from './color-utils';

export type HarmonyMode =
  | 'none'
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'square';

/**
 * Generate colors based on harmony mode
 */
export function generateHarmony(
  mode: HarmonyMode,
  baseColor: HSL,
  count: number
): HSL[] {
  switch (mode) {
    case 'none':
      return generateRandom(count);
    case 'monochromatic':
      return generateMonochromatic(baseColor, count);
    case 'analogous':
      return generateAnalogous(baseColor, count);
    case 'complementary':
      return generateComplementary(baseColor, count);
    case 'split-complementary':
      return generateSplitComplementary(baseColor, count);
    case 'triadic':
      return generateTriadic(baseColor, count);
    case 'tetradic':
      return generateTetradic(baseColor, count);
    case 'square':
      return generateSquare(baseColor, count);
    default:
      return generateRandom(count);
  }
}

/**
 * Generate completely random colors
 */
function generateRandom(count: number): HSL[] {
  return Array.from({ length: count }, () => randomColor());
}

/**
 * Generate monochromatic harmony (same hue, different saturation/lightness)
 */
function generateMonochromatic(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  
  for (let i = 1; i < count; i++) {
    const lightnessVariation = (i * 15) % 50;
    const saturationVariation = (i * 20) % 40;
    
    colors.push({
      h: baseColor.h,
      s: clamp(baseColor.s + saturationVariation - 20, 20, 100),
      l: clamp(baseColor.l + lightnessVariation - 25, 20, 80),
    });
  }
  
  return colors;
}

/**
 * Generate analogous harmony (adjacent hues on color wheel)
 */
function generateAnalogous(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  const step = 30; // degrees on color wheel
  
  for (let i = 1; i < count; i++) {
    const offset = Math.ceil(i / 2) * step * (i % 2 === 0 ? 1 : -1);
    colors.push({
      h: normalizeHue(baseColor.h + offset),
      s: clamp(baseColor.s + (Math.random() * 20 - 10), 40, 100),
      l: clamp(baseColor.l + (Math.random() * 20 - 10), 30, 70),
    });
  }
  
  return colors;
}

/**
 * Generate complementary harmony (opposite on color wheel)
 */
function generateComplementary(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  const complementHue = normalizeHue(baseColor.h + 180);
  
  for (let i = 1; i < count; i++) {
    if (i % 2 === 1) {
      // Use complement
      colors.push({
        h: complementHue,
        s: clamp(baseColor.s + (Math.random() * 20 - 10), 40, 100),
        l: clamp(baseColor.l + (Math.random() * 20 - 10), 30, 70),
      });
    } else {
      // Variation of base or complement
      const useBase = Math.random() > 0.5;
      colors.push({
        h: normalizeHue((useBase ? baseColor.h : complementHue) + (Math.random() * 20 - 10)),
        s: clamp(baseColor.s + (Math.random() * 20 - 10), 40, 100),
        l: clamp(baseColor.l + (Math.random() * 20 - 10), 30, 70),
      });
    }
  }
  
  return colors;
}

/**
 * Generate split-complementary harmony
 */
function generateSplitComplementary(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  const split1 = normalizeHue(baseColor.h + 150);
  const split2 = normalizeHue(baseColor.h + 210);
  const hues = [split1, split2];
  
  for (let i = 1; i < count; i++) {
    const selectedHue = hues[(i - 1) % 2];
    colors.push({
      h: normalizeHue(selectedHue + (Math.random() * 15 - 7.5)),
      s: clamp(baseColor.s + (Math.random() * 20 - 10), 40, 100),
      l: clamp(baseColor.l + (Math.random() * 20 - 10), 30, 70),
    });
  }
  
  return colors;
}

/**
 * Generate triadic harmony (120° intervals)
 */
function generateTriadic(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  const hues = [
    baseColor.h,
    normalizeHue(baseColor.h + 120),
    normalizeHue(baseColor.h + 240),
  ];
  
  for (let i = 1; i < count; i++) {
    const selectedHue = hues[i % 3];
    colors.push({
      h: normalizeHue(selectedHue + (Math.random() * 15 - 7.5)),
      s: clamp(baseColor.s + (Math.random() * 20 - 10), 40, 100),
      l: clamp(baseColor.l + (Math.random() * 20 - 10), 30, 70),
    });
  }
  
  return colors;
}

/**
 * Generate tetradic harmony (rectangle - 90° and 180° offsets)
 */
function generateTetradic(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  const hues = [
    baseColor.h,
    normalizeHue(baseColor.h + 90),
    normalizeHue(baseColor.h + 180),
    normalizeHue(baseColor.h + 270),
  ];
  
  for (let i = 1; i < count; i++) {
    const selectedHue = hues[i % 4];
    colors.push({
      h: normalizeHue(selectedHue + (Math.random() * 10 - 5)),
      s: clamp(baseColor.s + (Math.random() * 20 - 10), 40, 100),
      l: clamp(baseColor.l + (Math.random() * 20 - 10), 30, 70),
    });
  }
  
  return colors;
}

/**
 * Generate square harmony (equal 90° intervals)
 */
function generateSquare(baseColor: HSL, count: number): HSL[] {
  const colors: HSL[] = [{ ...baseColor }];
  const hues = [
    baseColor.h,
    normalizeHue(baseColor.h + 90),
    normalizeHue(baseColor.h + 180),
    normalizeHue(baseColor.h + 270),
  ];
  
  for (let i = 1; i < count; i++) {
    const selectedHue = hues[i % 4];
    colors.push({
      h: normalizeHue(selectedHue + (Math.random() * 10 - 5)),
      s: clamp(baseColor.s + (Math.random() * 15 - 7.5), 40, 100),
      l: clamp(baseColor.l + (Math.random() * 15 - 7.5), 30, 70),
    });
  }
  
  return colors;
}

/**
 * Get display name for harmony mode
 */
export function getHarmonyName(mode: HarmonyMode): string {
  const names: Record<HarmonyMode, string> = {
    none: 'Random',
    monochromatic: 'Monochromatic',
    analogous: 'Analogous',
    complementary: 'Complementary',
    'split-complementary': 'Split Complementary',
    triadic: 'Triadic',
    tetradic: 'Tetradic',
    square: 'Square',
  };
  return names[mode];
}

/**
 * Get all available harmony modes
 */
export function getAllHarmonyModes(): HarmonyMode[] {
  return [
    'none',
    'monochromatic',
    'analogous',
    'complementary',
    'split-complementary',
    'triadic',
    'tetradic',
    'square',
  ];
}

/**
 * Get next harmony mode (for arrow key navigation)
 */
export function getNextHarmonyMode(current: HarmonyMode): HarmonyMode {
  const modes = getAllHarmonyModes();
  const currentIndex = modes.indexOf(current);
  const nextIndex = (currentIndex + 1) % modes.length;
  return modes[nextIndex];
}

/**
 * Get previous harmony mode (for arrow key navigation)
 */
export function getPreviousHarmonyMode(current: HarmonyMode): HarmonyMode {
  const modes = getAllHarmonyModes();
  const currentIndex = modes.indexOf(current);
  const previousIndex = currentIndex === 0 ? modes.length - 1 : currentIndex - 1;
  return modes[previousIndex];
}

/**
 * Get the optimal number of colors for a harmony mode
 */
export function getOptimalColorCount(mode: HarmonyMode): number | null {
  const optimalCounts: Record<HarmonyMode, number | null> = {
    none: null, // Any number
    monochromatic: null, // Flexible, typically 4+
    analogous: 3,
    complementary: 2,
    'split-complementary': 3,
    triadic: 3,
    tetradic: 4,
    square: 4,
  };
  return optimalCounts[mode];
}

