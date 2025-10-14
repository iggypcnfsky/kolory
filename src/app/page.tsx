'use client';

import { useState } from 'react';
import { Save, FolderOpen, Download, HelpCircle, Shuffle, Palette, X, Percent } from 'lucide-react';
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
      <main className="relative w-screen h-screen overflow-hidden">
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

            {/* Save Palette */}
            <TopBarButton
              icon={<Save className="h-5 w-5" />}
              onClick={handleButtonClick(handleSavePalette)}
              tooltip="Save palette (S)"
            />

            {/* Open Saved Palettes */}
            <TopBarButton
              icon={<FolderOpen className="h-5 w-5" />}
              onClick={handleButtonClick(() => setSavedPalettesOpen(true))}
              tooltip="Saved palettes"
            />

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

        {/* Mobile Bottom Left - Generate Button */}
        <div className="fixed bottom-4 left-4 z-20 md:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={handleButtonClick(shuffleColors)}
                className="h-14 w-14 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 shadow-lg"
              >
                <Shuffle className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate (Space)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mobile Bottom Right - Harmony Toggle Button */}
        <div className="fixed bottom-4 right-4 z-20 md:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                onClick={() => setMobileHarmonyOpen(!mobileHarmonyOpen)}
                className="h-14 w-14 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 shadow-lg"
              >
                {mobileHarmonyOpen ? <X className="h-6 w-6" /> : <Palette className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Harmony Mode</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Mobile Harmony Selector Panel */}
        {mobileHarmonyOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileHarmonyOpen(false)}
            />
            
            {/* Panel */}
            <div className="absolute bottom-0 left-0 right-0 p-4 animate-in slide-in-from-bottom">
              <HarmonySelector 
                currentMode={harmonyMode} 
                onChange={(mode) => {
                  changeHarmonyMode(mode);
                  setMobileHarmonyOpen(false);
                }} 
              />
            </div>
          </div>
        )}


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

        {/* Toast Notifications */}
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
      </main>
    </TooltipProvider>
  );
}
