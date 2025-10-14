'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Color } from '@/hooks/usePalette';
import { hslToHex } from '@/lib/color-utils';
import { RotateCcw } from 'lucide-react';

interface ColorAdjusterProps {
  color: Color;
  onUpdate: (hsl: { h: number; s: number; l: number }) => void;
  onClose: () => void;
}

export function ColorAdjuster({ color, onUpdate, onClose }: ColorAdjusterProps) {
  const [h, setH] = useState(color.hsl.h);
  const [s, setS] = useState(color.hsl.s);
  const [l, setL] = useState(color.hsl.l);

  const [originalHsl] = useState(color.hsl);

  useEffect(() => {
    onUpdate({ h, s, l });
  }, [h, s, l, onUpdate]);

  const handleReset = () => {
    setH(originalHsl.h);
    setS(originalHsl.s);
    setL(originalHsl.l);
  };

  const previewHex = hslToHex(h, s, l);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Adjust Color</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReset}
          className="h-8 px-2"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Color Preview */}
      <div
        className="w-full h-16 rounded-md border-2 border-gray-200"
        style={{ backgroundColor: previewHex }}
      />

      {/* Hex Display */}
      <div className="text-center font-mono text-sm">
        {previewHex.toUpperCase()}
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label>Hue</label>
          <span className="text-muted-foreground">{Math.round(h)}°</span>
        </div>
        <Slider
          value={[h]}
          onValueChange={([value]) => setH(value)}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
        <div
          className="w-full h-2 rounded"
          style={{
            background: `linear-gradient(to right, 
              hsl(0, ${s}%, ${l}%), 
              hsl(60, ${s}%, ${l}%), 
              hsl(120, ${s}%, ${l}%), 
              hsl(180, ${s}%, ${l}%), 
              hsl(240, ${s}%, ${l}%), 
              hsl(300, ${s}%, ${l}%), 
              hsl(360, ${s}%, ${l}%))`,
          }}
        />
      </div>

      {/* Saturation Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label>Saturation</label>
          <span className="text-muted-foreground">{Math.round(s)}%</span>
        </div>
        <Slider
          value={[s]}
          onValueChange={([value]) => setS(value)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div
          className="w-full h-2 rounded"
          style={{
            background: `linear-gradient(to right, 
              hsl(${h}, 0%, ${l}%), 
              hsl(${h}, 100%, ${l}%))`,
          }}
        />
      </div>

      {/* Lightness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <label>Lightness</label>
          <span className="text-muted-foreground">{Math.round(l)}%</span>
        </div>
        <Slider
          value={[l]}
          onValueChange={([value]) => setL(value)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div
          className="w-full h-2 rounded"
          style={{
            background: `linear-gradient(to right, 
              hsl(${h}, ${s}%, 0%), 
              hsl(${h}, ${s}%, 50%), 
              hsl(${h}, ${s}%, 100%))`,
          }}
        />
      </div>

      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
}

