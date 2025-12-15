# Typographic Colonialism

### A Data Visualization Project Exposing Font Inequality Across the World's Writing Systems

---

<p align="center">
  <strong>1,900 fonts for Latin. 32 fonts for 1.6 billion Han speakers.</strong><br>
  <em>This isn't a technical limitation—it's a choice about who gets to participate in the typographic web.</em>
</p>

---

## The Thesis

Typography is not neutral. The availability of fonts across the world's writing systems reveals a stark colonial geography: **Western scripts dominate**, while scripts serving billions of people in Africa, South Asia, and Southeast Asia remain critically underserved.

This project uses data from Google Fonts, Unicode, and ISO 15924 to visualize this inequality through interactive, participatory designs that let viewers **experience** the disparity firsthand.

---

## Key Findings

| Metric | Value |
|--------|-------|
| **Latin fonts** | 1,900+ (99% of all fonts) |
| **Average non-Latin** | ~25 fonts |
| **Worst inequality** | Han script: **59×** fewer fonts per speaker than Latin |
| **Critical scripts** | 24 scripts with fewer than 10 fonts |
| **Noto-only scripts** | 47 scripts that would have **zero** fonts without Google |
| **Variable fonts** | 543 fonts... almost all for Latin |

---

## Visualizations

### 1. The Variable Font Divide
**Participatory design** — Drag a slider and watch Latin text smoothly transition through every weight (100→900) while other scripts snap between fixed points.

> *"This isn't a technical limitation—it's a choice about who gets precision typography."*

📁 `visualizations/variable_font_disparity_v2.js`

---

### 2. World Script Inequality Map
**Interactive choropleth** — Hover over countries to discover how many fonts their primary script has. Darker = more fonts. Red = critical.

Shows:
- Country-level font availability
- Critical scripts serving millions
- The Latin vs. World disparity (76× difference)

📁 `visualizations/world_script_inequality_v2.js`

---

### 3. The Wait vs Web Domination
**Bubble chart** — Each bubble represents a writing system, sized by speaker population, positioned by:
- **X-axis**: When the script entered the digital age
- **Y-axis**: Font inequality ratio vs Latin

Reveals the **32-year head start** Latin had in the digital typography era.

📁 `visualizations/wait_vs_domination_v4.js`

---

### 4. Noto 3D Ridge Chart
**3D ridge plot** — Visualizes the distribution of Noto fonts across scripts, showing which scripts have comprehensive coverage (multiple weights) and which are barely covered.

📁 `visualizations/noto_3d_ridge.js`

---

### 5. Font Distribution Wheel
**Radial visualization** — All 164 scripts arranged in a wheel, with arcs sized by font count. Makes the Latin dominance impossible to ignore.

📁 `visualizations/font_distribution_wheel.js`

---

### 6. Script Eye Test
**Typographic specimen** — Interactive comparison showing the same text rendered in fonts from different scripts at various weights.

📁 `visualizations/script_eye_test_v3.js`

---

## Design Philosophy

These visualizations follow a **participatory design** approach:

1. **Experience over explanation** — Users interact and discover inequality themselves
2. **Minimal palette** — Black, white, gold accents. Let the data speak.
3. **Editorial tone** — Clear headlines, provocative statistics, curated insights
4. **Self-contained** — Each visualization includes all needed data, styles, and interactions

---

## Quick Start

### View in Observable

```javascript
// Load the master dataset
masterData = FileAttachment("data/processed/master_dataset.json").json()

// Or fetch from GitHub
masterData = fetch("https://raw.githubusercontent.com/khush-tawar/Typographic-Colonialism/dataset/data/processed/master_dataset.json")
  .then(r => r.json())
```

Copy any visualization file into an Observable notebook and run.

### Run Locally

```bash
git clone https://github.com/khush-tawar/Typographic-Colonialism.git
cd Typographic-Colonialism

# The visualizations are Observable-compatible JavaScript
# Open them in Observable or a local D3 environment
```

---

## Repository Structure

```
├── README.md                     # This file
├── style_guide.json              # Design system
│
├── data/
│   ├── raw/                      # Source data (Google Fonts, Unicode, etc.)
│   └── processed/
│       └── master_dataset.json   # Combined dataset for visualizations
│
├── scripts/                      # Python data processing
│   ├── build_master_dataset.py
│   └── build_graph.py
│
└── visualizations/               # Observable-ready code
    ├── variable_font_disparity_v2.js    # ★ Variable Font Divide
    ├── world_script_inequality_v2.js    # ★ World Map
    ├── wait_vs_domination_v4.js         # ★ Bubble Chart
    ├── noto_3d_ridge.js                 # ★ Noto Ridge
    ├── font_distribution_wheel.js       # ★ Radial Wheel
    └── script_eye_test_v3.js            # ★ Eye Test
```

---

## Data Sources

| Source | Description |
|--------|-------------|
| **Google Fonts API** | 1,916 fonts with script/weight metadata |
| **ISO 15924** | 234 script codes and classifications |
| **Unicode CLDR** | Language-script-territory mappings |
| **Wikidata** | Speaker population estimates |
| **Unicode DerivedAge** | When each script entered Unicode |
| **Historical research** | 49 pre-digital typefaces (1455-2010) |

---

## The Numbers That Matter

```
Latin scripts:     1,900 fonts
Han Simplified:       32 fonts  (1.6B speakers)
Arabic:              129 fonts  (400M speakers)  
Devanagari:           75 fonts  (600M speakers)
Bengali:              30 fonts  (300M speakers)

47 scripts would have ZERO fonts without Google's Noto project.
```

---

## Why This Matters

> "When a script has no fonts, its speakers become invisible on the web. Their languages can't be rendered. Their stories can't be told. Their cultures exist in a typographic void."

Font inequality is not just a design problem—it's a **digital justice** issue affecting billions of people. This project makes that inequality visible, measurable, and undeniable.

---

## Credits

**Data Compilation & Visualizations**: Khush Tawar

**Sources**: Google Fonts, Unicode Consortium, ISO 15924, Wikidata, CLDR

**Inspired by**: The Noto project's mission to eliminate "tofu" (☐) from the web

---

## License

- **Visualizations**: MIT License
- **Dataset**: CC BY 4.0
- **Underlying data**: Respective source licenses (Google Fonts, Unicode, etc.)

---

## Citation

```bibtex
@project{typographic_colonialism_2024,
  title={Typographic Colonialism: Visualizing Font Inequality},
  author={Tawar, Khush},
  year={2024},
  url={https://github.com/khush-tawar/Typographic-Colonialism}
}
```

---

<p align="center">
  <strong>1,900 fonts for Latin. 3 fonts for Adlam.</strong><br>
  <em>The data is clear. The question is: what do we do about it?</em>
</p>

