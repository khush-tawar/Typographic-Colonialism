// ═══════════════════════════════════════════════════════════════════════════════
// THE WAIT VS WEB DOMINATION - v3 (Uses Hosted Style Guide)
// ═══════════════════════════════════════════════════════════════════════════════
// Import styleGuide ONCE in your notebook, then use it everywhere.

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Import Style Guide (do this ONCE in your notebook)
// ═══════════════════════════════════════════════════════════════════════════════
styleGuide = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/style_guide.json")
  .then(r => r.json())

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Helper Functions (add once, use everywhere)
// ═══════════════════════════════════════════════════════════════════════════════
helpers = ({
  // Get status color based on inequality metrics
  getStatusColor: (d, sg = styleGuide) => {
    if (d.code === "Latn") return sg.colors.status.dominant;
    if (d.notoOnly) return sg.colors.status.notoOnly;
    if (d.inequalityRatio < 2) return sg.colors.status.privileged;
    if (d.inequalityRatio < 10) return sg.colors.status.struggling;
    return sg.colors.status.neglected;
  },
  
  // Get palette color by index
  getPaletteColor: (i, palette = "primary", sg = styleGuide) => 
    sg.colors.palette[palette][i % sg.colors.palette[palette].length],
  
  // Apply typography style
  applyTypo: (sel, style, sg = styleGuide) => {
    const t = sg.typography[style];
    return sel
      .style("font-size", t.size)
      .style("font-weight", t.weight)
      .style("letter-spacing", t.spacing)
      .style("text-transform", t.transform);
  }
})

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Data Loading (assumes masterData & graphData already loaded)
// ═══════════════════════════════════════════════════════════════════════════════
// masterData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/master_dataset.json").then(r => r.json())
// graphData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/graph_structure.json").then(r => r.json())

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Process Data
// ═══════════════════════════════════════════════════════════════════════════════
waitData = {
  const timeline = masterData.digital_timeline?.scripts || {};
  const inequality = new Map((masterData.inequality_metrics || []).map(d => [d.code, d]));
  const scripts = masterData.scripts || {};
  
  const nodes = Object.entries(scripts)
    .filter(([_, d]) => d.font_count > 0)
    .map(([code, d]) => {
      const t = timeline[code] || {};
      const ineq = inequality.get(code) || {};
      const digitalStart = t.digital_age_start || t.first_google_fonts?.year || 2010;
      const notoOnly = d.font_count <= (d.noto_families?.length || 0) + 1 && code !== "Latn";
      
      return {
        code, name: d.name || code,
        digitalStart, yearsAfterLatin: digitalStart - 1984,
        inequalityRatio: ineq.inequality_ratio || 1,
        speakers: d.speakers || 0,
        fontCount: d.font_count || 0,
        notoOnly,
        rtl: d.rtl || false
      };
    });
  
  const nodeSet = new Set(nodes.map(n => n.code));
  const links = (graphData.d3_ready?.script_network?.links || [])
    .filter(l => nodeSet.has(l.source) && nodeSet.has(l.target));
  
  const latin = nodes.find(n => n.code === "Latn");
  
  return { 
    nodes, links,
    stats: {
      total: nodes.length,
      latinFonts: latin?.fontCount || 1900,
      notoOnly: nodes.filter(n => n.notoOnly).length,
      neglected: nodes.filter(n => n.inequalityRatio > 10).length
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 5: Main Visualization
// ═══════════════════════════════════════════════════════════════════════════════
waitChart = {
  const sg = styleGuide;
  const { nodes, links, stats } = waitData;
  const dim = sg.dimensions.default;
  const W = dim.width, H = dim.height, M = dim.margin;
  const innerW = W - M.left - M.right, innerH = H - M.top - M.bottom;
  
  // Scales
  const xScale = d3.scaleLinear().domain([1980, 2020]).range([0, innerW]);
  const yScale = d3.scaleLog().domain([0.3, 100]).range([innerH, 0]).clamp(true);
  const sizeScale = d3.scaleSqrt().domain([0, stats.latinFonts]).range([3, 50]);
  const nodeMap = new Map(nodes.map(n => [n.code, n]));
  
  // SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%").style("height", "auto")
    .style("background", sg.colors.background)
    .style("font-family", sg.typography.fontFamily);
  
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
  
  // ─── Background Zones ───
  const zones = [
    { y0: 0.3, y1: 2, color: sg.colors.chart.zonePrivileged, label: "Well-supported" },
    { y0: 2, y1: 10, color: sg.colors.chart.zoneStruggling, label: "Struggling" },
    { y0: 10, y1: 100, color: sg.colors.chart.zoneNeglected, label: "Neglected" }
  ];
  
  g.selectAll(".zone").data(zones).join("rect")
    .attr("x", 0).attr("width", innerW)
    .attr("y", d => yScale(d.y1))
    .attr("height", d => yScale(d.y0) - yScale(d.y1))
    .attr("fill", d => d.color);
  
  // Zone labels
  g.selectAll(".zone-label").data(zones).join("text")
    .attr("x", innerW + 8)
    .attr("y", d => (yScale(d.y0) + yScale(d.y1)) / 2 + 4)
    .attr("fill", sg.colors.textMuted)
    .attr("font-size", "10px")
    .text(d => d.label);
  
  // ─── Grid ───
  const years = [1984, 1990, 2000, 2010, 2020];
  g.selectAll(".grid-x").data(years).join("line")
    .attr("x1", d => xScale(d)).attr("x2", d => xScale(d))
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke", sg.colors.grid)
    .attr("stroke-dasharray", d => d === 1984 ? "none" : "3,3")
    .attr("stroke-width", d => d === 1984 ? 2 : 1);
  
  g.selectAll(".year-label").data(years).join("text")
    .attr("x", d => xScale(d)).attr("y", innerH + 20)
    .attr("text-anchor", "middle")
    .attr("fill", d => d === 1984 ? sg.colors.accent : sg.colors.textMuted)
    .attr("font-size", "11px")
    .attr("font-weight", d => d === 1984 ? "bold" : "normal")
    .text(d => d);
  
  const yTicks = [1, 2, 5, 10, 20, 50];
  g.selectAll(".grid-y").data(yTicks).join("line")
    .attr("x1", 0).attr("x2", innerW)
    .attr("y1", d => yScale(d)).attr("y2", d => yScale(d))
    .attr("stroke", sg.colors.grid)
    .attr("stroke-dasharray", d => d === 1 ? "none" : "3,3");
  
  g.selectAll(".y-label").data(yTicks).join("text")
    .attr("x", -10).attr("y", d => yScale(d) + 4)
    .attr("text-anchor", "end")
    .attr("fill", sg.colors.textMuted)
    .attr("font-size", "10px")
    .text(d => d === 1 ? "Equal" : `${d}×`);
  
  // ─── Links ───
  g.append("g").selectAll("path").data(links).join("path")
    .attr("d", d => {
      const s = nodeMap.get(d.source), t = nodeMap.get(d.target);
      if (!s || !t) return null;
      const x1 = xScale(s.digitalStart), y1 = yScale(s.inequalityRatio);
      const x2 = xScale(t.digitalStart), y2 = yScale(t.inequalityRatio);
      return `M${x1},${y1} Q${(x1+x2)/2},${Math.min(y1,y2)-30} ${x2},${y2}`;
    })
    .attr("fill", "none")
    .attr("stroke", d => (d.source === "Latn" || d.target === "Latn") ? sg.colors.accent : sg.colors.borderLight)
    .attr("stroke-width", d => Math.sqrt(d.value || 1) * 0.3 + 0.3)
    .attr("stroke-opacity", d => (d.source === "Latn" || d.target === "Latn") ? 0.4 : 0.15);
  
  // ─── Nodes ───
  const sortedNodes = [...nodes].sort((a, b) => a.code === "Latn" ? 1 : b.code === "Latn" ? -1 : a.fontCount - b.fontCount);
  
  const nodeG = g.append("g").selectAll("g").data(sortedNodes).join("g")
    .attr("transform", d => `translate(${xScale(d.digitalStart)},${yScale(d.inequalityRatio)})`);
  
  nodeG.append("circle")
    .attr("r", d => sizeScale(d.fontCount))
    .attr("fill", d => helpers.getStatusColor(d, sg))
    .attr("fill-opacity", d => Math.min(0.9, 0.4 + Math.log10(Math.max(d.speakers, 1000)) / 10))
    .attr("stroke", d => helpers.getStatusColor(d, sg))
    .attr("stroke-width", d => d.code === "Latn" ? 3 : 1.5)
    .attr("stroke-opacity", 0.8)
    .style("cursor", "pointer");
  
  // Key script labels
  const keyScripts = sg.keyScripts;
  const labelNodes = sortedNodes.filter(d => keyScripts.includes(d.code));
  
  g.append("g").selectAll("text").data(labelNodes).join("text")
    .attr("x", d => xScale(d.digitalStart))
    .attr("y", d => yScale(d.inequalityRatio) - sizeScale(d.fontCount) - 6)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textPrimary)
    .attr("font-size", d => d.code === "Latn" ? "13px" : "11px")
    .attr("font-weight", d => d.code === "Latn" ? "700" : "500")
    .text(d => d.name);
  
  // ─── Callouts ───
  const hans = nodes.find(n => n.code === "Hans");
  if (hans) {
    const cx = xScale(hans.digitalStart) + 50, cy = yScale(hans.inequalityRatio) - 25;
    g.append("line")
      .attr("x1", xScale(hans.digitalStart) + 10).attr("y1", yScale(hans.inequalityRatio) - 10)
      .attr("x2", cx).attr("y2", cy)
      .attr("stroke", sg.colors.status.neglected).attr("stroke-dasharray", "3,3");
    g.append("text").attr("x", cx + 5).attr("y", cy)
      .attr("fill", sg.colors.status.neglected).attr("font-size", "11px").attr("font-weight", "bold")
      .text(`${Math.round(hans.inequalityRatio)}× inequality`);
    g.append("text").attr("x", cx + 5).attr("y", cy + 14)
      .attr("fill", sg.colors.textMuted).attr("font-size", "10px")
      .text("1.6B speakers");
  }
  
  // ─── Title ───
  svg.append("text").attr("x", M.left).attr("y", 32)
    .attr("fill", sg.colors.textPrimary)
    .attr("font-size", sg.typography.h2.size)
    .attr("font-weight", sg.typography.h2.weight)
    .attr("letter-spacing", sg.typography.h2.spacing)
    .text("THE WAIT VS WEB DOMINATION");
  
  svg.append("line")
    .attr("x1", M.left).attr("x2", M.left + 280)
    .attr("y1", 40).attr("y2", 40)
    .attr("stroke", sg.colors.border).attr("stroke-width", 2);
  
  svg.append("text").attr("x", M.left).attr("y", 58)
    .attr("fill", sg.colors.textSecondary).attr("font-size", "13px")
    .text("How Latin script colonized digital typography—and left billions behind");
  
  // ─── Axis Titles ───
  svg.append("text").attr("x", W / 2).attr("y", H - 12)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textSecondary).attr("font-size", "11px")
    .text("YEAR ENTERED DIGITAL AGE →");
  
  svg.append("text")
    .attr("transform", `translate(18,${H/2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textSecondary).attr("font-size", "11px")
    .text("← INEQUALITY RATIO");
  
  // ─── Legend ───
  const legend = svg.append("g").attr("transform", `translate(${W - 180}, 25)`);
  const legendItems = [
    { label: "Latin / Dominant", color: sg.colors.status.dominant },
    { label: "Privileged (<2×)", color: sg.colors.status.privileged },
    { label: "Struggling (2-10×)", color: sg.colors.status.struggling },
    { label: "Neglected (>10×)", color: sg.colors.status.neglected },
    { label: "Noto-only", color: sg.colors.status.notoOnly }
  ];
  
  legend.selectAll("g").data(legendItems).join("g")
    .attr("transform", (d, i) => `translate(0,${i * 16})`)
    .call(g => g.append("circle").attr("r", 5).attr("fill", d => d.color))
    .call(g => g.append("text").attr("x", 12).attr("y", 4)
      .attr("fill", sg.colors.textMuted).attr("font-size", "10px").text(d => d.label));
  
  // ─── Source ───
  svg.append("text").attr("x", W - M.right).attr("y", H - 10)
    .attr("text-anchor", "end")
    .attr("fill", sg.colors.textSubtle).attr("font-size", "9px")
    .text("Data: Google Fonts, Unicode CLDR • github.com/khush-tawar/Typographic-Colonialism");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 6: Stats Cards (Compact)
// ═══════════════════════════════════════════════════════════════════════════════
waitStats = {
  const sg = styleGuide;
  const { stats, nodes } = waitData;
  const latin = nodes.find(n => n.code === "Latn");
  const hans = nodes.find(n => n.code === "Hans");
  
  const cards = [
    { value: latin?.fontCount.toLocaleString(), label: "Latin fonts", sub: "First digital: 1984", color: sg.colors.status.dominant },
    { value: `${Math.round(hans?.inequalityRatio || 59)}×`, label: "Han inequality", sub: "1.6B speakers", color: sg.colors.status.neglected },
    { value: stats.notoOnly, label: "Noto-only scripts", sub: "No alternatives", color: sg.colors.status.notoOnly },
    { value: stats.neglected, label: "Neglected scripts", sub: ">10× inequality", color: sg.colors.status.struggling }
  ];
  
  return html`<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:16px; font-family:${sg.typography.fontFamily};">
    ${cards.map(c => html`<div style="background:${sg.colors.backgroundAlt}; border-left:4px solid ${c.color}; padding:16px; border-radius:0 4px 4px 0;">
      <div style="font-size:${sg.typography.dataLarge.size}; font-weight:700; color:${c.color};">${c.value}</div>
      <div style="font-size:12px; color:${sg.colors.textSecondary}; margin-top:4px;">${c.label}</div>
      <div style="font-size:10px; color:${sg.colors.textMuted}; margin-top:8px;">${c.sub}</div>
    </div>`)}
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 7: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width:1200px; margin:0 auto;">
  ${waitChart}
  ${waitStats}
  <div style="text-align:center; margin-top:12px; font-size:11px; color:${styleGuide.colors.textMuted};">
    Figure 2: The Wait vs Web Domination — Script inequality over time
  </div>
</div>`
