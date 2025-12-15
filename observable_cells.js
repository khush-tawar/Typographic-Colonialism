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

// ===========================================
// CELL 13: Graph Data (Nodes & Edges)
// ===========================================
graphData = masterData.graph

// ===========================================
// CELL 14: Script Network (for Force Graph)
// ===========================================
// D3-ready network: scripts as nodes, shared fonts as edges
scriptNetwork = {
  const network = masterData.graph.networks.script_network;
  
  // Enrich nodes with additional data
  const enrichedNodes = network.nodes.map(n => ({
    ...n,
    // Size by speaker count (log scale)
    radius: Math.max(4, Math.log10(n.speakers + 1) * 3),
    // Color by font count
    fontDensity: n.fontCount / Math.max(1, n.speakers / 1000000),
  }));
  
  return {
    nodes: enrichedNodes,
    links: network.links,
  };
}

// ===========================================
// CELL 15: Adjacency Lookup (fast access)
// ===========================================
adjacency = masterData.graph.adjacency

// ===========================================
// CELL 16: Get Fonts for Script
// ===========================================
getFontsForScript = (scriptCode) => {
  return adjacency.script_to_fonts[scriptCode] || [];
}

// ===========================================
// CELL 17: Get Script Neighbors (shared fonts)
// ===========================================
getScriptNeighbors = (scriptCode) => {
  return adjacency.script_neighbors[scriptCode] || [];
}

// ===========================================
// CELL 18: Edge Lists by Type
// ===========================================
edges = masterData.graph.edges

// ===========================================
// CELL 19: Script Co-occurrence Matrix
// ===========================================
coOccurrenceMatrix = {
  const links = scriptNetwork.links;
  const nodes = scriptNetwork.nodes;
  
  // Create a map for quick lookup
  const matrix = {};
  nodes.forEach(n => {
    matrix[n.code] = {};
    nodes.forEach(m => {
      matrix[n.code][m.code] = 0;
    });
  });
  
  // Fill in shared font counts
  links.forEach(link => {
    const source = typeof link.source === 'object' ? link.source.code : link.source;
    const target = typeof link.target === 'object' ? link.target.code : link.target;
    matrix[source][target] = link.value;
    matrix[target][source] = link.value;
  });
  
  return matrix;
}

// ===========================================
// CELL 20: Graph Metrics
// ===========================================
graphMetrics = masterData.graph.metrics

// ===========================================
// CELL 21: Digital Age Timeline
// ===========================================
digitalTimeline = masterData.digital_timeline

// ===========================================
// CELL 22: Deep Metrics (italic, mono, noto dependency)
// ===========================================
deepMetrics = masterData.deep_metrics

// ===========================================
// CELL 23: Font Sizes (Bandwidth Barrier)
// ===========================================
fontSizes = masterData.font_sizes

// ===========================================
// CELL 24: Web Usage Data
// ===========================================
webUsage = masterData.web_usage

// ===========================================
// CELL 25: Variable Font Data
// ===========================================
variableFonts = masterData.variable_fonts

// ===========================================
// CELL 26: Quick Wins Summary
// ===========================================
quickWinsSummary = masterData.quick_wins_summary

// ===========================================
// CELL 27: Example Force Graph (D3)
// ===========================================
// Paste this for a quick force-directed graph visualization
forceGraphExample = {
  const width = 928;
  const height = 680;
  
  const nodes = scriptNetwork.nodes
    .filter(n => n.fontCount > 0)
    .map(d => ({...d}));
  
  const nodeIds = new Set(nodes.map(n => n.code));
  
  const links = scriptNetwork.links
    .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target))
    .map(d => ({...d}));
  
  // Create color scale by font count
  const colorScale = d3.scaleSequentialLog(d3.interpolateViridis)
    .domain([1, d3.max(nodes, d => d.fontCount)]);
  
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.code).strength(d => Math.min(0.5, d.value / 100)))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(d => d.radius + 2));
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; background: #E8E5DA;");
  
  // Draw links
  const link = svg.append("g")
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", d => Math.sqrt(d.value) * 0.5);
  
  // Draw nodes
  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => d.radius)
    .attr("fill", d => colorScale(d.fontCount))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1)
    .call(drag(simulation));
  
  // Add labels for major scripts
  const label = svg.append("g")
    .selectAll("text")
    .data(nodes.filter(n => n.fontCount > 10 || n.speakers > 100000000))
    .join("text")
    .text(d => d.name)
    .attr("font-size", 9)
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("fill", "#333")
    .attr("dx", d => d.radius + 3)
    .attr("dy", 3);
  
  // Tooltip
  node.append("title")
    .text(d => `${d.name}\nFonts: ${d.fontCount}\nSpeakers: ${(d.speakers / 1e6).toFixed(1)}M\nConnections: ${d.degree}`);
  
  // Tick function
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    
    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
    
    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });
  
  // Drag behavior
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
  
  return svg.node();
}
