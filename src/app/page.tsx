'use client';

import { useState, useEffect } from 'react';
import { Save, FolderOpen, Download, HelpCircle, Shuffle, Palette, X, Percent, Type, ExternalLink, Lock, Unlock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ColorPalette } from '@/components/ColorPalette';
import { HarmonySelector } from '@/components/HarmonySelector';
import { ExportDialog } from '@/components/ExportDialog';
import { SavedPalettes } from '@/components/SavedPalettes';
import { HelpDialog } from '@/components/HelpDialog';
import { usePalette } from '@/hooks/usePalette';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getNextHarmonyMode, getPreviousHarmonyMode, getHarmonyName } from '@/lib/color-harmonies';
import { getRandomFont, loadGoogleFont } from '@/lib/google-fonts';

// Top bar button component - circular with icon only
function TopBarButton({ 
  icon, 
  onClick, 
  tooltip,
  active = false,
}: { 
  icon: React.ReactNode; 
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  tooltip: string;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`w-12 h-12 rounded-full backdrop-blur-md transition-all duration-200 shadow-lg ${
            active 
              ? 'bg-white/90 text-black hover:bg-white' 
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function Home() {
  const {
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
    canAddMore,
    canRemove,
  } = usePalette(4);

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [savedPalettesOpen, setSavedPalettesOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [paletteName, setPaletteName] = useState('');
  const [mobileHarmonyOpen, setMobileHarmonyOpen] = useState(false);
  const [randomWidthMode, setRandomWidthMode] = useState(false);
  const [randomFontMode, setRandomFontMode] = useState(false);
  const [currentFont, setCurrentFont] = useState<string>('DM Sans');
  const [fontLocked, setFontLocked] = useState(false);

  // Get all harmony modes for mobile display
  const allModes = ['none', 'monochromatic', 'analogous', 'complementary', 'split-complementary', 'triadic', 'tetradic', 'square'] as const;

  // Harmony mode icons - same as desktop
  const harmonyIcons: Record<typeof allModes[number], React.ReactNode> = {
    none: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="12" r="3" fill="currentColor" />
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.7" />
        <circle cx="18" cy="12" r="3" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    monochromatic: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="6" width="4" height="12" fill="currentColor" opacity="0.3" />
        <rect x="10" y="6" width="4" height="12" fill="currentColor" opacity="0.6" />
        <rect x="16" y="6" width="4" height="12" fill="currentColor" opacity="1" />
      </svg>
    ),
    analogous: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="18" cy="8" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="6" cy="8" r="2.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    complementary: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="12" cy="19" r="2.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    'split-complementary': (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="17" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="7" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
    triadic: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="18.5" cy="15.5" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="5.5" cy="15.5" r="2.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    tetradic: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2" fill="currentColor" />
        <circle cx="19" cy="12" r="2" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.5" />
        <circle cx="5" cy="12" r="2" fill="currentColor" opacity="0.4" />
      </svg>
    ),
    square: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
        <circle cx="12" cy="5" r="2.5" fill="currentColor" />
        <circle cx="19" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="19" r="2.5" fill="currentColor" opacity="0.5" />
        <circle cx="5" cy="12" r="2.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  };

  // Helper to blur button after click
  const handleButtonClick = (callback: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    callback();
    e.currentTarget.blur();
  };

  const handleCopyPalette = async () => {
    try {
      const hexCodes = colors.map((c) => c.hex).join(', ');
      await navigator.clipboard.writeText(hexCodes);
      toast.success('Copied all colors to clipboard');
    } catch {
      toast.error('Failed to copy colors');
    }
  };

  const handleSavePalette = () => {
    setSaveDialogOpen(true);
  };

  const confirmSavePalette = () => {
    const name = paletteName.trim() || `Palette ${savedPalettes.length + 1}`;
    savePalette(name);
    toast.success(`Saved "${name}"`);
    setSaveDialogOpen(false);
    setPaletteName('');
  };

  const handleNextMode = () => {
    const nextMode = getNextHarmonyMode(harmonyMode);
    changeHarmonyMode(nextMode);
    toast.info(`Harmony: ${getHarmonyName(nextMode)}`);
  };

  const handlePreviousMode = () => {
    const prevMode = getPreviousHarmonyMode(harmonyMode);
    changeHarmonyMode(prevMode);
    toast.info(`Harmony: ${getHarmonyName(prevMode)}`);
  };

  const handleToggleRandomWidth = () => {
    setRandomWidthMode(!randomWidthMode);
    toast.info(randomWidthMode ? 'Equal widths' : 'Random widths');
  };

  const handleToggleRandomFont = () => {
    const newMode = !randomFontMode;
    setRandomFontMode(newMode);
    
    if (newMode) {
      // Pick a random font and load it
      const randomFont = getRandomFont();
      setCurrentFont(randomFont);
      loadGoogleFont(randomFont);
      setFontLocked(false); // Reset lock when enabling
      toast.info(`Random fonts enabled: ${randomFont}`);
    } else {
      // Reset to default
      setCurrentFont('DM Sans');
      setFontLocked(false); // Reset lock when disabling
      toast.info('Default font restored');
    }
  };

  const handleToggleFontLock = () => {
    setFontLocked(!fontLocked);
    toast.info(fontLocked ? 'Font unlocked' : 'Font locked');
  };

  const handleSharePalette = async () => {
    // Create text representation of the palette
    let paletteText = '🎨 Color Palette\n\n';
    
    // Add colors with hex codes
    paletteText += 'Colors:\n';
    colors.forEach((color, index) => {
      paletteText += `${index + 1}. ${color.hex.toUpperCase()}${color.locked ? ' 🔒' : ''}\n`;
    });
    
    // Add font info if random font mode is active
    if (randomFontMode) {
      paletteText += `\nFont: ${currentFont}${fontLocked ? ' 🔒' : ''}\n`;
    }
    
    // Add harmony mode if not 'none'
    if (harmonyMode !== 'none') {
      paletteText += `\nHarmony: ${getHarmonyName(harmonyMode)}\n`;
    }
    
    // Add width info if random width mode is active
    if (randomWidthMode) {
      paletteText += '\nRandom widths enabled\n';
    }
    
    try {
      await navigator.clipboard.writeText(paletteText);
      // Show success feedback (toast is hidden on mobile, so this is just for consistency)
      toast.success('Palette copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy palette');
    }
  };

  // Generate new random font when colors change in random font mode
  useEffect(() => {
    if (randomFontMode && !fontLocked) {
      const randomFont = getRandomFont();
      setCurrentFont(randomFont);
      loadGoogleFont(randomFont);
    }
  }, [colors, randomFontMode, fontLocked]);

  useKeyboard({
    onShuffle: shuffleColors,
    onCopyPalette: handleCopyPalette,
    onExport: () => setExportDialogOpen(true),
    onSave: handleSavePalette,
    onHelp: () => setHelpDialogOpen(true),
    onNextMode: handleNextMode,
    onPreviousMode: handlePreviousMode,
  });

  return (
    <TooltipProvider>
      <main className="relative w-screen h-screen overflow-hidden overflow-x-hidden max-w-full" style={{ maxWidth: '100vw' }}>
        {/* Color Palette */}
        <ColorPalette
          colors={colors}
          onToggleLock={toggleLock}
          onUpdateColor={updateColor}
          onReorder={reorderColors}
          onDeleteColor={removeColor}
          onAddColor={addColor}
          canAddMore={canAddMore}
          canRemove={canRemove}
          randomWidthMode={randomWidthMode}
          onShuffleWidths={shuffleColors}
          hexFont={currentFont}
        />

        {/* Top Center Controls - Desktop Only */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <div className="flex items-center gap-3">
            {/* Generate Button */}
            <TopBarButton
              icon={<Shuffle className="h-5 w-5" />}
              onClick={handleButtonClick(shuffleColors)}
              tooltip="Generate new colors (Space)"
            />

            {/* Random Width Toggle */}
            <TopBarButton
              icon={<Percent className="h-5 w-5" />}
              onClick={handleButtonClick(handleToggleRandomWidth)}
              tooltip={randomWidthMode ? "Random widths enabled" : "Random widths disabled"}
              active={randomWidthMode}
            />

            {/* Random Font Toggle */}
            {randomFontMode ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-black shadow-lg backdrop-blur-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleButtonClick(handleToggleRandomFont)}
                      className="h-8 w-8 hover:bg-black/10"
                    >
                      <Type className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: currentFont }}>
                      {currentFont}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleButtonClick(handleToggleFontLock)}
                      className="h-8 w-8 hover:bg-black/10"
                    >
                      {fontLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const fontUrl = `https://fonts.google.com/specimen/${currentFont.replace(/\s+/g, '+')}`;
                        window.open(fontUrl, '_blank');
                        e.currentTarget.blur();
                      }}
                      className="h-8 w-8 hover:bg-black/10"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Type: disable • Lock: {fontLocked ? 'unlock' : 'lock'} font • Link: view font</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <TopBarButton
                icon={<Type className="h-5 w-5" />}
                onClick={handleButtonClick(handleToggleRandomFont)}
                tooltip="Random fonts disabled"
                active={false}
              />
            )}

            {/* Export */}
            <TopBarButton
              icon={<Download className="h-5 w-5" />}
              onClick={handleButtonClick(() => setExportDialogOpen(true))}
              tooltip="Export (E)"
            />

            {/* Help */}
            <TopBarButton
              icon={<HelpCircle className="h-5 w-5" />}
              onClick={handleButtonClick(() => setHelpDialogOpen(true))}
              tooltip="Help (?)"
            />
          </div>
        </div>

        {/* Bottom Center - Harmony Selector - Desktop Only */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:block">
          <HarmonySelector currentMode={harmonyMode} onChange={changeHarmonyMode} />
        </div>

        {/* Mobile Top Right - Share Button */}
        <div className="fixed top-4 right-4 z-20 md:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleButtonClick(handleSharePalette)}
                className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white active:bg-black/80 shadow-lg"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Copy palette as text</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mobile Bottom Left - Text Mode Only */}
        <div className="fixed bottom-4 left-4 z-20 md:hidden">
          {/* Text Mode Button/Display */}
          {randomFontMode ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white text-black shadow-lg backdrop-blur-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleButtonClick(handleToggleRandomFont)}
                    className="h-6 w-6 hover:bg-black/10 flex-shrink-0"
                  >
                    <Type className="h-3 w-3" />
                  </Button>
                  <span 
                    className="text-xs font-medium whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis" 
                    style={{ fontFamily: currentFont }}
                  >
                    {currentFont}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleButtonClick(handleToggleFontLock)}
                    className="h-6 w-6 hover:bg-black/10 flex-shrink-0"
                  >
                    {fontLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const fontUrl = `https://fonts.google.com/specimen/${currentFont.replace(/\s+/g, '+')}`;
                      window.open(fontUrl, '_blank');
                      e.currentTarget.blur();
                    }}
                    className="h-6 w-6 hover:bg-black/10 flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Type: disable • Lock: {fontLocked ? 'unlock' : 'lock'} • Link: view</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={handleButtonClick(handleToggleRandomFont)}
                  className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white active:bg-black/80 shadow-lg"
                >
                  <Type className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Random fonts disabled</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Mobile Bottom Right - Three Buttons */}
        <div className="fixed bottom-4 right-4 z-20 md:hidden">
          {/* Harmony mode buttons panel - shown when open - positioned higher to avoid overlap */}
          <div 
            className={`absolute bottom-[100px] right-0 flex flex-col gap-1.5 transition-all duration-300 origin-bottom-right ${
              mobileHarmonyOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
            }`}
          >
            {allModes.map((mode) => {
              const isActive = harmonyMode === mode;
              
              return (
                <Tooltip key={mode}>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      onClick={(e) => {
                        changeHarmonyMode(mode);
                        e.currentTarget.blur();
                      }}
                      className={`h-8 w-8 rounded-full transition-all duration-200 shadow-lg ${
                        isActive 
                          ? 'bg-white text-black' 
                          : 'bg-black/60 backdrop-blur-md text-white active:bg-black/80'
                      }`}
                    >
                      <div className="scale-75">
                        {harmonyIcons[mode]}
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>{getHarmonyName(mode)}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex items-end gap-1.5">
            {/* Percentage Toggle Button - Left */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={handleButtonClick(handleToggleRandomWidth)}
                  className={`h-8 w-8 rounded-full shadow-lg transition-all duration-200 ${
                    randomWidthMode
                      ? 'bg-white text-black'
                      : 'bg-black/60 backdrop-blur-md text-white active:bg-black/80'
                  }`}
                >
                  <Percent className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{randomWidthMode ? "Random widths enabled" : "Random widths disabled"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Right column: Harmony stacked above Generate */}
            <div className="flex flex-col gap-1.5">
              {/* Harmony Toggle Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={() => setMobileHarmonyOpen(!mobileHarmonyOpen)}
                    className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white active:bg-black/80 shadow-lg"
                  >
                    {mobileHarmonyOpen ? <X className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Harmony Mode</p>
                </TooltipContent>
              </Tooltip>

              {/* Generate Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={handleButtonClick(shuffleColors)}
                    className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md text-white active:bg-black/80 shadow-lg"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Generate (Space)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>


        {/* Dialogs */}
        <ExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          exportPalette={exportPalette}
          colors={colors}
        />

        <SavedPalettes
          open={savedPalettesOpen}
          onOpenChange={setSavedPalettesOpen}
          savedPalettes={savedPalettes}
          onLoad={loadPalette}
          onDelete={deletePalette}
        />

        <HelpDialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen} />

        {/* Save Palette Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Palette</DialogTitle>
              <DialogDescription>
                Give your palette a name (optional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder={`Palette ${savedPalettes.length + 1}`}
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmSavePalette();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSaveDialogOpen(false);
                    setPaletteName('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={confirmSavePalette}>Save</Button>
              </div>
    </div>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications - Hidden on Mobile */}
        <div className="hidden md:block">
          <Toaster 
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                border: 'none',
                color: 'white',
              },
            }}
          />
        </div>
      </main>
    </TooltipProvider>
  );
}
