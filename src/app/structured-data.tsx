export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Kolory",
    "alternateName": "Kolory - Color Palette Generator",
    "url": "https://kolory.app",
    "logo": "https://kolory.app/icon.png",
    "description": "Generate beautiful color palettes with harmony modes, lock colors, random fonts, and export in multiple formats. A modern color tool for designers and developers.",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Person",
      "name": "Iggy Love",
      "url": "https://iggy.love"
    },
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
    },
    "featureList": [
      "Color palette generation",
      "Multiple color harmony modes (monochromatic, analogous, complementary, triadic, tetradic, square)",
      "Lock/unlock individual colors",
      "Random width mode",
      "Random font mode with Google Fonts integration",
      "HSL color adjustments",
      "Export to multiple formats (CSS, JSON, SVG, PNG)",
      "Save and load palettes",
      "Keyboard shortcuts",
      "Drag and drop color reordering",
      "Copy colors to clipboard",
      "Responsive design for mobile and desktop"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

