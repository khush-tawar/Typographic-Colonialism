// ═══════════════════════════════════════════════════════════════════════════════
// THE WAIT VS WEB DOMINATION - v4 (Editorial / Data Speaks)
// ═══════════════════════════════════════════════════════════════════════════════
// A more impactful visualization where the data tells the story

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Style Guide + Helpers (assumes styleGuide already loaded)
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Process Data with Richer Metrics
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
      const yearsWaiting = digitalStart - 1984;
      
      return {
        code, 
        name: d.name || code,
        digitalStart, 
        yearsWaiting,
        inequalityRatio: ineq.inequality_ratio || 1,
        speakers: d.speakers || 0,
        speakersM: (d.speakers || 0) / 1e6,
        speakersB: (d.speakers || 0) / 1e9,
        fontCount: d.font_count || 0,
        fontsPerM: ineq.fonts_per_100m || 0,
        notoOnly,
        rtl: d.rtl || false,
        languages: d.languages?.length || 0,
        countries: d.countries?.length || 0
      };
    });
  
  const nodeSet = new Set(nodes.map(n => n.code));
  const links = (graphData.d3_ready?.script_network?.links || [])
    .filter(l => nodeSet.has(l.source) && nodeSet.has(l.target));
  
  const latin = nodes.find(n => n.code === "Latn");
  const sortedByInequality = [...nodes].sort((a, b) => b.inequalityRatio - a.inequalityRatio);
  const sortedBySpeakers = [...nodes].sort((a, b) => b.speakers - a.speakers);
  
  // Calculate "people left behind" - speakers with >10x inequality
  const neglectedSpeakers = nodes
    .filter(n => n.inequalityRatio > 10)
    .reduce((sum, n) => sum + n.speakers, 0);
  
  return { 
    nodes, links,
    latin,
    topInequality: sortedByInequality.slice(0, 10),
    topSpeakers: sortedBySpeakers.slice(0, 15),
    stats: {
      total: nodes.length,
      latinFonts: latin?.fontCount || 1900,
      notoOnly: nodes.filter(n => n.notoOnly).length,
      neglected: nodes.filter(n => n.inequalityRatio > 10).length,
      neglectedSpeakers,
      neglectedSpeakersB: neglectedSpeakers / 1e9,
      avgWait: d3.mean(nodes.filter(n => n.code !== "Latn"), d => d.yearsWaiting),
      maxInequality: d3.max(nodes, d => d.inequalityRatio)
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Main Visualization - Editorial Style
// ═══════════════════════════════════════════════════════════════════════════════
waitChart = {
  const sg = styleGuide;
  const { nodes, links, stats, latin, topSpeakers } = waitData;
  
  const W = 1200, H = 900;
  const M = { top: 120, right: 200, bottom: 100, left: 100 };
  const innerW = W - M.left - M.right, innerH = H - M.top - M.bottom;
  
  // Scales
  const xScale = d3.scaleLinear().domain([1982, 2022]).range([0, innerW]);
  const yScale = d3.scaleLog().domain([0.5, 120]).range([innerH, 0]).clamp(true);
  const sizeScale = d3.scaleSqrt().domain([0, 2e9]).range([4, 80]);
  const nodeMap = new Map(nodes.map(n => [n.code, n]));
  
  // Get status color
  const getColor = (d) => {
    if (d.code === "Latn") return sg.colors.status.dominant;
    if (d.notoOnly) return sg.colors.status.notoOnly;
    if (d.inequalityRatio < 2) return sg.colors.status.privileged;
    if (d.inequalityRatio < 10) return sg.colors.status.struggling;
    return sg.colors.status.neglected;
  };
  
  // SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%").style("height", "auto")
    .style("background", sg.colors.background)
    .style("font-family", sg.typography.fontFamily);
  
  // Defs
  const defs = svg.append("defs");
  
  // Glow filter for Latin
  const glow = defs.append("filter").attr("id", "latinGlow");
  glow.append("feGaussianBlur").attr("stdDeviation", "8").attr("result", "blur");
  glow.append("feMerge").call(m => {
    m.append("feMergeNode").attr("in", "blur");
    m.append("feMergeNode").attr("in", "SourceGraphic");
  });
  
  // Radial gradient for Latin
  const latinGrad = defs.append("radialGradient").attr("id", "latinGrad");
  latinGrad.append("stop").attr("offset", "0%").attr("stop-color", "#fff");
  latinGrad.append("stop").attr("offset", "40%").attr("stop-color", sg.colors.status.dominant);
  latinGrad.append("stop").attr("offset", "100%").attr("stop-color", sg.colors.status.dominant).attr("stop-opacity", 0.7);
  
  const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
  
  // ─── LAYER 0: Dramatic headline ───
  svg.append("text").attr("x", M.left).attr("y", 45)
    .attr("fill", sg.colors.textPrimary)
    .attr("font-size", "32px").attr("font-weight", "300")
    .text("The Typography Divide");
  
  svg.append("text").attr("x", M.left).attr("y", 72)
    .attr("fill", sg.colors.textSecondary).attr("font-size", "15px")
    .text("How digital fonts left billions of people behind");
  
  // Big stat callout
  svg.append("text").attr("x", M.left).attr("y", 100)
    .attr("fill", sg.colors.status.neglected).attr("font-size", "13px").attr("font-weight", "600")
    .text(`${stats.neglectedSpeakersB.toFixed(1)} BILLION people use scripts with >10× font inequality`);
  
  // ─── LAYER 1: Background zones with labels ───
  const zones = [
    { y0: 0.5, y1: 2, color: sg.colors.status.privileged, opacity: 0.06, label: "Parity Zone", desc: "< 2× inequality" },
    { y0: 2, y1: 10, color: sg.colors.status.struggling, opacity: 0.06, label: "Underserved", desc: "2-10× inequality" },
    { y0: 10, y1: 120, color: sg.colors.status.neglected, opacity: 0.08, label: "Font Poverty", desc: "> 10× inequality" }
  ];
  
  zones.forEach(z => {
    g.append("rect")
      .attr("x", 0).attr("width", innerW)
      .attr("y", yScale(z.y1))
      .attr("height", yScale(z.y0) - yScale(z.y1))
      .attr("fill", z.color).attr("opacity", z.opacity);
    
    // Zone label on right
    const midY = (yScale(z.y0) + yScale(z.y1)) / 2;
    g.append("text")
      .attr("x", innerW + 15).attr("y", midY - 6)
      .attr("fill", z.color).attr("font-size", "12px").attr("font-weight", "700")
      .text(z.label);
    g.append("text")
      .attr("x", innerW + 15).attr("y", midY + 8)
      .attr("fill", sg.colors.textMuted).attr("font-size", "10px")
      .text(z.desc);
  });
  
  // ─── LAYER 2: Timeline grid ───
  const keyYears = [
    { year: 1984, label: "PostScript", color: sg.colors.status.dominant },
    { year: 1991, label: "TrueType" },
    { year: 1996, label: "CSS Fonts" },
    { year: 2010, label: "Google Fonts" },
    { year: 2014, label: "Noto Project" }
  ];
  
  keyYears.forEach(({ year, label, color }) => {
    const x = xScale(year);
    g.append("line")
      .attr("x1", x).attr("x2", x)
      .attr("y1", -10).attr("y2", innerH)
      .attr("stroke", color || sg.colors.grid)
      .attr("stroke-width", year === 1984 ? 2 : 1)
      .attr("stroke-dasharray", year === 1984 ? "none" : "4,4");
    
    g.append("text")
      .attr("x", x).attr("y", innerH + 20)
      .attr("text-anchor", "middle")
      .attr("fill", color || sg.colors.textMuted)
      .attr("font-size", "11px").attr("font-weight", year === 1984 ? "700" : "400")
      .text(year);
    
    if (label) {
      g.append("text")
        .attr("x", x).attr("y", innerH + 34)
        .attr("text-anchor", "middle")
        .attr("fill", sg.colors.textMuted).attr("font-size", "9px")
        .text(label);
    }
  });
  
  // Y-axis
  const yTicks = [1, 2, 5, 10, 25, 50, 100];
  yTicks.forEach(tick => {
    g.append("line")
      .attr("x1", -5).attr("x2", innerW)
      .attr("y1", yScale(tick)).attr("y2", yScale(tick))
      .attr("stroke", tick === 1 ? sg.colors.textMuted : sg.colors.grid)
      .attr("stroke-width", tick === 1 ? 1.5 : 0.5)
      .attr("stroke-dasharray", tick === 1 ? "none" : "2,4");
    
    g.append("text")
      .attr("x", -12).attr("y", yScale(tick) + 4)
      .attr("text-anchor", "end")
      .attr("fill", tick === 1 ? sg.colors.status.privileged : sg.colors.textMuted)
      .attr("font-size", "10px")
      .text(tick === 1 ? "Equal" : `${tick}×`);
  });
  
  // ─── LAYER 3: Connections (subtle) ───
  g.append("g").attr("opacity", 0.3)
    .selectAll("path").data(links.filter(l => l.source === "Latn" || l.target === "Latn")).join("path")
    .attr("d", d => {
      const s = nodeMap.get(d.source), t = nodeMap.get(d.target);
      if (!s || !t) return null;
      const x1 = xScale(s.digitalStart), y1 = yScale(s.inequalityRatio);
      const x2 = xScale(t.digitalStart), y2 = yScale(t.inequalityRatio);
      return `M${x1},${y1} Q${(x1+x2)/2},${Math.min(y1,y2)-40} ${x2},${y2}`;
    })
    .attr("fill", "none")
    .attr("stroke", sg.colors.accent)
    .attr("stroke-width", 0.8);
  
  // ─── LAYER 4: Nodes (bubbles sized by SPEAKERS) ───
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.code === "Latn") return 1;
    if (b.code === "Latn") return -1;
    return a.speakers - b.speakers;
  });
  
  const nodeG = g.append("g").attr("class", "nodes")
    .selectAll("g").data(sortedNodes).join("g")
    .attr("transform", d => `translate(${xScale(d.digitalStart)},${yScale(d.inequalityRatio)})`);
  
  // Bubble
  nodeG.append("circle")
    .attr("r", d => d.code === "Latn" ? 60 : sizeScale(d.speakers))
    .attr("fill", d => d.code === "Latn" ? "url(#latinGrad)" : getColor(d))
    .attr("fill-opacity", d => d.code === "Latn" ? 1 : 0.7)
    .attr("stroke", d => d.code === "Latn" ? "#fff" : getColor(d))
    .attr("stroke-width", d => d.code === "Latn" ? 3 : 1.5)
    .attr("filter", d => d.code === "Latn" ? "url(#latinGlow)" : null)
    .style("cursor", "pointer");
  
  // Noto-only ring
  nodeG.filter(d => d.notoOnly)
    .append("circle")
    .attr("r", d => sizeScale(d.speakers) + 4)
    .attr("fill", "none")
    .attr("stroke", sg.colors.status.notoOnly)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "3,2");
  
  // ─── LAYER 5: Key script labels ───
  const keyScripts = ["Latn", "Arab", "Hans", "Deva", "Beng", "Cyrl", "Jpan", "Kore", "Thai", "Taml", "Grek", "Hebr"];
  
  nodeG.filter(d => keyScripts.includes(d.code))
    .append("text")
    .attr("y", d => d.code === "Latn" ? -70 : -sizeScale(d.speakers) - 8)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textPrimary)
    .attr("font-size", d => d.code === "Latn" ? "14px" : "11px")
    .attr("font-weight", d => d.code === "Latn" ? "700" : "500")
    .text(d => d.name);
  
  // Font count under label
  nodeG.filter(d => keyScripts.includes(d.code) && d.code !== "Latn")
    .append("text")
    .attr("y", d => -sizeScale(d.speakers) + 4)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textMuted)
    .attr("font-size", "9px")
    .text(d => `${d.fontCount} fonts`);
  
  // ─── LAYER 6: Annotated callouts ───
  
  // Latin callout
  const latinX = xScale(latin.digitalStart), latinY = yScale(latin.inequalityRatio);
  g.append("text")
    .attr("x", latinX).attr("y", latinY + 85)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.status.dominant).attr("font-size", "28px").attr("font-weight", "700")
    .text(latin.fontCount.toLocaleString());
  g.append("text")
    .attr("x", latinX).attr("y", latinY + 102)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textMuted).attr("font-size", "11px")
    .text("fonts for Latin script");
  
  // Han callout (most extreme large script)
  const hans = nodes.find(n => n.code === "Hans");
  if (hans) {
    const hx = xScale(hans.digitalStart), hy = yScale(hans.inequalityRatio);
    const calloutX = hx + 100, calloutY = hy - 40;
    
    g.append("path")
      .attr("d", `M${hx + 15},${hy - 10} L${calloutX - 5},${calloutY + 15} L${calloutX - 5},${calloutY - 30}`)
      .attr("fill", "none").attr("stroke", sg.colors.status.neglected)
      .attr("stroke-width", 1.5);
    
    g.append("rect")
      .attr("x", calloutX - 10).attr("y", calloutY - 55)
      .attr("width", 160).attr("height", 70)
      .attr("fill", sg.colors.backgroundAlt)
      .attr("stroke", sg.colors.status.neglected).attr("stroke-width", 2)
      .attr("rx", 4);
    
    g.append("text").attr("x", calloutX).attr("y", calloutY - 35)
      .attr("fill", sg.colors.status.neglected).attr("font-size", "24px").attr("font-weight", "700")
      .text(`${Math.round(hans.inequalityRatio)}× worse`);
    g.append("text").attr("x", calloutX).attr("y", calloutY - 18)
      .attr("fill", sg.colors.textPrimary).attr("font-size", "11px")
      .text("than Latin script");
    g.append("text").attr("x", calloutX).attr("y", calloutY)
      .attr("fill", sg.colors.textMuted).attr("font-size", "10px")
      .text(`${hans.speakersB.toFixed(1)}B speakers • ${hans.fontCount} fonts`);
  }
  
  // Arabic callout (RTL)
  const arab = nodes.find(n => n.code === "Arab");
  if (arab) {
    const ax = xScale(arab.digitalStart), ay = yScale(arab.inequalityRatio);
    g.append("text")
      .attr("x", ax + sizeScale(arab.speakers) + 8).attr("y", ay + 4)
      .attr("fill", sg.colors.status.struggling).attr("font-size", "10px").attr("font-weight", "600")
      .text("RTL");
  }
  
  // Adlam callout (latest entrant)
  const adlam = nodes.find(n => n.code === "Adlm");
  if (adlam) {
    const adx = xScale(adlam.digitalStart), ady = yScale(adlam.inequalityRatio);
    g.append("line")
      .attr("x1", adx).attr("y1", ady + 15)
      .attr("x2", adx).attr("y2", innerH - 50)
      .attr("stroke", sg.colors.status.notoOnly).attr("stroke-dasharray", "4,3");
    g.append("text")
      .attr("x", adx).attr("y", innerH - 35)
      .attr("text-anchor", "middle")
      .attr("fill", sg.colors.status.notoOnly).attr("font-size", "11px").attr("font-weight", "600")
      .text(`${adlam.yearsWaiting} years behind Latin`);
    g.append("text")
      .attr("x", adx).attr("y", innerH - 22)
      .attr("text-anchor", "middle")
      .attr("fill", sg.colors.textMuted).attr("font-size", "9px")
      .text("Adlam script (2016)");
  }
  
  // ─── LAYER 7: Legend ───
  const legend = svg.append("g").attr("transform", `translate(${W - 185}, ${M.top})`);
  
  legend.append("text")
    .attr("fill", sg.colors.textPrimary).attr("font-size", "11px").attr("font-weight", "700")
    .text("BUBBLE SIZE = SPEAKERS");
  
  // Size legend
  [100e6, 500e6, 1e9].forEach((pop, i) => {
    const r = sizeScale(pop);
    const y = 35 + i * 45;
    legend.append("circle")
      .attr("cx", 25).attr("cy", y)
      .attr("r", r)
      .attr("fill", "none").attr("stroke", sg.colors.textMuted).attr("stroke-dasharray", "2,2");
    legend.append("text")
      .attr("x", 55).attr("y", y + 4)
      .attr("fill", sg.colors.textMuted).attr("font-size", "10px")
      .text(pop >= 1e9 ? `${pop/1e9}B` : `${pop/1e6}M`);
  });
  
  // Color legend
  const colorLegend = legend.append("g").attr("transform", "translate(0, 180)");
  colorLegend.append("text")
    .attr("fill", sg.colors.textPrimary).attr("font-size", "11px").attr("font-weight", "700")
    .text("INEQUALITY STATUS");
  
  const legendItems = [
    { color: sg.colors.status.dominant, label: "Latin (baseline)" },
    { color: sg.colors.status.privileged, label: "Near parity" },
    { color: sg.colors.status.struggling, label: "Underserved" },
    { color: sg.colors.status.neglected, label: "Font poverty" },
    { color: sg.colors.status.notoOnly, label: "Noto-only" }
  ];
  
  legendItems.forEach((item, i) => {
    const y = 20 + i * 22;
    colorLegend.append("circle")
      .attr("cx", 8).attr("cy", y)
      .attr("r", 6).attr("fill", item.color);
    colorLegend.append("text")
      .attr("x", 22).attr("y", y + 4)
      .attr("fill", sg.colors.textMuted).attr("font-size", "10px")
      .text(item.label);
  });
  
  // ─── LAYER 8: Axis labels ───
  svg.append("text")
    .attr("x", M.left + innerW / 2).attr("y", H - 25)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textSecondary).attr("font-size", "12px")
    .text("YEAR SCRIPT ENTERED DIGITAL AGE →");
  
  svg.append("text")
    .attr("transform", `translate(25, ${M.top + innerH/2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textSecondary).attr("font-size", "12px")
    .text("← FONT INEQUALITY (× worse than Latin)");
  
  // ─── Source ───
  svg.append("text")
    .attr("x", W - 20).attr("y", H - 10)
    .attr("text-anchor", "end")
    .attr("fill", sg.colors.textSubtle).attr("font-size", "9px")
    .text("Data: Google Fonts API, Unicode CLDR, ISO 15924 | github.com/khush-tawar/Typographic-Colonialism");
  
  // ─── Tooltip ───
  const tooltip = svg.append("g").attr("display", "none");
  const tooltipBg = tooltip.append("rect")
    .attr("fill", "rgba(42,42,42,0.95)").attr("rx", 6);
  const tooltipText = tooltip.append("g");
  
  nodeG.selectAll("circle:first-child")
    .on("mouseenter", function(event, d) {
      d3.select(this).attr("stroke-width", 3);
      
      const lines = [
        { text: d.name, size: "14px", weight: "700", color: "#fff" },
        { text: `${d.fontCount} fonts`, size: "12px", color: getColor(d) },
        { text: `${d.inequalityRatio.toFixed(1)}× inequality`, size: "11px", color: sg.colors.status.neglected },
        { text: `${d.speakersB >= 1 ? d.speakersB.toFixed(2) + 'B' : d.speakersM.toFixed(0) + 'M'} speakers`, size: "11px" },
        { text: `Digital since ${d.digitalStart}`, size: "10px", color: sg.colors.textMuted },
        { text: d.notoOnly ? "⚠ Noto-only (no alternatives)" : "", size: "10px", color: sg.colors.status.notoOnly }
      ].filter(l => l.text);
      
      tooltipText.selectAll("*").remove();
      lines.forEach((l, i) => {
        tooltipText.append("text")
          .attr("x", 12).attr("y", 20 + i * 18)
          .attr("fill", l.color || "#fff")
          .attr("font-size", l.size || "11px")
          .attr("font-weight", l.weight || "400")
          .text(l.text);
      });
      
      const h = lines.length * 18 + 16;
      tooltipBg.attr("width", 200).attr("height", h);
      
      const x = Math.min(xScale(d.digitalStart) + M.left + 50, W - 220);
      const y = Math.max(yScale(d.inequalityRatio) + M.top - h/2, 10);
      tooltip.attr("transform", `translate(${x},${y})`).attr("display", null);
    })
    .on("mouseleave", function(event, d) {
      d3.select(this).attr("stroke-width", d.code === "Latn" ? 3 : 1.5);
      tooltip.attr("display", "none");
    });
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Key Insights Panel
// ═══════════════════════════════════════════════════════════════════════════════
insightsPanel = {
  const sg = styleGuide;
  const { stats, latin, topInequality, nodes } = waitData;
  
  const hans = nodes.find(n => n.code === "Hans");
  const arab = nodes.find(n => n.code === "Arab");
  const deva = nodes.find(n => n.code === "Deva");
  
  return html`
  <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; margin-top:24px; font-family:${sg.typography.fontFamily};">
    
    <!-- Latin dominance -->
    <div style="background:${sg.colors.backgroundAlt}; padding:24px; border-radius:8px; border-top:4px solid ${sg.colors.status.dominant};">
      <div style="font-size:48px; font-weight:700; color:${sg.colors.status.dominant}; line-height:1;">
        ${latin.fontCount.toLocaleString()}
      </div>
      <div style="font-size:14px; color:${sg.colors.textSecondary}; margin-top:8px;">
        fonts for Latin script
      </div>
      <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:12px; padding-top:12px; border-top:1px solid ${sg.colors.borderLight};">
        <strong>${((latin.fontCount / 1916) * 100).toFixed(0)}%</strong> of all Google Fonts
      </div>
    </div>
    
    <!-- People affected -->
    <div style="background:${sg.colors.backgroundAlt}; padding:24px; border-radius:8px; border-top:4px solid ${sg.colors.status.neglected};">
      <div style="font-size:48px; font-weight:700; color:${sg.colors.status.neglected}; line-height:1;">
        ${stats.neglectedSpeakersB.toFixed(1)}B
      </div>
      <div style="font-size:14px; color:${sg.colors.textSecondary}; margin-top:8px;">
        people in font poverty
      </div>
      <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:12px; padding-top:12px; border-top:1px solid ${sg.colors.borderLight};">
        Scripts with <strong>&gt;10×</strong> inequality vs Latin
      </div>
    </div>
    
    <!-- Han example -->
    <div style="background:${sg.colors.backgroundAlt}; padding:24px; border-radius:8px; border-top:4px solid ${sg.colors.status.struggling};">
      <div style="font-size:48px; font-weight:700; color:${sg.colors.status.struggling}; line-height:1;">
        ${Math.round(hans?.inequalityRatio || 59)}×
      </div>
      <div style="font-size:14px; color:${sg.colors.textSecondary}; margin-top:8px;">
        Han script inequality
      </div>
      <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:12px; padding-top:12px; border-top:1px solid ${sg.colors.borderLight};">
        <strong>1.6 billion</strong> speakers, only <strong>${hans?.fontCount}</strong> fonts
      </div>
    </div>
    
    <!-- Noto dependency -->
    <div style="background:${sg.colors.backgroundAlt}; padding:24px; border-radius:8px; border-top:4px solid ${sg.colors.status.notoOnly};">
      <div style="font-size:48px; font-weight:700; color:${sg.colors.status.notoOnly}; line-height:1;">
        ${stats.notoOnly}
      </div>
      <div style="font-size:14px; color:${sg.colors.textSecondary}; margin-top:8px;">
        Noto-only scripts
      </div>
      <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:12px; padding-top:12px; border-top:1px solid ${sg.colors.borderLight};">
        Would have <strong>zero</strong> free fonts without Google
      </div>
    </div>
    
  </div>
  
  <!-- Bottom insight -->
  <div style="background:linear-gradient(135deg, ${sg.colors.status.neglected}15, ${sg.colors.status.struggling}10); 
              padding:20px 24px; margin-top:20px; border-radius:8px; border-left:4px solid ${sg.colors.status.neglected};
              font-family:${sg.typography.fontFamily};">
    <div style="font-size:13px; color:${sg.colors.textPrimary}; line-height:1.6;">
      <strong style="color:${sg.colors.status.neglected};">The Pattern:</strong> 
      Scripts entered the digital age over a <strong>32-year span</strong>. Latin had a 
      <strong>${Math.round(stats.avgWait)}-year head start</strong> on average—time that compounded into 
      ${stats.latinFonts.toLocaleString()} fonts while some scripts still have only Noto.
    </div>
  </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 5: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width:1200px; margin:0 auto; padding:20px;">
  ${waitChart}
  ${insightsPanel}
  <div style="text-align:center; margin-top:20px; font-size:11px; color:${styleGuide.colors.textMuted};">
    Figure 2: The Wait vs Web Domination — Each bubble represents a writing system, sized by speaker population
  </div>
</div>`
