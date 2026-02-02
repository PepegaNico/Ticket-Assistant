# Extension Icons

Place your extension icons here:

- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels  
- `icon128.png` - 128x128 pixels

## Creating Icons

You can create simple placeholder icons or design proper ones.

### Quick Placeholder Icons (using ImageMagick):

```bash
# Create a simple colored square with "RA" text for Remedy Assistant
convert -size 128x128 xc:#0066cc -pointsize 60 -fill white -gravity center -annotate +0+0 "RA" icon128.png
convert -size 48x48 xc:#0066cc -pointsize 20 -fill white -gravity center -annotate +0+0 "RA" icon48.png
convert -size 16x16 xc:#0066cc -pointsize 8 -fill white -gravity center -annotate +0+0 "RA" icon16.png
```

Or use any image editor to create icons with the Remedy Assistant logo/branding.

For now, the extension will work without icons, but Edge will show a default puzzle piece icon.
