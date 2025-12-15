// ═══════════════════════════════════════════════════════════════════════════════
// VARIABLE FONT DISPARITY - Participatory Design Visualization
// ═══════════════════════════════════════════════════════════════════════════════
// Interactive slider reveals the gap: Latin fonts flow, others snap
// Users EXPERIENCE the inequality by dragging the weight control

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 1: Font Weight Slider
// ═══════════════════════════════════════════════════════════════════════════════
viewof weight = Inputs.range([100, 900], {
  value: 400,
  step: 1,
  label: "Font Weight"
})

// ═══════════════════════════════════════════════════════════════════════════════
// CELL 2: Main Participatory Visualization
// ═══════════════════════════════════════════════════════════════════════════════
variableFontDisparity = {
  const width = 1200;
  const height = 1500;
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("background", "#FAFAF8")
    .style("font-family", "'Helvetica Neue', Arial, sans-serif");
  
  // Title section
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("text-anchor", "middle")
    .style("font-size", "26px")
    .style("font-weight", "700")
    .style("fill", "#2A2A2A")
    .style("letter-spacing", "2px")
    .text("THE VARIABLE FONT DIVIDE");
  
  svg.append("line")
    .attr("x1", width / 2 - 200)
    .attr("y1", 55)
    .attr("x2", width / 2 + 200)
    .attr("y2", 55)
    .attr("stroke", "#5A5A5A")
    .attr("stroke-width", 2);
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 78)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "#666")
    .text("Drag the slider to expose font weight support gaps");
  
  // Current weight display
  const weightDisplay = svg.append("g")
    .attr("transform", `translate(${width / 2}, 115)`);
  
  weightDisplay.append("rect")
    .attr("x", -80)
    .attr("y", -25)
    .attr("width", 160)
    .attr("height", 50)
    .attr("fill", "#2A2A2A")
    .attr("rx", 4);
  
  weightDisplay.append("text")
    .attr("text-anchor", "middle")
    .attr("y", 8)
    .style("font-size", "28px")
    .style("font-weight", "700")
    .style("fill", "#FAFAF8")
    .style("font-family", "monospace")
    .text(weight);
  
  // Foreign object for HTML content
  const fo = svg.append("foreignObject")
    .attr("x", 50)
    .attr("y", 160)
    .attr("width", width - 100)
    .attr("height", height - 250);
  
  const container = fo.append("xhtml:div")
    .style("width", "100%")
    .style("padding", "20px 40px")
    .style("box-sizing", "border-box");
  
  // Script comparisons data
  const comparisons = [
    {
      script: "Latin",
      scriptCode: "Latn",
      samples: [
        {
          font: "Noto Sans",
          family: "'Noto Sans', sans-serif",
          text: "The quick brown fox jumps over the lazy dog",
          isVariable: true,
          range: "100–900",
          status: "variable"
        },
        {
          font: "Roboto Flex",
          family: "'Roboto Flex', sans-serif",
          text: "The quick brown fox jumps over the lazy dog",
          isVariable: true,
          range: "100–1000",
          status: "variable"
        }
      ]
    },
    {
      script: "Thai",
      scriptCode: "Thai",
      samples: [
        {
          font: "Noto Sans Thai",
          family: "'Noto Sans Thai', sans-serif",
          text: "สวัสดีชาวโลก ภาษาไทยสวยงาม",
          isVariable: false,
          range: "snaps to 400, 700",
          status: "static"
        },
        {
          font: "Sarabun",
          family: "'Sarabun', sans-serif",
          text: "สวัสดีชาวโลก ภาษาไทยสวยงาม",
          isVariable: false,
          range: "200–800 (static weights)",
          status: "better"
        }
      ]
    },
    {
      script: "Devanagari (Hindi)",
      scriptCode: "Deva",
      samples: [
        {
          font: "Noto Sans Devanagari",
          family: "'Noto Sans Devanagari', sans-serif",
          text: "नमस्ते दुनिया हिंदी में",
          isVariable: false,
          range: "jumps between values",
          status: "static"
        },
        {
          font: "Poppins",
          family: "'Poppins', sans-serif",
          text: "नमस्ते दुनिया हिंदी में",
          isVariable: false,
          range: "100–900 (static weights)",
          status: "better"
        }
      ]
    },
    {
      script: "Arabic",
      scriptCode: "Arab",
      samples: [
        {
          font: "Noto Sans Arabic",
          family: "'Noto Sans Arabic', sans-serif",
          text: "مرحبا بالعالم اللغة العربية",
          isVariable: true,
          range: "limited axis range",
          status: "limited",
          rtl: true
        },
        {
          font: "Cairo",
          family: "'Cairo', sans-serif",
          text: "مرحبا بالعالم اللغة العربية",
          isVariable: true,
          range: "200–1000 (better than Noto)",
          status: "variable",
          rtl: true
        }
      ]
    },
    {
      script: "Bengali",
      scriptCode: "Beng",
      samples: [
        {
          font: "Noto Sans Bengali",
          family: "'Noto Sans Bengali', sans-serif",
          text: "হ্যালো বিশ্ব বাংলা ভাষা",
          isVariable: false,
          range: "400, 700 only",
          status: "static"
        },
        {
          font: "Hind Siliguri",
          family: "'Hind Siliguri', sans-serif",
          text: "হ্যালো বিশ্ব বাংলা ভাষা",
          isVariable: false,
          range: "300–700 (more options)",
          status: "better"
        }
      ]
    },
    {
      script: "Japanese",
      scriptCode: "Jpan",
      samples: [
        {
          font: "Noto Sans JP",
          family: "'Noto Sans JP', sans-serif",
          text: "こんにちは世界 日本語",
          isVariable: false,
          range: "static weights only",
          status: "static"
        },
        {
          font: "M PLUS 1p",
          family: "'M PLUS 1p', sans-serif",
          text: "こんにちは世界 日本語",
          isVariable: false,
          range: "100–900 (9 weights)",
          status: "better"
        }
      ]
    },
    {
      script: "Korean",
      scriptCode: "Kore",
      samples: [
        {
          font: "Noto Sans KR",
          family: "'Noto Sans KR', sans-serif",
          text: "안녕하세요 세계 한국어",
          isVariable: false,
          range: "limited static weights",
          status: "static"
        },
        {
          font: "Nanum Gothic",
          family: "'Nanum Gothic', sans-serif",
          text: "안녕하세요 세계 한국어",
          isVariable: false,
          range: "400, 700, 800",
          status: "limited"
        }
      ]
    }
  ];
  
  // Build HTML
  let html = '';
  
  comparisons.forEach((comp, idx) => {
    const bgColor = idx % 2 === 0 ? '#FFFFFF' : '#F8F8F5';
    
    html += `
      <div style="background: ${bgColor}; padding: 30px; margin-bottom: 2px; border-left: 4px solid ${comp.scriptCode === 'Latn' ? '#2A9D8F' : '#E27D60'};">
        <div style="font-size: 12px; font-weight: 700; color: #7A7A7A; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1.5px;">
          ${comp.script} ${comp.scriptCode !== 'Latn' ? '<span style="color: #E27D60; font-size: 10px; margin-left: 8px;">NON-LATIN</span>' : '<span style="color: #2A9D8F; font-size: 10px; margin-left: 8px;">BENCHMARK</span>'}
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
    `;
    
    comp.samples.forEach((sample, sIdx) => {
      const statusColor = sample.status === 'variable' ? '#16a34a' : 
                          sample.status === 'better' ? '#2563eb' :
                          sample.status === 'limited' ? '#ea580c' : '#dc2626';
      
      const statusIcon = sample.status === 'variable' ? '✓' : 
                         sample.status === 'better' ? '◐' :
                         sample.status === 'limited' ? '⚠' : '✗';
      
      const statusLabel = sample.status === 'variable' ? 'Variable' : 
                          sample.status === 'better' ? 'Better Static Coverage' :
                          sample.status === 'limited' ? 'Limited Variable' : 'Static Only';
      
      // Calculate text opacity based on whether font supports the weight
      const textColor = sample.status === 'variable' ? '#1a1a1a' : 
                        sample.status === 'static' ? '#666' : '#333';
      
      html += `
        <div>
          <div style="font-size: 10px; color: #999; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span>${sample.font}</span>
            <span style="font-size: 9px; color: ${statusColor}; font-weight: 700;">${statusIcon} ${statusLabel}</span>
          </div>
          <div style="
            font-family: ${sample.family}; 
            font-size: 32px; 
            font-weight: ${weight}; 
            color: ${textColor};
            ${sample.rtl ? 'direction: rtl; text-align: right;' : ''}
            line-height: 1.4;
            min-height: 50px;
            transition: ${sample.status === 'variable' ? 'font-weight 0.1s ease' : 'none'};
          ">
            ${sample.text}
          </div>
          <div style="font-size: 10px; color: ${statusColor}; margin-top: 8px; font-weight: 600;">
            ${sample.range}
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  // Explanation box
  html += `
    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 6px; padding: 25px; margin-top: 30px;">
      <div style="font-size: 14px; font-weight: 700; color: #92400e; margin-bottom: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
        The Inequality Exposed
      </div>
      <div style="font-size: 13px; line-height: 1.8; color: #3a3a3a;">
        <strong>Drag the slider from 100 to 900.</strong> Watch Latin fonts (Noto Sans, Roboto Flex) 
        transition <em>smoothly</em> through every weight. Now observe Thai, Bengali, and Japanese — 
        they <strong>snap and jump</strong> between fixed values. This isn't a technical limitation; 
        fonts like <strong>Cairo (Arabic)</strong> and <strong>Poppins (Devanagari)</strong> prove 
        variable fonts for non-Latin scripts are possible. Google chose not to invest equally.
        <br><br>
        <strong style="color: #16a34a;">✓ Green = Smooth variable support</strong> &nbsp;|&nbsp;
        <strong style="color: #2563eb;">◐ Blue = Better alternative exists</strong> &nbsp;|&nbsp;
        <strong style="color: #ea580c;">⚠ Orange = Limited</strong> &nbsp;|&nbsp;
        <strong style="color: #dc2626;">✗ Red = Broken static weights</strong>
      </div>
    </div>
  `;
  
  // Weight behavior guide
  html += `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 25px;">
      <div style="background: #ecfdf5; border-left: 3px solid #16a34a; padding: 15px;">
        <div style="font-size: 11px; font-weight: 700; color: #16a34a; margin-bottom: 6px;">VARIABLE FONTS</div>
        <div style="font-size: 11px; color: #333; line-height: 1.5;">
          Slider moves: text weight changes smoothly, pixel by pixel. Every value from 100-900 renders uniquely.
        </div>
      </div>
      <div style="background: #fef2f2; border-left: 3px solid #dc2626; padding: 15px;">
        <div style="font-size: 11px; font-weight: 700; color: #dc2626; margin-bottom: 6px;">STATIC FONTS</div>
        <div style="font-size: 11px; color: #333; line-height: 1.5;">
          Slider moves: text snaps between fixed weights (usually 400→700). Most intermediate values look identical.
        </div>
      </div>
      <div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 15px;">
        <div style="font-size: 11px; font-weight: 700; color: #f59e0b; margin-bottom: 6px;">LIMITED VARIABLE</div>
        <div style="font-size: 11px; color: #333; line-height: 1.5;">
          Partial variable support, but restricted axis range or fewer design variations than Latin equivalents.
        </div>
      </div>
    </div>
  `;
  
  container.html(html);
  
  // Caption
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 45)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "700")
    .style("fill", "#3A3A3A")
    .text("Fig 5. Interactive Font Weight Comparison: Experience the Variable Font Gap");
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 25)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", "#666")
    .style("font-style", "italic")
    .text("Participatory visualization — drag the slider to feel the inequality");
  
  return svg.node();
}
