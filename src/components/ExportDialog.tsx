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
import { Copy, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportPalette: (format: 'css' | 'json' | 'array') => string;
  colors: Array<{ hex: string }>;
}

export function ExportDialog({
  open,
  onOpenChange,
  exportPalette,
  colors,
}: ExportDialogProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const handleCopy = async (format: 'css' | 'json' | 'array', label: string) => {
    try {
      const content = exportPalette(format);
      await navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      toast.success(`Copied ${label} format`);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadSVG = () => {
    const width = 1000;
    const height = 200;
    const colorWidth = width / colors.length;

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${colors
    .map(
      (color, i) =>
        `<rect x="${i * colorWidth}" y="0" width="${colorWidth}" height="${height}" fill="${color.hex}"/>`
    )
    .join('\n  ')}
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.svg';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded SVG');
  };

  const handleDownloadPNG = () => {
    const canvas = document.createElement('canvas');
    const width = 1000;
    const height = 200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const colorWidth = width / colors.length;
      colors.forEach((color, i) => {
        ctx.fillStyle = color.hex;
        ctx.fillRect(i * colorWidth, 0, colorWidth, height);
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'palette.png';
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Downloaded PNG');
        }
      });
    }
  };

  const cssContent = exportPalette('css');
  const jsonContent = exportPalette('json');
  const arrayContent = exportPalette('array');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Palette</DialogTitle>
          <DialogDescription>
            Choose a format to export your color palette
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* CSS Variables */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">CSS Variables</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy('css', 'CSS')}
              >
                {copiedFormat === 'css' ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
              <code>{`:root {\n${cssContent}\n}`}</code>
            </pre>
          </div>

          {/* JSON */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">JSON</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy('json', 'JSON')}
              >
                {copiedFormat === 'json' ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
              <code>{jsonContent}</code>
            </pre>
          </div>

          {/* Array */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Array</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy('array', 'Array')}
              >
                {copiedFormat === 'array' ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy
              </Button>
            </div>
            <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
              <code>{arrayContent}</code>
            </pre>
          </div>

          {/* Download Options */}
          <div className="space-y-2">
            <h3 className="font-semibold">Download as Image</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadSVG}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                SVG
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPNG}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

