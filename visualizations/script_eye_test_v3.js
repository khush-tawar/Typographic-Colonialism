// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPT EYE TEST v3 - Interactive Zoom + Gradient Colors
// ═══════════════════════════════════════════════════════════════════════════════
// True proportional scaling with zoom slider to explore the invisible scripts

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Zoom Control
// ═══════════════════════════════════════════════════════════════════════════════
viewof zoomLevel = {
  const container = html`<div style="max-width:900px; margin:0 auto 20px; font-family:system-ui, sans-serif;">
    <div style="display:flex; align-items:center; gap:20px; padding:16px 20px; background:#f8f8f8; border-radius:8px;">
      <div style="flex:0 0 auto;">
        <div style="font-size:11px; color:#666; margin-bottom:4px;">ZOOM LEVEL</div>
        <div style="font-size:24px; font-weight:700; color:#333;" id="zoomValue">1×</div>
      </div>
      <div style="flex:1;">
        <input type="range" min="1" max="50" value="1" step="1" 
               style="width:100%; height:8px; cursor:pointer;"
               id="zoomSlider">
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#999; margin-top:4px;">
          <span>1× (true scale)</span>
          <span>10×</span>
          <span>25×</span>
          <span>50× (max zoom)</span>
        </div>
      </div>
      <div style="flex:0 0 auto; text-align:right;">
        <div style="font-size:10px; color:#888;">Zoom to see</div>
        <div style="font-size:10px; color:#888;">invisible scripts</div>
      </div>
    </div>
  </div>`;
  
  const slider = container.querySelector("#zoomSlider");
  const valueDisplay = container.querySelector("#zoomValue");
  
  slider.oninput = () => {
    valueDisplay.textContent = slider.value + "×";
    container.value = +slider.value;
    container.dispatchEvent(new CustomEvent("input"));
  };
  
  container.value = 1;
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Process Data for Eye Test
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestData = {
  const scripts = masterData.scripts || {};
  const inequality = new Map((masterData.inequality_metrics || []).map(d => [d.code, d]));
  
  // Script-specific letters in their native writing systems
  const scriptLetters = {
    "Latn": "E F P T O Z L D C B",
    "Cyrl": "Д Б Ж Ф Ц Щ Э Ю Я П",
    "Grek": "Ω Σ Δ Π Φ Ψ Λ Θ Ξ Γ",
    "Arab": "ع غ ف ق ك ل م ن ه و",
    "Hebr": "א ב ג ד ה ו ז ח ט י",
    "Deva": "अ आ इ ई उ ऊ ए ऐ ओ औ",
    "Beng": "অ আ ই ঈ উ ঊ এ ঐ ও ঔ",
    "Taml": "அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ",
    "Telu": "అ ఆ ఇ ఈ ఉ ఊ ఎ ఏ ఐ ఒ",
    "Knda": "ಅ ಆ ಇ ಈ ಉ ಊ ಎ ಏ ಐ ಒ",
    "Mlym": "അ ആ ഇ ഈ ഉ ഊ എ ഏ ഐ ഒ",
    "Gujr": "અ આ ઇ ઈ ઉ ઊ એ ઐ ઓ ઔ",
    "Guru": "ਅ ਆ ਇ ਈ ਉ ਊ ਏ ਐ ਓ ਔ",
    "Orya": "ଅ ଆ ଇ ଈ ଉ ଊ ଏ ଐ ଓ ଔ",
    "Sinh": "අ ආ ඉ ඊ උ ඌ එ ඒ ඔ ඕ",
    "Mymr": "က ခ ဂ ဃ င စ ဆ ဇ ဈ ည",
    "Thai": "ก ข ค ฆ ง จ ฉ ช ซ ฌ",
    "Laoo": "ກ ຂ ຄ ງ ຈ ສ ຊ ຍ ດ ຕ",
    "Khmr": "ក ខ គ ឃ ង ច ឆ ជ ឈ ញ",
    "Tibt": "ཀ ཁ ག ང ཅ ཆ ཇ ཉ ཏ ཐ",
    "Geor": "ა ბ გ დ ე ვ ზ თ ი კ",
    "Armn": "Ա Բ Գ Դ Delays Զ Է Ը Թ Ժ",
    "Ethi": "አ በ ገ ደ ሀ ወ ዘ የ ከ ለ",
    "Hans": "字 文 书 画 诗 词 歌 赋 章 篇",
    "Hant": "字 文 書 畫 詩 詞 歌 賦 章 篇",
    "Jpan": "あ い う え お か き く け こ",
    "Kore": "가 나 다 라 마 바 사 아 자 차",
    "Hang": "한 글 말 씀 빛 솔 꽃 달 별 물",
    "Hira": "あ い う え お か き く け こ",
    "Kana": "ア イ ウ エ オ カ キ ク ケ コ",
    "Tfng": "ⴰ ⴱ ⴳ ⴷ ⴹ ⴻ ⴼ ⴽ ⵀ ⵃ",
    "Cans": "ᐊ ᐁ ᐃ ᐅ ᐆ ᑲ ᒐ ᒪ ᓇ ᓴ",
    "Cher": "Ꭰ Ꭱ Ꭲ Ꭳ Ꭴ Ꭵ Ꮎ Ꮏ Ꮐ Ꮑ",
    "Nkoo": "ߋ ߌ ߍ ߎ ߏ ߐ ߑ ߒ ߓ ߔ",
    "Syrc": "ܐ ܒ ܓ ܕ ܗ ܘ ܙ ܚ ܛ ܝ",
    "Thaa": "އ ބ ތ ޖ ޗ ދ ޒ ރ ސ ޝ",
    "Mong": "ᠠ ᠡ ᠢ ᠣ ᠤ ᠥ ᠦ ᠧ ᠨ ᠩ"
  };
  
  // Fallback Latin letters for scripts not in the map
  const fallbackLetters = "E F P T O Z L D C B";
  
  // Build rows
  const rows = Object.entries(scripts)
    .filter(([code, d]) => d.font_count > 0)
    .map(([code, d], i) => {
      const ineq = inequality.get(code) || {};
      return {
        code,
        name: d.name || code,
        allLetters: scriptLetters[code] || fallbackLetters,
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
  
  // Calculate base font sizes (true proportional)
  // Latin = 1900 fonts = 72px
  // 315 fonts = 72 * (315/1900) = 12px
  // 62 fonts = 72 * (62/1900) = 2.3px
  rows.forEach((r, i) => {
    const ratio = r.fontCount / maxFonts;
    r.baseFontSize = ratio * 72; // TRUE linear, keep decimals for accuracy
    r.truePercentage = (ratio * 100).toFixed(2);
    r.ratio = ratio;
  });
  
  return { rows, latin, maxFonts };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Color Scale (Gradient based on font count)
// ═══════════════════════════════════════════════════════════════════════════════
colorScale = {
  // Create a color scale from green (high fonts) to red (low fonts)
  // Using perceptually balanced colors
  const maxFonts = eyeTestData.maxFonts;
  
  // Color stops: high → low
  // Teal (#2A9D8F) → Yellow-Orange (#E9C46A) → Orange (#F4A261) → Red (#E76F51) → Dark Red (#C74848)
  const colors = [
    { stop: 1.0, color: [42, 157, 143] },   // Teal - top tier (>50%)
    { stop: 0.15, color: [65, 179, 163] },  // Light teal (15-50%)
    { stop: 0.05, color: [233, 196, 106] }, // Yellow (5-15%)
    { stop: 0.02, color: [244, 162, 97] },  // Orange (2-5%)
    { stop: 0.01, color: [231, 111, 81] },  // Red-orange (1-2%)
    { stop: 0.0, color: [199, 72, 72] }     // Red (<1%)
  ];
  
  return (ratio) => {
    // Find the two color stops we're between
    for (let i = 0; i < colors.length - 1; i++) {
      if (ratio >= colors[i + 1].stop) {
        const upper = colors[i];
        const lower = colors[i + 1];
        const t = (ratio - lower.stop) / (upper.stop - lower.stop);
        
        // Interpolate
        const r = Math.round(lower.color[0] + t * (upper.color[0] - lower.color[0]));
        const g = Math.round(lower.color[1] + t * (upper.color[1] - lower.color[1]));
        const b = Math.round(lower.color[2] + t * (upper.color[2] - lower.color[2]));
        
        return `rgb(${r},${g},${b})`;
      }
    }
    return `rgb(${colors[colors.length - 1].color.join(",")})`;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: The Eye Test Visualization (Reactive to zoom)
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestChart = {
  const sg = styleGuide;
  const { rows, latin, maxFonts } = eyeTestData;
  const zoom = zoomLevel;
  
  // Show top 20 scripts
  const displayRows = rows.slice(0, 20);
  
  const W = 900, H = 900;
  const M = { top: 100, right: 200, bottom: 80, left: 50 };
  const chartWidth = W - M.left - M.right;
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%")
    .style("height", "auto")
    .style("background", "#FAFAFA")
    .style("font-family", "'Courier New', Courier, monospace");
  
  // ─── Title ───
  svg.append("text")
    .attr("x", W / 2).attr("y", 35)
    .attr("text-anchor", "middle")
    .attr("fill", "#1a1a1a")
    .attr("font-size", "24px")
    .attr("font-weight", "700")
    .attr("letter-spacing", "2px")
    .text("SCRIPT VISIBILITY TEST");
  
  svg.append("text")
    .attr("x", W / 2).attr("y", 58)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", "12px")
    .attr("font-family", sg.typography.fontFamily)
    .text(`Formula: size = (fonts ÷ ${maxFonts.toLocaleString()}) × 72px × ${zoom}× zoom`);
  
  if (zoom > 1) {
    svg.append("text")
      .attr("x", W / 2).attr("y", 78)
      .attr("text-anchor", "middle")
      .attr("fill", "#E76F51")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("font-family", sg.typography.fontFamily)
      .text(`⚠ Zoomed ${zoom}× — true scale is ${zoom}× smaller`);
  }
  
  // ─── Chart area ───
  const chartArea = svg.append("g")
    .attr("transform", `translate(${M.left}, ${M.top})`);
  
  // Calculate rows with dynamic letter count
  let currentY = 10;
  
  displayRows.forEach((row, i) => {
    const zoomedSize = Math.min(row.baseFontSize * zoom, 80); // Cap at 80px even with zoom
    const displaySize = Math.max(2, zoomedSize);
    
    // Calculate how many letters fit - use 80% of chart width to leave margin
    const availableWidth = chartWidth * 0.8; // Leave 20% buffer from right labels
    const charWidth = displaySize * 1.2; // Character width including space
    const maxLetters = Math.max(1, Math.floor(availableWidth / charWidth));
    
    // Get letters array and take only what fits
    const allLetters = row.allLetters.split(" ");
    const numLetters = Math.min(allLetters.length, maxLetters);
    const displayLetters = allLetters.slice(0, numLetters).join("  ");
    
    const rowG = chartArea.append("g")
      .attr("transform", `translate(0, ${currentY})`);
    
    // Color from gradient scale
    const color = colorScale(row.ratio);
    
    // The letters
    rowG.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", color)
      .attr("font-size", `${displaySize}px`)
      .attr("font-weight", "700")
      .attr("letter-spacing", `${Math.max(1, displaySize / 6)}px`)
      .text(displayLetters);
    
    // Right side info
    const statsX = chartWidth + 15;
    
    rowG.append("text")
      .attr("x", statsX)
      .attr("y", -4)
      .attr("fill", color)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("font-family", sg.typography.fontFamily)
      .text(row.name.length > 18 ? row.name.slice(0, 16) + "…" : row.name);
    
    // Show both true size and zoomed size
    const trueSize = row.baseFontSize;
    const sizeText = zoom > 1 
      ? `${row.fontCount} → ${trueSize}px (×${zoom}=${displaySize.toFixed(0)}px)`
      : `${row.fontCount} fonts → ${trueSize}px`;
    
    rowG.append("text")
      .attr("x", statsX)
      .attr("y", 10)
      .attr("fill", "#888")
      .attr("font-size", "8px")
      .attr("font-family", sg.typography.fontFamily)
      .text(sizeText);
    
    // Row spacing based on display size
    currentY += Math.max(displaySize, 14) + 10;
  });
  
  // ─── Color gradient legend ───
  const legendY = H - 55;
  const legendG = svg.append("g")
    .attr("transform", `translate(${M.left}, ${legendY})`);
  
  legendG.append("text")
    .attr("x", 0).attr("y", -8)
    .attr("fill", "#666")
    .attr("font-size", "9px")
    .attr("font-family", sg.typography.fontFamily)
    .text("COLOR = FONT AVAILABILITY:");
  
  // Draw gradient bar (green/high on LEFT, red/low on RIGHT to match intuition)
  const gradientWidth = 300;
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "fontGradient")
    .attr("x1", "0%").attr("x2", "100%");
  
  gradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(1));     // Green (high)
  gradient.append("stop").attr("offset", "50%").attr("stop-color", colorScale(0.05)); // Yellow (mid)
  gradient.append("stop").attr("offset", "85%").attr("stop-color", colorScale(0.01)); // Orange
  gradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(0));   // Red (low)
  
  legendG.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", gradientWidth).attr("height", 12)
    .attr("fill", "url(#fontGradient)")
    .attr("rx", 2);
  
  // Labels under gradient (high on left, low on right)
  const labels = [
    { x: 0, text: `${maxFonts} fonts (100%)` },
    { x: gradientWidth * 0.5, text: "~100 fonts (5%)" },
    { x: gradientWidth, text: "1 font (0.05%)" }
  ];
  
  labels.forEach(l => {
    legendG.append("text")
      .attr("x", l.x)
      .attr("y", 24)
      .attr("text-anchor", l.x === 0 ? "start" : (l.x === gradientWidth ? "end" : "middle"))
      .attr("fill", "#888")
      .attr("font-size", "8px")
      .attr("font-family", sg.typography.fontFamily)
      .text(l.text);
  });
  
  // ─── Source ───
  svg.append("text")
    .attr("x", W - 10)
    .attr("y", H - 10)
    .attr("text-anchor", "end")
    .attr("fill", "#ccc")
    .attr("font-size", "8px")
    .attr("font-family", sg.typography.fontFamily)
    .text("github.com/khush-tawar/Typographic-Colonialism");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 5: Disparity Narration
// ═══════════════════════════════════════════════════════════════════════════════
disparityNarration = {
  const { rows, latin, maxFonts } = eyeTestData;
  const smallest = rows[rows.length - 1];
  const disparity = Math.round(latin.fontCount / Math.max(1, smallest?.fontCount || 1));
  
  return html`
  <div style="max-width:900px; margin:20px auto; font-family:system-ui, sans-serif;">
    <div style="background:linear-gradient(135deg, #C7484815, #E76F5110); padding:20px 24px; border-radius:8px; border-left:4px solid #C74848;">
      <div style="font-size:14px; color:#333; line-height:1.7;">
        <strong style="font-size:24px; color:#C74848;">${disparity}× disparity</strong><br>
        If you can't read a row at 1× zoom, that's not a rendering bug—it's the reality of typographic inequality.
        <strong>Latin has ${latin.fontCount.toLocaleString()} fonts</strong>. Some scripts have just <strong>1</strong>.
        <br><br>
        <span style="color:#666;">At true scale, the bottom rows are literally invisible. That's what it means to browse the web in those scripts.
        Use the zoom slider to magnify—but remember, <em>you're cheating</em>. The web doesn't zoom for you.</span>
      </div>
    </div>
  </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 6: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width:900px; margin:0 auto;">
  ${viewof zoomLevel}
  ${eyeTestChart}
  ${disparityNarration}
</div>`
