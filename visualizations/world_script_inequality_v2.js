// ═══════════════════════════════════════════════════════════════════════════════
// WORLD SCRIPT INEQUALITY - Participatory Design (Self-Contained)
// ═══════════════════════════════════════════════════════════════════════════════
// Everything in one cell: data, map, interactions
// Clean theme matching variable_font_disparity_v2

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Data (masterData must be loaded first)
// ═══════════════════════════════════════════════════════════════════════════════
masterData = FileAttachment("data/processed/master_dataset.json").json()

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: TopoJSON World Map
// ═══════════════════════════════════════════════════════════════════════════════
worldGeo = {
  const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
  const world = await response.json();
  return topojson.feature(world, world.objects.countries);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: The Visualization (Self-Contained)
// ═══════════════════════════════════════════════════════════════════════════════
worldScriptInequality = {
  const width = 1100;
  const height = 1400;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PROCESS DATA
  // ─────────────────────────────────────────────────────────────────────────────
  const scripts = masterData.scripts || {};
  const countryToScript = new Map();
  let notoOnlyCount = 0;
  let criticalCount = 0;
  const latinFonts = scripts.Latn?.font_count || 1900;
  
  Object.entries(scripts).forEach(([code, s]) => {
    if (s.noto_only) notoOnlyCount++;
    if (s.font_count > 0 && s.font_count < 10) criticalCount++;
    
    (s.countries || []).forEach(country => {
      const existing = countryToScript.get(country);
      if (!existing || s.font_count > existing.fontCount) {
        countryToScript.set(country, {
          scriptCode: code,
          scriptName: s.name,
          fontCount: s.font_count || 0,
          notoOnly: s.noto_only || false,
          speakers: s.speakers || 0
        });
      }
    });
  });
  
  // Country ID mapping (TopoJSON numeric → ISO alpha-2)
  const countryIdMap = {
    "4": "AF", "8": "AL", "12": "DZ", "24": "AO", "32": "AR", "36": "AU", "40": "AT",
    "50": "BD", "56": "BE", "68": "BO", "76": "BR", "100": "BG", "104": "MM", "116": "KH",
    "120": "CM", "124": "CA", "140": "CF", "144": "LK", "148": "TD", "152": "CL", "156": "CN",
    "170": "CO", "178": "CG", "180": "CD", "188": "CR", "191": "HR", "192": "CU", "196": "CY",
    "203": "CZ", "204": "BJ", "208": "DK", "214": "DO", "218": "EC", "818": "EG", "222": "SV",
    "231": "ET", "232": "ER", "233": "EE", "246": "FI", "250": "FR", "266": "GA", "268": "GE",
    "276": "DE", "288": "GH", "300": "GR", "320": "GT", "324": "GN", "328": "GY", "332": "HT",
    "340": "HN", "348": "HU", "352": "IS", "356": "IN", "360": "ID", "364": "IR", "368": "IQ",
    "372": "IE", "376": "IL", "380": "IT", "384": "CI", "388": "JM", "392": "JP", "398": "KZ",
    "400": "JO", "404": "KE", "408": "KP", "410": "KR", "414": "KW", "417": "KG", "418": "LA",
    "422": "LB", "426": "LS", "430": "LR", "434": "LY", "440": "LT", "442": "LU", "450": "MG",
    "454": "MW", "458": "MY", "462": "MV", "466": "ML", "478": "MR", "484": "MX", "496": "MN",
    "498": "MD", "504": "MA", "508": "MZ", "512": "OM", "516": "NA", "524": "NP", "528": "NL",
    "554": "NZ", "558": "NI", "562": "NE", "566": "NG", "578": "NO", "586": "PK", "591": "PA",
    "598": "PG", "600": "PY", "604": "PE", "608": "PH", "616": "PL", "620": "PT", "634": "QA",
    "642": "RO", "643": "RU", "646": "RW", "682": "SA", "686": "SN", "688": "RS", "694": "SL",
    "702": "SG", "703": "SK", "704": "VN", "705": "SI", "706": "SO", "710": "ZA", "716": "ZW",
    "724": "ES", "728": "SS", "729": "SD", "740": "SR", "748": "SZ", "752": "SE", "756": "CH",
    "760": "SY", "762": "TJ", "764": "TH", "768": "TG", "780": "TT", "784": "AE", "788": "TN",
    "792": "TR", "795": "TM", "800": "UG", "804": "UA", "807": "MK", "826": "GB", "834": "TZ",
    "840": "US", "854": "BF", "858": "UY", "860": "UZ", "862": "VE", "887": "YE", "894": "ZM",
    "51": "AM", "31": "AZ", "48": "BH", "64": "BT", "70": "BA", "72": "BW", "96": "BN",
    "108": "BI", "270": "GM", "275": "PS", "499": "ME", "158": "TW"
  };
  
  // Color scale function
  const getColor = fontCount => {
    if (fontCount >= 500) return "#1a1a1a";      // Dominant - black
    if (fontCount >= 100) return "#444";         // Privileged - dark gray
    if (fontCount >= 30) return "#888";          // Struggling - medium gray
    if (fontCount >= 10) return "#bbb";          // Neglected - light gray
    if (fontCount >= 1) return "#C74848";        // Critical - red
    return "#e8e8e8";                            // No data - very light
  };
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE CONTAINER
  // ─────────────────────────────────────────────────────────────────────────────
  const container = d3.create("div")
    .style("width", `${width}px`)
    .style("margin", "0 auto")
    .style("font-family", "'Helvetica Neue', Arial, sans-serif")
    .style("background", "#FAFAF8")
    .style("position", "relative");
  
  // ─────────────────────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────────────────────
  const header = container.append("div")
    .style("text-align", "center")
    .style("padding", "50px 40px 30px");
  
  header.append("div")
    .style("font-size", "28px")
    .style("font-weight", "700")
    .style("color", "#1a1a1a")
    .style("letter-spacing", "3px")
    .style("margin-bottom", "12px")
    .text("WORLD SCRIPT INEQUALITY");
  
  header.append("div")
    .style("width", "120px")
    .style("height", "3px")
    .style("background", "#1a1a1a")
    .style("margin", "0 auto 20px");
  
  header.append("div")
    .style("font-size", "15px")
    .style("color", "#666")
    .style("max-width", "650px")
    .style("margin", "0 auto")
    .style("line-height", "1.6")
    .html("Hover over countries to see font availability. <strong>Darker = more fonts</strong>. <strong style='color:#C74848'>Red = critical</strong>.");
  
  // ─────────────────────────────────────────────────────────────────────────────
  // STATS BAR
  // ─────────────────────────────────────────────────────────────────────────────
  const statsBar = container.append("div")
    .style("background", "#1a1a1a")
    .style("padding", "30px 60px")
    .style("margin", "20px 0")
    .style("display", "flex")
    .style("justify-content", "space-around")
    .style("align-items", "center");
  
  const statItems = [
    { value: latinFonts.toLocaleString(), label: "LATIN FONTS", sublabel: "99% of all fonts" },
    { value: Object.keys(scripts).length, label: "TOTAL SCRIPTS", sublabel: "in Google Fonts" },
    { value: criticalCount, label: "CRITICAL", sublabel: "scripts with <10 fonts", highlight: true },
    { value: notoOnlyCount, label: "NOTO-ONLY", sublabel: "would have zero fonts" }
  ];
  
  statItems.forEach(stat => {
    const statDiv = statsBar.append("div")
      .style("text-align", "center");
    
    statDiv.append("div")
      .style("font-size", "36px")
      .style("font-weight", "700")
      .style("color", stat.highlight ? "#C74848" : "#fff")
      .style("font-family", "monospace")
      .text(stat.value);
    
    statDiv.append("div")
      .style("font-size", "10px")
      .style("color", "#888")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "2px")
      .style("margin-top", "4px")
      .text(stat.label);
    
    statDiv.append("div")
      .style("font-size", "10px")
      .style("color", "#555")
      .style("font-style", "italic")
      .style("margin-top", "2px")
      .text(stat.sublabel);
  });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // MAP CONTAINER
  // ─────────────────────────────────────────────────────────────────────────────
  const mapSection = container.append("div")
    .style("padding", "30px 40px");
  
  const mapWidth = 1020;
  const mapHeight = 500;
  
  const svg = mapSection.append("svg")
    .attr("viewBox", [0, 0, mapWidth, mapHeight])
    .style("width", "100%")
    .style("display", "block");
  
  // Map projection
  const projection = d3.geoNaturalEarth1()
    .fitSize([mapWidth - 40, mapHeight - 40], worldGeo)
    .translate([mapWidth / 2, mapHeight / 2]);
  
  const path = d3.geoPath(projection);
  
  // Tooltip
  const tooltip = container.append("div")
    .style("position", "absolute")
    .style("background", "#1a1a1a")
    .style("color", "#fff")
    .style("padding", "15px 20px")
    .style("border-radius", "4px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 1000)
    .style("box-shadow", "0 4px 20px rgba(0,0,0,0.3)")
    .style("max-width", "280px");
  
  // Draw countries
  svg.selectAll("path")
    .data(worldGeo.features)
    .join("path")
    .attr("d", path)
    .attr("fill", d => {
      const iso2 = countryIdMap[d.id];
      const data = countryToScript.get(iso2);
      return data ? getColor(data.fontCount) : "#e8e8e8";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .style("transition", "fill 0.2s")
    .on("mouseenter", function(event, d) {
      const iso2 = countryIdMap[d.id];
      const data = countryToScript.get(iso2);
      
      d3.select(this)
        .attr("stroke", "#1a1a1a")
        .attr("stroke-width", 2);
      
      if (data) {
        const status = data.fontCount >= 500 ? "DOMINANT" :
                      data.fontCount >= 100 ? "PRIVILEGED" :
                      data.fontCount >= 30 ? "STRUGGLING" :
                      data.fontCount >= 10 ? "NEGLECTED" : "CRITICAL";
        
        const statusColor = data.fontCount >= 30 ? "#16a34a" : 
                           data.fontCount >= 10 ? "#f59e0b" : "#C74848";
        
        tooltip.html(`
          <div style="font-weight:700; font-size:15px; margin-bottom:8px;">${d.properties?.name || iso2}</div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#888;">Script</span>
            <span style="font-weight:600;">${data.scriptName}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#888;">Fonts Available</span>
            <span style="font-weight:600;">${data.fontCount.toLocaleString()}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:#888;">Status</span>
            <span style="font-weight:700; color:${statusColor};">${status}</span>
          </div>
          ${data.notoOnly ? `<div style="margin-top:8px; padding-top:8px; border-top:1px solid #333; color:#888; font-size:11px;">⚠️ Would have ZERO fonts without Noto</div>` : ''}
        `);
      } else {
        tooltip.html(`
          <div style="font-weight:700; font-size:15px;">${d.properties?.name || 'Unknown'}</div>
          <div style="color:#888; margin-top:4px;">No data available</div>
        `);
      }
      
      tooltip
        .style("left", `${event.offsetX + 15}px`)
        .style("top", `${event.offsetY - 10}px`)
        .style("opacity", 1);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.offsetX + 15}px`)
        .style("top", `${event.offsetY - 10}px`);
    })
    .on("mouseleave", function() {
      d3.select(this)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5);
      
      tooltip.style("opacity", 0);
    });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // LEGEND (Horizontal, below map)
  // ─────────────────────────────────────────────────────────────────────────────
  const legendSection = container.append("div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("gap", "30px")
    .style("padding", "0 40px 30px")
    .style("flex-wrap", "wrap");
  
  const legendItems = [
    { color: "#1a1a1a", label: "Dominant", sublabel: "500+ fonts" },
    { color: "#444", label: "Privileged", sublabel: "100-499" },
    { color: "#888", label: "Struggling", sublabel: "30-99" },
    { color: "#bbb", label: "Neglected", sublabel: "10-29" },
    { color: "#C74848", label: "Critical", sublabel: "<10 fonts" }
  ];
  
  legendItems.forEach(item => {
    const legendItem = legendSection.append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("gap", "8px");
    
    legendItem.append("div")
      .style("width", "20px")
      .style("height", "20px")
      .style("background", item.color)
      .style("border-radius", "3px");
    
    const labelDiv = legendItem.append("div");
    
    labelDiv.append("div")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("color", "#1a1a1a")
      .text(item.label);
    
    labelDiv.append("div")
      .style("font-size", "10px")
      .style("color", "#888")
      .text(item.sublabel);
  });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CRITICAL SCRIPTS SHOWCASE
  // ─────────────────────────────────────────────────────────────────────────────
  const criticalScripts = Object.entries(scripts)
    .filter(([code, s]) => s.font_count > 0 && s.font_count < 10)
    .sort((a, b) => b[1].speakers - a[1].speakers)
    .slice(0, 8);
  
  const showcaseSection = container.append("div")
    .style("padding", "30px 60px")
    .style("border-top", "1px solid #e5e5e5");
  
  showcaseSection.append("div")
    .style("font-size", "13px")
    .style("font-weight", "700")
    .style("color", "#1a1a1a")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "2px")
    .style("margin-bottom", "20px")
    .text("Critical Scripts — Millions of Speakers, Almost No Fonts");
  
  const showcaseGrid = showcaseSection.append("div")
    .style("display", "grid")
    .style("grid-template-columns", "repeat(4, 1fr)")
    .style("gap", "15px");
  
  criticalScripts.forEach(([code, script]) => {
    const card = showcaseGrid.append("div")
      .style("background", "#fff")
      .style("border", "2px solid #C74848")
      .style("border-radius", "6px")
      .style("padding", "15px")
      .style("text-align", "center");
    
    card.append("div")
      .style("font-size", "11px")
      .style("color", "#C74848")
      .style("font-weight", "700")
      .style("text-transform", "uppercase")
      .style("letter-spacing", "1px")
      .text(script.name);
    
    card.append("div")
      .style("font-size", "28px")
      .style("font-weight", "700")
      .style("color", "#1a1a1a")
      .style("margin", "8px 0")
      .text(script.font_count);
    
    card.append("div")
      .style("font-size", "10px")
      .style("color", "#888")
      .text("fonts");
    
    if (script.speakers) {
      card.append("div")
        .style("font-size", "10px")
        .style("color", "#666")
        .style("margin-top", "8px")
        .style("padding-top", "8px")
        .style("border-top", "1px solid #eee")
        .text(`${(script.speakers / 1000000).toFixed(0)}M+ speakers`);
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────────
  // INSIGHT BOX
  // ─────────────────────────────────────────────────────────────────────────────
  const insight = container.append("div")
    .style("background", "#fff3cd")
    .style("border-left", "4px solid #ffc107")
    .style("margin", "30px 60px")
    .style("padding", "25px 30px");
  
  insight.append("div")
    .style("font-size", "13px")
    .style("font-weight", "700")
    .style("color", "#856404")
    .style("margin-bottom", "10px")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1px")
    .text("The Pattern");
  
  insight.append("div")
    .style("font-size", "14px")
    .style("color", "#533f03")
    .style("line-height", "1.7")
    .html(`
      The map reveals typography's colonial geography. <strong>Western Europe and North America are black</strong> — 
      dominated by thousands of Latin fonts. <strong>Africa, South Asia, and Southeast Asia are red</strong> — 
      their scripts critically underserved. ${notoOnlyCount} scripts would have <em>zero fonts</em> without 
      Google's Noto project. This isn't ancient history — this is the web in 2024.
    `);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // COMPARE: LATIN VS WORLD
  // ─────────────────────────────────────────────────────────────────────────────
  const compareSection = container.append("div")
    .style("padding", "30px 60px")
    .style("border-top", "1px solid #e5e5e5");
  
  compareSection.append("div")
    .style("font-size", "13px")
    .style("font-weight", "700")
    .style("color", "#1a1a1a")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "2px")
    .style("margin-bottom", "20px")
    .style("text-align", "center")
    .text("The Disparity in One Number");
  
  const compareRow = compareSection.append("div")
    .style("display", "flex")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("gap", "60px");
  
  // Latin
  const latinBox = compareRow.append("div")
    .style("text-align", "center");
  
  latinBox.append("div")
    .style("font-size", "72px")
    .style("font-weight", "700")
    .style("color", "#1a1a1a")
    .style("line-height", "1")
    .text(latinFonts.toLocaleString());
  
  latinBox.append("div")
    .style("font-size", "14px")
    .style("color", "#666")
    .style("margin-top", "8px")
    .text("Latin fonts");
  
  // VS
  compareRow.append("div")
    .style("font-size", "24px")
    .style("color", "#ccc")
    .style("font-weight", "300")
    .text("vs");
  
  // Average non-Latin
  const avgNonLatin = Math.round(
    Object.values(scripts)
      .filter(s => s.font_count > 0 && s.font_count < latinFonts)
      .reduce((sum, s) => sum + s.font_count, 0) /
    Object.values(scripts).filter(s => s.font_count > 0 && s.font_count < latinFonts).length
  );
  
  const otherBox = compareRow.append("div")
    .style("text-align", "center");
  
  otherBox.append("div")
    .style("font-size", "72px")
    .style("font-weight", "700")
    .style("color", "#C74848")
    .style("line-height", "1")
    .text(avgNonLatin);
  
  otherBox.append("div")
    .style("font-size", "14px")
    .style("color", "#666")
    .style("margin-top", "8px")
    .text("average for other scripts");
  
  // Ratio
  compareSection.append("div")
    .style("text-align", "center")
    .style("margin-top", "20px")
    .style("font-size", "14px")
    .style("color", "#888")
    .html(`Latin has <strong style="color:#1a1a1a">${Math.round(latinFonts / avgNonLatin)}×</strong> more fonts than the average script`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CAPTION
  // ─────────────────────────────────────────────────────────────────────────────
  container.append("div")
    .style("text-align", "center")
    .style("padding", "30px 40px 50px")
    .style("border-top", "1px solid #e5e5e5")
    .html(`
      <div style="font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px;">
        Fig 6. World Script Inequality
      </div>
      <div style="font-size: 11px; color: #888; font-style: italic;">
        Geographic distribution of font availability — the darker the region, the more typographic power
      </div>
    `);
  
  return container.node();
}
