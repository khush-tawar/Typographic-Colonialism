// ═══════════════════════════════════════════════════════════════════════════════
// WORLD MAP + HISTORICAL TIMELINE - Typographic Colonialism
// ═══════════════════════════════════════════════════════════════════════════════
// Geographic spread + colonial history + Noto's rescue
// All data pulled from masterData - no hardcoding!

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Layer Controls
// ═══════════════════════════════════════════════════════════════════════════════
viewof activeLayer = {
  const layers = [
    { id: "inequality", emoji: "🗺️", label: "Script Inequality", color: "#C74848" },
    { id: "colonial", emoji: "⚓", label: "Colonial Printing (1450-1900)", color: "#8B4513" },
    { id: "digital", emoji: "💻", label: "Digital Age Entry (1984-2024)", color: "#2196F3" },
    { id: "noto", emoji: "🦸", label: "Noto Rescue Scripts", color: "#9c27b0" }
  ];
  
  const container = html`<div style="max-width:1100px; margin:0 auto 20px; font-family:system-ui, sans-serif;">
    <div style="display:flex; flex-wrap:wrap; gap:10px; padding:16px 20px; background:#f8f8f8; border-radius:8px;">
      <div style="flex:0 0 auto; margin-right:20px;">
        <div style="font-size:11px; color:#666; margin-bottom:6px; letter-spacing:1px;">ACTIVE LAYER</div>
      </div>
      ${layers.map((l, i) => `
        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; padding:8px 16px; background:#fff; border-radius:4px; border:2px solid #ddd;" data-layer="${l.id}">
          <input type="radio" name="layer" value="${l.id}" ${i === 0 ? 'checked' : ''} style="accent-color:${l.color};">
          <span style="font-size:12px; font-weight:600; color:${l.color};">${l.emoji} ${l.label}</span>
        </label>
      `).join('')}
    </div>
  </div>`;
  
  const radios = container.querySelectorAll('input[type="radio"]');
  const labels = container.querySelectorAll('label');
  
  function updateStyles() {
    labels.forEach(label => {
      const input = label.querySelector('input');
      const layer = layers.find(l => l.id === label.dataset.layer);
      label.style.borderColor = input.checked ? layer.color : '#ddd';
      label.style.background = input.checked ? layer.color + '15' : '#fff';
    });
  }
  
  radios.forEach(radio => {
    radio.onchange = () => {
      updateStyles();
      container.value = radio.value;
      container.dispatchEvent(new CustomEvent("input"));
    };
  });
  
  updateStyles();
  container.value = "inequality";
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Timeline Slider (layer-aware with weighted distribution)
// ═══════════════════════════════════════════════════════════════════════════════
viewof timelineYear = {
  const layer = activeLayer;
  
  // Layer-specific configurations with weighted breakpoints
  const configs = {
    colonial: {
      defaultYear: 1700,
      breakpoints: [
        { year: 1450, percent: 0, label: "1450" },
        { year: 1600, percent: 25, label: "1600" },
        { year: 1750, percent: 50, label: "1750" },
        { year: 1850, percent: 70, label: "1850" },
        { year: 1950, percent: 85, label: "1950" },
        { year: 2024, percent: 100, label: "2024" }
      ]
    },
    digital: {
      defaultYear: 2010,
      breakpoints: [
        { year: 1984, percent: 0, label: "1984" },
        { year: 1991, percent: 10, label: "1991" },
        { year: 2000, percent: 25, label: "2000" },
        { year: 2010, percent: 50, label: "2010" },
        { year: 2016, percent: 70, label: "2016" },
        { year: 2020, percent: 85, label: "2020" },
        { year: 2024, percent: 100, label: "2024" }
      ]
    }
  };
  
  const config = configs[layer] || configs.digital;
  const bp = config.breakpoints;
  
  // Piecewise linear interpolation
  const percentToYear = pct => {
    for (let i = 0; i < bp.length - 1; i++) {
      if (pct <= bp[i + 1].percent) {
        const ratio = (pct - bp[i].percent) / (bp[i + 1].percent - bp[i].percent);
        return Math.round(bp[i].year + ratio * (bp[i + 1].year - bp[i].year));
      }
    }
    return bp[bp.length - 1].year;
  };
  
  const yearToPercent = year => {
    for (let i = 0; i < bp.length - 1; i++) {
      if (year <= bp[i + 1].year) {
        const ratio = (year - bp[i].year) / (bp[i + 1].year - bp[i].year);
        return bp[i].percent + ratio * (bp[i + 1].percent - bp[i].percent);
      }
    }
    return 100;
  };
  
  const defaultPercent = yearToPercent(config.defaultYear);
  const color = layer === 'colonial' ? '#8B4513' : '#2196F3';
  
  const container = html`<div style="max-width:1100px; margin:0 auto 20px; font-family:system-ui, sans-serif;">
    <div style="display:flex; align-items:center; gap:20px; padding:16px 20px; background:#f0f0f0; border-radius:8px;">
      <div style="flex:0 0 auto;">
        <div style="font-size:10px; color:#666;">YEAR</div>
        <div style="font-size:28px; font-weight:700; color:#333; font-family:monospace;" id="yearValue">${config.defaultYear}</div>
      </div>
      <div style="flex:1; position:relative;">
        <input type="range" min="0" max="100" value="${defaultPercent}" step="0.5" style="width:100%; height:8px; cursor:pointer;" id="yearSlider">
        <div style="position:relative; height:20px; margin-top:4px; font-size:9px; color:#888;">
          ${bp.map(b => `<span style="position:absolute; left:${b.percent}%; transform:translateX(-50%);">${b.label}</span>`).join('')}
        </div>
      </div>
      <button id="playBtn" style="padding:8px 16px; border:none; background:${color}; color:white; border-radius:4px; cursor:pointer; font-weight:600;">▶ Play</button>
    </div>
  </div>`;
  
  const slider = container.querySelector("#yearSlider");
  const valueDisplay = container.querySelector("#yearValue");
  const playBtn = container.querySelector("#playBtn");
  let playing = false, interval = null;
  
  slider.oninput = () => {
    const year = percentToYear(+slider.value);
    valueDisplay.textContent = year;
    container.value = year;
    container.dispatchEvent(new CustomEvent("input"));
  };
  
  playBtn.onclick = () => {
    if (playing) {
      clearInterval(interval);
      playBtn.textContent = "▶ Play";
      playing = false;
    } else {
      playBtn.textContent = "⏸ Pause";
      playing = true;
      if (+slider.value >= 100) slider.value = 0;
      interval = setInterval(() => {
        slider.value = +slider.value + 0.5;
        if (+slider.value >= 100) { clearInterval(interval); playBtn.textContent = "▶ Play"; playing = false; }
        const year = percentToYear(+slider.value);
        valueDisplay.textContent = year;
        container.value = year;
        container.dispatchEvent(new CustomEvent("input"));
      }, 80);
    }
  };
  
  container.value = config.defaultYear;
  return container;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Process Data from masterData (no hardcoding!)
// ═══════════════════════════════════════════════════════════════════════════════
processedData = {
  const scripts = masterData.scripts || {};
  const milestones = masterData.digital_milestones || [];
  
  // Build country → script mapping from the dataset
  const countryToScript = new Map();
  const notoOnlyScripts = [];
  const printingEvents = [];
  
  Object.entries(scripts).forEach(([code, s]) => {
    // Track Noto-only scripts
    if (s.noto_only) notoOnlyScripts.push(code);
    
    // Build printing events
    if (s.printing_intro?.year) {
      printingEvents.push({
        year: s.printing_intro.year,
        script: code,
        name: s.name,
        location: s.printing_intro.location,
        event: s.printing_intro.event
      });
    }
    
    // Map countries to scripts
    (s.countries || []).forEach(country => {
      const existing = countryToScript.get(country);
      if (!existing || s.font_count > existing.fontCount) {
        countryToScript.set(country, {
          scriptCode: code,
          scriptName: s.name,
          fontCount: s.font_count || 0,
          digitalEntry: s.digital_age_start,
          notoRelease: s.noto_first_release,
          printingYear: s.printing_intro?.year,
          notoOnly: s.noto_only || false,
          speakers: s.speakers || 0
        });
      }
    });
  });
  
  // Sort printing events chronologically
  printingEvents.sort((a, b) => a.year - b.year);
  
  return { countryToScript, notoOnlyScripts, printingEvents, milestones, scripts };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: World Map TopoJSON
// ═══════════════════════════════════════════════════════════════════════════════
worldGeo = {
  const response = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
  const world = await response.json();
  return topojson.feature(world, world.objects.countries);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 5: Country ID Mapping (TopoJSON numeric → ISO alpha-2)
// ═══════════════════════════════════════════════════════════════════════════════
countryIdMap = ({
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
})

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 6: Color Scales
// ═══════════════════════════════════════════════════════════════════════════════
colorScales = {
  const sg = styleGuide;
  
  return {
    inequality: fontCount => {
      if (fontCount >= 500) return sg.colors.status.dominant;
      if (fontCount >= 100) return sg.colors.status.privileged;
      if (fontCount >= 30) return "#E9C46A";
      if (fontCount >= 10) return sg.colors.status.struggling;
      if (fontCount >= 1) return sg.colors.status.neglected;
      return "#ddd";
    },
    colonial: (printingYear, currentYear) => {
      if (!printingYear || printingYear > currentYear) return "#ddd";
      const yearsActive = currentYear - printingYear;
      const ratio = Math.min(1, yearsActive / 574);
      return `rgb(${Math.round(210 - ratio * 71)},${Math.round(180 - ratio * 111)},${Math.round(140 - ratio * 121)})`;
    },
    digital: (digitalEntry, currentYear) => {
      if (!digitalEntry || digitalEntry > currentYear) return "#ddd";
      const yearsBehind = digitalEntry - 1984;
      if (yearsBehind <= 0) return "#1976D2";
      if (yearsBehind <= 5) return "#42A5F5";
      if (yearsBehind <= 10) return "#81C784";
      if (yearsBehind <= 15) return "#FFD54F";
      if (yearsBehind <= 20) return "#FF8A65";
      return "#EF5350";
    },
    noto: isNotoOnly => isNotoOnly ? "#9c27b0" : "#ddd"
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 7: The World Map
// ═══════════════════════════════════════════════════════════════════════════════
worldMapChart = {
  const sg = styleGuide;
  const layer = activeLayer;
  const year = timelineYear;
  const { countryToScript, printingEvents, milestones, notoOnlyScripts } = processedData;
  
  const W = 1100, H = 650;
  const M = { top: 80, right: 50, bottom: 100, left: 50 };
  
  const titles = {
    inequality: "WORLD SCRIPT INEQUALITY",
    colonial: `PRINTING PRESS SPREAD (by ${year})`,
    digital: `DIGITAL AGE ENTRY (by ${year})`,
    noto: "NOTO RESCUE: SCRIPTS SAVED BY GOOGLE"
  };
  
  const subtitles = {
    inequality: "Countries colored by font availability of their primary script",
    colonial: "When the printing press reached each script (darker = earlier)",
    digital: "When scripts entered the digital age (red = decades behind Latin)",
    noto: "Scripts that would have ZERO fonts without Google's Noto project"
  };
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, W, H])
    .style("max-width", "100%")
    .style("background", "#FAFAFA")
    .style("font-family", sg.typography.fontFamily);
  
  // Title
  svg.append("text").attr("x", W/2).attr("y", 35).attr("text-anchor", "middle")
    .attr("fill", "#1a1a1a").attr("font-size", "22px").attr("font-weight", "700")
    .attr("letter-spacing", "2px").text(titles[layer]);
  
  svg.append("text").attr("x", W/2).attr("y", 58).attr("text-anchor", "middle")
    .attr("fill", "#666").attr("font-size", "12px").text(subtitles[layer]);
  
  // Map
  const projection = d3.geoNaturalEarth1().fitSize([W - M.left - M.right, H - M.top - M.bottom], worldGeo);
  const path = d3.geoPath(projection);
  
  const mapG = svg.append("g").attr("transform", `translate(${M.left}, ${M.top})`);
  
  mapG.selectAll("path").data(worldGeo.features).join("path")
    .attr("d", path)
    .attr("fill", d => {
      const iso2 = countryIdMap[d.id];
      const data = countryToScript.get(iso2);
      if (!data) return "#e0e0e0";
      
      switch(layer) {
        case "inequality": return colorScales.inequality(data.fontCount);
        case "colonial": return colorScales.colonial(data.printingYear, year);
        case "digital": return colorScales.digital(data.digitalEntry, year);
        case "noto": return colorScales.noto(data.notoOnly);
        default: return "#e0e0e0";
      }
    })
    .attr("stroke", "#fff").attr("stroke-width", 0.5)
    .append("title").text(d => {
      const iso2 = countryIdMap[d.id];
      const data = countryToScript.get(iso2);
      if (!data) return d.properties?.name || "Unknown";
      return `${d.properties?.name || iso2}\nScript: ${data.scriptName}\nFonts: ${data.fontCount}\nDigital: ${data.digitalEntry || "?"}\nNoto: ${data.notoRelease || "?"}`;
    });
  
  // Overlay annotations for digital layer
  if (layer === "digital") {
    const visible = milestones.filter(m => m.year <= year);
    const annotG = svg.append("g").attr("transform", `translate(${W - 180}, ${M.top + 10})`);
    annotG.append("text").attr("font-size", "10px").attr("font-weight", "700").attr("fill", "#333").text("MILESTONES:");
    visible.slice(-6).forEach((m, i) => {
      annotG.append("text").attr("y", 18 + i * 14).attr("font-size", "9px").attr("fill", "#666")
        .text(`${m.year}: ${m.event.slice(0, 24)}`);
    });
  }
  
  // Legend
  const legendG = svg.append("g").attr("transform", `translate(${M.left}, ${H - 70})`);
  
  if (layer === "inequality") {
    [
      { label: "Dominant (500+)", color: sg.colors.status.dominant },
      { label: "Privileged (100-499)", color: sg.colors.status.privileged },
      { label: "Struggling (30-99)", color: "#E9C46A" },
      { label: "Neglected (10-29)", color: sg.colors.status.struggling },
      { label: "Critical (<10)", color: sg.colors.status.neglected }
    ].forEach((item, i) => {
      legendG.append("rect").attr("x", i * 160).attr("y", 0).attr("width", 14).attr("height", 14).attr("fill", item.color).attr("rx", 2);
      legendG.append("text").attr("x", i * 160 + 20).attr("y", 11).attr("font-size", "10px").attr("fill", "#555").text(item.label);
    });
  }
  
  if (layer === "noto") {
    legendG.append("rect").attr("width", 18).attr("height", 18).attr("fill", "#9c27b0").attr("rx", 2);
    legendG.append("text").attr("x", 25).attr("y", 14).attr("font-size", "12px").attr("font-weight", "600").attr("fill", "#9c27b0")
      .text(`Noto-only: ${notoOnlyScripts.length} scripts would have ZERO fonts without Google`);
  }
  
  // Source
  svg.append("text").attr("x", W - 10).attr("y", H - 10).attr("text-anchor", "end")
    .attr("fill", "#ccc").attr("font-size", "8px").text("github.com/khush-tawar/Typographic-Colonialism");
  
  return svg.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 8: Stats Panel
// ═══════════════════════════════════════════════════════════════════════════════
statsPanel = {
  const layer = activeLayer;
  const year = timelineYear;
  const { notoOnlyScripts, printingEvents, milestones, scripts } = processedData;
  
  // Calculate stats from actual data
  const latinFonts = scripts.Latn?.font_count || 1900;
  const totalScripts = Object.keys(scripts).length;
  const criticalScripts = Object.values(scripts).filter(s => s.font_count > 0 && s.font_count < 10).length;
  
  const stats = {
    inequality: {
      title: "INEQUALITY BY THE NUMBERS",
      items: [
        { label: "Latin fonts", value: latinFonts.toLocaleString(), sublabel: "99% of all fonts", color: "#2A9D8F" },
        { label: "Total scripts", value: totalScripts, color: "#333" },
        { label: "Critical (<10 fonts)", value: criticalScripts, sublabel: "serving millions", color: "#C74848" },
        { label: "Noto-only scripts", value: notoOnlyScripts.length, sublabel: "would have nothing", color: "#9c27b0" }
      ]
    },
    colonial: {
      title: `PRINTING HISTORY (${year})`,
      items: [
        { label: "Latin head start", value: `${Math.max(0, year - 1450)} years`, color: "#8B4513" },
        { label: "Scripts with printing", value: printingEvents.filter(e => e.year <= year).length, color: "#5D4037" },
        { label: "Gutenberg", value: year >= 1450 ? "✓ Active" : "Not yet", color: "#D4AF37" }
      ]
    },
    digital: {
      title: `DIGITAL AGE (${year})`,
      items: [
        { label: "Latin entered", value: "1984", sublabel: "PostScript", color: "#1976D2" },
        { label: "Scripts online", value: Object.values(scripts).filter(s => s.digital_age_start && s.digital_age_start <= year).length, color: "#2196F3" },
        { label: "Noto project", value: year >= 2010 ? "Active" : "Not yet", color: "#9c27b0" }
      ]
    },
    noto: {
      title: "GOOGLE'S NOTO PROJECT",
      items: [
        { label: "Scripts rescued", value: notoOnlyScripts.length, sublabel: "from zero fonts", color: "#9c27b0" },
        { label: "Project started", value: "2010", color: "#673AB7" },
        { label: "Mission", value: "No Tofu", sublabel: "readable everywhere", color: "#4A148C" }
      ]
    }
  }[layer];
  
  return html`<div style="max-width:1100px; margin:20px auto; font-family:system-ui, sans-serif;">
    <div style="background:#fff; border-radius:8px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <div style="font-size:11px; color:#666; letter-spacing:1px; margin-bottom:15px; font-weight:600;">${stats.title}</div>
      <div style="display:flex; gap:30px; flex-wrap:wrap;">
        ${stats.items.map(item => html`
          <div style="flex:1; min-width:120px;">
            <div style="font-size:28px; font-weight:700; color:${item.color};">${item.value}</div>
            <div style="font-size:12px; color:#555;">${item.label}</div>
            ${item.sublabel ? html`<div style="font-size:10px; color:#888;">${item.sublabel}</div>` : ''}
          </div>
        `)}
      </div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 9: Narration
// ═══════════════════════════════════════════════════════════════════════════════
narration = {
  const layer = activeLayer;
  const year = timelineYear;
  const { notoOnlyScripts } = processedData;
  
  const narratives = {
    inequality: {
      icon: "🗺️", title: "The Geography of Typographic Power",
      text: `Font availability follows colonial and economic power. Western Europe and North America have thousands of font choices, while Africa, South Asia, and Southeast Asia are marked in red—regions whose scripts have been systematically neglected.`
    },
    colonial: {
      icon: "⚓",
      title: year < 1600 ? "The First Century" : year < 1800 ? "Colonial Expansion" : "Industrial Era",
      text: year < 1600
        ? `Gutenberg invented movable type in 1450. For 150 years, printing remained almost exclusively in Latin script.`
        : year < 1800
        ? `The printing press follows colonial trade routes. Scripts are printed where there's profit or missionary interest—not where people need them.`
        : `By 1900, the pattern is set: Latin has 450 years of development. Many scripts are just beginning.`
    },
    digital: {
      icon: "💻",
      title: year < 1991 ? "Pre-Unicode Era" : year < 2010 ? "Unicode Era" : "Noto Era",
      text: year < 1991
        ? `PostScript (1984) enabled digital Latin fonts. Other scripts wait for Unicode.`
        : year < 2010
        ? `Unicode expands, but font creation lags. Creating fonts for complex scripts requires expertise the market doesn't fund.`
        : `Google's Noto project (2010) aims to eliminate "tofu" boxes. By ${year}, they've rescued ${notoOnlyScripts.length} scripts from invisibility.`
    },
    noto: {
      icon: "🦸", title: "No More Tofu",
      text: `"Noto" means "No Tofu"—the blank boxes when fonts can't render. ${notoOnlyScripts.length} scripts exist digitally only because of Google. This is intervention at scale—but it shouldn't have taken a trillion-dollar company.`
    }
  }[layer];
  
  const colors = { inequality: '#C74848', colonial: '#8B4513', digital: '#2196F3', noto: '#9c27b0' };
  
  return html`<div style="max-width:1100px; margin:20px auto; font-family:system-ui, sans-serif;">
    <div style="background:#f8f8f8; padding:24px; border-radius:8px; border-left:4px solid ${colors[layer]};">
      <div style="font-size:18px; margin-bottom:8px;">${narratives.icon} <strong>${narratives.title}</strong></div>
      <div style="font-size:14px; color:#444; line-height:1.6;">${narratives.text}</div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 10: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width:1100px; margin:0 auto;">
  ${viewof activeLayer}
  ${activeLayer === "colonial" || activeLayer === "digital" ? viewof timelineYear : ""}
  ${worldMapChart}
  ${statsPanel}
  ${narration}
</div>`
