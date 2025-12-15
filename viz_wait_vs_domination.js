// ═══════════════════════════════════════════════════════════════════════════════
// THE WAIT VS WEB DOMINATION - Typographic Colonialism Visualization
// A Three.js + D3 visualization showing script inequality in 3D space
// ═══════════════════════════════════════════════════════════════════════════════
// 
// CONCEPT: Scripts plotted in 3D space showing:
//   X-axis: Year entered digital age (1984 → 2016) - THE WAIT
//   Y-axis: Inequality ratio vs Latin (log scale) - THE GAP  
//   Z-axis: Speaker population (log scale) - THE WEIGHT
//   Bubble size: Font count available
//   Connections: Scripts that share fonts (from graph data)
//   Color: Noto dependency (red = Noto-only, green = diverse)
//
// For Observable Notebooks - paste cells in order
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// CELL 1: Load Three.js and dependencies
// ─────────────────────────────────────────────────────────────────────────────
/*
THREE = require("three@0.150.0")
*/
THREE = {
  const THREE = await require("three@0.150.0");
  // We'll add OrbitControls separately
  return THREE;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 2: Load the master dataset
// ─────────────────────────────────────────────────────────────────────────────
masterData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/master_dataset.json")
  .then(r => r.json())

// ─────────────────────────────────────────────────────────────────────────────
// CELL 3: Load the graph structure
// ─────────────────────────────────────────────────────────────────────────────  
graphData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/graph_structure.json")
  .then(r => r.json())

// ─────────────────────────────────────────────────────────────────────────────
// CELL 4: Process data for 3D visualization
// ─────────────────────────────────────────────────────────────────────────────
vizData = {
  // Get digital timeline data
  const timeline = masterData.digital_timeline?.scripts || {};
  const inequality = masterData.inequality_metrics || [];
  const scripts = masterData.scripts || {};
  const deepMetrics = masterData.deep_metrics || {};
  
  // Create a map for quick lookup
  const inequalityMap = new Map(inequality.map(d => [d.code, d]));
  
  // Combine data for visualization
  const processedScripts = [];
  
  for (const [code, scriptData] of Object.entries(scripts)) {
    const timelineData = timeline[code] || {};
    const ineqData = inequalityMap.get(code) || {};
    
    // Only include scripts with meaningful data
    if (scriptData.font_count > 0) {
      const digitalStart = timelineData.digital_age_start || 
                          (timelineData.first_google_fonts?.year) ||
                          2010; // default to Google Fonts era
      
      const yearsWaited = 1984 - digitalStart; // negative = after Latin
      
      processedScripts.push({
        code,
        name: scriptData.name || code,
        // Position data
        digitalAgeStart: digitalStart,
        yearsWaited: Math.abs(yearsWaited),
        waitedAfterLatin: yearsWaited < 0,
        // Size and importance
        speakers: scriptData.speakers || 0,
        fontCount: scriptData.font_count || 0,
        // Inequality metrics
        fontsPerM: ineqData.fonts_per_100m || 0,
        inequalityRatio: ineqData.inequality_ratio || 999,
        // Diversity/dependency
        notoFamilies: scriptData.noto_families?.length || 0,
        notoCoverage: scriptData.noto_weight_coverage || 0,
        isNotoOnly: scriptData.font_count <= (scriptData.noto_families?.length || 0) + 1,
        // Categories
        rtl: scriptData.rtl || false,
        unicodeVersion: scriptData.unicode_version || "1.0",
        // Timeline data
        firstScalable: timelineData.first_scalable?.year,
        firstFree: timelineData.first_free?.year,
        firstGoogleFonts: timelineData.first_google_fonts?.year,
        notes: timelineData.notes || ""
      });
    }
  }
  
  // Get the script network links
  const scriptNetwork = graphData.d3_ready?.script_network || { nodes: [], links: [] };
  const links = scriptNetwork.links.filter(l => 
    processedScripts.some(s => s.code === l.source) &&
    processedScripts.some(s => s.code === l.target)
  );
  
  return {
    scripts: processedScripts,
    links: links,
    stats: {
      totalScripts: processedScripts.length,
      earliestDigital: Math.min(...processedScripts.map(s => s.digitalAgeStart)),
      latestDigital: Math.max(...processedScripts.map(s => s.digitalAgeStart)),
      maxSpeakers: Math.max(...processedScripts.map(s => s.speakers)),
      maxFontCount: Math.max(...processedScripts.map(s => s.fontCount)),
      notoOnlyCount: processedScripts.filter(s => s.isNotoOnly).length
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 5: WSJ Color Palette
// ─────────────────────────────────────────────────────────────────────────────
wsjColors = ({
  background: "#E8E5DA",     // WSJ paper
  backgroundDark: "#1a1a2e", // Dark mode
  
  // Script status colors
  dominant: "#1e88e5",       // Blue - Latin/privileged
  privileged: "#43a047",     // Green - good coverage
  struggling: "#fb8c00",     // Orange - moderate inequality
  neglected: "#e53935",      // Red - severe inequality
  notoOnly: "#9c27b0",       // Purple - Noto dependency
  
  // Connection colors
  strongLink: "rgba(30, 136, 229, 0.6)",
  weakLink: "rgba(100, 100, 100, 0.2)",
  
  // Text
  label: "#2c2c2c",
  labelDark: "#ffffff",
  
  // Grid
  grid: "rgba(100, 100, 100, 0.3)",
  axis: "#666666"
})

// ─────────────────────────────────────────────────────────────────────────────
// CELL 6: Scale functions for 3D positioning
// ─────────────────────────────────────────────────────────────────────────────
scales = {
  const stats = vizData.stats;
  
  // X: Year (1980-2020) → -50 to 50
  const xScale = d3.scaleLinear()
    .domain([1980, 2020])
    .range([-50, 50]);
  
  // Y: Inequality ratio (log scale) → 0 to 40
  const yScale = d3.scaleLog()
    .domain([0.3, 100])
    .range([0, 40])
    .clamp(true);
  
  // Z: Speakers (log scale) → -30 to 30
  const zScale = d3.scaleLog()
    .domain([1000, 6e9])
    .range([-30, 30])
    .clamp(true);
  
  // Size: Font count → 0.5 to 8
  const sizeScale = d3.scaleSqrt()
    .domain([0, stats.maxFontCount])
    .range([0.5, 8]);
  
  // Color: Based on inequality and Noto dependency
  const colorScale = (script) => {
    if (script.code === "Latn") return wsjColors.dominant;
    if (script.isNotoOnly) return wsjColors.notoOnly;
    if (script.inequalityRatio < 2) return wsjColors.privileged;
    if (script.inequalityRatio < 10) return wsjColors.struggling;
    return wsjColors.neglected;
  };
  
  return { xScale, yScale, zScale, sizeScale, colorScale };
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 7: Create the 3D visualization container
// ─────────────────────────────────────────────────────────────────────────────
container = {
  const div = document.createElement("div");
  div.style.width = "100%";
  div.style.height = "700px";
  div.style.position = "relative";
  div.style.borderRadius = "8px";
  div.style.overflow = "hidden";
  div.style.background = wsjColors.backgroundDark;
  return div;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 8: Main Three.js Scene Setup
// ─────────────────────────────────────────────────────────────────────────────
scene = {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(wsjColors.backgroundDark);
  scene.fog = new THREE.FogExp2(0x1a1a2e, 0.008);
  return scene;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 9: Camera Setup
// ─────────────────────────────────────────────────────────────────────────────
camera = {
  const width = 1200;
  const height = 700;
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(80, 40, 80);
  camera.lookAt(0, 15, 0);
  return camera;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 10: WebGL Renderer
// ─────────────────────────────────────────────────────────────────────────────
renderer = {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(1200, 700);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 11: Lighting Setup
// ─────────────────────────────────────────────────────────────────────────────
lights = {
  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  
  // Main directional light (sun)
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(50, 100, 50);
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;
  scene.add(sun);
  
  // Fill light from opposite side
  const fill = new THREE.DirectionalLight(0x8888ff, 0.3);
  fill.position.set(-50, 20, -50);
  scene.add(fill);
  
  // Point light to highlight center
  const point = new THREE.PointLight(0xffffcc, 0.5, 100);
  point.position.set(0, 30, 0);
  scene.add(point);
  
  return { ambient, sun, fill, point };
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 12: Create 3D Grid / Axes
// ─────────────────────────────────────────────────────────────────────────────
axes = {
  const axisGroup = new THREE.Group();
  
  // Ground plane (XZ) - represents the base year plane
  const groundGeom = new THREE.PlaneGeometry(120, 80);
  const groundMat = new THREE.MeshPhongMaterial({
    color: 0x1a1a2e,
    opacity: 0.8,
    transparent: true,
    side: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  axisGroup.add(ground);
  
  // Grid helper
  const gridHelper = new THREE.GridHelper(100, 20, 0x444466, 0x333344);
  gridHelper.position.y = -0.5;
  axisGroup.add(gridHelper);
  
  // X-axis line (Year)
  const xAxisMat = new THREE.LineBasicMaterial({ color: 0x1e88e5 });
  const xAxisGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-55, 0, 0),
    new THREE.Vector3(55, 0, 0)
  ]);
  const xAxis = new THREE.Line(xAxisGeom, xAxisMat);
  axisGroup.add(xAxis);
  
  // Y-axis line (Inequality)
  const yAxisMat = new THREE.LineBasicMaterial({ color: 0xe53935 });
  const yAxisGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-55, 0, 0),
    new THREE.Vector3(-55, 45, 0)
  ]);
  const yAxis = new THREE.Line(yAxisGeom, yAxisMat);
  axisGroup.add(yAxis);
  
  // Z-axis line (Speakers)
  const zAxisMat = new THREE.LineBasicMaterial({ color: 0x43a047 });
  const zAxisGeom = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-55, 0, -35),
    new THREE.Vector3(-55, 0, 35)
  ]);
  const zAxis = new THREE.Line(zAxisGeom, zAxisMat);
  axisGroup.add(zAxis);
  
  scene.add(axisGroup);
  return axisGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 13: Create Script Spheres (The Data Points)
// ─────────────────────────────────────────────────────────────────────────────
scriptSpheres = {
  const sphereGroup = new THREE.Group();
  const scriptMeshMap = new Map(); // For linking later
  
  vizData.scripts.forEach(script => {
    // Calculate 3D position
    const x = scales.xScale(script.digitalAgeStart);
    const y = scales.yScale(script.inequalityRatio || 1);
    const z = scales.zScale(Math.max(script.speakers, 1000));
    const size = scales.sizeScale(script.fontCount);
    const color = scales.colorScale(script);
    
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    
    // Material with glow effect for emphasis
    const material = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.3,
      shininess: 100,
      transparent: true,
      opacity: script.code === "Latn" ? 1.0 : 0.85
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    
    // Store script data for interaction
    sphere.userData = {
      script: script,
      originalColor: color,
      originalSize: size
    };
    
    sphereGroup.add(sphere);
    scriptMeshMap.set(script.code, sphere);
  });
  
  scene.add(sphereGroup);
  return { group: sphereGroup, map: scriptMeshMap };
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 14: Create Connection Lines Between Scripts
// ─────────────────────────────────────────────────────────────────────────────
connections = {
  const lineGroup = new THREE.Group();
  const { map: scriptMeshMap } = scriptSpheres;
  
  // Create lines for scripts that share fonts
  vizData.links.forEach(link => {
    const sourceMesh = scriptMeshMap.get(link.source);
    const targetMesh = scriptMeshMap.get(link.target);
    
    if (sourceMesh && targetMesh) {
      // Line opacity based on connection strength
      const strength = Math.min(link.value / 50, 1);
      const isLatinConnection = link.source === "Latn" || link.target === "Latn";
      
      // Create curved line using QuadraticBezier
      const start = sourceMesh.position.clone();
      const end = targetMesh.position.clone();
      const mid = start.clone().add(end).multiplyScalar(0.5);
      mid.y += 5 + Math.random() * 5; // Arc upward
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(20);
      
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: isLatinConnection ? 0x1e88e5 : 0x666688,
        opacity: isLatinConnection ? 0.4 : 0.15,
        transparent: true,
        linewidth: 1
      });
      
      const line = new THREE.Line(lineGeom, lineMat);
      line.userData = { source: link.source, target: link.target, value: link.value };
      lineGroup.add(line);
    }
  });
  
  scene.add(lineGroup);
  return lineGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 15: Create Latin "Sun" Effect - The Dominator
// ─────────────────────────────────────────────────────────────────────────────
latinSun = {
  const latinMesh = scriptSpheres.map.get("Latn");
  if (!latinMesh) return null;
  
  // Create glowing ring around Latin
  const ringGeom = new THREE.TorusGeometry(12, 0.3, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x1e88e5,
    transparent: true,
    opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  ring.position.copy(latinMesh.position);
  ring.rotation.x = Math.PI / 2;
  
  // Create rays emanating from Latin
  const rayGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rayGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(Math.cos(angle) * 20, 0, Math.sin(angle) * 20)
    ]);
    const rayMat = new THREE.LineBasicMaterial({
      color: 0x1e88e5,
      transparent: true,
      opacity: 0.2
    });
    const ray = new THREE.Line(rayGeom, rayMat);
    rayGroup.add(ray);
  }
  rayGroup.position.copy(latinMesh.position);
  
  scene.add(ring);
  scene.add(rayGroup);
  
  return { ring, rays: rayGroup };
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 16: Create floating labels for key scripts
// ─────────────────────────────────────────────────────────────────────────────
labels = {
  // Important scripts to label
  const keyScripts = ["Latn", "Arab", "Hans", "Deva", "Beng", "Cyrl", "Jpan", "Kore", "Thai", "Grek"];
  const labelGroup = new THREE.Group();
  
  // We'll use CSS2DRenderer for labels - for now create sprite labels
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  
  keyScripts.forEach(code => {
    const mesh = scriptSpheres.map.get(code);
    if (!mesh) return;
    
    const script = mesh.userData.script;
    
    // Create canvas texture for label
    const labelCanvas = document.createElement('canvas');
    const ctx = labelCanvas.getContext('2d');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = 'bold 24px Helvetica Neue, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(script.name, 128, 30);
    ctx.font = '14px Helvetica Neue, sans-serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`${script.fontCount} fonts`, 128, 50);
    
    const texture = new THREE.CanvasTexture(labelCanvas);
    const spriteMat = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(mesh.position);
    sprite.position.y += mesh.userData.originalSize + 3;
    sprite.scale.set(15, 4, 1);
    
    labelGroup.add(sprite);
  });
  
  scene.add(labelGroup);
  return labelGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 17: Axis Labels (Year, Inequality, Speakers)
// ─────────────────────────────────────────────────────────────────────────────
axisLabels = {
  const createAxisLabel = (text, position, color) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 64;
    
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, 512, 64);
    ctx.font = 'bold 20px Helvetica Neue, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(...position);
    sprite.scale.set(30, 4, 1);
    return sprite;
  };
  
  const axisLabelGroup = new THREE.Group();
  
  // X-axis label (Year)
  const xLabel = createAxisLabel("YEAR ENTERED DIGITAL AGE →", [0, -3, 0], "#1e88e5");
  axisLabelGroup.add(xLabel);
  
  // Y-axis label (Inequality)
  const yLabel = createAxisLabel("↑ INEQUALITY (vs Latin)", [-55, 25, -10], "#e53935");
  yLabel.material.rotation = Math.PI / 2;
  axisLabelGroup.add(yLabel);
  
  // Z-axis label (Speakers)
  const zLabel = createAxisLabel("SPEAKERS →", [-55, -3, 0], "#43a047");
  axisLabelGroup.add(zLabel);
  
  // Year markers
  [1984, 1990, 2000, 2010, 2020].forEach(year => {
    const x = scales.xScale(year);
    const marker = createAxisLabel(year.toString(), [x, -3, 35], "#666666");
    marker.scale.set(10, 2, 1);
    axisLabelGroup.add(marker);
  });
  
  scene.add(axisLabelGroup);
  return axisLabelGroup;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 18: Animation Loop with Rotation
// ─────────────────────────────────────────────────────────────────────────────
animate = {
  // Append renderer to container
  container.appendChild(renderer.domElement);
  
  let angle = 0;
  const radius = 100;
  
  function animate() {
    requestAnimationFrame(animate);
    
    // Slow automatic rotation
    angle += 0.002;
    camera.position.x = Math.cos(angle) * radius;
    camera.position.z = Math.sin(angle) * radius;
    camera.lookAt(0, 15, 0);
    
    // Animate Latin's ring
    if (latinSun?.ring) {
      latinSun.ring.rotation.z += 0.01;
    }
    if (latinSun?.rays) {
      latinSun.rays.rotation.y += 0.005;
    }
    
    // Pulse effect for Noto-only scripts
    const time = Date.now() * 0.001;
    scriptSpheres.group.children.forEach(sphere => {
      if (sphere.userData.script?.isNotoOnly) {
        const pulse = 1 + Math.sin(time * 2) * 0.1;
        sphere.scale.setScalar(pulse);
      }
    });
    
    renderer.render(scene, camera);
  }
  
  animate();
  return container;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 19: Legend / Info Panel (HTML overlay)
// ─────────────────────────────────────────────────────────────────────────────
legend = {
  const legendDiv = document.createElement("div");
  legendDiv.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(26, 26, 46, 0.9);
    padding: 20px;
    border-radius: 8px;
    color: white;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 12px;
    max-width: 280px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
  `;
  
  const notoOnlyCount = vizData.stats.notoOnlyCount;
  const totalScripts = vizData.stats.totalScripts;
  
  legendDiv.innerHTML = `
    <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #E8E5DA;">
      THE WAIT vs WEB DOMINATION
    </h3>
    
    <div style="margin-bottom: 15px; font-size: 11px; color: #888; line-height: 1.5;">
      Scripts plotted by: when they entered digital age (X), 
      inequality vs Latin (Y), and speaker population (Z).
    </div>
    
    <div style="margin-bottom: 12px;">
      <div style="font-size: 10px; color: #666; margin-bottom: 5px;">SCRIPT STATUS</div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="width: 12px; height: 12px; background: ${wsjColors.dominant}; border-radius: 50%; margin-right: 8px;"></span>
        <span>Latin (the dominant)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="width: 12px; height: 12px; background: ${wsjColors.privileged}; border-radius: 50%; margin-right: 8px;"></span>
        <span>Well-supported (&lt;2× inequality)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="width: 12px; height: 12px; background: ${wsjColors.struggling}; border-radius: 50%; margin-right: 8px;"></span>
        <span>Struggling (2-10× inequality)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="width: 12px; height: 12px; background: ${wsjColors.neglected}; border-radius: 50%; margin-right: 8px;"></span>
        <span>Neglected (&gt;10× inequality)</span>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 4px;">
        <span style="width: 12px; height: 12px; background: ${wsjColors.notoOnly}; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite;"></span>
        <span>Noto-only (${notoOnlyCount} scripts)</span>
      </div>
    </div>
    
    <div style="margin-bottom: 12px;">
      <div style="font-size: 10px; color: #666; margin-bottom: 5px;">SPHERE SIZE = FONT COUNT</div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="width: 6px; height: 6px; background: #666; border-radius: 50%;"></span>
        <span style="font-size: 10px;">1</span>
        <span style="width: 16px; height: 16px; background: #666; border-radius: 50%;"></span>
        <span style="font-size: 10px;">100</span>
        <span style="width: 28px; height: 28px; background: #666; border-radius: 50%;"></span>
        <span style="font-size: 10px;">1900</span>
      </div>
    </div>
    
    <div style="margin-bottom: 12px;">
      <div style="font-size: 10px; color: #666; margin-bottom: 5px;">CONNECTIONS</div>
      <div style="color: #888; font-size: 11px; line-height: 1.4;">
        Lines connect scripts sharing fonts. 
        <span style="color: #1e88e5;">Blue lines</span> = Latin connections.
      </div>
    </div>
    
    <div style="
      background: rgba(229, 57, 53, 0.2);
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #e53935;
      font-size: 11px;
      line-height: 1.4;
    ">
      <strong>The Story:</strong> Latin entered digital in 1984 with 
      hundreds of fonts. ${notoOnlyCount} scripts (${Math.round(notoOnlyCount/totalScripts*100)}%) 
      still have no alternative to Noto.
    </div>
    
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.2); }
      }
    </style>
  `;
  
  container.style.position = "relative";
  container.appendChild(legendDiv);
  
  return legendDiv;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 20: Stats Panel (Bottom Right)
// ─────────────────────────────────────────────────────────────────────────────
statsPanel = {
  const stats = vizData.stats;
  const scripts = vizData.scripts;
  
  // Find key scripts for stats
  const latin = scripts.find(s => s.code === "Latn");
  const arabic = scripts.find(s => s.code === "Arab");
  const hans = scripts.find(s => s.code === "Hans");
  const adlam = scripts.find(s => s.code === "Adlm");
  
  const statsDiv = document.createElement("div");
  statsDiv.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    background: rgba(26, 26, 46, 0.9);
    padding: 20px;
    border-radius: 8px;
    color: white;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 12px;
    max-width: 280px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
  `;
  
  const yearsGap = adlam ? (adlam.digitalAgeStart - latin.digitalAgeStart) : 32;
  
  statsDiv.innerHTML = `
    <div style="font-size: 10px; color: #666; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
      KEY INSIGHTS
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div>
        <div style="font-size: 24px; font-weight: 700; color: #1e88e5;">
          ${latin?.fontCount.toLocaleString() || 1900}
        </div>
        <div style="font-size: 10px; color: #888;">Latin fonts</div>
      </div>
      <div>
        <div style="font-size: 24px; font-weight: 700; color: #e53935;">
          ${Math.round(hans?.inequalityRatio || 59)}×
        </div>
        <div style="font-size: 10px; color: #888;">Han inequality</div>
      </div>
      <div>
        <div style="font-size: 24px; font-weight: 700; color: #fb8c00;">
          ${yearsGap}
        </div>
        <div style="font-size: 10px; color: #888;">Years behind (Adlam)</div>
      </div>
      <div>
        <div style="font-size: 24px; font-weight: 700; color: #9c27b0;">
          ${stats.notoOnlyCount}
        </div>
        <div style="font-size: 10px; color: #888;">Noto-only scripts</div>
      </div>
    </div>
    
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
      <div style="font-size: 11px; color: #888; line-height: 1.4;">
        <strong style="color: #E8E5DA;">The Bandwidth Barrier:</strong>
        CJK fonts are 72× larger than Latin, creating a digital divide 
        even when fonts exist.
      </div>
    </div>
  `;
  
  container.appendChild(statsDiv);
  return statsDiv;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 21: Title / Header
// ─────────────────────────────────────────────────────────────────────────────
title = {
  const titleDiv = document.createElement("div");
  titleDiv.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    text-align: right;
    color: white;
    font-family: 'Helvetica Neue', sans-serif;
  `;
  
  titleDiv.innerHTML = `
    <div style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">
      TYPOGRAPHIC COLONIALISM
    </div>
    <div style="font-size: 28px; font-weight: 300; color: #E8E5DA; line-height: 1.2;">
      The Wait vs<br>Web Domination
    </div>
    <div style="font-size: 12px; color: #666; margin-top: 8px;">
      ${vizData.stats.totalScripts} writing systems • ${masterData.metadata?.counts?.total_fonts || 1916} fonts
    </div>
  `;
  
  container.appendChild(titleDiv);
  return titleDiv;
}

// ─────────────────────────────────────────────────────────────────────────────
// CELL 22: Export the final visualization
// ─────────────────────────────────────────────────────────────────────────────
/* 
  This is the final cell that displays the visualization.
  Just reference 'container' to render it, or call the animate function.
  
  For Observable:
  - Cells 1-3: Load dependencies and data
  - Cell 4: Process data
  - Cells 5-6: Color palette and scales
  - Cells 7-17: Build 3D scene
  - Cell 18: Animation loop
  - Cells 19-21: UI overlays
  - Cell 22 (this): Display
*/

// The container with the full visualization
container

// ═══════════════════════════════════════════════════════════════════════════════
// ALTERNATIVE: 2D FORCE-DIRECTED VERSION (Simpler, more compatible)
// ═══════════════════════════════════════════════════════════════════════════════
// If Three.js doesn't work well in Observable, here's a D3-only 2D version

// ─────────────────────────────────────────────────────────────────────────────
// CELL ALT-1: 2D Force Graph Version (D3 only)
// ─────────────────────────────────────────────────────────────────────────────
forceGraph2D = {
  const width = 1200;
  const height = 800;
  
  // Create SVG
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("style", `
      max-width: 100%;
      height: auto;
      background: #1a1a2e;
      border-radius: 8px;
    `);
  
  // Defs for gradients and filters
  const defs = svg.append("defs");
  
  // Glow filter
  const filter = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
  
  filter.append("feGaussianBlur")
    .attr("stdDeviation", "3")
    .attr("result", "coloredBlur");
  
  const feMerge = filter.append("feMerge");
  feMerge.append("feMergeNode").attr("in", "coloredBlur");
  feMerge.append("feMergeNode").attr("in", "SourceGraphic");
  
  // Prepare nodes and links
  const nodes = vizData.scripts.map(s => ({
    ...s,
    id: s.code,
    x: scales.xScale(s.digitalAgeStart) * 10 + width / 2,
    y: height - scales.yScale(s.inequalityRatio || 1) * 15 - 50
  }));
  
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  
  const links = vizData.links
    .filter(l => nodeMap.has(l.source) && nodeMap.has(l.target))
    .map(l => ({
      source: nodeMap.get(l.source),
      target: nodeMap.get(l.target),
      value: l.value
    }));
  
  // Create force simulation
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(50).strength(0.1))
    .force("charge", d3.forceManyBody().strength(d => d.code === "Latn" ? -200 : -30))
    .force("x", d3.forceX(d => scales.xScale(d.digitalAgeStart) * 8 + width / 2).strength(0.5))
    .force("y", d3.forceY(d => height - scales.yScale(d.inequalityRatio || 1) * 12 - 100).strength(0.3))
    .force("collision", d3.forceCollide(d => scales.sizeScale(d.fontCount) + 2));
  
  // Draw links
  const link = svg.append("g")
    .attr("stroke-opacity", 0.3)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke", d => 
      d.source.code === "Latn" || d.target.code === "Latn" 
        ? wsjColors.dominant 
        : "#444466"
    )
    .attr("stroke-width", d => Math.sqrt(d.value) * 0.5);
  
  // Draw nodes
  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", d => scales.sizeScale(d.fontCount))
    .attr("fill", d => scales.colorScale(d))
    .attr("stroke", "#fff")
    .attr("stroke-width", d => d.code === "Latn" ? 2 : 0.5)
    .attr("filter", d => d.code === "Latn" ? "url(#glow)" : null)
    .style("cursor", "pointer");
  
  // Add labels for major scripts
  const keyScripts = ["Latn", "Arab", "Hans", "Deva", "Beng", "Cyrl", "Jpan", "Grek"];
  
  const label = svg.append("g")
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("font-size", 10)
    .attr("fill", "#fff")
    .selectAll("text")
    .data(nodes.filter(n => keyScripts.includes(n.code)))
    .join("text")
    .attr("dy", d => -scales.sizeScale(d.fontCount) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.name);
  
  // Tooltip
  const tooltip = svg.append("g")
    .attr("display", "none");
  
  tooltip.append("rect")
    .attr("fill", "rgba(0,0,0,0.8)")
    .attr("rx", 4)
    .attr("width", 180)
    .attr("height", 80);
  
  const tooltipText = tooltip.append("text")
    .attr("fill", "#fff")
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("font-size", 11);
  
  node.on("mouseover", function(event, d) {
    tooltip.attr("display", null)
      .attr("transform", `translate(${d.x + 10}, ${d.y - 40})`);
    
    tooltipText.selectAll("*").remove();
    tooltipText.append("tspan").attr("x", 10).attr("y", 20).attr("font-weight", "bold").text(d.name);
    tooltipText.append("tspan").attr("x", 10).attr("y", 35).text(`${d.fontCount} fonts`);
    tooltipText.append("tspan").attr("x", 10).attr("y", 50).text(`${d.inequalityRatio?.toFixed(1) || '?'}× inequality`);
    tooltipText.append("tspan").attr("x", 10).attr("y", 65).text(`Digital: ${d.digitalAgeStart}`);
  })
  .on("mouseout", () => tooltip.attr("display", "none"));
  
  // Animation
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
  
  // Axis labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 20)
    .attr("text-anchor", "middle")
    .attr("fill", "#1e88e5")
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("font-size", 12)
    .text("← 1984 (Latin PostScript) ————— YEAR ENTERED DIGITAL AGE ————— 2016+ (Recent scripts) →");
  
  svg.append("text")
    .attr("transform", `translate(30, ${height/2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .attr("fill", "#e53935")
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("font-size", 12)
    .text("↑ HIGHER INEQUALITY (fewer fonts per speaker)");
  
  // Title
  svg.append("text")
    .attr("x", 40)
    .attr("y", 40)
    .attr("fill", "#E8E5DA")
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("font-size", 24)
    .attr("font-weight", "300")
    .text("The Wait vs Web Domination");
  
  svg.append("text")
    .attr("x", 40)
    .attr("y", 60)
    .attr("fill", "#888")
    .attr("font-family", "Helvetica Neue, sans-serif")
    .attr("font-size", 11)
    .text("Script inequality in the digital age");
  
  // Legend
  const legendY = 90;
  const legendItems = [
    { label: "Latin (dominant)", color: wsjColors.dominant },
    { label: "Well-supported", color: wsjColors.privileged },
    { label: "Struggling", color: wsjColors.struggling },
    { label: "Neglected", color: wsjColors.neglected },
    { label: "Noto-only", color: wsjColors.notoOnly }
  ];
  
  legendItems.forEach((item, i) => {
    svg.append("circle")
      .attr("cx", 50)
      .attr("cy", legendY + i * 18)
      .attr("r", 5)
      .attr("fill", item.color);
    
    svg.append("text")
      .attr("x", 62)
      .attr("y", legendY + i * 18 + 4)
      .attr("fill", "#888")
      .attr("font-family", "Helvetica Neue, sans-serif")
      .attr("font-size", 10)
      .text(item.label);
  });
  
  return svg.node();
}
