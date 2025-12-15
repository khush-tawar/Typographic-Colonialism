// ═══════════════════════════════════════════════════════════════════════════════
// THE WAIT VS WEB DOMINATION - Observable Notebook Ready
// ═══════════════════════════════════════════════════════════════════════════════
// Copy each cell into Observable. This is the polished 2D+3D hybrid version.

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Configuration & Color Palette
// ═══════════════════════════════════════════════════════════════════════════════
config = ({
  // WSJ-inspired palette
  colors: {
    background: "#0f0f1a",
    paper: "#E8E5DA",
    
    // Script status
    latin: "#4fc3f7",       // Bright cyan - the sun
    privileged: "#66bb6a",  // Green - good coverage
    struggling: "#ffa726",  // Orange - moderate inequality  
    neglected: "#ef5350",   // Red - severe inequality
    notoOnly: "#ab47bc",    // Purple - Noto dependency
    
    // UI
    text: "#ffffff",
    textMuted: "#888888",
    textSubtle: "#555555",
    grid: "#333344",
    
    // Links
    latinLink: "#4fc3f7",
    otherLink: "#444466"
  },
  
  // Key scripts to always label
  keyScripts: ["Latn", "Arab", "Hans", "Deva", "Beng", "Cyrl", "Jpan", "Kore", "Thai", "Grek", "Hebr", "Taml"],
  
  dimensions: {
    width: 1200,
    height: 800,
    margin: { top: 100, right: 60, bottom: 80, left: 80 }
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
// CELL 5: Create Scales
// ═══════════════════════════════════════════════════════════════════════════════
scales = {
  const { width, height, margin } = config.dimensions;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  return {
    // X: Year entered digital age
    x: d3.scaleLinear()
      .domain([1980, 2020])
      .range([0, innerWidth]),
    
    // Y: Inequality ratio (log scale for better distribution)
    y: d3.scaleLog()
      .domain([0.3, 100])// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Process & Enrich Data
// ═══════════════════════════════════════════════════════════════════════════════
processedData = {
  const timeline = masterData.digital_timeline?.scripts || {};
  const inequality = masterData.inequality_metrics || [];
  const scripts = masterData.scripts || {};
  const deepMetrics = masterData.deep_metrics || {};
  
  const inequalityMap = new Map(inequality.map(d => [d.code, d]));
  
  // Process each script
  const nodes = [];
  
  for (const [code, data] of Object.entries(scripts)) {
    if (data.font_count === 0) continue;
    
    const t = timeline[code] || {};
    const ineq = inequalityMap.get(code) || {};
    
    // Determine digital age start
    let digitalStart = t.digital_age_start || t.first_google_fonts?.year || 2010;
    
    // Calculate wait time relative to Latin (1984)
    const yearsAfterLatin = digitalStart - 1984;
    
    // Determine script status category
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
      
      // Position metrics
      digitalStart,
      yearsAfterLatin,
      inequalityRatio: ineq.inequality_ratio || 1,
      
      // Size metrics
      speakers: data.speakers || 0,
      fontCount: data.font_count || 0,
      
      // Status
      status,
      
      // Additional data
      fontsPerM: ineq.fonts_per_100m || 0,
      notoFamilies: data.noto_families?.length || 0,
      languages: data.languages?.length || 0,
      countries: data.countries?.length || 0,
      rtl: data.rtl || false,
      
      // Timeline details
      firstScalable: t.first_scalable,
      firstFree: t.first_free,
      firstGoogleFonts: t.first_google_fonts
    });
  }
  
  // Get links from graph structure
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
  
  // Stats
  const stats = {
    totalScripts: nodes.length,
    totalFonts: masterData.metadata?.counts?.total_fonts || 1916,
    notoOnlyCount: nodes.filter(n => n.status === "notoOnly").length,
    neglectedCount: nodes.filter(n => n.status === "neglected").length,
    latinFonts: nodes.find(n => n.code === "Latn")?.fontCount || 1900,
    maxInequality: Math.max(...nodes.map(n => n.inequalityRatio)),
    latestDigitalEntry: Math.max(...nodes.map(n => n.digitalStart)),
    totalSpeakers: nodes.reduce((sum, n) => sum + n.speakers, 0)
  };
  
  return { nodes, links, stats };
}


      .range([innerHeight, 0])
      .clamp(true),
    
    // Size: Font count
    size: d3.scaleSqrt()
      .domain([0, processedData.stats.latinFonts])
      .range([3, 45]),
    
    // Opacity: Speaker population
    opacity: d3.scaleLog()
      .domain([1000, 6e9])
      .range([0.4, 1])
      .clamp(true),
    
    // Color by status
    color: (status) => config.colors[status] || config.colors.neglected
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 6: THE VISUALIZATION - Wait vs Web Domination
// ═══════════════════════════════════════════════════════════════════════════════
chart = {
  const { width, height, margin } = config.dimensions;
  const { nodes, links, stats } = processedData;
  
  // Create SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", `
      max-width: 100%;
      height: auto;
      background: ${config.colors.background};
      font-family: 'Helvetica Neue', -apple-system, sans-serif;
    `);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // DEFS: Gradients, Filters, Markers
  // ─────────────────────────────────────────────────────────────────────────────
  const defs = svg.append("defs");
  
  // Glow filter for Latin
  const glow = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-100%").attr("y", "-100%")
    .attr("width", "300%").attr("height", "300%");
  glow.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
  glow.append("feComposite").attr("in", "blur").attr("in2", "SourceGraphic");
  
  // Pulse filter for Noto-only
  const pulse = defs.append("filter")
    .attr("id", "pulse");
  pulse.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "blur");
  pulse.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");
  
  // Radial gradient for Latin "sun"
  const latinGradient = defs.append("radialGradient")
    .attr("id", "latinGradient");
  latinGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffffff");
  latinGradient.append("stop").attr("offset", "30%").attr("stop-color", config.colors.latin);
  latinGradient.append("stop").attr("offset", "100%").attr("stop-color", config.colors.latin).attr("stop-opacity", 0.6);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 0: Background grid & axes
  // ─────────────────────────────────────────────────────────────────────────────
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // Vertical grid lines (years)
  const years = [1984, 1990, 1995, 2000, 2005, 2010, 2015, 2020];
  g.append("g")
    .attr("class", "grid-x")
    .selectAll("line")
    .data(years)
    .join("line")
    .attr("x1", d => scales.x(d))
    .attr("x2", d => scales.x(d))
    .attr("y1", 0)
    .attr("y2", height - margin.top - margin.bottom)
    .attr("stroke", config.colors.grid)
    .attr("stroke-dasharray", d => d === 1984 ? "none" : "3,3")
    .attr("stroke-width", d => d === 1984 ? 2 : 1);
  
  // Year labels
  g.append("g")
    .selectAll("text")
    .data(years)
    .join("text")
    .attr("x", d => scales.x(d))
    .attr("y", height - margin.top - margin.bottom + 25)
    .attr("text-anchor", "middle")
    .attr("fill", d => d === 1984 ? config.colors.latin : config.colors.textMuted)
    .attr("font-size", d => d === 1984 ? 12 : 10)
    .attr("font-weight", d => d === 1984 ? "bold" : "normal")
    .text(d => d);
  
  // 1984 annotation
  g.append("text")
    .attr("x", scales.x(1984))
    .attr("y", height - margin.top - margin.bottom + 45)
    .attr("text-anchor", "middle")
    .attr("fill", config.colors.latin)
    .attr("font-size", 9)
    .text("PostScript");
  
  // Horizontal grid lines (inequality ratios)
  const yTicks = [0.5, 1, 2, 5, 10, 20, 50];
  g.append("g")
    .attr("class", "grid-y")
    .selectAll("line")
    .data(yTicks)
    .join("line")
    .attr("x1", 0)
    .attr("x2", width - margin.left - margin.right)
    .attr("y1", d => scales.y(d))
    .attr("y2", d => scales.y(d))
    .attr("stroke", config.colors.grid)
    .attr("stroke-dasharray", d => d === 1 ? "none" : "3,3")
    .attr("stroke-width", d => d === 1 ? 2 : 1);
  
  // Y-axis labels
  g.append("g")
    .selectAll("text")
    .data(yTicks)
    .join("text")
    .attr("x", -15)
    .attr("y", d => scales.y(d) + 4)
    .attr("text-anchor", "end")
    .attr("fill", d => d === 1 ? config.colors.privileged : config.colors.textMuted)
    .attr("font-size", 10)
    .text(d => d === 1 ? "Equal" : `${d}×`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 1: Inequality zones (background bands)
  // ─────────────────────────────────────────────────────────────────────────────
  const zones = [
    { y0: 0.3, y1: 2, label: "Well-supported", color: config.colors.privileged, opacity: 0.05 },
    { y0: 2, y1: 10, label: "Struggling", color: config.colors.struggling, opacity: 0.05 },
    { y0: 10, y1: 100, label: "Neglected", color: config.colors.neglected, opacity: 0.08 }
  ];
  
  g.append("g")
    .attr("class", "zones")
    .selectAll("rect")
    .data(zones)
    .join("rect")
    .attr("x", 0)
    .attr("y", d => scales.y(d.y1))
    .attr("width", width - margin.left - margin.right)
    .attr("height", d => scales.y(d.y0) - scales.y(d.y1))
    .attr("fill", d => d.color)
    .attr("opacity", d => d.opacity);
  
  // Zone labels (right side)
  g.append("g")
    .selectAll("text")
    .data(zones)
    .join("text")
    .attr("x", width - margin.left - margin.right + 10)
    .attr("y", d => (scales.y(d.y0) + scales.y(d.y1)) / 2)
    .attr("dominant-baseline", "middle")
    .attr("fill", d => d.color)
    .attr("font-size", 9)
    .attr("opacity", 0.6)
    .text(d => d.label);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 2: Connection lines (scripts sharing fonts)
  // ─────────────────────────────────────────────────────────────────────────────
  const nodeById = new Map(nodes.map(n => [n.code, n]));
  
  // Sort links so Latin connections are on top
  const sortedLinks = [...links].sort((a, b) => {
    const aLatin = a.isLatinLink ? 1 : 0;
    const bLatin = b.isLatinLink ? 1 : 0;
    return aLatin - bLatin;
  });
  
  g.append("g")
    .attr("class", "links")
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
      
      // Curved line
      const mx = (x1 + x2) / 2;
      const my = Math.min(y1, y2) - 20 - Math.random() * 30;
      
      return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
    })
    .attr("fill", "none")
    .attr("stroke", d => d.isLatinLink ? config.colors.latinLink : config.colors.otherLink)
    .attr("stroke-width", d => Math.sqrt(d.value) * 0.3 + 0.5)
    .attr("stroke-opacity", d => d.isLatinLink ? 0.3 : 0.1);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 3: Script bubbles
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Sort nodes so Latin is on top
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.code === "Latn") return 1;
    if (b.code === "Latn") return -1;
    return a.fontCount - b.fontCount;
  });
  
  const nodeGroup = g.append("g")
    .attr("class", "nodes")
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
    .attr("stroke-width", d => d.code === "Latn" ? 3 : 1)
    .attr("stroke-opacity", d => d.code === "Latn" ? 0.8 : 0.3)
    .attr("filter", d => d.code === "Latn" ? "url(#glow)" : null)
    .style("cursor", "pointer");
  
  // Rings around key scripts
  nodeGroup.filter(d => config.keyScripts.includes(d.code) && d.code !== "Latn")
    .append("circle")
    .attr("r", d => scales.size(d.fontCount) + 4)
    .attr("fill", "none")
    .attr("stroke", d => scales.color(d.status))
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.3);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 4: Labels for key scripts
  // ─────────────────────────────────────────────────────────────────────────────
  const labelGroup = g.append("g")
    .attr("class", "labels")
    .selectAll("g")
    .data(sortedNodes.filter(d => config.keyScripts.includes(d.code)))
    .join("g")
    .attr("transform", d => {
      const x = scales.x(d.digitalStart);
      const y = scales.y(d.inequalityRatio) - scales.size(d.fontCount) - 8;
      return `translate(${x}, ${y})`;
    });
  
  labelGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("fill", config.colors.text)
    .attr("font-size", d => d.code === "Latn" ? 14 : 11)
    .attr("font-weight", d => d.code === "Latn" ? "bold" : "normal")
    .text(d => d.name);
  
  labelGroup.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 12)
    .attr("fill", config.colors.textMuted)
    .attr("font-size", 9)
    .text(d => `${d.fontCount} fonts`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 5: Axis titles
  // ─────────────────────────────────────────────────────────────────────────────
  
  // X-axis title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .attr("fill", config.colors.latin)
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text("YEAR ENTERED DIGITAL AGE →");
  
  // Y-axis title
  svg.append("text")
    .attr("transform", `translate(25, ${height/2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", config.colors.neglected)
    .attr("font-size", 12)
    .attr("font-weight", "bold")
    .text("← INEQUALITY RATIO (fonts per speaker vs Latin)");
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 6: Title & Subtitle
  // ─────────────────────────────────────────────────────────────────────────────
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 35)
    .attr("fill", config.colors.paper)
    .attr("font-size", 28)
    .attr("font-weight", "300")
    .text("The Wait vs Web Domination");
  
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 55)
    .attr("fill", config.colors.textMuted)
    .attr("font-size", 12)
    .text("How Latin script colonized digital typography—and left billions behind");
  
  // Stats line
  svg.append("text")
    .attr("x", margin.left)
    .attr("y", 75)
    .attr("fill", config.colors.textSubtle)
    .attr("font-size", 10)
    .text(`${stats.totalScripts} scripts • ${stats.totalFonts.toLocaleString()} fonts • ${(stats.totalSpeakers / 1e9).toFixed(1)}B speakers`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 7: Legend
  // ─────────────────────────────────────────────────────────────────────────────
  const legendData = [
    { status: "latin", label: `Latin (${stats.latinFonts} fonts)` },
    { status: "privileged", label: "Well-supported (<2× gap)" },
    { status: "struggling", label: "Struggling (2-10× gap)" },
    { status: "neglected", label: `Neglected (>10× gap) [${stats.neglectedCount}]` },
    { status: "notoOnly", label: `Noto-only (${stats.notoOnlyCount} scripts)` }
  ];
  
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 200}, 30)`);
  
  legend.selectAll("g")
    .data(legendData)
    .join("g")
    .attr("transform", (d, i) => `translate(0, ${i * 18})`)
    .call(g => {
      g.append("circle")
        .attr("r", 5)
        .attr("fill", d => config.colors[d.status]);
      g.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr("fill", config.colors.textMuted)
        .attr("font-size", 10)
        .text(d => d.label);
    });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LAYER 8: Key insight callouts
  // ─────────────────────────────────────────────────────────────────────────────
  
  // Han (Chinese) callout
  const hans = nodes.find(n => n.code === "Hans");
  if (hans) {
    const calloutG = g.append("g")
      .attr("transform", `translate(${scales.x(hans.digitalStart) + 60}, ${scales.y(hans.inequalityRatio) - 20})`);
    
    calloutG.append("line")
      .attr("x1", -55).attr("y1", 15)
      .attr("x2", 0).attr("y2", 0)
      .attr("stroke", config.colors.neglected)
      .attr("stroke-dasharray", "2,2");
    
    calloutG.append("text")
      .attr("fill", config.colors.neglected)
      .attr("font-size", 10)
      .attr("font-weight", "bold")
      .text("59× inequality");
    
    calloutG.append("text")
      .attr("y", 14)
      .attr("fill", config.colors.textMuted)
      .attr("font-size", 9)
      .text("1.6B speakers, 10 fonts");
  }
  
  // Adlam callout (latest entrant)
  const adlam = nodes.find(n => n.code === "Adlm");
  if (adlam) {
    const ax = scales.x(adlam.digitalStart);
    const ay = scales.y(adlam.inequalityRatio);
    
    g.append("line")
      .attr("x1", ax).attr("y1", ay + 15)
      .attr("x2", ax).attr("y2", height - margin.top - margin.bottom - 60)
      .attr("stroke", config.colors.notoOnly)
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-opacity", 0.5);
    
    g.append("text")
      .attr("x", ax)
      .attr("y", height - margin.top - margin.bottom - 45)
      .attr("text-anchor", "middle")
      .attr("fill", config.colors.notoOnly)
      .attr("font-size", 10)
      .text("Adlam: 32 years behind");
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // INTERACTIVITY: Tooltip
  // ─────────────────────────────────────────────────────────────────────────────
  const tooltip = svg.append("g")
    .attr("class", "tooltip")
    .attr("display", "none");
  
  const tooltipRect = tooltip.append("rect")
    .attr("fill", "rgba(0,0,0,0.9)")
    .attr("rx", 4)
    .attr("stroke", config.colors.textSubtle)
    .attr("stroke-width", 1);
  
  const tooltipText = tooltip.append("text")
    .attr("fill", config.colors.text)
    .attr("font-size", 11);
  
  nodeGroup.selectAll("circle:first-child")
    .on("mouseenter", function(event, d) {
      // Highlight this node
      d3.select(this)
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 1);
      
      // Show tooltip
      const lines = [
        { text: d.name, weight: "bold" },
        { text: `${d.fontCount} fonts`, color: config.colors.latin },
        { text: `${d.inequalityRatio.toFixed(1)}× inequality`, color: config.colors.neglected },
        { text: `${(d.speakers / 1e6).toFixed(0)}M speakers` },
        { text: `Digital: ${d.digitalStart}` },
        { text: d.status === "notoOnly" ? "⚠ Noto-only" : "" }
      ].filter(l => l.text);
      
      tooltipText.selectAll("*").remove();
      lines.forEach((line, i) => {
        tooltipText.append("tspan")
          .attr("x", 10)
          .attr("y", 18 + i * 16)
          .attr("font-weight", line.weight || "normal")
          .attr("fill", line.color || config.colors.text)
          .text(line.text);
      });
      
      const tooltipWidth = 150;
      const tooltipHeight = lines.length * 16 + 15;
      tooltipRect.attr("width", tooltipWidth).attr("height", tooltipHeight);
      
      const x = scales.x(d.digitalStart) + margin.left + scales.size(d.fontCount) + 10;
      const y = scales.y(d.inequalityRatio) + margin.top - tooltipHeight / 2;
      
      tooltip.attr("transform", `translate(${x}, ${y})`);
      tooltip.attr("display", null);
    })
    .on("mouseleave", function(event, d) {
      d3.select(this)
        .attr("stroke-width", d.code === "Latn" ? 3 : 1)
        .attr("stroke-opacity", d.code === "Latn" ? 0.8 : 0.3);
      
      tooltip.attr("display", "none");
    });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Source attribution
  // ─────────────────────────────────────────────────────────────────────────────
  svg.append("text")
    .attr("x", width - margin.right)
    .attr("y", height - 10)
    .attr("text-anchor", "end")
    .attr("fill", config.colors.textSubtle)
    .attr("font-size", 9)
    .text("Data: Google Fonts, Unicode CLDR, ISO 15924 • github.com/khush-tawar/Typographic-Colonialism");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 7: KEY INSIGHTS (Stats Cards)
// ═══════════════════════════════════════════════════════════════════════════════
insights = {
  const { stats, nodes } = processedData;
  
  const latin = nodes.find(n => n.code === "Latn");
  const hans = nodes.find(n => n.code === "Hans");
  const arabic = nodes.find(n => n.code === "Arab");
  
  const container = html`<div style="
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;
    font-family: 'Helvetica Neue', sans-serif;
  ">
    <div style="
      background: linear-gradient(135deg, ${config.colors.latin}22, ${config.colors.latin}11);
      border-left: 4px solid ${config.colors.latin};
      padding: 20px;
      border-radius: 4px;
    ">
      <div style="font-size: 36px; font-weight: 700; color: ${config.colors.latin};">
        ${latin?.fontCount.toLocaleString()}
      </div>
      <div style="font-size: 12px; color: ${config.colors.textMuted}; margin-top: 5px;">
        Latin fonts
      </div>
      <div style="font-size: 10px; color: ${config.colors.textSubtle}; margin-top: 10px;">
        First digital font: 1984
      </div>
    </div>
    
    <div style="
      background: linear-gradient(135deg, ${config.colors.neglected}22, ${config.colors.neglected}11);
      border-left: 4px solid ${config.colors.neglected};
      padding: 20px;
      border-radius: 4px;
    ">
      <div style="font-size: 36px; font-weight: 700; color: ${config.colors.neglected};">
        ${Math.round(hans?.inequalityRatio || 59)}×
      </div>
      <div style="font-size: 12px; color: ${config.colors.textMuted}; margin-top: 5px;">
        Han (Chinese) inequality
      </div>
      <div style="font-size: 10px; color: ${config.colors.textSubtle}; margin-top: 10px;">
        1.6B speakers, ${hans?.fontCount} fonts
      </div>
    </div>
    
    <div style="
      background: linear-gradient(135deg, ${config.colors.notoOnly}22, ${config.colors.notoOnly}11);
      border-left: 4px solid ${config.colors.notoOnly};
      padding: 20px;
      border-radius: 4px;
    ">
      <div style="font-size: 36px; font-weight: 700; color: ${config.colors.notoOnly};">
        ${stats.notoOnlyCount}
      </div>
      <div style="font-size: 12px; color: ${config.colors.textMuted}; margin-top: 5px;">
        Noto-only scripts
      </div>
      <div style="font-size: 10px; color: ${config.colors.textSubtle}; margin-top: 10px;">
        No alternatives exist
      </div>
    </div>
    
    <div style="
      background: linear-gradient(135deg, ${config.colors.struggling}22, ${config.colors.struggling}11);
      border-left: 4px solid ${config.colors.struggling};
      padding: 20px;
      border-radius: 4px;
    ">
      <div style="font-size: 36px; font-weight: 700; color: ${config.colors.struggling};">
        32
      </div>
      <div style="font-size: 12px; color: ${config.colors.textMuted}; margin-top: 5px;">
        Years behind (Adlam)
      </div>
      <div style="font-size: 10px; color: ${config.colors.textSubtle}; margin-top: 10px;">
        Entered digital in 2016
      </div>
    </div>
  </div>`;
  
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 8: Export the complete visualization
// ═══════════════════════════════════════════════════════════════════════════════
/*
  USAGE IN OBSERVABLE:
  
  1. Copy cells 1-7 into your Observable notebook
  2. The `chart` cell displays the main visualization
  3. The `insights` cell shows the stat cards below
  
  To display:
  viewof visualization = html`
    <div style="max-width: 1200px; margin: 0 auto;">
      ${chart}
      ${insights}
    </div>
  `
*/

// Display both together
html`
<div style="max-width: 1200px; margin: 0 auto; background: ${config.colors.background}; padding: 20px; border-radius: 8px;">
  ${chart}
  ${insights}
</div>
`
