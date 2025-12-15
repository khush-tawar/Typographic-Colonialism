// ═══════════════════════════════════════════════════════════════════════════════
// THE VARIABLE FONT DIVIDE - Participatory Design
// ═══════════════════════════════════════════════════════════════════════════════
// Simple, visceral comparison: Latin flows, others snap
// Users FEEL the inequality through direct interaction

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: The Visualization
// ═══════════════════════════════════════════════════════════════════════════════
variableFontDivide = {
  const width = 1100;
  const height = 1200;
  
  // State
  let currentWeight = 400;
  
  const container = d3.create("div")
    .style("width", `${width}px`)
    .style("margin", "0 auto")
    .style("font-family", "'Helvetica Neue', Arial, sans-serif")
    .style("background", "#FAFAF8")
    .style("position", "relative");
  
  // Header
  const header = container.append("div")
    .style("text-align", "center")
    .style("padding", "50px 40px 30px");
  
  header.append("div")
    .style("font-size", "28px")
    .style("font-weight", "700")
    .style("color", "#1a1a1a")
    .style("letter-spacing", "3px")
    .style("margin-bottom", "12px")
    .text("THE VARIABLE FONT DIVIDE");
  
  header.append("div")
    .style("width", "120px")
    .style("height", "3px")
    .style("background", "#1a1a1a")
    .style("margin", "0 auto 20px");
  
  header.append("div")
    .style("font-size", "15px")
    .style("color", "#666")
    .style("max-width", "600px")
    .style("margin", "0 auto")
    .style("line-height", "1.6")
    .html("Drag the weight slider. Watch Latin text <strong>flow</strong>. Watch everything else <strong>snap</strong>.");
  
  // Weight Slider - Prominent and Styled
  const sliderSection = container.append("div")
    .style("background", "#1a1a1a")
    .style("padding", "35px 60px")
    .style("margin", "20px 0");
  
  const sliderRow = sliderSection.append("div")
    .style("display", "flex")
    .style("align-items", "center")
    .style("gap", "30px")
    .style("max-width", "800px")
    .style("margin", "0 auto");
  
  sliderRow.append("div")
    .style("font-size", "11px")
    .style("color", "#888")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "2px")
    .style("white-space", "nowrap")
    .text("Font Weight");
  
  const sliderContainer = sliderRow.append("div")
    .style("flex", "1")
    .style("position", "relative");
  
  const slider = sliderContainer.append("input")
    .attr("type", "range")
    .attr("min", "100")
    .attr("max", "900")
    .attr("value", "400")
    .attr("step", "1")
    .style("width", "100%")
    .style("height", "8px")
    .style("-webkit-appearance", "none")
    .style("background", "linear-gradient(to right, #333 0%, #666 50%, #333 100%)")
    .style("border-radius", "4px")
    .style("cursor", "pointer");
  
  const weightDisplay = sliderRow.append("div")
    .style("font-size", "36px")
    .style("font-weight", "700")
    .style("color", "#fff")
    .style("font-family", "monospace")
    .style("min-width", "80px")
    .style("text-align", "right")
    .text("400");
  
  // Add slider thumb styles
  const style = container.append("style").text(`
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.1s;
    }
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }
    input[type="range"]::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
  `);
  
  // Comparison Grid
  const comparisons = [
    {
      script: "Latin",
      isVariable: true,
      font: "Inter",
      family: "'Inter', sans-serif",
      text: "Typography shapes how we read the world",
      note: "smooth transition"
    },
    {
      script: "Thai",
      isVariable: false,
      font: "Noto Sans Thai",
      family: "'Noto Sans Thai', sans-serif",
      text: "การออกแบบตัวอักษรกำหนดวิธีที่เราอ่านโลก",
      note: "snaps at 400, 700"
    },
    {
      script: "Hindi",
      isVariable: false,
      font: "Noto Sans Devanagari",
      family: "'Noto Sans Devanagari', sans-serif",
      text: "टाइपोग्राफी हमारे पढ़ने के तरीके को आकार देती है",
      note: "snaps between weights"
    },
    {
      script: "Bengali",
      isVariable: false,
      font: "Noto Sans Bengali",
      family: "'Noto Sans Bengali', sans-serif",
      text: "টাইপোগ্রাফি আমাদের পড়ার ধরন নির্ধারণ করে",
      note: "only 400, 700"
    },
    {
      script: "Japanese",
      isVariable: false,
      font: "Noto Sans JP",
      family: "'Noto Sans JP', sans-serif",
      text: "タイポグラフィは私たちの読み方を形作る",
      note: "fixed weights only"
    },
    {
      script: "Arabic",
      isVariable: false,
      font: "Noto Sans Arabic",
      family: "'Noto Sans Arabic', sans-serif",
      text: "الطباعة تشكل طريقة قراءتنا للعالم",
      note: "limited range",
      rtl: true
    }
  ];
  
  const grid = container.append("div")
    .style("padding", "40px 60px");
  
  // Create comparison rows
  const rows = [];
  
  comparisons.forEach((comp, idx) => {
    const row = grid.append("div")
      .style("display", "grid")
      .style("grid-template-columns", "100px 1fr")
      .style("gap", "30px")
      .style("padding", "35px 0")
      .style("border-bottom", idx < comparisons.length - 1 ? "1px solid #e5e5e5" : "none")
      .style("align-items", "center");
    
    // Script label
    const labelCol = row.append("div");
    
    labelCol.append("div")
      .style("font-size", "13px")
      .style("font-weight", "700")
      .style("color", comp.isVariable ? "#16a34a" : "#1a1a1a")
      .style("margin-bottom", "4px")
      .text(comp.script);
    
    labelCol.append("div")
      .style("font-size", "10px")
      .style("color", comp.isVariable ? "#16a34a" : "#999")
      .style("font-style", "italic")
      .text(comp.note);
    
    // Text sample
    const textCol = row.append("div");
    
    const textSample = textCol.append("div")
      .attr("class", `sample-${idx}`)
      .style("font-family", comp.family)
      .style("font-size", "38px")
      .style("font-weight", "400")
      .style("color", "#1a1a1a")
      .style("line-height", "1.4")
      .style("transition", comp.isVariable ? "font-weight 0.05s ease" : "none")
      .style("direction", comp.rtl ? "rtl" : "ltr")
      .text(comp.text);
    
    textCol.append("div")
      .style("font-size", "10px")
      .style("color", "#bbb")
      .style("margin-top", "8px")
      .text(comp.font);
    
    rows.push({ element: textSample, isVariable: comp.isVariable, idx });
  });
  
  // Insight box
  const insight = container.append("div")
    .style("background", "#fff3cd")
    .style("border-left", "4px solid #ffc107")
    .style("margin", "20px 60px 40px")
    .style("padding", "25px 30px");
  
  insight.append("div")
    .style("font-size", "13px")
    .style("font-weight", "700")
    .style("color", "#856404")
    .style("margin-bottom", "10px")
    .style("text-transform", "uppercase")
    .style("letter-spacing", "1px")
    .text("What You're Seeing");
  
  insight.append("div")
    .style("font-size", "14px")
    .style("color", "#533f03")
    .style("line-height", "1.7")
    .html(`
      As you drag the slider, <strong>Latin (Inter)</strong> smoothly transitions through 
      every weight value — 100, 237, 489, 712 — each renders uniquely. 
      <strong>Every other script snaps</strong> between fixed points (usually 400 and 700), 
      ignoring everything in between. This isn't a technical limitation — 
      it's a choice about who gets precision typography.
    `);
  
  // Caption
  container.append("div")
    .style("text-align", "center")
    .style("padding", "20px 40px 50px")
    .style("border-top", "1px solid #e5e5e5")
    .html(`
      <div style="font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px;">
        Fig 5. The Variable Font Divide
      </div>
      <div style="font-size: 11px; color: #888; font-style: italic;">
        Participatory visualization — experience typographic inequality through interaction
      </div>
    `);
  
  // Update function
  function updateWeights(weight) {
    weightDisplay.text(weight);
    
    rows.forEach(row => {
      row.element.style("font-weight", weight);
    });
  }
  
  // Slider event
  slider.on("input", function() {
    const weight = +this.value;
    currentWeight = weight;
    updateWeights(weight);
  });
  
  return container.node();
}
