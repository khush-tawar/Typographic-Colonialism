// ===========================================
// OBSERVABLE CELLS: Master Dataset Loader
// ===========================================
// Paste these cells into Observable to load the master dataset

// ===========================================
// CELL 1: Load Master Dataset from GitHub
// ===========================================
masterData = {
  const url = "https://raw.githubusercontent.com/khush-tawar/claude-use/dataset/master_dataset.json";
  const response = await fetch(url);
  return response.json();
}

// ===========================================
// CELL 2: Extract Script Nodes (for your existing visualizations)
// ===========================================
scriptNodes = {
  const scripts = masterData.scripts;
  
  return Object.values(scripts)
    .filter(s => s.speakers > 0 || s.font_count > 0)
    .map(s => ({
      code: s.code,
      name: s.name,
      speakers: s.speakers,
      fontCount: s.font_count,
      notoFontCount: s.noto_font_count,
      languageCount: s.languages.length,
      countries: s.countries,
      rtl: s.rtl,
      unicodeVersion: s.unicode_version,
      unicodeDate: s.unicode_date,
      firstGoogleFontDate: s.first_google_font_date,
      fontsByCategory: s.fonts_by_category,
      fontsByWeight: s.fonts_by_weight,
      originCountry: s.origin_country,
    }))
    .sort((a, b) => b.speakers - a.speakers);
}

// ===========================================
// CELL 3: Extract Font Nodes
// ===========================================
fontNodes = {
  return masterData.fonts.map(f => ({
    family: f.family,
    category: f.category,
    scripts: f.scripts,
    subsets: f.subsets,
    weights: f.weights,
    styles: f.styles,
    variants: f.variants,
    lastModified: f.last_modified,
    isNoto: f.is_noto,
    scriptCount: f.scripts.length,
  }));
}

// ===========================================
// CELL 4: Inequality Metrics (Pre-calculated)
// ===========================================
inequalityMetrics = masterData.inequality_metrics

// ===========================================
// CELL 5: Timeline Data
// ===========================================
timelineData = masterData.timeline

// ===========================================
// CELL 6: Color Scheme (consistent across all viz)
// ===========================================
colorScheme = ({
  population: ["#C74848", "#E27D60", "#E8A87C", "#41B3A3", "#659DBD", "#8E8E93", "#BC6C25", "#DDA15E", "#6A994E", "#A7C957"],
  fonts: ["#2A9D8F", "#E76F51", "#F4A261", "#E9C46A", "#264653", "#8E8E93", "#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"],
  background: "#E8E5DA",
  text: "#3A3A3A",
  textLight: "#666",
  textMuted: "#9A9A9A",
  accent: "#2A9D8F",
  danger: "#C74848",
  warning: "#E76F51",
})

// ===========================================
// CELL 7: Build Hierarchical Data for Wheel
// ===========================================
hierarchicalData = {
  const scripts = scriptNodes;
  const fonts = fontNodes;
  
  const categories = ["sans-serif", "serif", "display", "handwriting", "monospace"];
  
  const children = scripts.map(script => {
    const scriptFonts = fonts.filter(f => f.scripts.includes(script.code));
    
    const categoryChildren = categories.map(cat => {
      const catFonts = scriptFonts.filter(f => f.category === cat);
      return {
        name: cat,
        fontCount: catFonts.length,
        children: catFonts.map(f => ({
          name: f.family,
          value: 1
        }))
      };
    }).filter(c => c.fontCount > 0);
    
    return {
      name: script.name,
      code: script.code,
      speakers: script.speakers,
      fontCount: script.fontCount,
      languageCount: script.languageCount,
      children: categoryChildren
    };
  });
  
  return {
    name: "All Scripts",
    children: children
  };
}

// ===========================================
// CELL 8: Subset to Script Code Mapping
// ===========================================
subsetToScriptMap = masterData.subset_to_script_map

// ===========================================
// CELL 9: Unicode Version Dates
// ===========================================
unicodeVersionDates = masterData.unicode_version_dates

// ===========================================
// CELL 10: Classification Nodes (for category analysis)
// ===========================================
classificationNodes = {
  const fonts = fontNodes;
  const categories = ["sans-serif", "serif", "display", "handwriting", "monospace"];
  
  return categories.map(cat => {
    const catFonts = fonts.filter(f => f.category === cat);
    const scriptsInCat = new Set(catFonts.flatMap(f => f.scripts));
    
    return {
      name: cat,
      fontCount: catFonts.length,
      scriptCount: scriptsInCat.size,
      scripts: Array.from(scriptsInCat),
    };
  });
}

// ===========================================
// CELL 11: Noto 3D Data (for your existing 3D viz)
// ===========================================
noto3DData = {
  const notoFonts = fontNodes.filter(f => f.isNoto);
  const weights = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
  
  const dataArray = [];
  const scriptSet = new Set();
  
  notoFonts.forEach(font => {
    font.scripts.forEach(script => {
      scriptSet.add(script);
      font.weights.forEach(weight => {
        if (weights.includes(weight)) {
          dataArray.push({
            script: script,
            weight: weight,
            font: font.family,
          });
        }
      });
    });
  });
  
  // Aggregate: count fonts per script+weight combo
  const aggregated = d3.rollups(
    dataArray,
    v => v.length,
    d => d.script,
    d => d.weight
  );
  
  const result = [];
  aggregated.forEach(([script, weightData]) => {
    weightData.forEach(([weight, count]) => {
      result.push({ script, weight, count });
    });
  });
  
  return {
    "Scripts": Array.from(scriptSet),
    "Weights": weights,
    "Data array": result,
  };
}

// ===========================================
// CELL 12: Speakers vs Fonts Timeline (for area chart)
// ===========================================
speakersVsFonts = {
  const scripts = scriptNodes;
  const timeline = timelineData;
  const years = timeline.years.map(y => parseInt(y)).filter(y => y >= 2010);
  
  const data = [];
  
  scripts.slice(0, 20).forEach(script => {
    years.forEach(year => {
      const fontCount = timeline.cumulative[script.code]?.[year.toString()] || 0;
      
      // Estimate historical population (simple backprojection)
      const currentSpeakers = script.speakers;
      const yearsBack = 2025 - year;
      const estimatedSpeakers = Math.round(currentSpeakers / Math.pow(1.015, yearsBack));
      
      data.push({
        year,
        script: script.code,
        scriptName: script.name,
        speakers: estimatedSpeakers,
        fontCount,
        fontsPerMillion: fontCount / (estimatedSpeakers / 1000000),
      });
    });
  });
  
  return data;
}
