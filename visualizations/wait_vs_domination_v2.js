// ═══════════════════════════════════════════════════════════════════════════════
// THE WAIT VS WEB DOMINATION - Observable Notebook Ready
// ═══════════════════════════════════════════════════════════════════════════════
// Uses the canonical style guide for Typography Colonialism project
// Copy each cell into Observable. This is Cell 2 (bridge visualization).

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Style Guide (copy from style_guide.js or import)
// ═══════════════════════════════════════════════════════════════════════════════
styleGuide = ({
  colors: {
    // BACKGROUNDS
    background: "#E8E5DA",
    backgroundAlt: "#F5F3EE",
    backgroundDark: "#1a1a2e",
    
    // TEXT HIERARCHY
    textPrimary: "#2A2A2A",
    textSecondary: "#3A3A3A",
    textBody: "#666666",
    textMuted: "#7A7A7A",
    textSubtle: "#888888",
    textDisabled: "#999999",
    
    // BORDERS & LINES
    borderStrong: "#5A5A5A",
    borderMedium: "#9A9A9A",
    borderLight: "#D8D6CB",
    
    // ACCENT
    accent: "#2A9D8F",
    accentHover: "#41B3A3",
    
    // STATUS COLORS
    statusDominant: "#2A9D8F",
    statusPrivileged: "#41B3A3",
    statusStruggling: "#E27D60",
    statusNeglected: "#C74848",
    statusNotoOnly: "#9c27b0",
    
    // DATA PALETTES
    palettePrimary: ["#C74848", "#E27D60", "#E8A87C", "#41B3A3", "#659DBD", "#8E8E93", "#BC6C25", "#DDA15E", "#6A994E", "#A7C957"],
    paletteSecondary: ["#2A9D8F", "#E76F51", "#F4A261", "#E9C46A", "#264653", "#8E8E93", "#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"]
  },
  
  typography: {
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    h1: { fontSize: "24px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", color: "#3A3A3A" },
    h2: { fontSize: "18px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#3A3A3A" },
    h3: { fontSize: "14px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", color: "#3A3A3A" },
    overline: { fontSize: "10px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: "#7A7A7A" },
    body: { fontSize: "13px", fontWeight: "400", color: "#3A3A3A", lineHeight: "1.7" },
    bodySmall: { fontSize: "11px", fontWeight: "400", color: "#666666" },
    caption: { fontSize: "10px", fontWeight: "400", fontStyle: "italic", color: "#7A7A7A" },
    dataLarge: { fontSize: "48px", fontWeight: "300", letterSpacing: "-1px", color: "#2A2A2A" },
    dataMedium: { fontSize: "18px", fontWeight: "700", color: "#2A2A2A" },
    label: { fontSize: "11px", fontWeight: "600", color: "#2A2A2A" }
  },
  
  components: {
    infoPanel: { background: "#F5F3EE", borderLeft: "3px solid #5A5A5A", padding: "16px" },
    tooltip: { background: "rgba(42, 42, 42, 0.95)", color: "#E8E5DA", padding: "12px 16px", borderRadius: "4px", fontSize: "11px" }
  },
  
  getStatusColor: function(inequalityRatio, isNotoOnly = false, isLatin = false) {
    if (isLatin) return this.colors.statusDominant;
    if (isNotoOnly) return this.colors.statusNotoOnly;
    if (inequalityRatio < 2) return this.colors.statusPrivileged;
    if (inequalityRatio < 10) return this.colors.statusStruggling;
    return this.colors.statusNeglected;
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Load Master Dataset
// ═══════════════════════════════════════════════════════════════════════════════
masterData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/master_dataset.json")
  .then(r => r.json())

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Load Graph Structure
// ═══════════════════════════════════════════════════════════════════════════════
graphData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/graph_structure.json")
  .then(r => r.json())

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Process & Enrich Data
// ═══════════════════════════════════════════════════════════════════════════════
processedData = {
  const timeline = masterData.digital_timeline?.scripts || {};
  const inequality = masterData.inequality_metrics || [];
  const scripts = masterData.scripts || {};
  
  const inequalityMap = new Map(inequality.map(d => [d.code, d]));
  
  const nodes = [];
  
  for (const [code, data] of Object.entries(scripts)) {
    if (data.font_count === 0) continue;
    
    const t = timeline[code] || {};
    const ineq = inequalityMap.get(code) || {};
    
    let digitalStart = t.digital_age_start || t.first_google_fonts?.year || 2010;
    const yearsAfterLatin = digitalStart - 1984;
    
    // Determine script status
    let status;
    if (code === "Latn") {
      status = "latin";
    } else if (data.font_count <= (data.noto_families?.length || 0) + 1) {
      status = "notoOnly";
    } else if ((ineq.inequality_ratio || 999) < 2) {
      status = "privileged";
    } else if ((ineq.inequality_ratio || 999) < 10) {
      status = "struggling";
    } else {
      status = "neglected";
    }
    
    nodes.push({
      id: code,
      code,
      name: data.name || code,
      digitalStart,
      yearsAfterLatin,
      inequalityRatio: ineq.inequality_ratio || 1,
      speakers: data.speakers || 0,
      fontCount: data.font_count || 0,
      status,
      fontsPerM: ineq.fonts_per_100m || 0,
      notoFamilies: data.noto_families?.length || 0,
      rtl: data.rtl || false,
      firstScalable: t.first_scalable,
      firstGoogleFonts: t.first_google_fonts
    });
  }
  
  // Get links from graph
  const scriptNetwork = graphData.d3_ready?.script_network || { nodes: [], links: [] };
  const nodeSet = new Set(nodes.map(n => n.code));
  
  const links = scriptNetwork.links
    .filter(l => nodeSet.has(l.source) && nodeSet.has(l.target))
    .map(l => ({
      source: l.source,
      target: l.target,
      value: l.value,
      isLatinLink: l.source === "Latn" || l.target === "Latn"
    }));
  
  const stats = {
    totalScripts: nodes.length,
    totalFonts: masterData.metadata?.counts?.total_fonts || 1916,
    notoOnlyCount: nodes.filter(n => n.status === "notoOnly").length,
    neglectedCount: nodes.filter(n => n.status === "neglected").length,
    latinFonts: nodes.find(n => n.code === "Latn")?.fontCount || 1900,
    maxInequality: Math.max(...nodes.map(n => n.inequalityRatio)),
    totalSpeakers: nodes.reduce((sum, n) => sum + n.speakers, 0)
  };
  
  return { nodes, links, stats };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 5: Create Scales
// ═══════════════════════════════════════════════════════════════════════════════
scales = {
  const width = 1000;
  const height = 900;
  const margin = { top: 140, right: 80, bottom: 100, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  return {
    width,
    height,
    margin,
    innerWidth,
    innerHeight,
    
    x: d3.scaleLinear().domain([1982, 2020]).range([0, innerWidth]),
    y: d3.scaleLog().domain([0.3, 100]).range([innerHeight, 0]).clamp(true),
    size: d3.scaleSqrt().domain([0, processedData.stats.latinFonts]).range([4, 50]),
    opacity: d3.scaleLog().domain([1000, 6e9]).range([0.5, 1]).clamp(true),
    
    color: (status) => ({
      latin: styleGuide.colors.statusDominant,
      privileged: styleGuide.colors.statusPrivileged,
      struggling: styleGuide.colors.statusStruggling,
      neglected: styleGuide.colors.statusNeglected,
      notoOnly: styleGuide.colors.statusNotoOnly
    })[status] || styleGuide.colors.statusNeglected
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 6: KEY SCRIPTS TO LABEL
// ═══════════════════════════════════════════════════════════════════════════════
keyScripts = ["Latn", "Arab", "Hans", "Deva", "Beng", "Cyrl", "Jpan", "Kore", "Thai", "Grek", "Hebr", "Taml"]

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 7: THE VISUALIZATION - Wait vs Web Domination
// ═══════════════════════════════════════════════════════════════════════════════
chart = {
  const { width, height, margin, innerWidth, innerHeight } = scales;
  const { nodes, links, stats } = processedData;
  
  // Create SVG with WSJ background
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("background", styleGuide.colors.background)
    .style("font-family", styleGuide.typography.fontFamily);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DEFS: Gradients & Filters
  // ─────────────────────────────────────────────────────────────────────────────
  const defs = svg.append("defs");
  
  // Glow filter for Latin
  const glow = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-100%").attr("y", "-100%")
    .attr("width", "300%").attr("height", "300%");
  glow.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
  glow.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");
  
  // Radial gradient for Latin "sun"
  const latinGrad = defs.append("radialGradient").attr("id", "latinGradient");
  latinGrad.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
  latinGrad.append("stop").attr("offset", "40%").attr("stop-color", styleGuide.colors.statusDominant);
  latinGrad.append("stop").attr("offset", "100%").attr("stop-color", styleGuide.colors.statusDominant).attr("stop-opacity", 0.7);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────────────────────
  // Main title
  svg.append("text")
    .attr("x", 60).attr("y", 45)
    .style("font-size", styleGuide.typography.h2.fontSize)
    .style("font-weight", styleGuide.typography.h2.fontWeight)
    .style("letter-spacing", styleGuide.typography.h2.letterSpacing)
    .style("fill", styleGuide.typography.h2.color)
    .text("THE WAIT VS WEB DOMINATION");
  
  // Underline
  svg.append("line")
    .attr("x1", 60).attr("y1", 58)
    .attr("x2", 420).attr("y2", 58)
    .attr("stroke", styleGuide.colors.borderStrong)
    .attr("stroke-width", 2);
  
  // Subtitle
  svg.append("text")
    .attr("x", 60).attr("y", 78)
    .style("font-size", styleGuide.typography.bodySmall.fontSize)
    .style("fill", styleGuide.colors.textBody)
    .text("How Latin script colonized digital typography—and left billions behind");
  
  svg.append("text")
    .attr("x", 60).attr("y", 94)
    .style("font-size", styleGuide.typography.bodySmall.fontSize)
    .style("fill", styleGuide.colors.textBody)
    .text(`${stats.totalScripts} scripts • ${stats.totalFonts.toLocaleString()} fonts • ${(stats.totalSpeakers / 1e9).toFixed(1)}B speakers`);
  
  // Right header
  svg.append("text")
    .attr("x", width - 60).attr("y", 45)
    .attr("text-anchor", "end")
    .style("font-size", "13px")
    .style("fill", styleGuide.colors.textMuted)
    .style("font-style", "italic")
    .text("Digital Typography Timeline");
  
  svg.append("line")
    .attr("x1", width - 300).attr("y1", 58)
    .attr("x2", width - 60).attr("y2", 58)
    .attr("stroke", styleGuide.colors.borderMedium)
    .attr("stroke-width", 2);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CHART AREA
  // ─────────────────────────────────────────────────────────────────────────────
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 0: Inequality Zones (background bands)
  // ─────────────────────────────────────────────────────────────────────────────
  const zones = [
    { y0: 0.3, y1: 2, label: "Well-supported", color: styleGuide.colors.statusPrivileged, opacity: 0.08 },
    { y0: 2, y1: 10, label: "Struggling", color: styleGuide.colors.statusStruggling, opacity: 0.06 },
    { y0: 10, y1: 100, label: "Neglected", color: styleGuide.colors.statusNeglected, opacity: 0.08 }
  ];
  
  g.append("g").attr("class", "zones")
    .selectAll("rect")
    .data(zones)
    .join("rect")
    .attr("x", 0)
    .attr("y", d => scales.y(d.y1))
    .attr("width", innerWidth)
    .attr("height", d => scales.y(d.y0) - scales.y(d.y1))
    .attr("fill", d => d.color)
    .attr("opacity", d => d.opacity);
  
  // Zone labels (right side)
  g.append("g")
    .selectAll("text")
    .data(zones)
    .join("text")
    .attr("x", innerWidth + 10)
    .attr("y", d => (scales.y(d.y0) + scales.y(d.y1)) / 2)
    .attr("dominant-baseline", "middle")
    .style("font-size", "9px")
    .style("fill", d => d.color)
    .style("opacity", 0.8)
    .text(d => d.label);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 1: Grid Lines
  // ─────────────────────────────────────────────────────────────────────────────
  // Vertical grid (years)
  const years = [1984, 1990, 1995, 2000, 2005, 2010, 2015, 2020];
  g.append("g").attr("class", "grid-x")
    .selectAll("line")
    .data(years)
    .join("line")
    .attr("x1", d => scales.x(d))
    .attr("x2", d => scales.x(d))
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", d => d === 1984 ? styleGuide.colors.accent : styleGuide.colors.borderLight)
    .attr("stroke-dasharray", d => d === 1984 ? "none" : "3,3")
    .attr("stroke-width", d => d === 1984 ? 2 : 1);
  
  // Year labels
  g.append("g")
    .selectAll("text")
    .data(years)
    .join("text")
    .attr("x", d => scales.x(d))
    .attr("y", innerHeight + 22)
    .attr("text-anchor", "middle")
    .style("font-size", d => d === 1984 ? "12px" : "10px")
    .style("font-weight", d => d === 1984 ? "700" : "400")
    .style("fill", d => d === 1984 ? styleGuide.colors.accent : styleGuide.colors.textMuted)
    .text(d => d);
  
  // 1984 annotation
  g.append("text")
    .attr("x", scales.x(1984))
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "9px")
    .style("fill", styleGuide.colors.accent)
    .text("PostScript Era");
  
  // Horizontal grid (inequality ratios)
  const yTicks = [0.5, 1, 2, 5, 10, 20, 50];
  g.append("g").attr("class", "grid-y")
    .selectAll("line")
    .data(yTicks)
    .join("line")
    .attr("x1", 0)
    .attr("x2", innerWidth)
    .attr("y1", d => scales.y(d))
    .attr("y2", d => scales.y(d))
    .attr("stroke", d => d === 1 ? styleGuide.colors.accent : styleGuide.colors.borderLight)
    .attr("stroke-dasharray", d => d === 1 ? "none" : "3,3")
    .attr("stroke-width", d => d === 1 ? 2 : 1);
  
  // Y-axis labels
  g.append("g")
    .selectAll("text")
    .data(yTicks)
    .join("text")
    .attr("x", -12)
    .attr("y", d => scales.y(d) + 4)
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .style("font-weight", d => d === 1 ? "700" : "400")
    .style("fill", d => d === 1 ? styleGuide.colors.statusPrivileged : styleGuide.colors.textMuted)
    .text(d => d === 1 ? "Equal" : `${d}×`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 2: Connection Lines
  // ─────────────────────────────────────────────────────────────────────────────
  const nodeById = new Map(nodes.map(n => [n.code, n]));
  
  const sortedLinks = [...links].sort((a, b) => (a.isLatinLink ? 1 : 0) - (b.isLatinLink ? 1 : 0));
  
  g.append("g").attr("class", "links")
    .selectAll("path")
    .data(sortedLinks)
    .join("path")
    .attr("d", d => {
      const source = nodeById.get(d.source);
      const target = nodeById.get(d.target);
      if (!source || !target) return null;
      
      const x1 = scales.x(source.digitalStart);
      const y1 = scales.y(source.inequalityRatio);
      const x2 = scales.x(target.digitalStart);
      const y2 = scales.y(target.inequalityRatio);
      
      const mx = (x1 + x2) / 2;
      const my = Math.min(y1, y2) - 15 - Math.random() * 25;
      
      return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
    })
    .attr("fill", "none")
    .attr("stroke", d => d.isLatinLink ? styleGuide.colors.accent : styleGuide.colors.borderLight)
    .attr("stroke-width", d => Math.sqrt(d.value) * 0.3 + 0.5)
    .attr("stroke-opacity", d => d.isLatinLink ? 0.25 : 0.1);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 3: Script Bubbles
  // ─────────────────────────────────────────────────────────────────────────────
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.code === "Latn") return 1;
    if (b.code === "Latn") return -1;
    return a.fontCount - b.fontCount;
  });
  
  const nodeGroup = g.append("g").attr("class", "nodes")
    .selectAll("g")
    .data(sortedNodes)
    .join("g")
    .attr("transform", d => `translate(${scales.x(d.digitalStart)}, ${scales.y(d.inequalityRatio)})`);
  
  // Main circles
  nodeGroup.append("circle")
    .attr("r", d => scales.size(d.fontCount))
    .attr("fill", d => d.code === "Latn" ? "url(#latinGradient)" : scales.color(d.status))
    .attr("fill-opacity", d => scales.opacity(Math.max(d.speakers, 1000)))
    .attr("stroke", d => d.code === "Latn" ? "#fff" : scales.color(d.status))
    .attr("stroke-width", d => d.code === "Latn" ? 3 : 1.5)
    .attr("stroke-opacity", d => d.code === "Latn" ? 0.9 : 0.4)
    .attr("filter", d => d.code === "Latn" ? "url(#glow)" : null)
    .style("cursor", "pointer");
  
  // Outer rings for key scripts
  nodeGroup.filter(d => keyScripts.includes(d.code) && d.code !== "Latn")
    .append("circle")
    .attr("r", d => scales.size(d.fontCount) + 5)
    .attr("fill", "none")
    .attr("stroke", d => scales.color(d.status))
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.3)
    .attr("stroke-dasharray", "3,3");
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 4: Labels
  // ─────────────────────────────────────────────────────────────────────────────
  const labelGroup = g.append("g").attr("class", "labels")
    .selectAll("g")
    .data(sortedNodes.filter(d => keyScripts.includes(d.code)))
    .join("g")
    .attr("transform", d => {
      const x = scales.x(d.digitalStart);
      const y = scales.y(d.inequalityRatio) - scales.size(d.fontCount) - 10;
      return `translate(${x}, ${y})`;
    });
  
  labelGroup.append("text")
    .attr("text-anchor", "middle")
    .style("font-size", d => d.code === "Latn" ? "14px" : "11px")
    .style("font-weight", d => d.code === "Latn" ? "700" : "600")
    .style("fill", styleGuide.colors.textPrimary)
    .text(d => d.name);
  
  labelGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 13)
    .style("font-size", "9px")
    .style("fill", styleGuide.colors.textMuted)
    .text(d => `${d.fontCount} fonts`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 5: Key Insight Callouts
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Han (Chinese) callout
  const hans = nodes.find(n => n.code === "Hans");
  if (hans) {
    const hx = scales.x(hans.digitalStart);
    const hy = scales.y(hans.inequalityRatio);
    
    const callout = g.append("g")
      .attr("transform", `translate(${hx + 50}, ${hy - 25})`);
    
    callout.append("line")
      .attr("x1", -45).attr("y1", 18)
      .attr("x2", 0).attr("y2", 0)
      .attr("stroke", styleGuide.colors.statusNeglected)
      .attr("stroke-dasharray", "2,2");
    
    callout.append("text")
      .style("font-size", "11px")
      .style("font-weight", "700")
      .style("fill", styleGuide.colors.statusNeglected)
      .text(`${Math.round(hans.inequalityRatio)}× inequality`);
    
    callout.append("text")
      .attr("y", 14)
      .style("font-size", "9px")
      .style("fill", styleGuide.colors.textMuted)
      .text("1.6B speakers, 10 fonts");
  }
  
  // Adlam callout
  const adlam = nodes.find(n => n.code === "Adlm");
  if (adlam) {
    const ax = scales.x(adlam.digitalStart);
    const ay = scales.y(adlam.inequalityRatio);
    
    g.append("line")
      .attr("x1", ax).attr("y1", ay + 12)
      .attr("x2", ax).attr("y2", innerHeight - 55)
      .attr("stroke", styleGuide.colors.statusNotoOnly)
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-opacity", 0.6);
    
    g.append("text")
      .attr("x", ax)
      .attr("y", innerHeight - 40)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "600")
      .style("fill", styleGuide.colors.statusNotoOnly)
      .text("Adlam: 32 years behind");
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // AXIS TITLES
  // ─────────────────────────────────────────────────────────────────────────────
  
  // X-axis
  svg.append("text")
    .attr("x", margin.left + innerWidth / 2)
    .attr("y", height - 35)
    .attr("text-anchor", "middle")
    .style("font-size", styleGuide.typography.label.fontSize)
    .style("font-weight", "700")
    .style("fill", styleGuide.colors.accent)
    .style("letter-spacing", "1px")
    .text("YEAR ENTERED DIGITAL AGE →");
  
  // Y-axis
  svg.append("text")
    .attr("transform", `translate(30, ${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .style("font-size", styleGuide.typography.label.fontSize)
    .style("font-weight", "700")
    .style("fill", styleGuide.colors.statusNeglected)
    .style("letter-spacing", "1px")
    .text("← INEQUALITY RATIO (fonts per speaker vs Latin)");
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LEGEND
  // ─────────────────────────────────────────────────────────────────────────────
  const legend = svg.append("g")
    .attr("transform", `translate(60, ${height - 200})`);
  
  legend.append("text")
    .style("font-size", styleGuide.typography.h3.fontSize)
    .style("font-weight", styleGuide.typography.h3.fontWeight)
    .style("letter-spacing", styleGuide.typography.h3.letterSpacing)
    .style("fill", styleGuide.typography.h3.color)
    .text("SCRIPT STATUS");
  
  const legendItems = [
    { status: "latin", label: `Latin (${stats.latinFonts} fonts)` },
    { status: "privileged", label: "Well-supported (<2× gap)" },
    { status: "struggling", label: "Struggling (2-10× gap)" },
    { status: "neglected", label: `Neglected (>10× gap)` },
    { status: "notoOnly", label: `Noto-only (${stats.notoOnlyCount} scripts)` }
  ];
  
  legendItems.forEach((item, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 22 + 22})`);
    
    row.append("circle")
      .attr("r", 6)
      .attr("fill", scales.color(item.status));
    
    row.append("text")
      .attr("x", 16)
      .attr("y", 4)
      .style("font-size", "10px")
      .style("fill", styleGuide.colors.textBody)
      .text(item.label);
  });
  
  // Size legend
  const sizeLegend = svg.append("g")
    .attr("transform", `translate(280, ${height - 200})`);
  
  sizeLegend.append("text")
    .style("font-size", styleGuide.typography.h3.fontSize)
    .style("font-weight", styleGuide.typography.h3.fontWeight)
    .style("letter-spacing", styleGuide.typography.h3.letterSpacing)
    .style("fill", styleGuide.typography.h3.color)
    .text("BUBBLE SIZE = FONTS");
  
  const sizes = [1, 100, 500, 1900];
  sizes.forEach((count, i) => {
    const r = scales.size(count);
    const cx = 10 + i * 45;
    
    sizeLegend.append("circle")
      .attr("cx", cx)
      .attr("cy", 50)
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", styleGuide.colors.borderStrong)
      .attr("stroke-width", 1);
    
    sizeLegend.append("text")
      .attr("x", cx)
      .attr("y", 75)
      .attr("text-anchor", "middle")
      .style("font-size", "9px")
      .style("fill", styleGuide.colors.textMuted)
      .text(count);
  });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TOOLTIP (Interactive)
  // ─────────────────────────────────────────────────────────────────────────────
  const tooltip = svg.append("g")
    .attr("class", "tooltip")
    .attr("display", "none");
  
  tooltip.append("rect")
    .attr("fill", styleGuide.components.tooltip.background)
    .attr("rx", 4)
    .attr("stroke", styleGuide.colors.borderLight)
    .attr("stroke-width", 1);
  
  const tooltipText = tooltip.append("text")
    .attr("fill", styleGuide.components.tooltip.color)
    .style("font-size", styleGuide.components.tooltip.fontSize);
  
  nodeGroup.selectAll("circle:first-child")
    .on("mouseenter", function(event, d) {
      d3.select(this)
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 1)
        .style("filter", "brightness(1.15)");
      
      const lines = [
        { text: d.name, weight: "700" },
        { text: `${d.fontCount} fonts`, color: styleGuide.colors.accent },
        { text: `${d.inequalityRatio.toFixed(1)}× inequality`, color: styleGuide.colors.statusNeglected },
        { text: `${(d.speakers / 1e6).toFixed(0)}M speakers` },
        { text: `Digital: ${d.digitalStart}` },
        d.status === "notoOnly" ? { text: "⚠ Noto-only", color: styleGuide.colors.statusNotoOnly } : null
      ].filter(Boolean);
      
      tooltipText.selectAll("*").remove();
      lines.forEach((line, i) => {
        tooltipText.append("tspan")
          .attr("x", 12)
          .attr("y", 18 + i * 16)
          .attr("font-weight", line.weight || "400")
          .attr("fill", line.color || styleGuide.components.tooltip.color)
          .text(line.text);
      });
      
      const tooltipWidth = 160;
      const tooltipHeight = lines.length * 16 + 16;
      tooltip.select("rect").attr("width", tooltipWidth).attr("height", tooltipHeight);
      
      const x = scales.x(d.digitalStart) + margin.left + scales.size(d.fontCount) + 12;
      const y = scales.y(d.inequalityRatio) + margin.top - tooltipHeight / 2;
      
      tooltip.attr("transform", `translate(${x}, ${y})`);
      tooltip.attr("display", null);
    })
    .on("mouseleave", function(event, d) {
      d3.select(this)
        .attr("stroke-width", d.code === "Latn" ? 3 : 1.5)
        .attr("stroke-opacity", d.code === "Latn" ? 0.9 : 0.4)
        .style("filter", d.code === "Latn" ? "url(#glow)" : null);
      
      tooltip.attr("display", "none");
    });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // FIGURE CAPTION
  // ─────────────────────────────────────────────────────────────────────────────
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", styleGuide.typography.body.fontSize)
    .style("font-weight", "700")
    .style("fill", styleGuide.colors.textSecondary)
    .text("Fig 2. Digital Typography Timeline: Script Inequality Over Time");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 8: Summary Statistics Panel
// ═══════════════════════════════════════════════════════════════════════════════
statsPanel = {
  const { stats, nodes } = processedData;
  
  const latin = nodes.find(n => n.code === "Latn");
  const hans = nodes.find(n => n.code === "Hans");
  const adlam = nodes.find(n => n.code === "Adlm");
  
  return html`
    <div style="
      font-family: ${styleGuide.typography.fontFamily};
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px;
      background: ${styleGuide.colors.background};
    ">
      
      <!-- Header -->
      <div style="margin-bottom: 30px;">
        <h2 style="
          color: ${styleGuide.colors.textSecondary};
          margin: 0;
          font-size: ${styleGuide.typography.h1.fontSize};
          font-weight: ${styleGuide.typography.h1.fontWeight};
          letter-spacing: ${styleGuide.typography.h1.letterSpacing};
          text-transform: uppercase;
        ">Key Metrics</h2>
      </div>
      
      <!-- Stats Grid -->
      <div style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 30px;
        padding: 30px 0;
        border-top: 1px solid ${styleGuide.colors.borderMedium};
        border-bottom: 1px solid ${styleGuide.colors.borderMedium};
      ">
        <div style="text-align: center;">
          <div style="
            font-size: ${styleGuide.typography.dataLarge.fontSize};
            font-weight: ${styleGuide.typography.dataLarge.fontWeight};
            color: ${styleGuide.colors.accent};
            letter-spacing: -1px;
          ">${latin?.fontCount.toLocaleString()}</div>
          <div style="
            font-size: 11px;
            font-weight: 600;
            color: ${styleGuide.colors.textBody};
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 8px;
          ">Latin Fonts</div>
        </div>
        
        <div style="text-align: center;">
          <div style="
            font-size: ${styleGuide.typography.dataLarge.fontSize};
            font-weight: ${styleGuide.typography.dataLarge.fontWeight};
            color: ${styleGuide.colors.statusNeglected};
            letter-spacing: -1px;
          ">${Math.round(hans?.inequalityRatio || 59)}×</div>
          <div style="
            font-size: 11px;
            font-weight: 600;
            color: ${styleGuide.colors.textBody};
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 8px;
          ">Han Inequality</div>
        </div>
        
        <div style="text-align: center;">
          <div style="
            font-size: ${styleGuide.typography.dataLarge.fontSize};
            font-weight: ${styleGuide.typography.dataLarge.fontWeight};
            color: ${styleGuide.colors.statusNotoOnly};
            letter-spacing: -1px;
          ">${stats.notoOnlyCount}</div>
          <div style="
            font-size: 11px;
            font-weight: 600;
            color: ${styleGuide.colors.textBody};
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 8px;
          ">Noto-Only Scripts</div>
        </div>
        
        <div style="text-align: center;">
          <div style="
            font-size: ${styleGuide.typography.dataLarge.fontSize};
            font-weight: ${styleGuide.typography.dataLarge.fontWeight};
            color: ${styleGuide.colors.statusStruggling};
            letter-spacing: -1px;
          ">32</div>
          <div style="
            font-size: 11px;
            font-weight: 600;
            color: ${styleGuide.colors.textBody};
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 8px;
          ">Years Behind (Adlam)</div>
        </div>
      </div>
      
      <!-- Key Insight -->
      <div style="
        margin-top: 30px;
        padding: 20px;
        background: ${styleGuide.colors.backgroundAlt};
        border-left: 3px solid ${styleGuide.colors.borderStrong};
      ">
        <div style="
          font-size: ${styleGuide.typography.overline.fontSize};
          font-weight: ${styleGuide.typography.overline.fontWeight};
          color: ${styleGuide.colors.textMuted};
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        ">Key Insight</div>
        <p style="
          margin: 0;
          color: ${styleGuide.colors.textSecondary};
          font-size: ${styleGuide.typography.body.fontSize};
          line-height: ${styleGuide.typography.body.lineHeight};
        ">
          Latin entered digital typography in <strong>1984</strong> with PostScript. 
          Today it has <strong>${stats.latinFonts.toLocaleString()} fonts</strong>. 
          Meanwhile, <strong>${stats.notoOnlyCount} scripts</strong> (${Math.round(stats.notoOnlyCount / stats.totalScripts * 100)}%) 
          have no alternative to Google's Noto project—their only option for digital text.
        </p>
      </div>
      
      <!-- Figure caption -->
      <div style="margin-top: 30px; text-align: center;">
        <div style="
          font-size: 12px;
          font-weight: 700;
          color: ${styleGuide.colors.textSecondary};
        ">Fig 2a. Summary Statistics</div>
        <div style="
          font-size: 10px;
          font-style: italic;
          color: ${styleGuide.colors.textMuted};
          margin-top: 4px;
        ">Key metrics from the Wait vs Web Domination analysis</div>
      </div>
      
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 9: Display Full Visualization
// ═══════════════════════════════════════════════════════════════════════════════
html`
<div style="max-width: 1000px; margin: 0 auto;">
  ${chart}
  ${statsPanel}
</div>
`
