'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SavedPalette } from '@/hooks/usePalette';
import { Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface SavedPalettesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedPalettes: SavedPalette[];
  onLoad: (palette: SavedPalette) => void;
  onDelete: (id: string) => void;
}

export function SavedPalettes({
  open,
  onOpenChange,
  savedPalettes,
  onLoad,
  onDelete,
}: SavedPalettesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPalettes = savedPalettes.filter((palette) =>
    palette.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLoad = (palette: SavedPalette) => {
    onLoad(palette);
    onOpenChange(false);
    toast.success(`Loaded "${palette.name}"`);
  };

  const handleDelete = (id: string, name: string) => {
    onDelete(id);
    toast.success(`Deleted "${name}"`);
  };

  const handleExportAll = () => {
    const data = JSON.stringify(savedPalettes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palettes.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported all palettes');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saved Palettes</DialogTitle>
          <DialogDescription>
            {savedPalettes.length === 0
              ? 'No saved palettes yet'
              : `${savedPalettes.length} palette${savedPalettes.length === 1 ? '' : 's'} saved`}
          </DialogDescription>
        </DialogHeader>

        {savedPalettes.length > 0 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search palettes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>

            <div className="space-y-3">
              {filteredPalettes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No palettes match your search
                </p>
              ) : (
                filteredPalettes.map((palette) => (
                  <div
                    key={palette.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{palette.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(palette.createdAt).toLocaleDateString()} •{' '}
                          {palette.colors.length} colors
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoad(palette)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(palette.id, palette.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Color Preview */}
                    <div className="flex h-12 rounded-md overflow-hidden">
                      {palette.colors.map((color) => (
                        <div
                          key={color.id}
                          className="flex-1"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

