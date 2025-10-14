'use client';

import { useState } from 'react';
import { Plus, Minus, Save, FolderOpen, Download, HelpCircle } from 'lucide-react';
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
        />

        {/* Bottom Right - Harmony Selector */}
        <div className="fixed bottom-6 right-6 z-10">
          <HarmonySelector currentMode={harmonyMode} onChange={changeHarmonyMode} />
        </div>

        {/* Bottom Center Controls */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex gap-2">
            {/* Remove Color */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleButtonClick(removeColor)}
                  disabled={!canRemove}
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove color</p>
              </TooltipContent>
            </Tooltip>

            {/* Color Count */}
            <div className="flex items-center px-3 text-sm font-medium">
              {colors.length}
            </div>

            {/* Add Color */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleButtonClick(addColor)}
                  disabled={!canAddMore}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add color</p>
              </TooltipContent>
            </Tooltip>

            <div className="w-px bg-border mx-1" />

            {/* Save Palette */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={handleButtonClick(handleSavePalette)}>
                  <Save className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save palette (S)</p>
              </TooltipContent>
            </Tooltip>

            {/* Open Saved Palettes */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleButtonClick(() => setSavedPalettesOpen(true))}
                >
                  <FolderOpen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saved palettes</p>
              </TooltipContent>
            </Tooltip>

            {/* Export */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleButtonClick(() => setExportDialogOpen(true))}
                >
                  <Download className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export (E)</p>
              </TooltipContent>
            </Tooltip>

            <div className="w-px bg-border mx-1" />

            {/* Help */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleButtonClick(() => setHelpDialogOpen(true))}
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help (?)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Hint Text */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-center z-10">
          <p className="text-sm text-white/80 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
            Press <kbd className="px-2 py-1 bg-white/20 rounded">Space</kbd> to generate
            new colors
          </p>
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

        {/* Toast Notifications */}
        <Toaster />
      </main>
    </TooltipProvider>
  );
}
