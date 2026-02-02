# Icon Placeholders

The application needs icons in this directory:

- `icon.png` - Main application icon (512x512 PNG)
- `tray-icon.png` - System tray icon (32x32 PNG)
- `icon.ico` - Windows icon (256x256 ICO)
- `icon.icns` - macOS icon (1024x1024 ICNS)

## Create Icons Quickly

### Using ImageMagick (Linux):

```bash
# Create a simple blue square with "RA" text
convert -size 512x512 xc:#0066cc -pointsize 240 -fill white -gravity center -annotate +0+0 "RA" icon.png

# Create tray icon
convert icon.png -resize 32x32 tray-icon.png

# Windows (requires ImageMagick)
convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# macOS (requires png2icns)
png2icns icon.icns icon.png
```

### Or use online tools:

- https://www.icoconverter.com/ (PNG to ICO)
- https://cloudconvert.com/png-to-icns (PNG to ICNS)

For now, the app will work without icons, but they improve the user experience.
