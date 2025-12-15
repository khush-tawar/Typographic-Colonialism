// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHIC COLONIALISM - STYLE GUIDE
// ═══════════════════════════════════════════════════════════════════════════════
// 
// This is the canonical style guide for all visualizations in this project.
// Import this in every Observable notebook cell that needs styling.
//
// Usage: 
//   style = await FileAttachment("style_guide.js").text().then(eval)
//   // or copy the styleGuide object directly
//
// ═══════════════════════════════════════════════════════════════════════════════

styleGuide = ({
  
  // ─────────────────────────────────────────────────────────────────────────────
  // COLORS
  // ─────────────────────────────────────────────────────────────────────────────
  colors: {
    // BACKGROUNDS
    background: "#E8E5DA",          // Primary WSJ paper background
    backgroundAlt: "#F5F3EE",       // Secondary/elevated surfaces (cards, panels)
    backgroundDark: "#1a1a2e",      // Dark mode / 3D scenes
    
    // TEXT HIERARCHY
    textPrimary: "#2A2A2A",         // Headlines, key numbers
    textSecondary: "#3A3A3A",       // Section headers
    textBody: "#666666",            // Body text, descriptions
    textMuted: "#7A7A7A",           // Captions, labels
    textSubtle: "#888888",          // Secondary labels
    textDisabled: "#999999",        // Disabled/hint text
    
    // BORDERS & LINES
    borderStrong: "#5A5A5A",        // Primary borders, dividers
    borderMedium: "#9A9A9A",        // Secondary dividers
    borderLight: "#D8D6CB",         // Subtle dividers, table borders
    
    // ACCENT - Primary highlight color
    accent: "#2A9D8F",              // Teal - primary interactive/highlight
    accentHover: "#41B3A3",         // Lighter teal on hover
    
    // STATUS COLORS (for script inequality)
    statusDominant: "#2A9D8F",      // Latin/well-supported (teal)
    statusPrivileged: "#41B3A3",    // Good coverage (light teal)
    statusStruggling: "#E27D60",    // Moderate inequality (coral)
    statusNeglected: "#C74848",     // Severe inequality (red)
    statusNotoOnly: "#9c27b0",      // Noto dependency (purple)
    
    // DATA PALETTES
    // Use for categorical data - sorted by visual importance
    palettePrimary: [
      "#C74848",  // Red - attention/warning
      "#E27D60",  // Coral
      "#E8A87C",  // Peach
      "#41B3A3",  // Teal light
      "#659DBD",  // Blue
      "#8E8E93",  // Gray
      "#BC6C25",  // Brown
      "#DDA15E",  // Tan
      "#6A994E",  // Green
      "#A7C957"   // Lime
    ],
    
    // Alternative palette - more muted, professional
    paletteSecondary: [
      "#2A9D8F",  // Teal
      "#E76F51",  // Salmon
      "#F4A261",  // Orange
      "#E9C46A",  // Yellow
      "#264653",  // Dark blue
      "#8E8E93",  // Gray
      "#A8DADC",  // Light blue
      "#457B9D",  // Steel blue
      "#1D3557",  // Navy
      "#F1FAEE"   // Off-white
    ],
    
    // Sequential gradient for magnitude
    gradientCool: ["#264653", "#2A9D8F", "#41B3A3", "#A8DADC", "#E8E5DA"],
    gradientWarm: ["#C74848", "#E27D60", "#E8A87C", "#F4A261", "#E9C46A"],
    gradientDiverging: ["#C74848", "#E8A87C", "#E8E5DA", "#A8DADC", "#2A9D8F"],
    
    // Category-specific shades (for ring charts)
    categoryOpacity: {
      "sans-serif": 0.5,
      "serif": 0.4,
      "display": 0.3,
      "handwriting": 0.2,
      "monospace": 0.1
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────────
  typography: {
    // Font stack
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    fontFamilyMono: "'SF Mono', 'Monaco', 'Consolas', monospace",
    
    // HEADLINES - Major section titles
    h1: {
      fontSize: "24px",
      fontWeight: "700",
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "#3A3A3A",
      lineHeight: "1.2"
    },
    
    // SECTION HEADERS - Chart titles
    h2: {
      fontSize: "18px",
      fontWeight: "700",
      letterSpacing: "3px",
      textTransform: "uppercase",
      color: "#3A3A3A",
      lineHeight: "1.3"
    },
    
    // SUBSECTION - Table headers, legend titles
    h3: {
      fontSize: "14px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      textTransform: "uppercase",
      color: "#3A3A3A",
      lineHeight: "1.4"
    },
    
    // SMALL CAPS - Panel titles, category labels
    h4: {
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "#3A3A3A",
      lineHeight: "1.4"
    },
    
    // OVERLINE - Section labels above content
    overline: {
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "#7A7A7A",
      lineHeight: "1.5"
    },
    
    // BODY TEXT
    body: {
      fontSize: "13px",
      fontWeight: "400",
      letterSpacing: "0",
      color: "#3A3A3A",
      lineHeight: "1.7"
    },
    
    // SMALL BODY
    bodySmall: {
      fontSize: "11px",
      fontWeight: "400",
      letterSpacing: "0",
      color: "#666666",
      lineHeight: "1.6"
    },
    
    // CAPTION - Figure captions
    caption: {
      fontSize: "10px",
      fontWeight: "400",
      fontStyle: "italic",
      letterSpacing: "0",
      color: "#7A7A7A",
      lineHeight: "1.5"
    },
    
    // DATA LABEL - Numbers, values
    dataLarge: {
      fontSize: "48px",
      fontWeight: "300",
      letterSpacing: "-1px",
      color: "#2A2A2A",
      lineHeight: "1"
    },
    
    dataMedium: {
      fontSize: "18px",
      fontWeight: "700",
      letterSpacing: "0",
      color: "#2A2A2A",
      lineHeight: "1.2"
    },
    
    dataSmall: {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0",
      color: "#3A3A3A",
      lineHeight: "1.4"
    },
    
    // TABLE HEADER
    tableHeader: {
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1px",
      textTransform: "uppercase",
      color: "#3A3A3A",
      lineHeight: "1.4"
    },
    
    // LABEL - Axis labels, annotations
    label: {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0",
      color: "#2A2A2A",
      lineHeight: "1.4"
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // SPACING & LAYOUT
  // ─────────────────────────────────────────────────────────────────────────────
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "40px",
    xxl: "60px",
    
    // Standard chart margins
    chartMargin: {
      top: 100,
      right: 60,
      bottom: 80,
      left: 80
    },
    
    // Panel padding
    panelPadding: "20px",
    cardPadding: "16px"
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // COMPONENTS
  // ─────────────────────────────────────────────────────────────────────────────
  components: {
    // INFO PANEL (top-right corner boxes)
    infoPanel: {
      background: "#F5F3EE",
      borderLeft: "3px solid #5A5A5A",
      padding: "16px",
      borderRadius: "0"
    },
    
    // KEY INSIGHT BOX
    insightBox: {
      background: "#F5F3EE",
      borderLeft: "3px solid #5A5A5A",
      padding: "20px",
      borderRadius: "0"
    },
    
    // TOOLTIP
    tooltip: {
      background: "rgba(42, 42, 42, 0.95)",
      color: "#E8E5DA",
      padding: "12px 16px",
      borderRadius: "4px",
      fontSize: "11px",
      lineHeight: "1.6"
    },
    
    // BUTTON
    button: {
      background: "#5A5A5A",
      backgroundHover: "#3A3A3A",
      color: "#E8E5DA",
      padding: "14px 24px",
      border: "none",
      borderRadius: "0",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "1.5px",
      textTransform: "uppercase"
    },
    
    // TABLE
    table: {
      background: "#F5F3EE",
      headerBackground: "#D8D6CB",
      headerBorder: "2px solid #5A5A5A",
      rowBorder: "1px solid #D8D6CB",
      cellPadding: "12px 16px"
    },
    
    // DIVIDER LINE (under headers)
    divider: {
      stroke: "#5A5A5A",
      strokeWidth: 2
    },
    
    // DIVIDER LINE (secondary)
    dividerLight: {
      stroke: "#9A9A9A",
      strokeWidth: 1
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CHART ELEMENTS
  // ─────────────────────────────────────────────────────────────────────────────
  chart: {
    // Grid lines
    gridLine: {
      stroke: "#D8D6CB",
      strokeWidth: 1,
      strokeDasharray: "3,3"
    },
    
    // Axis line
    axisLine: {
      stroke: "#5A5A5A",
      strokeWidth: 2
    },
    
    // Highlight line (reference, e.g., 1984)
    highlightLine: {
      stroke: "#2A9D8F",
      strokeWidth: 2
    },
    
    // Data point stroke
    dataStroke: {
      stroke: "#E8E5DA",
      strokeWidth: 2
    },
    
    // Connection/link lines
    link: {
      strokeOpacity: 0.3,
      strokeWidth: 1
    },
    
    // Hover state
    hover: {
      stroke: "#FFFFFF",
      strokeWidth: 2,
      filter: "brightness(1.15)"
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FIGURE CAPTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  figures: {
    // Format: "Fig N. Title"
    titleStyle: {
      fontSize: "13px",
      fontWeight: "700",
      color: "#3A3A3A",
      textAlign: "center"
    },
    
    // Format: "Subtitle/description"
    subtitleStyle: {
      fontSize: "10px",
      fontStyle: "italic",
      color: "#666666",
      textAlign: "center",
      marginTop: "4px"
    }
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ANIMATION
  // ─────────────────────────────────────────────────────────────────────────────
  animation: {
    durationFast: 150,
    durationMedium: 300,
    durationSlow: 500,
    durationChart: 800,
    easing: "ease-out",
    staggerDelay: 10
  },
  
  // ─────────────────────────────────────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Get script status color based on inequality ratio
  getStatusColor: function(inequalityRatio, isNotoOnly = false, isLatin = false) {
    if (isLatin) return this.colors.statusDominant;
    if (isNotoOnly) return this.colors.statusNotoOnly;
    if (inequalityRatio < 2) return this.colors.statusPrivileged;
    if (inequalityRatio < 10) return this.colors.statusStruggling;
    return this.colors.statusNeglected;
  },
  
  // Get color from palette by index
  getPaletteColor: function(index, palette = "primary") {
    const colors = palette === "secondary" 
      ? this.colors.paletteSecondary 
      : this.colors.palettePrimary;
    return colors[index % colors.length];
  },
  
  // Apply typography style to D3 selection
  applyTypography: function(selection, styleName) {
    const style = this.typography[styleName];
    if (!style) return selection;
    
    return selection
      .style("font-size", style.fontSize)
      .style("font-weight", style.fontWeight)
      .style("letter-spacing", style.letterSpacing)
      .style("fill", style.color)
      .style("text-transform", style.textTransform || "none")
      .style("font-style", style.fontStyle || "normal");
  },
  
  // Create a standard header with underline
  createHeader: function(container, text, x, y, width = 240) {
    const g = container.append("g")
      .attr("transform", `translate(${x}, ${y})`);
    
    g.append("text")
      .style("font-size", this.typography.h2.fontSize)
      .style("font-weight", this.typography.h2.fontWeight)
      .style("letter-spacing", this.typography.h2.letterSpacing)
      .style("fill", this.typography.h2.color)
      .text(text);
    
    g.append("line")
      .attr("x1", 0)
      .attr("y1", 14)
      .attr("x2", width)
      .attr("y2", 14)
      .attr("stroke", this.colors.borderStrong)
      .attr("stroke-width", 2);
    
    return g;
  },
  
  // Create a figure caption
  createCaption: function(container, figNum, title, subtitle, x, y) {
    const g = container.append("g")
      .attr("transform", `translate(${x}, ${y})`);
    
    g.append("text")
      .attr("text-anchor", "middle")
      .style("font-size", this.figures.titleStyle.fontSize)
      .style("font-weight", this.figures.titleStyle.fontWeight)
      .style("fill", this.figures.titleStyle.color)
      .text(`Fig ${figNum}. ${title}`);
    
    if (subtitle) {
      g.append("text")
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .style("font-size", this.figures.subtitleStyle.fontSize)
        .style("font-style", this.figures.subtitleStyle.fontStyle)
        .style("fill", this.figures.subtitleStyle.color)
        .text(subtitle);
    }
    
    return g;
  },
  
  // Create an info panel
  createInfoPanel: function(container, x, y, width = 280, height = 150) {
    const g = container.append("g")
      .attr("transform", `translate(${x}, ${y})`);
    
    // Background
    g.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", this.components.infoPanel.background);
    
    // Left border
    g.append("rect")
      .attr("width", 3)
      .attr("height", height)
      .attr("fill", this.colors.borderStrong);
    
    return g;
  },
  
  // SVG base styles
  svgBaseStyles: function() {
    return `
      background: ${this.colors.background};
      font-family: ${this.typography.fontFamily};
    `;
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════
/*

// 1. BASIC SVG SETUP
const svg = d3.create("svg")
  .attr("viewBox", [0, 0, width, height])
  .style("background", styleGuide.colors.background)
  .style("font-family", styleGuide.typography.fontFamily);

// 2. ADD A HEADER
styleGuide.createHeader(svg, "GLOBAL FONTS", 60, 50);

// 3. ADD A FIGURE CAPTION
styleGuide.createCaption(svg, 1, "Font Distribution by Script", 
  "Inner ring: scripts • Outer ring: fonts", width/2, height - 60);

// 4. USE TYPOGRAPHY
svg.append("text")
  .call(sel => styleGuide.applyTypography(sel, "h2"))
  .text("Section Title");

// 5. GET STATUS COLOR
const color = styleGuide.getStatusColor(d.inequalityRatio, d.isNotoOnly, d.code === "Latn");

// 6. USE PALETTE
scripts.forEach((script, i) => {
  const color = styleGuide.getPaletteColor(i);
});

// 7. CREATE INFO PANEL
const panel = styleGuide.createInfoPanel(svg, width - 300, 30, 280, 150);
panel.append("text")
  .attr("x", 16).attr("y", 22)
  .call(sel => styleGuide.applyTypography(sel, "overline"))
  .text("SELECTION DETAILS");

*/
