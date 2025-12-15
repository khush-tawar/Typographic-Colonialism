// ═══════════════════════════════════════════════════════════════════════════════
// FONT DISTRIBUTION WHEEL - Using masterData
// ═══════════════════════════════════════════════════════════════════════════════
// Interactive sunburst showing: Scripts → Categories → Fonts
// All data pulled from masterData - no external dependencies

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: View Mode Toggle
// ═══════════════════════════════════════════════════════════════════════════════
viewof viewMode = Inputs.radio(
  ["population", "fonts"],
  {
    label: "",
    value: "population",
    format: d => d === "population" ? "BY POPULATION" : "BY FONT COUNT"
  }
)

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Build Hierarchical Data from masterData
// ═══════════════════════════════════════════════════════════════════════════════
hierarchicalData = {
  const scripts = masterData.scripts || {};
  const fonts = masterData.fonts || [];
  
  // Build script nodes with category breakdown
  const scriptNodes = Object.entries(scripts)
    .filter(([code, s]) => s.font_count > 0)
    .map(([code, s]) => {
      const categoryOrder = ["sans-serif", "serif", "display", "handwriting", "monospace"];
      const fontsByCategory = s.fonts_by_category || {};
      
      // Build category children with their fonts
      const categoryChildren = categoryOrder
        .filter(cat => fontsByCategory[cat] > 0)
        .map(cat => {
          // Get actual fonts for this script + category
          const categoryFonts = fonts
            .filter(f => f.scripts?.includes(code) && f.category === cat)
            .map(f => ({
              name: f.family,
              value: 1,
              category: cat
            }));
          
          return {
            name: cat,
            fontCount: fontsByCategory[cat] || 0,
            value: fontsByCategory[cat] || 0,
            children: categoryFonts.length > 0 ? categoryFonts : undefined
          };
        });
      
      return {
        code,
        name: s.name || code,
        speakers: s.speakers || 0,
        fontCount: s.font_count || 0,
        languageCount: (s.languages || []).length,
        value: s.font_count || 0,
        children: categoryChildren
      };
    });
  
  // Calculate totals
  const totalSpeakers = scriptNodes.reduce((sum, s) => sum + s.speakers, 0);
  const totalFonts = scriptNodes.reduce((sum, s) => sum + s.fontCount, 0);
  
  return {
    name: "root",
    children: scriptNodes,
    totalSpeakers,
    totalFonts,
    scriptCount: scriptNodes.length
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Font Distribution Wheel
// ═══════════════════════════════════════════════════════════════════════════════
fontDistributionWheel = {
  const sg = styleGuide;
  const data = hierarchicalData;
  
  // ===== CONTROLS =====
  const innerRingOpacity = 0.75;
  const middleRingOpacity = 0.5;
  const outerRingOpacity = 0.8;
  const centerFillOpacity = 0.25;
  const centerHoverOpacity = 0.25;
  // ====================
  
  const width = 1000;
  const height = 1000;
  const radius = 400;
  
  // Sort and take top 10 based on view mode
  const sortedData = {
    ...data,
    children: viewMode === "population"
      ? data.children.slice().sort((a, b) => b.speakers - a.speakers).slice(0, 10)
      : data.children.slice().sort((a, b) => b.fontCount - a.fontCount).slice(0, 10)
  };
  
  const root = d3.hierarchy(sortedData).sum(d => d.value || 0).sort((a, b) => b.value - a.value);
  d3.partition().size([2 * Math.PI, radius])(root);
  
  const ringGap = 0.01;
  const ringWidths = [0.2, 0.2, 0.2];
  
  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(0.002)
    .padRadius(radius / 2)
    .innerRadius(d => {
      if (d.depth === 1) return radius * 0.35;
      if (d.depth === 2) return radius * (0.35 + ringWidths[0] + ringGap);
      if (d.depth === 3) return radius * (0.35 + ringWidths[0] + ringGap + ringWidths[1] + ringGap);
      return 0;
    })
    .outerRadius(d => {
      if (d.depth === 1) return radius * (0.35 + ringWidths[0]);
      if (d.depth === 2) return radius * (0.35 + ringWidths[0] + ringGap + ringWidths[1]);
      if (d.depth === 3) return radius * (0.35 + ringWidths[0] + ringGap + ringWidths[1] + ringGap + ringWidths[2]);
      return 0;
    });
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("background", sg.colors.background)
    .style("font-family", sg.typography.fontFamily);
  
  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2 - 30})`);
  
  // Color palettes
  const colorPalettes = {
    population: ["#C74848", "#E27D60", "#E8A87C", "#41B3A3", "#659DBD", "#8E8E93", "#BC6C25", "#DDA15E", "#6A994E", "#A7C957"],
    fonts: ["#2A9D8F", "#E76F51", "#F4A261", "#E9C46A", "#264653", "#8E8E93", "#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"]
  };
  
  const scriptColors = colorPalettes[viewMode];
  const categoryOrder = ["sans-serif", "serif", "display", "handwriting", "monospace"];
  
  const categoryOpacityFactor = {
    "sans-serif": 0.5,
    "serif": 0.4,
    "display": 0.3,
    "handwriting": 0.2,
    "monospace": 0.1
  };
  
  // Keep category order consistent
  root.descendants().filter(d => d.depth === 1).forEach(scriptNode => {
    if (!scriptNode.children) return;
    
    scriptNode.children.sort((a, b) =>
      categoryOrder.indexOf(a.data.name) - categoryOrder.indexOf(b.data.name)
    );
    
    let currentAngle = scriptNode.x0;
    const totalFonts = d3.sum(scriptNode.children, d => d.value);
    
    scriptNode.children.forEach(cat => {
      const span = (cat.value / totalFonts) * (scriptNode.x1 - scriptNode.x0);
      cat.x0 = currentAngle;
      cat.x1 = currentAngle + span;
      currentAngle += span;
      
      if (cat.children) {
        let catAngle = cat.x0;
        const catTotal = d3.sum(cat.children, d => d.value);
        cat.children.forEach(font => {
          const fSpan = (font.value / catTotal) * (cat.x1 - cat.x0);
          font.x0 = catAngle;
          font.x1 = catAngle + fSpan;
          catAngle += fSpan;
        });
      }
    });
  });
  
  function getScriptColor(d) {
    let n = d;
    while (n.depth > 1) n = n.parent;
    return scriptColors[root.children.indexOf(n) % scriptColors.length];
  }
  
  function getFill(d) {
    const base = d3.color(getScriptColor(d));
    if (d.depth === 1) return base;
    if (d.depth === 2) {
      const f = categoryOpacityFactor[d.data.name] || 0.1;
      return d3.rgb(base.r * (1 - f), base.g * (1 - f), base.b * (1 - f));
    }
    if (d.depth === 3) return base;
    return "#CCC";
  }
  
  const paths = g.selectAll("path")
    .data(root.descendants().filter(d => d.depth > 0))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => getFill(d))
    .attr("stroke", sg.colors.background)
    .attr("stroke-width", d => d.depth === 3 ? 0.5 : 2)
    .style("cursor", "pointer")
    .style("opacity", d => {
      if (d.depth === 1) return innerRingOpacity;
      if (d.depth === 2) return middleRingOpacity;
      if (d.depth === 3) return outerRingOpacity;
      return 1;
    });
  
  // Center circle
  const centerCircle = g.append("circle")
    .attr("r", radius * 0.34)
    .attr("fill", sg.colors.backgroundAlt)
    .style("opacity", centerFillOpacity);
  
  // Center info group
  const infoGroup = g.append("g").attr("class", "info-panel");
  
  function setDefaultInfo() {
    infoGroup.selectAll("*").remove();
    
    infoGroup.append("text")
      .attr("text-anchor", "middle").attr("y", -6)
      .style("font-size", "13px").style("font-weight", "500")
      .style("fill", "#777").style("letter-spacing", "1.2px")
      .text("HOVER ANY RING");
    
    infoGroup.append("text")
      .attr("text-anchor", "middle").attr("y", 12)
      .style("font-size", "11px").style("font-weight", "400").style("fill", "#999")
      .text(viewMode === "population" ? "to see speakers & fonts" : "to see font counts");
  }
  
  setDefaultInfo();
  
  // Hover interactions
  paths.on("mouseenter", function(event, d) {
    d3.select(this)
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 2)
      .style("filter", "brightness(1.15)");
    
    const scriptColor = getScriptColor(d);
    centerCircle.attr("fill", scriptColor).style("opacity", centerHoverOpacity);
    
    infoGroup.selectAll("*").remove();
    
    if (d.depth === 1) {
      const metric = viewMode === "population"
        ? `${(d.data.speakers / 1e9).toFixed(2)}B speakers`
        : `${d.data.fontCount} fonts`;
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", -14)
        .style("font-size", "11px").style("font-weight", "500").style("fill", "#666")
        .text(d.data.name);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", 6)
        .style("font-size", "18px").style("font-weight", "700").style("fill", "#2A2A2A")
        .text(metric);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", 24)
        .style("font-size", "11px").style("font-weight", "500").style("fill", "#888")
        .text(`${d.data.languageCount} languages`);
        
    } else if (d.depth === 2) {
      const pct = ((d.data.fontCount / d.parent.data.fontCount) * 100).toFixed(0);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", -18)
        .style("font-size", "11px").style("font-weight", "500").style("fill", "#666")
        .text(d.parent.data.name);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", -2)
        .style("font-size", "11px").style("font-weight", "600").style("fill", "#666")
        .text(d.data.name);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", 16)
        .style("font-size", "18px").style("font-weight", "700").style("fill", "#2A2A2A")
        .text(`${d.data.fontCount} fonts`);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", 32)
        .style("font-size", "11px").style("font-weight", "500").style("fill", "#888")
        .text(`${pct}% of ${d.parent.data.name}`);
        
    } else if (d.depth === 3) {
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", -18)
        .style("font-size", "11px").style("font-weight", "500").style("fill", "#666")
        .text(d.parent.parent.data.name);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", 0)
        .style("font-size", "15px").style("font-weight", "700").style("fill", "#2A2A2A")
        .text(d.data.name);
      
      infoGroup.append("text").attr("text-anchor", "middle").attr("y", 18)
        .style("font-size", "11px").style("font-weight", "500").style("fill", "#888")
        .text(d.parent.data.name);
    }
  })
  .on("mouseleave", function() {
    d3.select(this)
      .attr("stroke", sg.colors.background)
      .attr("stroke-width", d => d.depth === 3 ? 0.5 : 2)
      .style("filter", "none");
    
    paths.style("opacity", d => {
      if (d.depth === 1) return innerRingOpacity;
      if (d.depth === 2) return middleRingOpacity;
      if (d.depth === 3) return outerRingOpacity;
      return 1;
    });
    
    centerCircle.attr("fill", sg.colors.backgroundAlt).style("opacity", centerFillOpacity);
    setDefaultInfo();
  });
  
  // Headers
  svg.append("text").attr("x", 60).attr("y", 50)
    .style("font-size", "18px").style("font-weight", "700")
    .style("fill", sg.colors.textPrimary).style("letter-spacing", "3px")
    .text("GLOBAL FONTS");
  
  svg.append("line").attr("x1", 60).attr("y1", 64).attr("x2", 300).attr("y2", 64)
    .attr("stroke", sg.colors.border).attr("stroke-width", 2);
  
  svg.append("text").attr("x", 60).attr("y", 88)
    .style("font-size", "11px").style("fill", sg.colors.textSecondary)
    .text("Comparing font availability across writing scripts");
  
  svg.append("text").attr("x", 60).attr("y", 104)
    .style("font-size", "11px").style("fill", sg.colors.textSecondary)
    .text(`by ${viewMode === "population" ? "speaker population" : "total font count"}`);
  
  svg.append("text").attr("x", width - 60).attr("y", 50)
    .attr("text-anchor", "end")
    .style("font-size", "13px").style("fill", sg.colors.textMuted)
    .style("font-style", "italic")
    .text("Script Distribution Wheel");
  
  svg.append("line").attr("x1", width - 300).attr("y1", 64).attr("x2", width - 60).attr("y2", 64)
    .attr("stroke", sg.colors.borderLight).attr("stroke-width", 2);
  
  // Legend
  const legend = svg.append("g").attr("transform", `translate(60, ${height - 220})`);
  legend.append("text")
    .style("font-size", "12px").style("font-weight", "700")
    .style("fill", sg.colors.textPrimary).style("letter-spacing", "1px")
    .text("CATEGORIES:");
  
  const cats = [
    { name: "Sans-serif", opacity: 0.25 },
    { name: "Serif", opacity: 0.18 },
    { name: "Display", opacity: 0.12 },
    { name: "Handwriting", opacity: 0.06 },
    { name: "Monospace", opacity: 0.03 }
  ];
  
  cats.forEach((cat, i) => {
    const item = legend.append("g").attr("transform", `translate(0, ${i * 28 + 20})`);
    
    item.append("rect")
      .attr("width", 18).attr("height", 18)
      .attr("fill", "#000").attr("opacity", cat.opacity)
      .attr("stroke", sg.colors.border).attr("stroke-width", 2);
    
    item.append("text")
      .attr("x", 26).attr("y", 13)
      .style("font-size", "10px").style("fill", sg.colors.textPrimary)
      .text(cat.name);
  });
  
  // Caption
  svg.append("text").attr("x", width / 2).attr("y", height - 60)
    .attr("text-anchor", "middle")
    .style("font-size", "13px").style("font-weight", "700")
    .style("fill", sg.colors.textPrimary)
    .text("Fig 1. Global Font Distribution by Writing Script");
  
  svg.append("text").attr("x", width / 2).attr("y", height - 42)
    .attr("text-anchor", "middle")
    .style("font-size", "10px").style("fill", sg.colors.textSecondary)
    .style("font-style", "italic")
    .text("Inner ring: scripts • Middle ring: categories • Outer ring: individual fonts");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Summary Statistics
// ═══════════════════════════════════════════════════════════════════════════════
summaryStats = {
  const sg = styleGuide;
  const data = hierarchicalData;
  const scripts = data.children;
  
  const totalSpeakers = data.totalSpeakers;
  const totalFonts = data.totalFonts;
  
  const colorPalettes = {
    population: ["#C74848", "#E27D60", "#E8A87C", "#41B3A3", "#659DBD", "#8E8E93", "#BC6C25", "#DDA15E", "#6A994E", "#A7C957"],
    fonts: ["#2A9D8F", "#E76F51", "#F4A261", "#E9C46A", "#264653", "#8E8E93", "#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"]
  };
  
  const sortedScripts = viewMode === "population"
    ? scripts.slice().sort((a, b) => b.speakers - a.speakers)
    : scripts.slice().sort((a, b) => b.fontCount - a.fontCount);
  
  const topScripts = sortedScripts.slice(0, 5);
  const scriptColors = colorPalettes[viewMode];
  
  return html`
    <div style="font-family: ${sg.typography.fontFamily}; max-width: 900px; margin: 0 auto; padding: 40px; background: ${sg.colors.background};">
      
      <div style="margin-bottom: 30px;">
        <h2 style="color: ${sg.colors.textPrimary}; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Font Inequality Overview</h2>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; margin: 30px 0; padding: 30px 0; border-top: 1px solid ${sg.colors.borderLight}; border-bottom: 1px solid ${sg.colors.borderLight};">
        <div style="text-align: center;">
          <div style="font-size: 48px; font-weight: 300; color: ${sg.colors.textPrimary}; letter-spacing: -1px;">${totalFonts.toLocaleString()}</div>
          <div style="font-size: 11px; font-weight: 600; color: ${sg.colors.textSecondary}; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px;">Total Fonts</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 48px; font-weight: 300; color: ${sg.colors.textPrimary}; letter-spacing: -1px;">${data.scriptCount}</div>
          <div style="font-size: 11px; font-weight: 600; color: ${sg.colors.textSecondary}; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px;">Writing Scripts</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 48px; font-weight: 300; color: ${sg.colors.textPrimary}; letter-spacing: -1px;">${(totalSpeakers/1e9).toFixed(1)}B</div>
          <div style="font-size: 11px; font-weight: 600; color: ${sg.colors.textSecondary}; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px;">Total Speakers</div>
        </div>
      </div>
      
      <div style="margin: 40px 0 20px 0;">
        <h3 style="color: ${sg.colors.textPrimary}; margin: 0; font-size: 14px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
          Top 5 Scripts by ${viewMode === "population" ? "Speaker Population" : "Font Count"}
        </h3>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; background: ${sg.colors.backgroundAlt};">
        <thead>
          <tr style="background: ${sg.colors.backgroundDark}; border-bottom: 2px solid ${sg.colors.border};">
            <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: ${sg.colors.textPrimary}; text-transform: uppercase; letter-spacing: 1px;">Script</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; color: ${sg.colors.textPrimary}; text-transform: uppercase; letter-spacing: 1px;">Speakers</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; color: ${sg.colors.textPrimary}; text-transform: uppercase; letter-spacing: 1px;">Fonts</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 700; color: ${sg.colors.textPrimary}; text-transform: uppercase; letter-spacing: 1px;">Fonts per 100M</th>
          </tr>
        </thead>
        <tbody>
          ${topScripts.map((s, i) => {
            const scriptColor = scriptColors[i % scriptColors.length];
            const fontsPer100M = s.speakers > 0 ? ((s.fontCount / s.speakers) * 100000000).toFixed(1) : "∞";
            return html`
              <tr style="border-bottom: 1px solid ${sg.colors.backgroundDark};">
                <td style="padding: 14px 16px; font-size: 13px; color: ${sg.colors.textPrimary};">
                  <div style="display: flex; align-items: center;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${scriptColor}; margin-right: 10px;"></div>
                    <span style="font-weight: 600;">${s.name}</span>
                  </div>
                </td>
                <td style="padding: 14px 16px; text-align: right; font-size: 13px; color: ${sg.colors.textPrimary};">${s.speakers.toLocaleString()}</td>
                <td style="padding: 14px 16px; text-align: right; font-size: 13px; font-weight: 600; color: ${sg.colors.textPrimary};">${s.fontCount}</td>
                <td style="padding: 14px 16px; text-align: right; font-size: 13px; color: ${sg.colors.textSecondary};">${fontsPer100M}</td>
              </tr>
            `;
          })}
        </tbody>
      </table>
      
      <div style="margin-top: 30px; padding: 20px; background: ${sg.colors.backgroundAlt}; border-left: 3px solid ${sg.colors.border};">
        <div style="font-size: 10px; font-weight: 700; color: ${sg.colors.textMuted}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Key Insight</div>
        <p style="margin: 0; color: ${sg.colors.textPrimary}; font-size: 13px; line-height: 1.7;">
          ${viewMode === "population"
            ? html`Latin script dominates with <strong>${topScripts[0].fontCount} fonts</strong> for <strong>${(topScripts[0].speakers/1e9).toFixed(1)}B speakers</strong>, while many scripts serve billions with far fewer font options.`
            : html`Latin leads with <strong>${topScripts[0].fontCount} fonts</strong>, while scripts like ${topScripts[4]?.name || "others"} have only <strong>${topScripts[4]?.fontCount || "few"} fonts</strong> despite significant speaker populations.`
          }
        </p>
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <div style="font-size: 12px; font-weight: 700; color: ${sg.colors.textPrimary};">Fig 2. Font Distribution Statistics</div>
        <div style="font-size: 10px; font-style: italic; color: ${sg.colors.textMuted}; margin-top: 4px;">Comparing font availability and speaker populations across writing systems</div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 5: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width: 1000px; margin: 0 auto;">
  <div style="display: flex; justify-content: center; margin-bottom: 20px;">
    ${viewof viewMode}
  </div>
  ${fontDistributionWheel}
  ${summaryStats}
</div>`
