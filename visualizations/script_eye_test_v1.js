// ═══════════════════════════════════════════════════════════════════════════════
// SCRIPT EYE TEST - "Can You Read Your Script?"
// ═══════════════════════════════════════════════════════════════════════════════
// Eye chart style - font size = font availability. Neglected scripts are literally hard to see.

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Process Data for Eye Test
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestData = {
  const scripts = masterData.scripts || {};
  const inequality = new Map((masterData.inequality_metrics || []).map(d => [d.code, d]));
  
  // Multiple letters for each script (like real eye chart - random arrangement)
  const scriptLetters = {
    "Latn": ["E", "F", "P", "T", "O", "Z", "L", "D", "C", "B", "N", "R"],
    "Cyrl": ["Д", "Б", "Ж", "Ф", "Ц", "Щ", "Э", "Ю", "Я", "П", "Л", "К"],
    "Grek": ["Ω", "Σ", "Δ", "Π", "Φ", "Ψ", "Λ", "Θ", "Ξ", "Γ", "Β", "Α"],
    "Arab": ["ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي", "ب"],
    "Hebr": ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל"],
    "Deva": ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "क", "ख"],
    "Beng": ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "এ", "ঐ", "ও", "ঔ", "ক", "খ"],
    "Taml": ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "க", "ங"],
    "Telu": ["అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఎ", "ఏ", "ఐ", "ఒ", "క", "ఖ"],
    "Knda": ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಎ", "ಏ", "ಐ", "ಒ", "ಕ", "ಖ"],
    "Mlym": ["അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ക", "ഖ"],
    "Gujr": ["અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "એ", "ઐ", "ઓ", "ઔ", "ક", "ખ"],
    "Guru": ["ਅ", "ਆ", "ਇ", "ਈ", "ਉ", "ਊ", "ਏ", "ਐ", "ਓ", "ਔ", "ਕ", "ਖ"],
    "Orya": ["ଅ", "ଆ", "ଇ", "ଈ", "ଉ", "ଊ", "ଏ", "ଐ", "ଓ", "ଔ", "କ", "ଖ"],
    "Sinh": ["අ", "ආ", "ඉ", "ඊ", "උ", "ඌ", "එ", "ඒ", "ඔ", "ඕ", "ක", "ඛ"],
    "Mymr": ["က", "ခ", "ဂ", "ဃ", "င", "စ", "ဆ", "ဇ", "ဈ", "ည", "ဋ", "ဌ"],
    "Thai": ["ก", "ข", "ค", "ฆ", "ง", "จ", "ฉ", "ช", "ซ", "ฌ", "ญ", "ฎ"],
    "Laoo": ["ກ", "ຂ", "ຄ", "ງ", "ຈ", "ສ", "ຊ", "ຍ", "ດ", "ຕ", "ຖ", "ທ"],
    "Khmr": ["ក", "ខ", "គ", "ឃ", "ង", "ច", "ឆ", "ជ", "ឈ", "ញ", "ដ", "ឋ"],
    "Tibt": ["ཀ", "ཁ", "ག", "ང", "ཅ", "ཆ", "ཇ", "ཉ", "ཏ", "ཐ", "ད", "ན"],
    "Geor": ["ა", "ბ", "გ", "დ", "ე", "ვ", "ზ", "თ", "ი", "კ", "ლ", "მ"],
    "Armn": ["Ա", "Բ", "Գ", "Դ", "Ե", "Զ", "Է", "Ը", "Թ", "Ժ", "Ի", "Լ"],
    "Ethi": ["አ", "በ", "ገ", "ደ", "ሀ", "ወ", "ዘ", "የ", "ከ", "ለ", "መ", "ነ"],
    "Hans": ["字", "文", "书", "画", "诗", "词", "歌", "赋", "章", "篇", "句", "段"],
    "Hant": ["字", "文", "書", "畫", "詩", "詞", "歌", "賦", "章", "篇", "句", "段"],
    "Jpan": ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し"],
    "Kore": ["가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타"],
    "Hang": ["한", "글", "말", "씀", "빛", "솔", "꽃", "달", "별", "물", "불", "흙"],
    "Hira": ["あ", "い", "う", "え", "お", "か", "き", "く", "け", "こ", "さ", "し"],
    "Kana": ["ア", "イ", "ウ", "エ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ"],
    "Tfng": ["ⴰ", "ⴱ", "ⴳ", "ⴷ", "ⴹ", "ⴻ", "ⴼ", "ⴽ", "ⵀ", "ⵃ", "ⵄ", "ⵅ"],
    "Cans": ["ᐊ", "ᐁ", "ᐃ", "ᐅ", "ᐆ", "ᐊ", "ᑲ", "ᒐ", "ᒪ", "ᓇ", "ᓴ", "ᔭ"],
    "Cher": ["Ꭰ", "Ꭱ", "Ꭲ", "Ꭳ", "Ꭴ", "Ꭵ", "Ꮎ", "Ꮏ", "Ꮐ", "Ꮑ", "Ꮒ", "Ꮓ"],
    "Osge": ["𐓀", "𐓁", "𐓂", "𐓃", "𐓄", "𐓅", "𐓆", "𐓇", "𐓈", "𐓉", "𐓊", "𐓋"],
    "Adlm": ["𞤀", "𞤁", "𞤂", "𞤃", "𞤄", "𞤅", "𞤆", "𞤇", "𞤈", "𞤉", "𞤊", "𞤋"],
    "Nkoo": ["ߋ", "ߌ", "ߍ", "ߎ", "ߏ", "ߐ", "ߑ", "ߒ", "ߓ", "ߔ", "ߕ", "ߖ"],
    "Syrc": ["ܐ", "ܒ", "ܓ", "ܕ", "ܗ", "ܘ", "ܙ", "ܚ", "ܛ", "ܝ", "ܟ", "ܠ"],
    "Thaa": ["އ", "ބ", "ތ", "ޖ", "ޗ", "ދ", "ޒ", "ރ", "ސ", "ޝ", "ފ", "ޤ"],
    "Mong": ["ᠠ", "ᠡ", "ᠢ", "ᠣ", "ᠤ", "ᠥ", "ᠦ", "ᠧ", "ᠨ", "ᠩ", "ᠪ", "ᠫ"]
  };
  
  // Shuffle and pick letters for eye chart effect
  const shuffle = arr => arr.slice().sort(() => Math.random() - 0.5);
  
  // Build rows for the eye chart
  const rows = Object.entries(scripts)
    .filter(([code, d]) => d.font_count > 0 && scriptLetters[code])
    .map(([code, d]) => {
      const ineq = inequality.get(code) || {};
      const letters = scriptLetters[code] || [];
      return {
        code,
        name: d.name || code,
        letters: shuffle(letters).slice(0, 8).join("  "), // 8 random letters with spacing
        fontCount: d.font_count || 0,
        speakers: d.speakers || 0,
        inequalityRatio: ineq.inequality_ratio || 1,
        notoOnly: d.font_count <= (d.noto_families?.length || 0) + 1 && code !== "Latn",
        rtl: d.rtl || false
      };
    })
    .sort((a, b) => b.fontCount - a.fontCount);
  
  // Get Latin for reference
  const latin = rows.find(r => r.code === "Latn");
  const maxFonts = latin?.fontCount || 1900;
  
  // TRUE PROPORTIONAL SCALING - no softening, no sqrt, just raw data
  // Latin at 1900 fonts = 100px
  // Everything else = (fonts/1900) * 100px
  // Minimum 1px so it at least renders as a dot
  rows.forEach(r => {
    const ratio = r.fontCount / maxFonts; // true proportion
    r.fontSize = Math.max(1, Math.round(ratio * 100)); // 1px to 100px, LINEAR
    r.opacity = 1; // full opacity - size tells the story
    r.truePercentage = (ratio * 100).toFixed(2);
  });
  
  return { rows, latin, maxFonts };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: The Eye Test Visualization
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestChart = {
  const sg = styleGuide;
  const { rows, latin, maxFonts } = eyeTestData;
  
  // Take top scripts by font count for clean display
  const displayRows = rows.slice(0, 25);
  
  const W = 1000, H = 1100;
  const M = { top: 160, right: 280, bottom: 80, left: 60 };
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%")
    .style("height", "auto")
    .style("background", "#FEFEFA") // Slightly off-white like an eye chart
    .style("font-family", sg.typography.fontFamily);
  
  // ─── Title Area (like optometrist header) ───
  svg.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", W).attr("height", 120)
    .attr("fill", sg.colors.background);
  
  svg.append("text")
    .attr("x", W / 2).attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textPrimary)
    .attr("font-size", "32px")
    .attr("font-weight", "300")
    .attr("letter-spacing", "4px")
    .text("SCRIPT VISIBILITY TEST");
  
  svg.append("text")
    .attr("x", W / 2).attr("y", 78)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textSecondary)
    .attr("font-size", "14px")
    .text("Can you read your writing system?");
  
  svg.append("text")
    .attr("x", W / 2).attr("y", 100)
    .attr("text-anchor", "middle")
    .attr("fill", sg.colors.textMuted)
    .attr("font-size", "11px")
    .text("Font size = number of available fonts. If you can't read it, neither can the web.");
  
  // ─── Eye chart frame ───
  const chartArea = svg.append("g")
    .attr("transform", `translate(${M.left}, ${M.top})`);
  
  // Subtle border
  chartArea.append("rect")
    .attr("x", -20).attr("y", -20)
    .attr("width", W - M.left - M.right + 40)
    .attr("height", H - M.top - M.bottom + 40)
    .attr("fill", "none")
    .attr("stroke", sg.colors.borderLight)
    .attr("stroke-width", 1);
  
  // ─── Row spacing ───
  const rowHeight = (H - M.top - M.bottom) / displayRows.length;
  
  // ─── Draw each script row ───
  displayRows.forEach((row, i) => {
    const y = i * rowHeight + rowHeight / 2;
    const rowG = chartArea.append("g")
      .attr("transform", `translate(0, ${y})`);
    
    // Get status color
    let color = sg.colors.textPrimary;
    if (row.code === "Latn") color = sg.colors.status.dominant;
    else if (row.notoOnly) color = sg.colors.status.notoOnly;
    else if (row.inequalityRatio > 10) color = sg.colors.status.neglected;
    else if (row.inequalityRatio > 2) color = sg.colors.status.struggling;
    else color = sg.colors.status.privileged;
    
    // The sample text (centered)
    const textX = (W - M.left - M.right) / 2;
    
    rowG.append("text")
      .attr("x", textX)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", color)
      .attr("font-size", `${row.fontSize}px`)
      .attr("font-weight", row.code === "Latn" ? "700" : "400")
      .attr("opacity", row.opacity)
      .attr("direction", row.rtl ? "rtl" : "ltr")
      .text(row.letters);
    
    // Row number (like eye chart)
    rowG.append("text")
      .attr("x", -15)
      .attr("y", 0)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", sg.colors.textMuted)
      .attr("font-size", "10px")
      .text(i + 1);
    
    // Right side: Script name and stats
    const statsX = W - M.left - M.right + 30;
    
    rowG.append("text")
      .attr("x", statsX)
      .attr("y", -6)
      .attr("fill", color)
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text(row.name);
    
    rowG.append("text")
      .attr("x", statsX)
      .attr("y", 8)
      .attr("fill", sg.colors.textMuted)
      .attr("font-size", "9px")
      .text(`${row.fontCount} fonts (${row.truePercentage}%)`);
    
    // Noto-only badge
    if (row.notoOnly) {
      rowG.append("text")
        .attr("x", statsX + 60)
        .attr("y", 8)
        .attr("fill", sg.colors.status.notoOnly)
        .attr("font-size", "8px")
        .attr("font-weight", "600")
        .text("NOTO ONLY");
    }
  });
  
  // ─── Bottom legend ───
  const legend = svg.append("g")
    .attr("transform", `translate(${M.left}, ${H - 40})`);
  
  const legendItems = [
    { size: 100, label: "100% (1900 fonts)" },
    { size: 17, label: "16.6% (315 fonts)" },
    { size: 2, label: "1.6% (30 fonts)" },
    { size: 1, label: "0.05% (1 font)" }
  ];
  
  let legendX = 0;
  legendItems.forEach(item => {
    legend.append("text")
      .attr("x", legendX)
      .attr("y", 0)
      .attr("dominant-baseline", "middle")
      .attr("fill", sg.colors.textMuted)
      .attr("font-size", `${Math.min(item.size, 28)}px`)
      .text("A");
    
    legend.append("text")
      .attr("x", legendX + 35)
      .attr("y", 0)
      .attr("dominant-baseline", "middle")
      .attr("fill", sg.colors.textMuted)
      .attr("font-size", "9px")
      .text(item.label);
    
    legendX += 150;
  });
  
  // ─── Source ───
  svg.append("text")
    .attr("x", W - 20)
    .attr("y", H - 15)
    .attr("text-anchor", "end")
    .attr("fill", sg.colors.textSubtle)
    .attr("font-size", "8px")
    .text("Data: Google Fonts API • github.com/khush-tawar/Typographic-Colonialism");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Insight Panel
