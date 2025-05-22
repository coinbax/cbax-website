/**
 * CBAX Responsive Website JavaScript
 * Handles continuous scroll, responsive layout, and interactive elements
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize components
  initThemeToggle();
  initProgressBar();
  initScrollEffects();
  initCharts();
  initSmoothScrolling();
  initActiveSection();
  initTocDropdown();
  initLightbox();
  
  // Handle theme changes
  window.addEventListener('themechange', function() {
    initCharts(); // Redraw charts when theme changes
    updateSvgColors(); // Update SVG colors on theme change
  });
  
  // Register resize handler
  window.addEventListener('resize', debounce(function() {
    initCharts(); // Redraw charts on resize
  }, 250));
  
  // Call this once after page load to ensure SVGs use correct colors
  updateSvgColors();
  
  // Attach PDF export handler
  const exportBtn = document.getElementById('export-pdf');
  const mobileExportBtn = document.getElementById('mobile-export-pdf');
  const closingExportBtn = document.getElementById('export-pdf-closing');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      exportPDF();
    });
  }
  
  if (mobileExportBtn) {
    mobileExportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      exportPDF();
    });
  }

  if (closingExportBtn) {
    closingExportBtn.addEventListener('click', function(e) {
      e.preventDefault();
      exportPDF();
    });
  }
});

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-switch');
  const htmlElement = document.documentElement;
  
  if (!themeToggleBtn) return;
  
  // Set initial state from localStorage or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', currentTheme);
  
  // Add click event to toggle button
  themeToggleBtn.addEventListener('click', function() {
    toggleTheme();
  });
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
  const htmlElement = document.documentElement;
  const currentTheme = htmlElement.getAttribute('data-theme');
  
  // Toggle the theme
  if (currentTheme === 'dark') {
    htmlElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    htmlElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  
  // Dispatch theme change event
  window.dispatchEvent(new Event('themechange'));
}

/**
 * Initialize progress bar for scroll tracking
 */
function initProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  
  if (!progressBar) return;
  
  window.addEventListener('scroll', function() {
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    progressBar.style.width = progress + '%';
  });
}

/**
 * Initialize TOC dropdown for mobile
 */
function initTocDropdown() {
  const tocDropdownBtn = document.querySelector('.toc-dropdown-btn');
  const tocDropdownContent = document.querySelector('.toc-dropdown-content');
  
  if (!tocDropdownBtn || !tocDropdownContent) return;
  
  // Toggle dropdown on button click
  tocDropdownBtn.addEventListener('click', function() {
    tocDropdownContent.classList.toggle('open');
    tocDropdownBtn.classList.toggle('active');
  });
  
  // Close dropdown when a link is clicked
  const dropdownLinks = tocDropdownContent.querySelectorAll('a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', function() {
      tocDropdownContent.classList.remove('open');
      tocDropdownBtn.classList.remove('active');
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (!tocDropdownBtn.contains(event.target) && 
        !tocDropdownContent.contains(event.target)) {
      tocDropdownContent.classList.remove('open');
      tocDropdownBtn.classList.remove('active');
    }
  });
  
  // Update active link in dropdown based on current section
  window.addEventListener('scroll', debounce(function() {
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (window.pageYOffset >= sectionTop - 100 && 
          window.pageYOffset < sectionTop + sectionHeight - 100) {
        currentSection = section.getAttribute('id');
      }
    });
    
    dropdownLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }, 100));
}

/**
 * Highlight active section in TOC based on scroll position
 */
function initActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const tocLinks = document.querySelectorAll('.toc-links a, .toc-horizontal a, .toc-dropdown-content a');
  
  if (sections.length === 0 || tocLinks.length === 0) return;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Get the id of the section that is currently visible
        const id = entry.target.getAttribute('id');
        
        // Remove 'active' class from all links
        tocLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);
  
  // Observe all sections
  sections.forEach(section => {
    observer.observe(section);
  });
  
  // Also update active section on scroll for better responsiveness
  window.addEventListener('scroll', debounce(function() {
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (window.pageYOffset >= sectionTop - 100 && 
          window.pageYOffset < sectionTop + sectionHeight - 100) {
        currentSection = section.getAttribute('id');
      }
    });
    
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }, 100));
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // Ignore empty anchors
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      // Add offset for fixed header
      const headerHeight = document.querySelector('.header').offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Initialize scroll effects (fade-in animations, etc.)
 */
function initScrollEffects() {
  // Fade-in elements as they come into view
  const fadeElements = document.querySelectorAll('.fade-in');
  
  if (fadeElements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  fadeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(element);
  });
}

/**
 * Initialize charts using Chart.js
 */
