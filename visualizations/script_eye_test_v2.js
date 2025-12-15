// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPT EYE TEST v2 - "Can You Read Your Script?"
// ═══════════════════════════════════════════════════════════════════════════════
// Eye chart style - font size = font availability. TRUE linear scaling.
// Uses Latin letters for guaranteed rendering - size represents each script's font availability.

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Process Data for Eye Test
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestData = {
  const scripts = masterData.scripts || {};
  const inequality = new Map((masterData.inequality_metrics || []).map(d => [d.code, d]));
  
  // Use LATIN letters for ALL rows - they will actually render
  // The SIZE represents font availability, the script name is shown on the side
  const eyeChartLines = [
    "E  F  P  T  O  Z",
    "L  P  E  D  C  F",
    "D  E  F  P  O  T",
    "P  E  C  F  D  Z",
    "F  Z  B  D  E  O",
    "O  F  L  C  T  B",
    "Z  C  E  D  F  P",
    "B  E  P  D  Z  F",
    "T  D  F  E  O  Z",
    "E  D  F  C  Z  P",
    "D  Z  P  E  F  T",
    "F  E  D  P  O  C",
    "P  D  E  F  C  Z",
    "C  Z  E  F  D  P",
    "E  F  D  P  Z  O",
    "Z  E  F  P  D  C",
    "D  P  E  F  Z  C",
    "F  C  D  E  P  Z",
    "E  Z  F  D  P  O",
    "P  E  D  F  Z  C",
    "C  D  E  F  P  Z",
    "E  F  D  C  Z  P",
    "D  E  P  F  Z  C",
    "F  D  E  Z  P  C",
    "E  F  P  D  C  Z",
    "Z  F  E  D  P  C",
    "P  D  F  E  C  Z",
    "E  C  D  F  Z  P",
    "F  E  Z  D  P  C",
    "D  F  E  P  C  Z"
  ];
  
  // Build rows for the eye chart
  const rows = Object.entries(scripts)
    .filter(([code, d]) => d.font_count > 0)
    .map(([code, d], i) => {
      const ineq = inequality.get(code) || {};
      return {
        code,
        name: d.name || code,
        letters: eyeChartLines[i % eyeChartLines.length],
        fontCount: d.font_count || 0,
        speakers: d.speakers || 0,
        inequalityRatio: ineq.inequality_ratio || 1,
        notoOnly: d.font_count <= (d.noto_families?.length || 0) + 1 && code !== "Latn"
      };
    })
    .sort((a, b) => b.fontCount - a.fontCount);
  
  // Get Latin for reference
  const latin = rows.find(r => r.code === "Latn");
  const maxFonts = latin?.fontCount || 1900;
  
  // TRUE LINEAR PROPORTIONAL SCALING
  // Latin (1900 fonts) = 72px (nice readable size)
  // Everything else = (fonts/1900) * 72px
  // This means: Cyrillic (315) = 12px, Greek (124) = 5px, Devanagari (62) = 2px
  rows.forEach((r, i) => {
    const ratio = r.fontCount / maxFonts;
    r.fontSize = Math.max(2, Math.round(ratio * 72)); // 2px min so it renders, 72px max
    r.truePercentage = (ratio * 100).toFixed(1);
    r.letters = eyeChartLines[i % eyeChartLines.length];
  });
  
  return { rows, latin, maxFonts };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: The Eye Test Visualization
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestChart = {
  const sg = styleGuide;
  const { rows, latin, maxFonts } = eyeTestData;
  
  // Show more rows to emphasize the dropoff
  const displayRows = rows.slice(0, 20);
  
  const W = 900, H = 1000;
  const M = { top: 120, right: 220, bottom: 100, left: 50 };
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%")
    .style("height", "auto")
    .style("background", "#FAFAFA")
    .style("font-family", "'Courier New', Courier, monospace"); // Monospace for eye chart feel
  
  // ─── Title ───
  svg.append("text")
    .attr("x", W / 2).attr("y", 40)
    .attr("text-anchor", "middle")
    .attr("fill", "#1a1a1a")
    .attr("font-size", "28px")
    .attr("font-weight", "700")
    .attr("letter-spacing", "3px")
    .text("SCRIPT VISIBILITY TEST");
  
  svg.append("text")
    .attr("x", W / 2).attr("y", 65)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", "13px")
    .text("Letter size = proportional to fonts available. No log scale. No tricks.");
  
  svg.append("text")
    .attr("x", W / 2).attr("y", 90)
    .attr("text-anchor", "middle")
    .attr("fill", "#999")
    .attr("font-size", "11px")
    .text(`Formula: size = (fonts ÷ ${maxFonts.toLocaleString()}) × 72px`);
  
  // ─── Chart area ───
  const chartArea = svg.append("g")
    .attr("transform", `translate(${M.left}, ${M.top})`);
  
  // Calculate row heights dynamically based on font size
  let currentY = 20;
  
  displayRows.forEach((row, i) => {
    const rowG = chartArea.append("g")
      .attr("transform", `translate(0, ${currentY})`);
    
    // Color based on status
    let color = "#333";
    if (row.code === "Latn") color = sg.colors.status.dominant;
    else if (row.notoOnly) color = sg.colors.status.notoOnly;
    else if (row.fontCount < 20) color = sg.colors.status.neglected;
    else if (row.fontCount < 100) color = sg.colors.status.struggling;
    else color = sg.colors.status.privileged;
    
    // The letters - centered
    const textX = (W - M.left - M.right) / 2;
    
    rowG.append("text")
      .attr("x", textX)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", color)
      .attr("font-size", `${row.fontSize}px`)
      .attr("font-weight", "700")
      .attr("letter-spacing", `${Math.max(1, row.fontSize / 8)}px`)
      .text(row.letters);
    
    // Right side info
    const statsX = W - M.left - M.right + 20;
    
    rowG.append("text")
      .attr("x", statsX)
      .attr("y", -4)
      .attr("fill", color)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("font-family", sg.typography.fontFamily)
      .text(row.name.length > 20 ? row.name.slice(0, 18) + "…" : row.name);
    
    rowG.append("text")
      .attr("x", statsX)
      .attr("y", 10)
      .attr("fill", "#888")
      .attr("font-size", "9px")
      .attr("font-family", sg.typography.fontFamily)
      .text(`${row.fontCount} fonts → ${row.fontSize}px`);
    
    // Row spacing: font size + padding
    currentY += Math.max(row.fontSize, 16) + 12;
  });
  
  // ─── Visual scale reference ───
  const scaleY = H - 60;
  const scaleG = svg.append("g")
    .attr("transform", `translate(${M.left}, ${scaleY})`);
  
  scaleG.append("text")
    .attr("x", 0).attr("y", -20)
    .attr("fill", "#666")
    .attr("font-size", "10px")
    .attr("font-family", sg.typography.fontFamily)
    .text("SCALE:");
  
  // Show actual data points as scale
  const scalePoints = [
    { fonts: 1900, label: "Latin" },
    { fonts: 315, label: "Cyrillic" },
    { fonts: 62, label: "Devanagari" },
    { fonts: 10, label: "10 fonts" },
    { fonts: 1, label: "1 font" }
  ];
  
  let scaleX = 50;
  scalePoints.forEach(pt => {
    const sz = Math.max(2, Math.round((pt.fonts / maxFonts) * 72));
    
    scaleG.append("text")
      .attr("x", scaleX)
      .attr("y", 0)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#333")
      .attr("font-size", `${Math.min(sz, 24)}px`)
      .attr("font-weight", "700")
      .text("E");
    
    scaleG.append("text")
      .attr("x", scaleX)
      .attr("y", 20)
      .attr("text-anchor", "start")
      .attr("fill", "#888")
      .attr("font-size", "8px")
      .attr("font-family", sg.typography.fontFamily)
      .text(`${pt.fonts} → ${sz}px`);
    
    scaleX += 130;
  });
  
  // ─── Source ───
  svg.append("text")
    .attr("x", W - 10)
    .attr("y", H - 10)
    .attr("text-anchor", "end")
    .attr("fill", "#bbb")
    .attr("font-size", "8px")
    .attr("font-family", sg.typography.fontFamily)
    .text("Data: Google Fonts API • github.com/khush-tawar/Typographic-Colonialism");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Insight Panel
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestInsights = {
  const sg = styleGuide;
  const { rows, latin, maxFonts } = eyeTestData;
  
  const cyrillic = rows.find(r => r.code === "Cyrl");
  const devanagari = rows.find(r => r.code === "Deva");
  const smallest = rows.slice(-5);
  
  return html`
  <div style="max-width:900px; margin:20px auto; font-family:${sg.typography.fontFamily};">
    
    <!-- Headline -->
    <div style="background:#fff; padding:24px; border-radius:8px; border-left:4px solid ${sg.colors.status.neglected}; margin-bottom:20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="font-size:13px; color:#666; margin-bottom:8px;">THE GAP, VISUALIZED:</div>
      <div style="font-size:20px; color:#1a1a1a; line-height:1.5;">
        <strong style="color:${sg.colors.status.dominant};">Latin</strong>: ${latin.fontCount.toLocaleString()} fonts → <strong>${latin.fontSize}px</strong><br>
        <strong style="color:${sg.colors.status.privileged};">Cyrillic</strong>: ${cyrillic?.fontCount || 315} fonts → <strong>${cyrillic?.fontSize || 12}px</strong> (${cyrillic?.truePercentage || "16.6"}% of Latin)<br>
        <strong style="color:${sg.colors.status.struggling};">Devanagari</strong>: ${devanagari?.fontCount || 62} fonts → <strong>${devanagari?.fontSize || 2}px</strong> (${devanagari?.truePercentage || "3.3"}% of Latin)
      </div>
    </div>
    
    <!-- The point -->
    <div style="text-align:center; padding:16px; background:#FAFAFA; border-radius:8px;">
      <div style="font-size:12px; color:#666;">
        If the bottom rows are barely visible, that's exactly how font-poor scripts appear on the web.<br>
        <strong>The data speaks. No categories. No normalization.</strong>
      </div>
    </div>
    
  </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width:900px; margin:0 auto;">
  ${eyeTestChart}
  ${eyeTestInsights}
</div>`
