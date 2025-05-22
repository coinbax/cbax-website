# Coinbax Presentation

This directory contains the Coinbax presentation in two formats:
- `index.html`: The slide-based presentation using Reveal.js (best for PDF export)
- `continuous-scroll.html`: The single-page, scrollable version of the presentation

## Generating a PDF Version

To create a high-quality PDF of the presentation:

1. Open `index.html` in Chrome
2. Click the "Download PDF" button in the bottom-right corner
3. This will generate and download the PDF using the html2pdf.js library
4. Alternatively, use the browser's print function (Ctrl+P or Cmd+P)
   - Set the destination to "Save as PDF"
   - Set paper size to "Letter" or "A4"
   - Set orientation to "Landscape"
   - Enable "Background graphics"
   - Disable "Headers and footers"

You can also use the Alt+P keyboard shortcut to generate the PDF from any slide.

## Presentation Content

The presentation covers:
- Introduction to Coinbax
- The problem and why now
- Solution overview
- Market opportunity
- How Coinbax works
- Business model
- Validation and competitive landscape
- Go-to-market strategy
- Team information
- Financial projections
- Funding requirements
- Closing summary

## Development Notes

- Both presentation formats share the same design system and styles
- Charts are rendered using Chart.js
- The slide format uses Reveal.js for navigation and PDF export
- PDF generation is handled by html2pdf.js

## Features

- Interactive slide navigation with reveal.js
- Keyboard shortcuts for navigation (arrow keys, space)
- PDF export functionality
- Responsive design for all devices
- Consistent branding with the main Coinbax site

## Continuous Scroll Version

A responsive, mobile-first version of the presentation with continuous scrolling has been added for a modern user experience.

### Features

- **Responsive Design**: Optimized for all devices from mobile to large desktop screens
- **Mobile-First Approach**: Stacks content vertically on mobile, with top-left positioned content on desktop
- **Continuous Scroll**: Allow users to scroll through the entire presentation without slideshows
- **Smooth Navigation**: Table of contents with smooth scrolling to sections
- **Accessibility**: Includes skip links, proper focus states, and semantic HTML
- **Dark/Light Mode**: Preserves the theme switching functionality from the slide version
- **Performance Optimized**: Lazy-loaded images and efficient animations

### How to Use

1. Open the `continuous-scroll.html` file in your browser to view the responsive version
2. Use the navigation menu (hamburger icon) or sidebar TOC to jump to different sections
3. The theme toggle button allows switching between dark and light mode
4. The "Download as PDF" button generates a PDF of the presentation content

### Implementation Details

- **Layout Structure**: Uses CSS Flexbox and Grid for responsive layouts
- **CSS Architecture**: Mobile-first approach with media queries for larger screens
- **JavaScript Features**: 
  - Smooth scrolling
  - Active section highlighting
  - Theme switching
  - Intersection Observer for animation effects
  - PDF export functionality

### Files

- `continuous-scroll.html` - Main HTML file for the continuous scroll version
- `css/responsive.css` - CSS styles specific to the responsive version
- `js/responsive.js` - JavaScript functionality for the responsive version

### Browser Support

Tested and optimized for:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Usage

### Viewing the Presentation

- Open `index.html` in a web browser
- Use arrow keys to navigate between slides
- Press `ESC` to see an overview of all slides
- Press `F` to enter fullscreen mode

### PDF Export

- Click the "Download as PDF" button on the last slide
- Alternatively, press `Alt+P` from any slide
- The PDF will be generated client-side and downloaded automatically

## Customization

### Adding/Modifying Content

- Edit `index.html` to change slide content
- Each slide is contained within a `<section>` element
- The slide order follows the order in the HTML

### Styling

- Custom styles are in `css/custom.css`
- The presentation uses the reveal.js black theme as a base
- Colors and typography match the Coinbax brand

### Images

- Add images to the `assets/images/` directory
- Use the existing naming convention for consistency
- Recommended image dimensions:
  - Logos: 250px × 150px
  - Diagrams: 800px × 450px
  - Team photos: 150px × 150px (square)

## Resources

- [reveal.js Documentation](https://revealjs.com/) 