// ═══════════════════════════════════════════════════════════════════════════════
eyeTestInsights = {
  const sg = styleGuide;
  const { rows, latin } = eyeTestData;
  
  const notoOnly = rows.filter(r => r.notoOnly);
  const smallest = rows.slice(-5);
  // Find Cyrillic for the direct comparison
  const cyrillic = rows.find(r => r.code === "Cyrl");
  
  return html`
  <div style="max-width:1000px; margin:20px auto; font-family:${sg.typography.fontFamily};">
    
    <!-- Key insight banner -->
    <div style="background:linear-gradient(135deg, ${sg.colors.status.neglected}15, ${sg.colors.status.notoOnly}10);
                padding:20px 24px; border-radius:8px; border-left:4px solid ${sg.colors.status.neglected};
                margin-bottom:20px;">
      <div style="font-size:15px; color:${sg.colors.textPrimary}; line-height:1.6;">
        <strong style="font-size:28px; color:${sg.colors.status.neglected};">
          Linear scaling. No tricks.
        </strong>
        <br>
        Latin has <strong>${latin.fontCount.toLocaleString()}</strong> fonts → <strong>${latin.fontSize}px</strong>.
        Cyrillic has <strong>${cyrillic?.fontCount || 315}</strong> fonts → <strong>${cyrillic?.fontSize || 17}px</strong>.
        That's the real gap. The bottom rows? Dots.
      </div>
    </div>
    
    <!-- Stats row -->
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px;">
      
      <div style="background:${sg.colors.backgroundAlt}; padding:20px; border-radius:8px; text-align:center;">
        <div style="font-size:48px; font-weight:700; color:${sg.colors.status.dominant};">
          ${latin.fontSize}px
        </div>
        <div style="font-size:12px; color:${sg.colors.textSecondary}; margin-top:4px;">
          Latin (${latin.fontCount.toLocaleString()} fonts)
        </div>
        <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:8px;">
          The baseline = 100%
        </div>
      </div>
      
      <div style="background:${sg.colors.backgroundAlt}; padding:20px; border-radius:8px; text-align:center;">
        <div style="font-size:48px; font-weight:700; color:${sg.colors.status.struggling};">
          ${cyrillic?.fontSize || 17}px
        </div>
        <div style="font-size:12px; color:${sg.colors.textSecondary}; margin-top:4px;">
          Cyrillic (${cyrillic?.fontCount || 315} fonts)
        </div>
        <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:8px;">
          ${cyrillic?.truePercentage || "16.58"}% of Latin
        </div>
      </div>
      
      <div style="background:${sg.colors.backgroundAlt}; padding:20px; border-radius:8px; text-align:center;">
        <div style="font-size:48px; font-weight:700; color:${sg.colors.status.neglected};">
          ${smallest[smallest.length - 1]?.fontSize || 1}px
        </div>
        <div style="font-size:12px; color:${sg.colors.textSecondary}; margin-top:4px;">
          ${smallest[smallest.length - 1]?.name || "Smallest"}
        </div>
        <div style="font-size:11px; color:${sg.colors.textMuted}; margin-top:8px;">
          ${smallest[smallest.length - 1]?.truePercentage || "0.05"}% — a pixel
        </div>
      </div>
      
    </div>
    
    <!-- Reading test prompt -->
    <div style="text-align:center; margin-top:24px; padding:16px; background:#FEFEFA; border-radius:8px; border:1px dashed ${sg.colors.borderLight};">
      <div style="font-size:13px; color:${sg.colors.textSecondary};">
        <strong>Formula:</strong> font_size = (fonts ÷ ${latin.fontCount.toLocaleString()}) × 100px
        <br>No log scale. No sqrt. Just the data.
      </div>
    </div>
    
  </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width:1000px; margin:0 auto;">
  ${eyeTestChart}
  ${eyeTestInsights}
  <div style="text-align:center; margin-top:16px; font-size:11px; color:${styleGuide.colors.textMuted};">
    Figure 2: Script Visibility Test — Font size corresponds to font availability
  </div>
</div>`
