document.addEventListener('DOMContentLoaded', function() {
  // Add CSS for PDF export mode
  const exportStyles = document.createElement('style');
  exportStyles.textContent = `
    .export-pdf-mode * {
      transition: none !important;
      animation: none !important;
    }
    
    /* Fix for touch event listeners */
    .reveal .controls {
      touch-action: pan-y;
    }
    
    /* Ensure slides are visible during export */
    .pdf-slide {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
      overflow: visible !important;
    }
  `;
  document.head.appendChild(exportStyles);
  
  // Register ChartJS plugins
  Chart.register(ChartDataLabels);
  
  // Initialize dark/light mode
  initThemeToggle();

  // Initialize reveal.js
  let deck = new Reveal({
    // Presentation settings
    width: 1200,
    height: 700,
    margin: 0.05,
    minScale: 0.2,
    maxScale: 1.5,
    
    // Appearance
    controls: true,
    progress: true,
    center: false,
    hash: true,
    
    // Navigation
    slideNumber: true,
    history: true,
    keyboard: true,
    overview: true,
    touch: true,
    
    // Responsive settings
    responsive: true,
    embedded: false, 
    
    // Better mobile handling
    hideInactiveCursor: 1000,
    hideCursorTime: 5000,
    
    // Transition effect
    transition: 'slide', // none/fade/slide/convex/concave/zoom
    transitionSpeed: 'default', // default/fast/slow
    
    // Prevent content overflow issues
    display: 'flex',
    
    // Fix height
    height: 700,
    
    // Ensure content is visible
    viewDistance: 2,
    disableLayout: false,
    
    // Mobile optimization
    mobileViewDistance: 1,
    
    // Gesture configuration
    gestures: {
      swipe: true,
      tap: true,
      pinch: true,
      touch: true,
      pointer: true,
    }
  });
  
  // Initialize the presentation
  deck.initialize().then(() => {
    // Initialize charts after deck is ready
    initCharts();
    
    // Fix position issues
    fixSlidePositioning();
    
    // Add event listeners for slide changes to ensure content fits
    deck.addEventListener('slidechanged', function(event) {
      // Ensure current slide's content is properly sized
      fixCurrentSlideContent(event.currentSlide);
    });
    
    // Listen for resize events to adjust content
    window.addEventListener('resize', function(e) {
      // Check if this is a manually dispatched event to prevent infinite recursion
      if (e.isTrusted === false) return;
      
      // Redraw charts when the window size changes
      initCharts();
      
      // Fix the positioning of all slides
      fixSlidePositioning();
      
      // Fix the current slide content
      const currentSlide = document.querySelector('.reveal .slides section.present');
      if (currentSlide) {
        fixCurrentSlideContent(currentSlide);
      }
    });
    
    // Detect if we're on a mobile device to apply specific optimizations
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      document.body.classList.add('mobile-device');
    }
    
    // Apply different optimizations for laptop/desktop
    if (window.innerWidth > 1024) {
      document.body.classList.add('large-screen');
    }
  });
  
  // Handle PDF export
  document.getElementById('export-pdf').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Show export message
    const exportBtn = this;
    const originalText = exportBtn.textContent;
    exportBtn.textContent = 'Preparing PDF...';
    exportBtn.style.backgroundColor = '#999';
    
    // Give charts a moment to render before starting PDF export
    setTimeout(function() {
      console.log('Starting PDF export after delay to ensure charts are rendered');
      
      // Force render charts directly instead of dispatching resize event
      try {
        // Redraw charts directly without triggering resize
        initCharts();
      } catch (err) {
        console.error('Error redrawing charts:', err);
      }
      
      // Show the user a message about the export process
      let exportMessage = document.createElement('div');
      exportMessage.style.position = 'fixed';
      exportMessage.style.top = '20px';
      exportMessage.style.right = '20px';
      exportMessage.style.padding = '15px';
      exportMessage.style.backgroundColor = 'rgba(0,0,0,0.8)';
      exportMessage.style.color = 'white';
      exportMessage.style.borderRadius = '5px';
      exportMessage.style.zIndex = '9999';
      exportMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      exportMessage.style.fontSize = '14px';
      exportMessage.innerHTML = 'Preparing PDF export...<br>This may take a minute for complex slides.';
      document.body.appendChild(exportMessage);
      
      // Ensure all animations/transitions are complete before export
      document.body.classList.add('export-pdf-mode');
      
      // Configure PDF export settings
      const opt = {
        margin: 0.5,
        filename: 'Coinbax_Presentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: true,
          // Add options to help with canvas rendering
          allowTaint: true,
          // Increase timeout for complex slides
          timeout: 60000,
          letterRendering: true,
          // Disable foreign object rendering which is causing blank pages
          foreignObjectRendering: false,
          // Use proxy to ensure images are rendered properly
          imageTimeout: 30000,
          // Use better rendering method to avoid blank pages
          onclone: function(clonedDoc) {
            // Force all images to complete loading in cloned document
            const images = clonedDoc.querySelectorAll('img');
            images.forEach(img => {
              if (!img.complete) {
                img.src = img.src;
              }
            });
            console.log('Document cloned, images refreshed:', images.length);
          }
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      
      try {
        // Create a temporary container for the presentation clone
        const tempContainer = document.createElement('div');
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        document.body.appendChild(tempContainer);
        
        // Clone the presentation content
        const revealContent = document.querySelector('.reveal').cloneNode(true);
        tempContainer.appendChild(revealContent);
        
        // Prepare slides for export - ensure all canvas elements have proper size
        const canvases = tempContainer.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          // Ensure canvas has proper dimensions
          if (canvas.width === 0 || canvas.height === 0) {
            console.log('Fixing zero-sized canvas:', canvas.id);
            // Set minimum size if not already set
            canvas.width = canvas.width || 300;
            canvas.height = canvas.height || 200;
            
            // Instead of trying to draw from the source canvas, render a simple background
            try {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // Fill with a light background color
                ctx.fillStyle = "#f0f0f0";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                // Add a text notice
                ctx.fillStyle = "#999";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.fillText("Chart could not be rendered for PDF", canvas.width/2, canvas.height/2);
              }
            } catch (err) {
              console.error('Error rendering fallback for canvas:', err);
            }
          } else {
            // Attempt to redraw canvas content
            try {
              const sourceCanvas = document.getElementById(canvas.id);
              if (sourceCanvas && sourceCanvas.getContext) {
                const context = canvas.getContext('2d');
                if (context) {
                  context.drawImage(sourceCanvas, 0, 0);
                }
              }
            } catch (err) {
              console.error('Error copying canvas content:', err);
            }
          }
        });
        
        // Ensure the container has proper dimensions
        tempContainer.style.width = '1200px';
        tempContainer.style.height = '700px';
        
        // Make the clone visible temporarily for better rendering
        tempContainer.style.visibility = 'visible';
        tempContainer.style.position = 'fixed';
        tempContainer.style.zIndex = '-1000';
        tempContainer.style.opacity = '0.01';
        
        // Ensure all slides are visible for PDF export
        const slides = tempContainer.querySelectorAll('.slides section');
        slides.forEach(function(slide, index) {
          console.log(`Processing slide ${index + 1} for PDF export`);
          slide.classList.add('pdf-slide');
          // Ensure the slide is displayed
          slide.style.display = 'block';
          slide.style.opacity = '1';
          slide.style.visibility = 'visible';
          slide.style.position = 'relative';
          slide.style.width = '1200px';
          slide.style.height = '700px';
          slide.style.minHeight = '700px';
          slide.style.padding = '30px';
          slide.style.boxSizing = 'border-box';
          slide.style.pageBreakAfter = 'always';
          slide.style.overflow = 'visible';
          
          // Log dimensions to help with debugging
          console.log(`Slide ${index + 1} dimensions: ${slide.offsetWidth}x${slide.offsetHeight}`);
          
          // Make sure text isn't cut off
          const textElements = slide.querySelectorAll('p, li, h1, h2, h3');
          textElements.forEach(el => {
            el.style.fontSize = '95%';
          });
        });
        
        // Update the PDF export options
        opt.html2canvas.width = 1200;
        opt.html2canvas.height = 700 * slides.length;
        opt.html2canvas.windowWidth = 1200;
        opt.html2canvas.windowHeight = 700 * slides.length;
        
        // Allow html2canvas to render all content (increased timeout)
        opt.html2canvas.timeout = 60000;
        
        // Generate PDF
        html2pdf()
          .from(tempContainer)
          .set(opt)
          .save()
          .then(function() {
            // Remove the temporary container after PDF generation
            document.body.removeChild(tempContainer);
            
            // Remove export message
            if (document.body.contains(exportMessage)) {
              document.body.removeChild(exportMessage);
            }
            
            // Remove export mode class
            document.body.classList.remove('export-pdf-mode');
            
            // Reset button
            exportBtn.textContent = originalText;
            exportBtn.style.backgroundColor = '';
            
            // Log success
            console.log('PDF export completed successfully');
          })
          .catch(function(error) {
            console.error('PDF export error details:', error);
            exportBtn.textContent = 'Export Failed';
            exportBtn.style.backgroundColor = '#f44336';
            
            // Remove export message
            if (document.body.contains(exportMessage)) {
              document.body.removeChild(exportMessage);
            }
            
            // Remove export mode class
            document.body.classList.remove('export-pdf-mode');
            
            // Reset button after 3 seconds
            setTimeout(function() {
              exportBtn.textContent = originalText;
              exportBtn.style.backgroundColor = '';
            }, 3000);
            
            // Offer alternative method
            if (confirm('PDF export failed. Would you like to try an alternative method?\nThis will open each slide in a new window for manual saving.')) {
              // Open print view that allows manual saving
              const slidesContainer = document.querySelector('.reveal .slides');
              if (slidesContainer) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                    <head>
                      <title>Presentation Slides for Print</title>
                      <style>
                        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                        .slide { page-break-after: always; margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; }
                        .slide img { max-width: 100%; height: auto; }
                        h1 { font-size: 18px; margin-bottom: 20px; }
                        p { font-size: 14px; color: #666; }
                      </style>
                    </head>
                    <body>
                      <h1>Presentation Slides for Manual Saving</h1>
                      <p>Right-click and "Save as..." to save as PDF or screenshot each slide.</p>
                      <div id="slides-container"></div>
                    </body>
                    </html>
                  `);
                  
                  // Clone each slide into the print window
                  const slides = document.querySelectorAll('.reveal .slides section');
                  slides.forEach((slide, index) => {
                    const slideClone = slide.cloneNode(true);
                    slideClone.style.display = 'block';
                    slideClone.style.width = '1000px';
                    slideClone.style.height = 'auto';
                    slideClone.style.margin = '0 auto 50px auto';
                    slideClone.style.pageBreakAfter = 'always';
                    slideClone.classList.add('slide');
                    
                    // Add slide number
                    const slideNumber = document.createElement('div');
                    slideNumber.textContent = `Slide ${index + 1}`;
                    slideNumber.style.position = 'absolute';
                    slideNumber.style.bottom = '10px';
                    slideNumber.style.right = '10px';
                    slideNumber.style.fontSize = '12px';
                    slideNumber.style.color = '#999';
                    slideClone.appendChild(slideNumber);
                    
                    printWindow.document.getElementById('slides-container').appendChild(slideClone);
                  });
                  
                  printWindow.document.close();
                }
              }
            }
          });
      } catch (err) {
        console.error('Error in PDF preparation:', err);
        exportBtn.textContent = 'Export Failed';
        exportBtn.style.backgroundColor = '#f44336';
        
        // Remove export message
        if (document.body.contains(exportMessage)) {
          document.body.removeChild(exportMessage);
        }
        
        // Remove export mode class
        document.body.classList.remove('export-pdf-mode');
        
        // Reset button after 3 seconds
        setTimeout(function() {
          exportBtn.textContent = originalText;
          exportBtn.style.backgroundColor = '';
        }, 3000);
        
        // Offer alternative method
        if (confirm('PDF export failed. Would you like to try an alternative method?\nThis will open each slide in a new window for manual saving.')) {
          // Open print view that allows manual saving
          const slidesContainer = document.querySelector('.reveal .slides');
          if (slidesContainer) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(`
                <html>
                <head>
                  <title>Presentation Slides for Print</title>
                  <style>
                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                    .slide { page-break-after: always; margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; }
                    .slide img { max-width: 100%; height: auto; }
                    h1 { font-size: 18px; margin-bottom: 20px; }
                    p { font-size: 14px; color: #666; }
                  </style>
                </head>
                <body>
                  <h1>Presentation Slides for Manual Saving</h1>
                  <p>Right-click and "Save as..." to save as PDF or screenshot each slide.</p>
                  <div id="slides-container"></div>
                </body>
                </html>
              `);
              
              // Clone each slide into the print window
              const slides = document.querySelectorAll('.reveal .slides section');
              slides.forEach((slide, index) => {
                const slideClone = slide.cloneNode(true);
                slideClone.style.display = 'block';
                slideClone.style.width = '1000px';
                slideClone.style.height = 'auto';
                slideClone.style.margin = '0 auto 50px auto';
                slideClone.style.pageBreakAfter = 'always';
                slideClone.classList.add('slide');
                
                // Add slide number
                const slideNumber = document.createElement('div');
                slideNumber.textContent = `Slide ${index + 1}`;
                slideNumber.style.position = 'absolute';
                slideNumber.style.bottom = '10px';
                slideNumber.style.right = '10px';
                slideNumber.style.fontSize = '12px';
                slideNumber.style.color = '#999';
                slideClone.appendChild(slideNumber);
                
                printWindow.document.getElementById('slides-container').appendChild(slideClone);
              });
              
              printWindow.document.close();
            }
          }
        }
      }
    }, 1500); // Increased delay to ensure charts are rendered
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Alt+P to export PDF
    if (e.altKey && e.key === 'p') {
      e.preventDefault();
      document.getElementById('export-pdf').click();
    }
    
    // Alt+T to toggle theme
    if (e.altKey && e.key === 't') {
      e.preventDefault();
      toggleTheme();
    }
  });
  
  // Create placeholder images for the presentation
  createPlaceholderImages();
  
  // Set SVG text colors based on theme
  function updateSvgTextColors() {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.style.setProperty('--text-color', isDarkTheme ? '#ffffff' : '#605cff');
    document.documentElement.style.setProperty('--dispute-text-color', isDarkTheme ? '#ffffff' : '#ff5c5c');
    document.documentElement.style.setProperty('--divider-color', isDarkTheme ? 'rgba(255, 255, 255, 0.2)' : '#605cff');
    document.documentElement.style.setProperty('--line-color', isDarkTheme ? '#8088aa' : '#8088aa');
  }
  
  // Call once on load
  updateSvgTextColors();
  
  // Handle the dispute text color in foreignObject
  function forceDisputeTextColor() {
    const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
    const disputeContainer = document.querySelector('foreignObject div');
    
    if (disputeContainer) {
      disputeContainer.style.color = isDarkTheme ? '#ffffff' : '#ff5c5c';
    }
  }
  
  // Call immediately
  forceDisputeTextColor();
  
  // Update whenever theme changes
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        updateSvgTextColors();
        forceDisputeTextColor();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });

  // Add debug function for image caption positioning
  console.log('Checking image caption positioning...');
  const captionElement = document.querySelector('.slide-how-it-works .image-caption');
  if (captionElement) {
    console.log('Caption element found:', captionElement);
    const computedStyle = window.getComputedStyle(captionElement);
    console.log('Caption position:', {
      position: computedStyle.position,
      top: computedStyle.top,
      right: computedStyle.right,
      bottom: computedStyle.bottom,
      left: computedStyle.left,
      display: computedStyle.display,
      width: computedStyle.width,
      textAlign: computedStyle.textAlign
    });
  } else {
    console.log('Caption element not found');
  }
});

// Function to fix current slide's content to ensure it fits
function fixCurrentSlideContent(slide) {
  if (!slide) return;
  
  // Ensure the slide has proper height
  slide.style.height = '700px';
  slide.style.boxSizing = 'border-box';
  
  // Check if content overflows
  const slideContent = slide.querySelector('.slide-content') || slide;
  const contentHeight = slideContent.scrollHeight;
  const containerHeight = slideContent.clientHeight;
  
  if (contentHeight > containerHeight) {
    // If content is taller than container, adjust font sizes slightly
    const textElements = slide.querySelectorAll('p, li');
    textElements.forEach(el => {
      const currentSize = window.getComputedStyle(el).fontSize;
      const newSize = parseFloat(currentSize) * 0.95;
      el.style.fontSize = `${newSize}px`;
    });
  }
}

// Function to fix slide positioning
function fixSlidePositioning() {
  document.querySelectorAll('.reveal .slides section').forEach(slide => {
    slide.style.height = '700px';
    slide.style.boxSizing = 'border-box';
    
    // Make sure the content doesn't overflow
    if (slide.scrollHeight > slide.clientHeight) {
      // Add a subtle scrollbar if needed
      slide.style.overflowY = 'auto';
    }
  });
}

// Initialize theme toggle functionality
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-switch');
  const htmlElement = document.documentElement;
  const darkTheme = document.getElementById('theme-dark');
  const lightTheme = document.getElementById('theme-light');
  
  // Set initial state from localStorage or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', currentTheme);
  
  // Set the correct theme stylesheet
  if (currentTheme === 'light') {
    darkTheme.disabled = true;
    lightTheme.disabled = false;
  } else {
    darkTheme.disabled = false;
    lightTheme.disabled = true;
  }
  
  // Add click event to toggle button
  themeToggleBtn.addEventListener('click', toggleTheme);
}

// Toggle between dark and light themes
function toggleTheme() {
  const htmlElement = document.documentElement;
  const darkTheme = document.getElementById('theme-dark');
  const lightTheme = document.getElementById('theme-light');
  const currentTheme = htmlElement.getAttribute('data-theme');
  
  // Toggle the theme
  if (currentTheme === 'dark') {
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    darkTheme.disabled = true;
    lightTheme.disabled = false;
  } else {
    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    darkTheme.disabled = false;
    lightTheme.disabled = true;
  }
  
  // Redraw charts with new theme colors
  initCharts();
  
  // Update SVG text colors
  updateSvgTextColors();
  
  // Force correct colors on the dispute text
  forceDisputeTextColor();
}

// Initialize charts using Chart.js
function initCharts() {
  // Get theme colors
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Destroy existing charts to prevent duplicates
  destroyChartIfExists('growthChart');
  destroyChartIfExists('fundingChart');
  destroyChartIfExists('volumeComparisonChart'); 
  
  // Create Growth Chart
  createGrowthChart(textColor, gridColor);
  
  // Create Funding Allocation Chart
  createFundingChart(textColor);

  // Create Volume Comparison Chart
  createVolumeComparisonChart(textColor, gridColor, isDarkTheme);
}

// Helper function to destroy chart if it exists
function destroyChartIfExists(chartId) {
  const chartInstance = Chart.getChart(chartId);
  if (chartInstance) {
    chartInstance.destroy();
  }
}

// Function to create growth chart
function createGrowthChart(textColor, gridColor) {
  const growthCtx = document.getElementById('growthChart');
  if (!growthCtx) return;
  
  // Use explicit hex colors instead of CSS variables
  const primaryColor = '#605cff'; // Main blue
  
  new Chart(growthCtx, {
    type: 'line',
    data: {
      labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      datasets: [{
        label: 'Blended Revenue Forecast',
        data: [0.75, 3.5, 11.5, 32.5, 80],
        borderColor: primaryColor,
        backgroundColor: `${primaryColor}20`, // Light fill
        fill: true,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#FFFFFF',
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: textColor,
            font: {
              family: "'IBM Plex Mono', monospace",
              size: 12
            },
            boxWidth: 15,
            usePointStyle: false,
            generateLabels: function(chart) {
              const defaultLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              defaultLabels.forEach(label => {
                label.fillStyle = primaryColor; // Use solid color for the legend key
              });
              return defaultLabels;
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Revenue: $${context.raw}M`;
            }
          }
        },
        datalabels: {
          display: true,
          formatter: function(value, context) {
            return `$${value}M`;
          },
          color: '#ffffff',
          backgroundColor: primaryColor,
          borderRadius: 4,
          padding: 6,
          font: {
            weight: 'bold',
            size: 11
          },
          anchor: 'end',
          align: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100, // Cap at $100M for better visualization
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            callback: function(value) {
              return `$${value}M`;
            },
            font: {
              size: 11
            }
          },
          title: {
            display: true,
            text: 'Revenue (Millions $)',
            color: textColor,
            font: {
              family: "'Space Grotesk', sans-serif",
              size: 12
            }
          }
        },
        x: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          }
        }
      }
    }
  });
}

