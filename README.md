# PixelMorpho

**PixelMorpho** is a responsive web app designed for seamless image resizing and conversion. Users can upload a reference image and batch-upload multiple images to automatically resize them to match the first image’s dimensions. It features smooth image handling, individual image actions, and automatic download post-conversion.

## Features
- 📏 Upload a reference image to define target dimensions.
- 🖼 Upload up to **6 images** to resize and arrange in a responsive grid.
- ✅ Converted images are marked with a green checkmark.
- ⬇️ Easily download resized images, which are automatically removed post-download.
- ❌ Individual image removal.
- 🖥 Fully responsive across all devices, displaying images in a vertical stack on mobile.

## How It Works
1. **Upload** a reference image (first image) to set the size.
2. **Add up to 6 images** in the second image section to convert.
3. Click **Convert to Match First Image** to resize images.
4. Download images with one click, or remove them as needed.

## Limitations
- Max file size: **3MB per image**
- Max images: **6**
- Images are downloaded in **JPEG** format.

## Future Enhancements
- Drag-and-drop image upload.
- Bulk downloads as ZIP.
- Image format and quality settings.
- Cloud storage integration for enhanced usability.

## Installation & Usage
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/pixelmorpho.git
## File Structure
PixelMorpho/
│
├── index.html   # Main HTML file
├── main.css     # Stylesheet for layout and design
└── main.js      # JavaScript for functionality
