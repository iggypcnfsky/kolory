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
  hexFont?: string;
}

export function ColorColumn({
  color,
  onToggleLock,
  onUpdateColor,
  onDelete,
  style,
  isDragging,
  hexFont = 'DM Sans',
}: ColorColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState<'h' | 's' | 'l' | null>(null);
  
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

  const handleSliderInteraction = (clientY: number, sliderElement: HTMLElement, type: 'h' | 's' | 'l', max: number) => {
    const rect = sliderElement.getBoundingClientRect();
    const clickY = clientY - rect.top;
    const percentage = 1 - (clickY / rect.height);
    const newValue = Math.round(Math.max(0, Math.min(max, percentage * max)));
    
    if (type === 'h') {
      setH(newValue);
      onUpdateColor({ h: newValue, s, l });
    } else if (type === 's') {
      setS(newValue);
      onUpdateColor({ h, s: newValue, l });
    } else {
      setL(newValue);
      onUpdateColor({ h, s, l: newValue });
    }
  };

  const handleSliderDrag = (e: React.MouseEvent, type: 'h' | 's' | 'l', max: number) => {
    handleSliderInteraction(e.clientY, e.currentTarget as HTMLElement, type, max);
  };

  useEffect(() => {
    if (!isDraggingSlider) return;

    const handleMouseMove = (e: MouseEvent) => {
      const sliderEl = document.querySelector(`[data-slider="${isDraggingSlider}"]`) as HTMLElement;
      if (!sliderEl) return;

      const rect = sliderEl.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const percentage = 1 - (clickY / rect.height);
      
      if (isDraggingSlider === 'h') {
        const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
        setH(newH);
        onUpdateColor({ h: newH, s, l });
      } else if (isDraggingSlider === 's') {
        const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
        setS(newS);
        onUpdateColor({ h, s: newS, l });
      } else if (isDraggingSlider === 'l') {
        const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
        setL(newL);
        onUpdateColor({ h, s, l: newL });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSlider(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSlider, h, s, l, onUpdateColor]);

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
      {/* Centered Control Group - Desktop */}
      <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6" onClick={(e) => e.stopPropagation()}>
        {/* Lock and Delete Icons */}
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
              className="text-3xl font-semibold tracking-tight hover:scale-105 transition-transform cursor-pointer flex items-center gap-2"
              style={{ color: textColor, fontFamily: hexFont }}
            >
              {color.hex.toUpperCase()}
              {copied && <Check className="h-6 w-6" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy</p>
          </TooltipContent>
        </Tooltip>

        {/* HSL Sliders - Below Hex */}
      <div
          className={`transition-all duration-200 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          {/* Hue Slider */}
          <div className="relative flex flex-col items-center gap-2">
            <div 
              data-slider="h"
              className="relative w-[51px] h-[186px] rounded-full border-2 cursor-pointer overflow-hidden"
              style={{ borderColor: `${textColor}e6` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDraggingSlider('h');
                handleSliderDrag(e, 'h', 360);
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                if (e.buttons === 1) {
                  setIsDraggingSlider('h');
                  handleSliderDrag(e, 'h', 360);
                }
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                if (e.buttons === 1) {
                  handleSliderDrag(e, 'h', 360);
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsDraggingSlider('h');
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = touch.clientY - rect.top;
                const percentage = 1 - (clickY / rect.height);
                const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
                setH(newH);
                onUpdateColor({ h: newH, s, l });
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = touch.clientY - rect.top;
                const percentage = 1 - (clickY / rect.height);
                const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
                setH(newH);
                onUpdateColor({ h: newH, s, l });
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fill indicator */}
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-150"
                style={{ 
                  height: `${(h / 360) * 100}%`,
                  backgroundColor: `${textColor}0d`
                }}
              />
              {/* Vertical text label */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ 
                  transform: 'translate(-50%, -50%) rotate(-90deg)',
                  transformOrigin: 'center',
                  color: textColor,
                  fontSize: '10.24px',
                  fontWeight: 400,
                  letterSpacing: '-0.04em',
                  whiteSpace: 'nowrap',
                  width: '120px',
                  textAlign: 'center'
                }}
              >
                Hue
              </div>
            </div>
            {/* Label below slider */}
            <span className="text-xs font-medium" style={{ color: textColor }}>Hue</span>
          </div>

          {/* Saturation Slider */}
          <div className="relative flex flex-col items-center gap-2">
            <div 
              data-slider="s"
              className="relative w-[51px] h-[186px] rounded-full border-2 cursor-pointer overflow-hidden"
              style={{ borderColor: `${textColor}e6` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDraggingSlider('s');
                handleSliderDrag(e, 's', 100);
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                if (e.buttons === 1) {
                  setIsDraggingSlider('s');
                  handleSliderDrag(e, 's', 100);
                }
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                if (e.buttons === 1) {
                  handleSliderDrag(e, 's', 100);
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsDraggingSlider('s');
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = touch.clientY - rect.top;
                const percentage = 1 - (clickY / rect.height);
                const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                setS(newS);
                onUpdateColor({ h, s: newS, l });
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = touch.clientY - rect.top;
                const percentage = 1 - (clickY / rect.height);
                const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                setS(newS);
                onUpdateColor({ h, s: newS, l });
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fill indicator */}
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-150"
                style={{ 
                  height: `${s}%`,
                  backgroundColor: `${textColor}0d`
                }}
              />
              {/* Vertical text label */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ 
                  transform: 'translate(-50%, -50%) rotate(-90deg)',
                  transformOrigin: 'center',
                  color: textColor,
                  fontSize: '10.24px',
                  fontWeight: 400,
                  letterSpacing: '-0.04em',
                  whiteSpace: 'nowrap',
                  width: '120px',
                  textAlign: 'center'
                }}
              >
                Saturation
              </div>
            </div>
            {/* Label below slider */}
            <span className="text-xs font-medium" style={{ color: textColor }}>Saturation</span>
          </div>

          {/* Lightness Slider */}
          <div className="relative flex flex-col items-center gap-2">
            <div 
              data-slider="l"
              className="relative w-[51px] h-[186px] rounded-full border-2 cursor-pointer overflow-hidden"
              style={{ borderColor: `${textColor}e6` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsDraggingSlider('l');
                handleSliderDrag(e, 'l', 100);
              }}
              onMouseEnter={(e) => {
                e.stopPropagation();
                if (e.buttons === 1) {
                  setIsDraggingSlider('l');
                  handleSliderDrag(e, 'l', 100);
                }
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                if (e.buttons === 1) {
                  handleSliderDrag(e, 'l', 100);
                }
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setIsDraggingSlider('l');
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = touch.clientY - rect.top;
                const percentage = 1 - (clickY / rect.height);
                const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                setL(newL);
                onUpdateColor({ h, s, l: newL });
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = touch.clientY - rect.top;
                const percentage = 1 - (clickY / rect.height);
                const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                setL(newL);
                onUpdateColor({ h, s, l: newL });
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fill indicator */}
              <div 
                className="absolute bottom-0 left-0 right-0 transition-all duration-150"
                style={{ 
                  height: `${l}%`,
                  backgroundColor: `${textColor}0d`
                }}
              />
              {/* Vertical text label */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ 
                  transform: 'translate(-50%, -50%) rotate(-90deg)',
                  transformOrigin: 'center',
                  color: textColor,
                  fontSize: '10.24px',
                  fontWeight: 400,
                  letterSpacing: '-0.04em',
                  whiteSpace: 'nowrap',
                  width: '120px',
                  textAlign: 'center'
                }}
              >
                Lightness
              </div>
            </div>
            {/* Label below slider */}
            <span className="text-xs font-medium" style={{ color: textColor }}>Lightness</span>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-full">
        {/* Top Left - Hex Code with Lock and Delete Icons - Always Visible */}
        <div className="absolute top-4 left-4 flex items-center gap-2 opacity-100" onClick={(e) => e.stopPropagation()}>
          {/* Hex Code */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyHex();
                }}
                className="text-base font-semibold tracking-tight active:scale-95 transition-transform cursor-pointer flex items-center gap-1"
                style={{ color: textColor, fontFamily: hexFont }}
              >
                {color.hex.toUpperCase()}
                {copied && <Check className="h-3 w-3" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to copy</p>
            </TooltipContent>
          </Tooltip>

          {/* Lock Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleLock();
                }}
                className="flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200 active:scale-95"
                style={{ 
                  color: textColor,
                  backgroundColor: `${textColor}20`
                }}
              >
                {color.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{color.locked ? 'Unlock' : 'Lock'} color</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete Button */}
          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="flex items-center justify-center w-7 h-7 rounded-full transition-colors duration-200 active:scale-95"
                  style={{ 
                    color: textColor,
                    backgroundColor: `${textColor}20`
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete color</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Bottom Center - Horizontal Sliders - Hidden on Mobile */}
        <div
          className="hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            {/* Hue Slider */}
            <div className="relative flex flex-col items-center gap-1">
              <span className="text-xs font-medium" style={{ color: textColor }}>H</span>
              <div 
                data-slider="h"
                className="relative w-[120px] h-[32px] rounded-full border-2 cursor-pointer overflow-hidden"
                style={{ borderColor: `${textColor}e6` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider('h');
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
                  setH(newH);
                  onUpdateColor({ h: newH, s, l });
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
                    setH(newH);
                    onUpdateColor({ h: newH, s, l });
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider('h');
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = touch.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
                  setH(newH);
                  onUpdateColor({ h: newH, s, l });
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = touch.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newH = Math.round(Math.max(0, Math.min(360, percentage * 360)));
                  setH(newH);
                  onUpdateColor({ h: newH, s, l });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 transition-all duration-150"
                  style={{ 
                    width: `${(h / 360) * 100}%`,
                    backgroundColor: `${textColor}0d`
                  }}
                />
              </div>
            </div>

            {/* Saturation Slider */}
            <div className="relative flex flex-col items-center gap-1">
              <span className="text-xs font-medium" style={{ color: textColor }}>S</span>
              <div 
                data-slider="s"
                className="relative w-[120px] h-[32px] rounded-full border-2 cursor-pointer overflow-hidden"
                style={{ borderColor: `${textColor}e6` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider('s');
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                  setS(newS);
                  onUpdateColor({ h, s: newS, l });
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                    setS(newS);
                    onUpdateColor({ h, s: newS, l });
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider('s');
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = touch.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                  setS(newS);
                  onUpdateColor({ h, s: newS, l });
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = touch.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newS = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                  setS(newS);
                  onUpdateColor({ h, s: newS, l });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 transition-all duration-150"
                  style={{ 
                    width: `${s}%`,
                    backgroundColor: `${textColor}0d`
                  }}
                />
              </div>
            </div>

            {/* Lightness Slider */}
            <div className="relative flex flex-col items-center gap-1">
              <span className="text-xs font-medium" style={{ color: textColor }}>L</span>
              <div 
                data-slider="l"
                className="relative w-[120px] h-[32px] rounded-full border-2 cursor-pointer overflow-hidden"
                style={{ borderColor: `${textColor}e6` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider('l');
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                  setL(newL);
                  onUpdateColor({ h, s, l: newL });
                }}
                onMouseMove={(e) => {
                  if (e.buttons === 1) {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = clickX / rect.width;
                    const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                    setL(newL);
                    onUpdateColor({ h, s, l: newL });
                  }
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider('l');
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = touch.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                  setL(newL);
                  onUpdateColor({ h, s, l: newL });
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                  const touch = e.touches[0];
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = touch.clientX - rect.left;
                  const percentage = clickX / rect.width;
                  const newL = Math.round(Math.max(0, Math.min(100, percentage * 100)));
                  setL(newL);
                  onUpdateColor({ h, s, l: newL });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 transition-all duration-150"
                  style={{ 
                    width: `${l}%`,
                    backgroundColor: `${textColor}0d`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

