'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const shortcuts = [
    { key: 'Spacebar', description: 'Generate new color palette' },
    { key: '↑ Arrow Up', description: 'Previous harmony mode' },
    { key: '↓ Arrow Down', description: 'Next harmony mode' },
    { key: 'C', description: 'Copy all colors to clipboard' },
    { key: 'E', description: 'Open export dialog' },
    { key: 'S', description: 'Save current palette' },
    { key: '?', description: 'Show this help dialog' },
  ];

  const tips = [
    'Click on a color to lock/unlock it',
    'Drag colors to reorder them',
    'Use the settings icon to adjust HSL values',
    'Click the hex code to copy it',
    'Locked colors will not change when shuffling',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts & Tips</DialogTitle>
          <DialogDescription>
            Make the most of your color palette generator
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Keyboard Shortcuts */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