function initCharts() {
  if (typeof Chart === 'undefined') return;
  
  // Destroy existing charts first
  destroyChartIfExists('growthChart');
  destroyChartIfExists('fundingChart');
  destroyChartIfExists('volumeComparisonChart');
  
  // Get theme colors
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  // Create charts
  createGrowthChart(textColor, gridColor);
  createFundingChart(textColor);
  createVolumeComparisonChart(textColor, gridColor, isDarkTheme);
}

/**
 * Helper function to destroy existing chart instances
 */
function destroyChartIfExists(chartId) {
  if (typeof Chart === 'undefined') return;
  
  const chartInstance = Chart.getChart(chartId);
  if (chartInstance) {
    chartInstance.destroy();
  }
}

/**
 * Create Growth Chart
 */
function createGrowthChart(textColor, gridColor) {
  const growthCtx = document.getElementById('growthChart');
  if (!growthCtx) return;
  
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
            usePointStyle: false
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
          formatter: function(value) {
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

/**
 * Create Funding Chart
 */
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
          formatter: (value) => {
            return value + '%';
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

/**
 * Create Volume Comparison Chart
 */
function createVolumeComparisonChart(textColor, gridColor, isDarkTheme) {
  const volumeCtx = document.getElementById('volumeComparisonChart');
  if (!volumeCtx) return;

  // Using colors from slide 5's sector items
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
          `${stablecoinColor}20`, // 20 = 12.5% opacity
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

/**
 * Utility function for debouncing function calls
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

/**
 * Update SVG colors based on theme
 */
function updateSvgColors() {
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDarkTheme ? '#ffffff' : '#121212';
  const accentColor = isDarkTheme ? '#ffffff' : '#ff5c5c';
  
  // Update SVG text elements
  document.querySelectorAll('.cbax-diagram-text, .cbax-flow-text, .cbax-diagram-title').forEach(element => {
    element.setAttribute('fill', textColor);
  });
  
  document.querySelectorAll('.cbax-diagram-text-accent, .cbax-flow-box-accent + .cbax-flow-text').forEach(element => {
    element.setAttribute('fill', accentColor);
  });
  
  // Update caption text
  document.querySelectorAll('.cbax-diagram-caption').forEach(element => {
    element.setAttribute('fill', isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)');
  });
}

/**
 * Show loading state for infinite scroll
 */
function showLoading() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'block';
  }
}

/**
 * Hide loading state for infinite scroll
 */
function hideLoading() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
}

/**
 * PDF Export functionality
 */
function exportPDF() {
    const clickedBtn = event.target;
    const originalText = clickedBtn.textContent;
    clickedBtn.textContent = 'Preparing PDF...';
    clickedBtn.disabled = true;
    clickedBtn.style.backgroundColor = '#999';

    const originalTheme = document.documentElement.getAttribute('data-theme');
    const bodyEl = document.body;
    const htmlEl = document.documentElement;

    // Store original canvases to restore them later
    const originalCanvases = new Map();
    document.querySelectorAll('canvas').forEach(canvas => {
        if (canvas.id) { // Ensure canvas has an ID
            originalCanvases.set(canvas.id, {
                element: canvas.cloneNode(true),
                parent: canvas.parentNode
            });
        }
    });

    const prepareForPrint = async () => {
        // Switch to light theme
        htmlEl.setAttribute('data-theme', 'light');
        // Dispatch themechange for SVGs and other elements that might adapt
        window.dispatchEvent(new Event('themechange')); 
        // A small delay for theme changes to apply visually if needed by charts before conversion
        await new Promise(resolve => setTimeout(resolve, 50));


        // Add printing class to apply print-specific styles
        bodyEl.classList.add('printing-active');

        // Convert charts to images
        const chartConversionPromises = [];
        document.querySelectorAll('canvas').forEach(canvas => {
            const chartId = canvas.id;
            if (!chartId) return; // Skip canvases without ID

            const chartInstance = Chart.getChart(chartId);
            if (chartInstance) {
                const promise = new Promise((resolve, reject) => {
                    try {
                        const img = new Image();
                        img.onload = () => {
                            if (canvas.parentNode) {
                                canvas.parentNode.replaceChild(img, canvas);
                            }
                            resolve();
                        };
                        img.onerror = (err) => {
                            console.error(`Failed to load image for chart ${chartId}:`, err);
                            const placeholder = document.createElement('div');
                            placeholder.className = 'chart-render-error';
                            placeholder.textContent = `[Chart: ${chartId} - Failed to render for PDF]`;
                            if (canvas.parentNode) {
                                canvas.parentNode.replaceChild(placeholder, canvas);
                            }
                            resolve(); // Resolve even on error to not block printing
                        };
                        img.src = chartInstance.toBase64Image();
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.display = 'block'; // Ensure it takes space
                        img.setAttribute('data-chart-id', chartId); // Mark for restoration
                    } catch (e) {
                        console.error(`Error converting chart ${chartId} to image:`, e);
                        const placeholder = document.createElement('div');
                        placeholder.className = 'chart-render-error';
                        placeholder.textContent = `[Chart: ${chartId} - Error during conversion]`;
                        if (canvas.parentNode) {
                            canvas.parentNode.replaceChild(placeholder, canvas);
                        }
                        resolve(); // Resolve
                    }
                });
                chartConversionPromises.push(promise);
            }
        });

        try {
            await Promise.all(chartConversionPromises);
        } catch (error) {
            console.error("Error during chart conversions:", error);
            // Proceed anyway, some charts might be missing
        }
        
        // Small delay to ensure DOM is updated with images and styles are applied
        await new Promise(resolve => setTimeout(resolve, 300));
    };

    const cleanupAfterPrint = () => {
        bodyEl.classList.remove('printing-active');
        htmlEl.setAttribute('data-theme', originalTheme);

        // Restore canvases
        document.querySelectorAll('img[data-chart-id]').forEach(imgPlaceholder => {
            const chartId = imgPlaceholder.getAttribute('data-chart-id');
            if (originalCanvases.has(chartId)) {
                const originalCanvasInfo = originalCanvases.get(chartId);
                if (imgPlaceholder.parentNode) {
                    imgPlaceholder.parentNode.replaceChild(originalCanvasInfo.element, imgPlaceholder);
                }
            }
        });
        // Also remove error placeholders if any
         document.querySelectorAll('.chart-render-error').forEach(placeholder => {
            // This part needs to know which canvas to restore. Assuming ID convention.
            // For simplicity, if its ID was based on chartId, we could try to restore.
            // This example is simplified, proper restoration might need more context.
            if(placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
         });


        initCharts(); // Re-initialize all charts

        window.dispatchEvent(new Event('themechange'));

        clickedBtn.textContent = originalText;
        clickedBtn.disabled = false;
        clickedBtn.style.backgroundColor = '';
    };

    const printMediaQuery = window.matchMedia('print');
    let printDialogOpened = false;

    const handlePrintMediaChange = (mql) => {
        if (mql.matches) {
            // This means the print dialog is about to be shown or is shown.
            printDialogOpened = true;
        } else {
            // This means the print dialog has been closed.
            if (printDialogOpened) { // Ensure it was opened by this instance
                cleanupAfterPrint();
                printMediaQuery.removeEventListener('change', handlePrintMediaChange); // Use 'change' for modern browsers
            }
        }
    };
    
    // For modern browsers, the 'change' event is preferred.
    printMediaQuery.addEventListener('change', handlePrintMediaChange);
    
    // Fallback for older browsers or immediate cancellation.
    // `window.onafterprint` is an option but not universally supported for cancellations.
    // This timeout is a less reliable fallback.
    let fallbackTimeout = setTimeout(() => {
        if (printDialogOpened) { // If dialog was opened but 'change' didn't fire for closing (unlikely with modern browsers)
             // cleanupAfterPrint(); // Be cautious with this, could interfere
             // printMediaQuery.removeEventListener('change', handlePrintMediaChange);
        }
    }, 5000); // 5 seconds to assume print was cancelled if no other event.

    prepareForPrint()
        .then(() => {
            window.print();
            // Note: `window.print()` is blocking in most browsers.
            // The `handlePrintMediaChange` listener will handle cleanup.
            // If it's cancelled very quickly, the `mql.matches` might go false almost immediately.
        })
        .catch(error => {
            console.error('Error preparing for print:', error);
            cleanupAfterPrint(); // Ensure cleanup on error
            printMediaQuery.removeEventListener('change', handlePrintMediaChange);
            clearTimeout(fallbackTimeout);
        });
}

/**
 * Initialize lightbox for images
 */
function initLightbox() {
  // Get the modal
  const modal = document.getElementById('lightbox-modal');
  if (!modal) return;
  
  // Get the image and insert it inside the modal
  const lightboxImages = document.querySelectorAll('.lightbox-image');
  const modalImg = document.getElementById('lightbox-img');
  const captionText = document.getElementById('lightbox-caption');
  
  lightboxImages.forEach(img => {
    img.addEventListener('click', function() {
      modal.style.display = "block";
      modalImg.src = this.src;
      captionText.innerHTML = this.alt;
      
      // Prevent scrolling when lightbox is open
      document.body.style.overflow = 'hidden';
    });
  });
  
  // Get the <span> element that closes the modal
  const closeBtn = document.querySelector('.lightbox-close');
  
  // When the user clicks on <span> (x), close the modal
  closeBtn.addEventListener('click', function() {
    modal.style.display = "none";
    
    // Restore scrolling
    document.body.style.overflow = '';
  });
  
  // Close modal on click outside the image
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
      
      // Restore scrolling
      document.body.style.overflow = '';
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = "none";
      
      // Restore scrolling
      document.body.style.overflow = '';
    }
  });
} 