// Helper function to add growth labels
function addGrowthLabels(canvas) {
  if (!canvas) return;
  
  const chart = Chart.getChart(canvas);
  if (!chart) return;
  
  const ctx = canvas.getContext('2d');
  const multipliers = ['', '4.6x', '3.3x', '2.8x', '2.5x'];
  const primaryColor = '#00C49F'; // Success color for multipliers
  
  ctx.save();
  ctx.font = "bold 11px 'IBM Plex Mono', monospace";
  ctx.fillStyle = primaryColor;
  ctx.textAlign = 'center';
  
  // Get positions for each data point
  const meta = chart.getDatasetMeta(0);
  
  // Add multiplier labels above each point (skip the first one)
  for (let i = 1; i < meta.data.length; i++) {
    const point = meta.data[i];
    const x = point.x;
    const y = point.y - 30; // Position above the point
    
    ctx.fillText(multipliers[i], x, y);
  }
  
  ctx.restore();
}

// Function to create funding chart
function createFundingChart(textColor) {
  const fundingCtx = document.getElementById('fundingChart');
  if (!fundingCtx) return;
  
  // Get current theme to adjust text colors
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // Use explicit hex colors following our consistent palette
  const primaryColor = '#605cff'; // Main blue - Product & R&D
  const secondaryColor = '#00C49F'; // Teal - Operations & Compliance
  const accentColor = '#FFB142'; // Orange - Sales & Marketing
  
  // Set text colors based on theme
  const labelColor = isDarkTheme ? '#ffffff' : '#121212';
  
  new Chart(fundingCtx, {
    type: 'pie',
    data: {
      labels: ['Product, Engineering, R&D', 'Operations + Compliance', 'Sales & Marketing'],
      datasets: [{
        data: [80, 12, 8],
        backgroundColor: [
          `${primaryColor}20`, // Semi-transparent fills
          `${secondaryColor}20`,
          `${accentColor}20`
        ],
        borderColor: [
          primaryColor,
          secondaryColor,
          accentColor
        ],
        borderWidth: 3 // Thicker border to match our styling
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: labelColor, // Use our theme-aware color
            font: {
              family: "'IBM Plex Mono', monospace",
              size: 11
            },
            boxWidth: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        },
        datalabels: {
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets[0].data;
            dataArr.map(data => {
              sum += data;
            });
            let percentage = (value*100 / sum).toFixed(0) + "%";
            return percentage;
          },
          color: function(context) {
            // Use the segment's border color for light mode, white for dark mode
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
              return '#ffffff';
            } else {
              // Return the border color of the segment
              const i = context.dataIndex;
              const borderColors = context.chart.data.datasets[0].borderColor;
              return borderColors[i];
            }
          },
          font: {
            weight: 'bold',
            family: "'Space Grotesk', sans-serif",
            size: 14
          }
        }
      }
    }
  });
}

