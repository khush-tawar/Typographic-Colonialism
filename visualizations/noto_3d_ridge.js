// ═══════════════════════════════════════════════════════════════════════════════
// NOTO 3D RIDGE CHART - Using masterData
// ═══════════════════════════════════════════════════════════════════════════════
// 3D ridge visualization of Noto font family variants across scripts and weights
// All data pulled from masterData - no external dependencies

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 0: Load Master Dataset from GitHub
// ═══════════════════════════════════════════════════════════════════════════════
masterData = {
  const url = "https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/data/processed/master_dataset.json";
  const response = await fetch(url);
  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Build Noto 3D Data from masterData
// ═══════════════════════════════════════════════════════════════════════════════
noto3DData = {
  const fonts = masterData.fonts || [];
  const scripts = masterData.scripts || {};
  
  // Filter Noto fonts that have a target script assigned
  // Use noto_target_script (the PRIMARY script the font was designed for)
  // NOT the scripts array (which includes Latin for all fonts due to numbers/punctuation)
  const notoFonts = fonts.filter(f => f.is_noto === true && f.noto_target_script);
  
  // All possible weights
  const allWeights = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
  
  // Group Noto fonts by their target script
  const fontsByScript = {};
  notoFonts.forEach(f => {
    const code = f.noto_target_script;
    if (!fontsByScript[code]) fontsByScript[code] = [];
    fontsByScript[code].push(f);
  });
  
  // Build data array: for each script + weight combo, count font families
  const dataArray = [];
  
  Object.entries(fontsByScript).forEach(([code, scriptFonts]) => {
    const scriptInfo = scripts[code] || {};
    
    allWeights.forEach(weight => {
      // Count fonts that have this weight
      const fontsWithWeight = scriptFonts.filter(f => 
        f.weights && f.weights.includes(weight)
      );
      
      dataArray.push({
        script: code,
        scriptName: scriptInfo.name || code,
        weight: weight,
        count: fontsWithWeight.length,
        fonts: fontsWithWeight.map(f => f.family)
      });
    });
  });
  
  // Calculate totals per script for sorting
  const scriptTotals = {};
  dataArray.forEach(d => {
    scriptTotals[d.script] = (scriptTotals[d.script] || 0) + d.count;
  });
  
  // Get sorted script list (by total font count)
  const sortedScripts = Object.entries(scriptTotals)
    .sort((a, b) => b[1] - a[1])
    .map(d => d[0]);
  
  // Build script name map
  const scriptNameMap = {};
  Object.entries(scripts).forEach(([code, info]) => {
    scriptNameMap[code] = info.name || code;
  });
  
  return {
    dataArray,
    scriptTotals,
    sortedScripts,
    scriptNameMap,
    totalNotoFonts: notoFonts.length,
    scriptsWithNoto: sortedScripts.length
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Chart Controls
// ═══════════════════════════════════════════════════════════════════════════════
viewof chartControls = {
  const data = noto3DData;
  const totalScripts = data.scriptsWithNoto;
  
  const form = d3.create("div")
    .style("font-family", "'Helvetica Neue', Arial, sans-serif")
    .style("max-width", "900px")
    .style("margin", "0 auto")
    .style("padding", "40px")
    .style("background", "#E8E5DA");
  
  // Header
  form.append("div")
    .style("margin-bottom", "30px")
    .append("h2")
    .style("color", "#3A3A3A")
    .style("margin", "0")
    .style("font-size", "24px")
    .style("font-weight", "700")
    .style("letter-spacing", "2px")
    .style("text-transform", "uppercase")
    .text("Visualization Controls");
  
  // Current Selection Info
  const topInfo = form.append("div")
    .style("padding", "20px")
    .style("background", "#F5F3EE")
    .style("border-left", "3px solid #5A5A5A")
    .style("margin-bottom", "30px");
  
  topInfo.append("div")
    .style("font-size", "10px")
    .style("font-weight", "700")
    .style("color", "#7A7A7A")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1px")
    .style("margin-bottom", "10px")
    .text("Current Selection");
  
  const scriptInfo = topInfo.append("div")
    .style("font-size", "13px")
    .style("color", "#3A3A3A")
    .style("line-height", "1.7")
    .html(`📊 <strong style="font-weight: 700;">${totalScripts} scripts</strong> with Noto fonts (Rank 1-${totalScripts})`);
  
  const weightInfo = topInfo.append("div")
    .style("font-size", "13px")
    .style("color", "#3A3A3A")
    .style("line-height", "1.7")
    .style("margin-top", "5px")
    .html(`📏 <strong style="font-weight: 700;">9 weights</strong> selected (100-900)`);
  
  // Control sections container
  const controlGrid = form.append("div")
    .style("display", "grid")
    .style("grid-template-columns", "1fr 1fr")
    .style("gap", "30px")
    .style("padding", "30px 0")
    .style("border-top", "1px solid #9A9A9A")
    .style("border-bottom", "1px solid #9A9A9A");
  
  // SCRIPT RANGE SECTION
  const scriptSection = controlGrid.append("div");
  
  scriptSection.append("h3")
    .style("color", "#3A3A3A")
    .style("margin", "0 0 20px 0")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("letter-spacing", "1.5px")
    .style("text-transform", "uppercase")
    .text("Script Range");
  
  const scriptSliderDiv = scriptSection.append("div")
    .style("position", "relative")
    .style("height", "50px")
    .style("margin-bottom", "15px");
  
  const scriptTrack = scriptSliderDiv.append("div")
    .style("position", "absolute")
    .style("top", "20px")
    .style("width", "100%")
    .style("height", "4px")
    .style("background", "#D8D6CB")
    .style("border-radius", "2px");
  
  const scriptRange = scriptTrack.append("div")
    .style("position", "absolute")
    .style("height", "100%")
    .style("background", "#2A9D8F")
    .style("border-radius", "2px")
    .style("left", "0%")
    .style("width", "100%");
  
  const minScriptSlider = scriptSliderDiv.append("input")
    .attr("type", "range")
    .attr("min", "1")
    .attr("max", totalScripts)
    .attr("value", "1")
    .attr("class", "dual-range-min")
    .style("position", "absolute")
    .style("width", "100%")
    .style("top", "18px")
    .style("-webkit-appearance", "none")
    .style("background", "transparent")
    .style("pointer-events", "none")
    .style("z-index", "2")
    .style("cursor", "pointer");
  
  const maxScriptSlider = scriptSliderDiv.append("input")
    .attr("type", "range")
    .attr("min", "1")
    .attr("max", totalScripts)
    .attr("value", totalScripts)
    .attr("class", "dual-range-max")
    .style("position", "absolute")
    .style("width", "100%")
    .style("top", "18px")
    .style("-webkit-appearance", "none")
    .style("background", "transparent")
    .style("pointer-events", "none")
    .style("z-index", "3")
    .style("cursor", "pointer");
  
  const scriptLabels = scriptSection.append("div")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("font-size", "11px")
    .style("color", "#666")
    .style("font-weight", "600")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1px");
  
  const minScriptLabel = scriptLabels.append("span").text("Min: 1");
  const maxScriptLabel = scriptLabels.append("span").text(`Max: ${totalScripts}`);
  
  // WEIGHT RANGE SECTION
  const weightSection = controlGrid.append("div");
  
  weightSection.append("h3")
    .style("color", "#3A3A3A")
    .style("margin", "0 0 20px 0")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("letter-spacing", "1.5px")
    .style("text-transform", "uppercase")
    .text("Weight Range");
  
  const weightSliderDiv = weightSection.append("div")
    .style("position", "relative")
    .style("height", "50px")
    .style("margin-bottom", "15px");
  
  const weightTrack = weightSliderDiv.append("div")
    .style("position", "absolute")
    .style("top", "20px")
    .style("width", "100%")
    .style("height", "4px")
    .style("background", "#D8D6CB")
    .style("border-radius", "2px");
  
  const weightRange = weightTrack.append("div")
    .style("position", "absolute")
    .style("height", "100%")
    .style("background", "#E27D60")
    .style("border-radius", "2px")
    .style("left", "0%")
    .style("width", "100%");
  
  const minWeightSlider = weightSliderDiv.append("input")
    .attr("type", "range")
    .attr("min", "100")
    .attr("max", "900")
    .attr("step", "100")
    .attr("value", "100")
    .attr("class", "dual-range-min")
    .style("position", "absolute")
    .style("width", "100%")
    .style("top", "18px")
    .style("-webkit-appearance", "none")
    .style("background", "transparent")
    .style("pointer-events", "none")
    .style("z-index", "2")
    .style("cursor", "pointer");
  
  const maxWeightSlider = weightSliderDiv.append("input")
    .attr("type", "range")
    .attr("min", "100")
    .attr("max", "900")
    .attr("step", "100")
    .attr("value", "900")
    .attr("class", "dual-range-max")
    .style("position", "absolute")
    .style("width", "100%")
    .style("top", "18px")
    .style("-webkit-appearance", "none")
    .style("background", "transparent")
    .style("pointer-events", "none")
    .style("z-index", "3")
    .style("cursor", "pointer");
  
  const weightLabels = weightSection.append("div")
    .style("display", "flex")
    .style("justify-content", "space-between")
    .style("font-size", "11px")
    .style("color", "#666")
    .style("font-weight", "600")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1px");
  
  const minWeightLabel = weightLabels.append("span").text("Min: 100");
  const maxWeightLabel = weightLabels.append("span").text("Max: 900");
  
  // DISPLAY OPTIONS SECTION
  const optionsGrid = form.append("div")
    .style("display", "grid")
    .style("grid-template-columns", "1fr 1fr")
    .style("gap", "30px")
    .style("margin-top", "30px")
    .style("padding-top", "30px")
    .style("border-top", "1px solid #9A9A9A");
  
  // Percentage Scale Option
  const percentSection = optionsGrid.append("div");
  
  percentSection.append("h3")
    .style("color", "#3A3A3A")
    .style("margin", "0 0 15px 0")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("letter-spacing", "1.5px")
    .style("text-transform", "uppercase")
    .text("Z-Axis Scale");
  
  const percentSlider = percentSection.append("input")
    .attr("type", "range")
    .attr("min", "0")
    .attr("max", "100")
    .attr("value", "100")
    .style("width", "100%")
    .style("cursor", "pointer")
    .style("-webkit-appearance", "none")
    .style("background", "transparent")
    .style("margin-bottom", "10px");
  
  const percentValue = percentSection.append("div")
    .style("font-size", "11px")
    .style("color", "#666")
    .style("font-weight", "600")
    .style("text-align", "center")
    .text("100% Percentage");
  
  // Spacing Option
  const spacingSection = optionsGrid.append("div");
  
  spacingSection.append("h3")
    .style("color", "#3A3A3A")
    .style("margin", "0 0 15px 0")
    .style("font-size", "14px")
    .style("font-weight", "700")
    .style("letter-spacing", "1.5px")
    .style("text-transform", "uppercase")
    .text("Spacing");
  
  const spacingSlider = spacingSection.append("input")
    .attr("type", "range")
    .attr("min", "0.5")
    .attr("max", "2")
    .attr("step", "0.1")
    .attr("value", "0.5")
    .style("width", "100%")
    .style("cursor", "pointer")
    .style("-webkit-appearance", "none")
    .style("background", "transparent")
    .style("margin-bottom", "10px");
  
  const spacingValue = spacingSection.append("div")
    .style("font-size", "11px")
    .style("color", "#666")
    .style("font-weight", "600")
    .style("text-align", "center")
    .text("0.5x");
  
  // Reset button
  const resetBtn = form.append("button")
    .style("margin-top", "30px")
    .style("padding", "14px 24px")
    .style("background", "#5A5A5A")
    .style("color", "#E8E5DA")
    .style("border", "none")
    .style("border-radius", "0")
    .style("font-size", "11px")
    .style("font-weight", "700")
    .style("cursor", "pointer")
    .style("width", "100%")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1.5px")
    .style("transition", "background 0.2s")
    .text("Reset All Controls");
  
  resetBtn.on("mouseover", function() { d3.select(this).style("background", "#3A3A3A"); });
  resetBtn.on("mouseout", function() { d3.select(this).style("background", "#5A5A5A"); });
  
  // Caption
  form.append("div")
    .style("margin-top", "30px")
    .style("text-align", "center")
    .html(`
      <div style="font-size: 12px; font-weight: 700; color: #3A3A3A;">Interactive Range Controls</div>
      <div style="font-size: 10px; font-style: italic; color: #7A7A7A; margin-top: 4px;">Adjust sliders to explore different subsets and customize display options</div>
    `);
  
  // Add custom slider styles
  form.append("style").text(`
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #5A5A5A;
      cursor: pointer;
      border: 2px solid #E8E5DA;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      position: relative;
      z-index: 100;
      pointer-events: all;
    }
    input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #5A5A5A;
      cursor: pointer;
      border: 2px solid #E8E5DA;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      pointer-events: all;
    }
    input[type="range"]::-webkit-slider-runnable-track {
      height: 4px;
      background: transparent;
    }
    input[type="range"]::-moz-range-track {
      height: 4px;
      background: transparent;
    }
  `);
  
  function updateUI() {
    const minScript = +minScriptSlider.property("value");
    const maxScript = +maxScriptSlider.property("value");
    const minWeight = +minWeightSlider.property("value");
    const maxWeight = +maxWeightSlider.property("value");
    const percentBlend = +percentSlider.property("value");
    const spacing = +spacingSlider.property("value");
    
    // Update range highlights
    const scriptPercent1 = ((minScript - 1) / (totalScripts - 1)) * 100;
    const scriptPercent2 = ((maxScript - 1) / (totalScripts - 1)) * 100;
    scriptRange
      .style("left", scriptPercent1 + "%")
      .style("width", (scriptPercent2 - scriptPercent1) + "%");
    
    const weightPercent1 = ((minWeight - 100) / 800) * 100;
    const weightPercent2 = ((maxWeight - 100) / 800) * 100;
    weightRange
      .style("left", weightPercent1 + "%")
      .style("width", (weightPercent2 - weightPercent1) + "%");
    
    // Update labels
    minScriptLabel.text(`Min: ${minScript}`);
    maxScriptLabel.text(`Max: ${maxScript}`);
    minWeightLabel.text(`Min: ${minWeight}`);
    maxWeightLabel.text(`Max: ${maxWeight}`);
    
    const scriptCount = maxScript - minScript + 1;
    const weightCount = (maxWeight - minWeight) / 100 + 1;
    
    scriptInfo.html(`📊 <strong style="font-weight: 700;">${scriptCount} script${scriptCount !== 1 ? 's' : ''}</strong> selected (Rank ${minScript}-${maxScript})`);
    weightInfo.html(`📏 <strong style="font-weight: 700;">${weightCount} weight${weightCount !== 1 ? 's' : ''}</strong> selected (${minWeight}-${maxWeight})`);
    
    if (percentBlend === 0) {
      percentValue.text("Absolute Count");
    } else if (percentBlend === 100) {
      percentValue.text("100% Percentage");
    } else {
      percentValue.text(`${percentBlend}% Percentage Blend`);
    }
    
    spacingValue.text(`${spacing.toFixed(1)}x`);
    
    form.node().value = {
      minScript,
      maxScript,
      minWeight,
      maxWeight,
      percentBlend: percentBlend / 100,
      spacing
    };
    
    form.node().dispatchEvent(new Event("input", {bubbles: true}));
  }
  
  function handleSliderChange() {
    let minScript = +minScriptSlider.property("value");
    let maxScript = +maxScriptSlider.property("value");
    let minWeight = +minWeightSlider.property("value");
    let maxWeight = +maxWeightSlider.property("value");
    
    if (minScript > maxScript) {
      [minScript, maxScript] = [maxScript, minScript];
      minScriptSlider.property("value", minScript);
      maxScriptSlider.property("value", maxScript);
    }
    
    if (minWeight > maxWeight) {
      [minWeight, maxWeight] = [maxWeight, minWeight];
      minWeightSlider.property("value", minWeight);
      maxWeightSlider.property("value", maxWeight);
    }
    
    updateUI();
  }
  
  minScriptSlider.on("input", handleSliderChange);
  maxScriptSlider.on("input", handleSliderChange);
  minWeightSlider.on("input", handleSliderChange);
  maxWeightSlider.on("input", handleSliderChange);
  percentSlider.on("input", updateUI);
  spacingSlider.on("input", updateUI);
  
  resetBtn.on("click", function() {
    minScriptSlider.property("value", 1);
    maxScriptSlider.property("value", totalScripts);
    minWeightSlider.property("value", 100);
    maxWeightSlider.property("value", 900);
    percentSlider.property("value", 100);
    spacingSlider.property("value", 0.5);
    updateUI();
  });
  
  form.node().value = {
    minScript: 1,
    maxScript: totalScripts,
    minWeight: 100,
    maxWeight: 900,
    percentBlend: 1.0,
    spacing: 0.5
  };
  
  updateUI();
  
  return form.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 3: Noto 3D Ridge Visualization
// ═══════════════════════════════════════════════════════════════════════════════
noto3DVisualization = {
  const data = noto3DData;
  const controls = chartControls;
  
  const allWeights = ["100", "200", "300", "400", "500", "600", "700", "800", "900"];
  const CANVAS = { width: 1200, height: 800 };
  
  const container = d3.create("div")
    .style("position", "relative")
    .style("width", `${CANVAS.width}px`)
    .style("height", `${CANVAS.height}px`)
    .style("font-family", "'Helvetica Neue', Arial, sans-serif")
    .style("overflow", "visible")
    .style("background", "#E8E5DA")
    .style("margin", "0 auto");
  
  const svg = container.append("svg")
    .attr("width", CANVAS.width)
    .attr("height", CANVAS.height);
  
  // Info panel - TOP RIGHT
  const infoGroup = svg.append("g")
    .attr("transform", `translate(${CANVAS.width - 320}, 30)`);
  
  const infoBg = infoGroup.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", 280).attr("height", 150)
    .attr("fill", "#F5F3EE")
    .attr("stroke", "none");
  
  infoGroup.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", 3).attr("height", 150)
    .attr("fill", "#5A5A5A");
  
  infoGroup.append("text")
    .attr("x", 16).attr("y", 22)
    .style("font-size", "10px")
    .style("font-weight", "700")
    .style("fill", "#7A7A7A")
    .style("letter-spacing", "1px")
    .text("SELECTION DETAILS");
  
  infoGroup.append("line")
    .attr("x1", 16).attr("y1", 30)
    .attr("x2", 264).attr("y2", 30)
    .attr("stroke", "#D8D6CB")
    .attr("stroke-width", 1);
  
  const scriptText = infoGroup.append("text")
    .attr("x", 16).attr("y", 50)
    .style("font-size", "11px")
    .style("fill", "#3A3A3A");
  
  scriptText.append("tspan").text("Script: ").style("font-weight", "400");
  const scriptValue = scriptText.append("tspan")
    .text("Hover any point")
    .style("font-weight", "700")
    .style("fill", "#666");
  
  const weightText = infoGroup.append("text")
    .attr("x", 16).attr("y", 70)
    .style("font-size", "11px")
    .style("fill", "#3A3A3A");
  
  weightText.append("tspan").text("Weight: ").style("font-weight", "400");
  const weightValue = weightText.append("tspan").text("—").style("font-weight", "700");
  
  const variantsText = infoGroup.append("text")
    .attr("x", 16).attr("y", 90)
    .style("font-size", "11px")
    .style("fill", "#3A3A3A");
  
  variantsText.append("tspan").text("Font Variants: ").style("font-weight", "400");
  const variantsValue = variantsText.append("tspan").text("—").style("font-weight", "700");
  
  infoGroup.append("line")
    .attr("x1", 16).attr("y1", 100)
    .attr("x2", 264).attr("y2", 100)
    .attr("stroke", "#D8D6CB")
    .attr("stroke-width", 1);
  
  const listTitle = infoGroup.append("text")
    .attr("x", 16).attr("y", 116)
    .style("font-size", "9px")
    .style("font-weight", "700")
    .style("fill", "#7A7A7A")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "0.5px")
    .style("opacity", 0)
    .text("Available Families:");
  
  const listContainer = infoGroup.append("g").attr("class", "font-list-container");
  
  // Tooltip
  const tooltip = container.append("div")
    .style("position", "absolute")
    .style("background", "rgba(42, 42, 42, 0.95)")
    .style("color", "#E8E5DA")
    .style("padding", "12px 16px")
    .style("border-radius", "4px")
    .style("font-size", "11px")
    .style("line-height", "1.6")
    .style("pointer-events", "none")
    .style("opacity", "0")
    .style("transition", "opacity 0.2s ease")
    .style("z-index", "1000")
    .style("white-space", "nowrap");
  
  const textLayer = svg.append("g");
  const zoomGroup = svg.append("g");
  const crosshairGroup = zoomGroup.append("g");
  const chartGroup = zoomGroup.append("g");
  
  const ANGLES = { x: -0.55, y: 0.38 };
  
  function project3D(x, y, z, scales) {
    const cosY = Math.cos(ANGLES.y);
    const sinY = Math.sin(ANGLES.y);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    const cosX = Math.cos(ANGLES.x);
    const sinX = Math.sin(ANGLES.x);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    return {
      x: x1 * scales.x,
      y: y1 * scales.y - z2 * scales.z
    };
  }
  
  function renderChart(minScriptRank, maxScriptRank, minWeight, maxWeight, percentBlend, spacing) {
    const selectedScripts = data.sortedScripts
      .slice(minScriptRank - 1, maxScriptRank)
      .reverse();
    
    const selectedWeights = allWeights.filter(w => {
      const weight = parseInt(w);
      return weight >= minWeight && weight <= maxWeight;
    });
    
    const numScripts = selectedScripts.length;
    const numWeights = selectedWeights.length;
    const maxCount = d3.max(data.dataArray, d => d.count);
    
    const grid = selectedScripts.map((scriptCode, scriptIdx) => {
      return selectedWeights.map((weight, weightIdx) => {
        const dataPoint = data.dataArray.find(
          d => d.script === scriptCode && d.weight === weight
        );
        const count = dataPoint ? dataPoint.count : 0;
        const fonts = dataPoint ? dataPoint.fonts : [];
        const percentage = (count / maxCount) * 100;
        const blendedValue = count * (1 - percentBlend) + percentage * percentBlend;
        
        const scriptName = data.scriptNameMap[scriptCode] || scriptCode;
        
        return {
          script: scriptName,
          scriptCode,
          scriptIdx,
          weight,
          weightIdx,
          variants: count,
          fonts,
          percentage,
          value: blendedValue
        };
      });
    });
    
    const densityFactor = Math.sqrt((8 * 7) / (numScripts * numWeights));
    const zoomScale = Math.max(0.15, Math.min(0.9, densityFactor));
    
    const baseScales = {
      x: 80 * spacing,
      y: 40 * spacing,
      z: 3.5
    };
    
    const labelSpace = numScripts <= 10 ? 40 : numScripts > 50 ? 80 : numScripts > 20 ? 100 : 60;
    const centerX = (CANVAS.width / 2) - labelSpace;
    const centerY = (CANVAS.height / 2) + 10;
    
    zoomGroup
      .transition()
      .duration(800)
      .attr("transform", `translate(${centerX}, ${centerY}) scale(${zoomScale})`);
    
    const colorScale = d3.scaleSequential()
      .domain([0, numScripts - 1])
      .interpolator(d3.interpolateRgbBasis([
        "#2A9D8F", "#41B3A3", "#659DBD", "#E8A87C", "#E27D60", "#C74848"
      ]));
    
    chartGroup.selectAll("*").remove();
    crosshairGroup.selectAll("*").remove();
    
    const animationDuration = 500;
    const staggerDelay = Math.min(10, 1000 / numScripts);
    
    const minReadableFont = 8;
    const calculatedFont = 350 / numScripts;
    const showLabels = numScripts <= 100 && calculatedFont >= minReadableFont;
    
    const weightLabelElements = [];
    const scriptLabelElements = [];
    
    const HIGHLIGHT_COLOR = "#2A9D8F";
    
    grid.slice().reverse().forEach((scriptData, idx) => {
      const reversedIdx = grid.length - 1 - idx;
      
      const points = scriptData.map(d => {
        const proj = project3D(
          d.weightIdx - ((numWeights - 1) / 2),
          d.scriptIdx - ((numScripts - 1) / 2),
          d.value,
          baseScales
        );
        return [proj.x, proj.y];
      });
      
      const baselinePoints = [...scriptData].reverse().map(d => {
        const proj = project3D(
          d.weightIdx - ((numWeights - 1) / 2),
          d.scriptIdx - ((numScripts - 1) / 2),
          0,
          baseScales
        );
        return [proj.x, proj.y];
      });
      
      const allPoints = [...points, ...baselinePoints];
      
      const ridge = chartGroup.append("path")
        .attr("d", d3.line()(allPoints) + "Z")
        .attr("fill", colorScale(reversedIdx))
        .attr("opacity", 0)
        .attr("stroke", "#5A5A5A")
        .attr("stroke-width", 1)
        .style("cursor", "pointer");
      
      ridge.transition()
        .duration(animationDuration)
        .delay(idx * staggerDelay)
        .attr("opacity", 0.85);
      
      chartGroup.append("path")
        .attr("d", d3.line()(points))
        .attr("fill", "none")
        .attr("stroke", "#2A2A2A")
        .attr("stroke-width", 1.8)
        .attr("opacity", 0)
        .style("pointer-events", "none")
        .transition()
        .duration(animationDuration)
        .delay(idx * staggerDelay)
        .attr("opacity", 1);
      
      scriptData.forEach((d, ptIdx) => {
        const proj = project3D(
          d.weightIdx - ((numWeights - 1) / 2),
          d.scriptIdx - ((numScripts - 1) / 2),
          d.value,
          baseScales
        );
        
        const baseProj = project3D(
          d.weightIdx - ((numWeights - 1) / 2),
          d.scriptIdx - ((numScripts - 1) / 2),
          0,
          baseScales
        );
        
        const hoverCircle = chartGroup.append("circle")
          .attr("cx", proj.x)
          .attr("cy", proj.y)
          .attr("r", 10)
          .attr("fill", "rgba(42, 42, 42, 0)")
          .attr("stroke", "none")
          .style("cursor", "pointer")
          .style("pointer-events", "all");
        
        hoverCircle
          .on("mouseenter", function(event) {
            d3.select(this)
              .transition().duration(150)
              .attr("fill", HIGHLIGHT_COLOR)
              .attr("r", 6)
              .attr("opacity", 1);
            
            ridge
              .transition().duration(150)
              .style("filter", "brightness(1.2)")
              .attr("opacity", 1)
              .attr("stroke", "#FFFFFF")
              .attr("stroke-width", 2);
            
            crosshairGroup.append("line")
              .attr("class", "crosshair-vertical")
              .attr("x1", proj.x).attr("y1", proj.y)
              .attr("x2", baseProj.x).attr("y2", baseProj.y)
              .attr("stroke", HIGHLIGHT_COLOR)
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5")
              .attr("opacity", 0)
              .transition().duration(150)
              .attr("opacity", 0.8);
            
            const labelProj = project3D(
              (numWeights / 2) + 1.8,
              d.scriptIdx - ((numScripts - 1) / 2),
              0,
              baseScales
            );
            
            crosshairGroup.append("line")
              .attr("class", "crosshair-horizontal")
              .attr("x1", baseProj.x).attr("y1", baseProj.y)
              .attr("x2", labelProj.x - 10).attr("y2", labelProj.y)
              .attr("stroke", HIGHLIGHT_COLOR)
              .attr("stroke-width", 2)
              .attr("stroke-dasharray", "5,5")
              .attr("opacity", 0)
              .transition().duration(150)
              .attr("opacity", 0.8);
            
            scriptValue.text(d.script).style("fill", HIGHLIGHT_COLOR);
            weightValue.text(d.weight).style("fill", HIGHLIGHT_COLOR);
            variantsValue.text(d.variants).style("fill", HIGHLIGHT_COLOR);
            
            // Update info panel with font list
            const newHeight = d.variants > 0 ? Math.min(380, 150 + d.fonts.length * 14) : 150;
            infoBg.transition().duration(200).attr("height", newHeight);
            infoGroup.select("rect:nth-child(2)").transition().duration(200).attr("height", newHeight);
            
            listTitle.transition().duration(200).style("opacity", d.variants > 0 ? 1 : 0);
            
            listContainer.selectAll("*").remove();
            
            if (d.variants > 0) {
              const displayFonts = d.fonts.slice(0, 15);
              const remaining = d.fonts.length - displayFonts.length;
              
              displayFonts.forEach((fontName, i) => {
                listContainer.append("text")
                  .attr("x", 16)
                  .attr("y", 130 + (i * 14))
                  .style("font-size", "9px")
                  .style("fill", "#3A3A3A")
                  .style("opacity", 0)
                  .text(`• ${fontName}`)
                  .transition().duration(150)
                  .delay(i * 20)
                  .style("opacity", 1);
              });
              
              if (remaining > 0) {
                listContainer.append("text")
                  .attr("x", 16)
                  .attr("y", 130 + (displayFonts.length * 14))
                  .style("font-size", "9px")
                  .style("fill", "#999")
                  .style("font-style", "italic")
                  .style("opacity", 0)
                  .text(`... and ${remaining} more`)
                  .transition().duration(150)
                  .delay(displayFonts.length * 20)
                  .style("opacity", 1);
              }
            }
            
            const weightLabel = weightLabelElements[d.weightIdx];
            if (weightLabel) {
              weightLabel.transition().duration(150)
                .style("font-size", "14px")
                .style("font-weight", "700")
                .style("fill", HIGHLIGHT_COLOR);
            }
            
            if (showLabels) {
              const scriptLabel = scriptLabelElements[d.scriptIdx];
              if (scriptLabel) {
                scriptLabel.transition().duration(150)
                  .style("font-size", `${Math.min(15, calculatedFont + 3)}px`)
                  .style("fill", HIGHLIGHT_COLOR);
              }
            }
            
            tooltip
              .style("opacity", "1")
              .html(`
                <div style="font-weight: 700; margin-bottom: 6px; font-size: 12px;">${d.script} • Weight ${d.weight}</div>
                <div style="margin-bottom: 3px;"><strong>Font Families:</strong> ${d.variants}</div>
                ${percentBlend > 0 ? `<div><strong>Relative:</strong> ${d.percentage.toFixed(1)}% of max</div>` : ''}
                <div style="margin-top: 6px; font-size: 10px; font-style: italic; color: #BBB;">See list in top-right panel</div>
              `);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseleave", function() {
            d3.select(this).transition().duration(150)
              .attr("fill", "rgba(42, 42, 42, 0)")
              .attr("r", 10);
            
            ridge.transition().duration(150)
              .style("filter", "none")
              .attr("opacity", 0.85)
              .attr("stroke", "#5A5A5A")
              .attr("stroke-width", 1);
            
            crosshairGroup.selectAll(".crosshair-vertical, .crosshair-horizontal")
              .transition().duration(150)
              .attr("opacity", 0)
              .remove();
            
            scriptValue.text("Hover any point").style("fill", "#666");
            weightValue.text("—").style("fill", "#3A3A3A");
            variantsValue.text("—").style("fill", "#3A3A3A");
            
            infoBg.transition().duration(200).attr("height", 150);
            infoGroup.select("rect:nth-child(2)").transition().duration(200).attr("height", 150);
            
            listTitle.transition().duration(200).style("opacity", 0);
            listContainer.selectAll("*").transition().duration(150).style("opacity", 0).remove();
            
            const weightLabel = weightLabelElements[d.weightIdx];
            if (weightLabel) {
              weightLabel.transition().duration(150)
                .style("font-size", "11px")
                .style("font-weight", "600")
                .style("fill", "#2A2A2A");
            }
            
            if (showLabels) {
              const scriptLabel = scriptLabelElements[d.scriptIdx];
              if (scriptLabel) {
                const fontSize = Math.max(minReadableFont, Math.min(12, calculatedFont));
                scriptLabel.transition().duration(150)
                  .style("font-size", `${fontSize}px`)
                  .style("fill", "#2A2A2A");
              }
            }
            
            tooltip.style("opacity", "0");
          });
        
        hoverCircle.transition()
          .duration(animationDuration)
          .delay(idx * staggerDelay + ptIdx * 3);
      });
      
      if (showLabels) {
        const labelProj = project3D(
          (numWeights / 2) + 1.8,
          scriptData[0].scriptIdx - ((numScripts - 1) / 2),
          0,
          baseScales
        );
        
        const fontSize = Math.max(minReadableFont, Math.min(12, calculatedFont));
        
        const scriptLabel = chartGroup.append("text")
          .attr("x", labelProj.x)
          .attr("y", labelProj.y)
          .attr("text-anchor", "start")
          .attr("dominant-baseline", "middle")
          .style("font-size", `${fontSize}px`)
          .style("font-weight", "700")
          .style("fill", "#2A2A2A")
          .style("opacity", 0)
          .style("pointer-events", "none")
          .style("transition", "all 0.15s ease")
          .text(scriptData[0].script);
        
        scriptLabelElements[scriptData[0].scriptIdx] = scriptLabel;
        
        scriptLabel.transition()
          .duration(animationDuration)
          .delay(idx * staggerDelay + 100)
          .style("opacity", 0.9);
      }
    });
    
    const weightSpacing = numWeights <= 5 ? 1 : 2;
    selectedWeights.forEach((weight, i) => {
      if (i % weightSpacing === 0 || i === selectedWeights.length - 1) {
        const proj = project3D(
          i - ((numWeights - 1) / 2),
          -(numScripts / 2) - 1.6,
          0,
          baseScales
        );
        
        const weightLabel = chartGroup.append("text")
          .attr("x", proj.x)
          .attr("y", proj.y - 8)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("font-weight", "600")
          .style("fill", "#2A2A2A")
          .style("opacity", 0)
          .style("transition", "all 0.15s ease")
          .text(weight);
        
        weightLabelElements[i] = weightLabel;
        
        weightLabel.transition()
          .duration(400)
          .delay(i * 15)
          .style("opacity", 1);
      }
    });
    
    // Text layer
    textLayer.selectAll("*").remove();
    
    textLayer.append("text")
      .attr("x", 50).attr("y", 35)
      .attr("text-anchor", "start")
      .style("font-size", "18px")
      .style("font-weight", "700")
      .style("fill", "#3A3A3A")
      .style("letter-spacing", "3px")
      .text("NOTO'S STYLE LANDSCAPE");
    
    textLayer.append("line")
      .attr("x1", 50).attr("y1", 48)
      .attr("x2", 420).attr("y2", 48)
      .attr("stroke", "#5A5A5A")
      .attr("stroke-width", 2);
    
    textLayer.append("text")
      .attr("x", 50).attr("y", 66)
      .attr("text-anchor", "start")
      .style("font-size", "11px")
      .style("fill", "#666")
      .text("Distribution of font family variants across writing scripts and weights");
    
    textLayer.append("text")
      .attr("x", 50).attr("y", 82)
      .attr("text-anchor", "start")
      .style("font-size", "11px")
      .style("fill", "#666")
      .text(`${numScripts} script${numScripts !== 1 ? 's' : ''} × ${numWeights} weight${numWeights !== 1 ? 's' : ''} • ${data.totalNotoFonts} Noto fonts total`);
    
    // Find max for caption
    const latinRegular = data.dataArray.find(d => d.script === "Latn" && d.weight === "400");
    const maxNote = latinRegular ? `Latin dominates with ${latinRegular.count} Regular weight families` : "";
    
    textLayer.append("text")
      .attr("x", CANVAS.width / 2).attr("y", CANVAS.height - 35)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "700")
      .style("fill", "#3A3A3A")
      .text("Fig 4. 3D Ridge Chart: Noto Font Family Availability");
    
    textLayer.append("text")
      .attr("x", CANVAS.width / 2).attr("y", CANVAS.height - 18)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#666")
      .style("font-style", "italic")
      .text(`Height represents number of font family variants • ${maxNote}`);
  }
  
  renderChart(
    controls.minScript,
    controls.maxScript,
    controls.minWeight,
    controls.maxWeight,
    controls.percentBlend,
    controls.spacing
  );
  
  return container.node();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 4: Combined Display
// ═══════════════════════════════════════════════════════════════════════════════
html`<div style="max-width: 1200px; margin: 0 auto;">
  ${viewof chartControls}
  ${noto3DVisualization}
</div>`