// Function to create Volume Comparison Chart
function createVolumeComparisonChart(textColor, gridColor, isDarkTheme) {
  const volumeCtx = document.getElementById('volumeComparisonChart');
  if (!volumeCtx) return;

  // Using colors from slide 5's sector items
  // These colors match the colored text containers in the market segments
  const stablecoinColor = '#605cff'; // Global B2B (primary blue)
  const visaColor = '#00C49F'; // High-Value B2B (teal)
  const mastercardColor = '#FFB142'; // E-commerce (orange)

  new Chart(volumeCtx, {
    type: 'bar',
    data: {
      labels: ['Stablecoins', 'Visa', 'Mastercard'],
      datasets: [{
        label: 'Transaction Volume (Trillion $)',
        data: [27.6, 14.8, 10.9],
        backgroundColor: [
          `${stablecoinColor}20`, // Adding transparency (20 = 12.5% opacity)
          `${visaColor}20`,
          `${mastercardColor}20`
        ],
        borderColor: [
          stablecoinColor,
          visaColor,
          mastercardColor
        ],
        borderWidth: 3,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
            display: true,
            text: 'Stablecoins vs Visa vs Mastercard Volume (2024)',
            color: textColor,
            font: {
                family: "'Space Grotesk', sans-serif",
                size: 16,
                weight: 'bold'
            },
            padding: { top: 5, bottom: 15 }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Volume: $${context.raw}T`;
            }
          }
        },
        datalabels: {
            display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            callback: function(value) {
              return `$${value}T`;
            },
            font: {
              family: "'IBM Plex Mono', monospace",
              size: 10
            }
          },
          title: {
            display: true,
            text: 'Volume ($ Trillion)',
            color: textColor,
            font: {
                family: "'Space Grotesk', sans-serif",
                size: 11,
                weight: 'normal'
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            font: {
              family: "'Space Grotesk', sans-serif",
              size: 11
            }
          }
        }
      }
    }
  });
}

// Function to create placeholder images
function createPlaceholderImages() {
  // List of placeholder images we need
  const placeholders = [
    'logo-placeholder.svg',
    'flow-placeholder.svg',
    'process-placeholder.svg',
    'partners-placeholder.svg',
    'customers-placeholder.svg',
    'person-placeholder.svg'
  ];
  
  // Create placeholder directory if it doesn't exist
  const checkImagesDir = async () => {
    try {
      // This will just check if images are loading, and if not, we'll show console messages
      console.log('Checking for placeholder images...');
    } catch (err) {
      console.warn('Could not verify image directory, using fallbacks');
    }
  };
  
  checkImagesDir();
  
  // Log placeholders (in a real implementation, we would create these server-side)
  console.log('Remember to create these placeholder SVG images:');
  placeholders.forEach(placeholder => {
    console.log(`- assets/images/${placeholder}`);
  });
} 