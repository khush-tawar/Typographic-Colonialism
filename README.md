# Typography Colonialism Dataset

**A comprehensive dataset documenting the global inequality in digital font availability across writing systems.**

[![Data Source](https://img.shields.io/badge/Google%20Fonts-1916%20fonts-blue)](https://fonts.google.com/)
[![Scripts](https://img.shields.io/badge/Scripts%20Tracked-164-green)](https://www.unicode.org/iso15924/)
[![License](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/)

## Overview

This dataset powers data visualizations showing how Latin script dominates digital typography while billions of people using other writing systems face severe font poverty. The data reveals:

- **Latin script**: 37.5 fonts per 100 million speakers
- **Arabic script**: 3.4 fonts per 100 million speakers (11× worse)
- **Han Simplified**: 0.6 fonts per 100 million speakers (59× worse)

## Quick Start

### For Observable Notebooks

```javascript
// Load the complete dataset
masterData = fetch("https://raw.githubusercontent.com/khush-tawar/claude-use/dataset/master_dataset.json")
  .then(r => r.json())

// Access specific data
fonts = masterData.fonts
scripts = masterData.scripts
timeline = masterData.combined_timeline
inequality = masterData.inequality_metrics
```

### For Python

```python
import json
import urllib.request

url = "https://raw.githubusercontent.com/khush-tawar/claude-use/dataset/master_dataset.json"
data = json.loads(urllib.request.urlopen(url).read())
```

---

## Data Sources

### 1. Google Fonts API
**URL**: https://fonts.google.com/metadata/fonts  
**License**: Apache 2.0 / Open Font License  
**Updated**: Real-time  
**File**: `webfonts.json`

Contains metadata for all 1,916+ fonts in the Google Fonts library, including:
- Font family name, designer, category
- Available weights and styles
- Supported scripts/subsets
- Last modified date
- Version information

```javascript
// Example font entry
{
  "family": "Noto Sans Bengali",
  "subsets": ["bengali", "latin", "latin-ext"],
  "weights": [100, 200, 300, 400, 500, 600, 700, 800, 900],
  "category": "sans-serif",
  "lastModified": "2023-05-02"
}
```

---

### 2. ISO 15924 Script Codes
**URL**: https://www.unicode.org/iso15924/iso15924-codes.html  
**Standard**: ISO 15924:2004  
**File**: `iso15924.txt`

The authoritative registry of 234 script codes used in Unicode. Each entry includes:
- 4-letter script code (e.g., `Latn`, `Arab`, `Deva`)
- Numeric code
- English name
- French name
- Unicode version when script was added

```
Adlm;166;Adlam;adlam;2016
Arab;160;Arabic;arabe;1.0
Armn;230;Armenian;arménien;1.0
Beng;325;Bengali (Bangla);bengali (bangla);1.0
```

---

### 3. Unicode CLDR (Common Locale Data Repository)
**URL**: https://github.com/unicode-org/cldr-json  
**Version**: 45  
**License**: Unicode License  
**Files**: `cldr_extracted/` directory

#### languageData.json
Maps languages to their writing scripts and territories:
```json
{
  "en": {"_scripts": "Latn", "_territories": "US GB AU CA"},
  "hi": {"_scripts": "Deva", "_territories": "IN"},
  "zh": {"_scripts": "Hans Hant", "_territories": "CN TW HK MO SG"}
}
```

#### territoryInfo.json
Population data per country:
```json
{
  "US": {"_population": "334914895"},
  "IN": {"_population": "1428627663"},
  "CN": {"_population": "1425893465"}
}
```

#### likelySubtags.json
Default script/territory for languages:
```json
{
  "en": "en_Latn_US",
  "ar": "ar_Arab_EG",
  "zh": "zh_Hans_CN"
}
```

#### scriptMetadata.json
Script properties:
```json
{
  "Arab": {"rtl": true, "ltr": false, "sample": "العربية"},
  "Hebr": {"rtl": true, "ltr": false, "sample": "עברית"}
}
```

---

### 4. Unicode DerivedAge.txt
**URL**: https://www.unicode.org/Public/UCD/latest/ucd/DerivedAge.txt  
**File**: `DerivedAge.txt`

Documents when each Unicode codepoint was added:
```
0041..005A    ; 1.1 # Lu  [26] LATIN CAPITAL LETTER A..Z
0600..0605    ; 4.0 # Cf   [6] ARABIC NUMBER SIGN..ARABIC
10A00..10A03  ; 4.0 # Mn   [4] KHAROSHTHI LETTER A..KHAROSHTHI VOWEL SIGN II
```

Used to determine when scripts became available in Unicode.

---

### 5. Unicode Version History
**URL**: https://www.unicode.org/versions/enumeratedversions.html

Complete history of Unicode releases:

| Version | Date | Characters | Notable Scripts Added |
|---------|------|------------|----------------------|
| 1.0 | 1991-10 | 7,161 | Latin, Greek, Cyrillic, Arabic, Hebrew, Devanagari, Thai |
| 3.0 | 1999-09 | 49,194 | Ethiopic, Khmer, Myanmar, Sinhala, Mongolian |
| 5.0 | 2006-07 | 99,024 | Balinese, Cuneiform, N'Ko, Phoenician |
| 7.0 | 2014-06 | 112,956 | Linear A, Siddham, Mahajani, 23 others |
| 15.0 | 2022-09 | 149,186 | Kawi, Nag Mundari |
| 16.0 | 2024-09 | 154,998 | Garay, Gurung Khema, Todhri, 7 others |

---

### 6. Historical Typography Data
**Sources**:
- Bringhurst, R. (2012). *The Elements of Typographic Style*
- Carter, H. (2002). *A View of Early Typography*
- Lawson, A. (1990). *Anatomy of a Typeface*
- https://fonts.google.com/knowledge
- https://www.typographica.org/

49 historical typefaces from 1455-2010 documenting the evolution of typography:

| Era | Years | Example Typefaces | Scripts |
|-----|-------|-------------------|---------|
| Blackletter | 1455-1500 | Textura, Schwabacher, Fraktur | Latn |
| Renaissance | 1470-1600 | Jenson, Garamond, Bembo | Latn, Grek |
| Baroque | 1600-1800 | Caslon, Baskerville | Latn, Arab, Grek |
| Modern | 1780-1880 | Bodoni, Didot | Latn, Grek, Cyrl |
| Neo-Grotesque | 1950-1990 | Helvetica, Univers, Frutiger | Latn, Cyrl, Grek, Arab |
| Digital | 1984-2010 | Verdana, Georgia, Lucida | Multi-script |

---

### 7. Noto Fonts Project
**URL**: https://github.com/notofonts/notofonts.github.io  
**API**: https://api.github.com/repos/notofonts/notofonts.github.io/contents/fonts  
**License**: Open Font License 1.1

Google's Noto project aims to support all languages with a harmonious look. Coverage data includes:
- 206 font families
- 65+ scripts with full or partial support
- Weight variations (100-900 where applicable)

Script coverage quality varies significantly:

| Quality | Scripts | Weights Available | Examples |
|---------|---------|-------------------|----------|
| Full | 25 | 100-900 (9 weights) | Latin, Arabic, Devanagari |
| Good | 15 | 400-700 (4 weights) | Javanese, Lisu, Sundanese |
| Basic | 45+ | 400 only | Avestan, Ogham, Runic |

---

### 8. Wikidata SPARQL
**URL**: https://query.wikidata.org/  
**Query**: Languages with speaker populations

```sparql
SELECT ?lang ?langLabel ?speakers ?scriptCode WHERE {
  ?lang wdt:P31 wd:Q34770.  # instance of language
  ?lang wdt:P1098 ?speakers.  # number of speakers
  ?lang wdt:P282 ?script.     # writing system
  ?script wdt:P506 ?scriptCode.  # ISO 15924 code
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?speakers)
LIMIT 500
```

**File**: `wikidata_languages.json`

---

## Dataset Schema

### master_dataset.json

```typescript
{
  // Metadata
  metadata: {
    version: string,          // "2.0"
    updated: string,          // ISO timestamp
    sources: Record<string, string>,
    counts: {
      fonts: number,
      scripts: number,
      languages: number,
      historical_typefaces: number,
      unicode_versions: number,
      noto_scripts_covered: number
    }
  },
  
  // Font data from Google Fonts
  fonts: Array<{
    family: string,
    category: string,
    scripts: string[],        // ISO 15924 codes
    weights: number[],
    lastModified: string,
    isNoto: boolean
  }>,
  
  // Script statistics
  scripts: Record<string, {
    code: string,             // ISO 15924
    name: string,
    font_count: number,
    speakers: number,
    languages: string[],
    countries: string[],
    noto_families: string[],
    noto_weight_count: number,
    unicode_version: string,
    unicode_date: string
  }>,
  
  // Inequality metrics (pre-calculated)
  inequality_metrics: Array<{
    code: string,
    name: string,
    speakers: number,
    font_count: number,
    fonts_per_100m: number,
    inequality_ratio: number,  // vs Latin
    noto_weight_coverage: number,
    years_waited: number
  }>,
  
  // Timeline data
  combined_timeline: {
    years: string[],          // "1455" to "2024"
    cumulative: Record<string, Record<string, number>>
  },
  
  // Historical pre-2010 typefaces
  historical_typefaces: Array<{
    name: string,
    year: number,
    designer: string,
    scripts: string[],
    era: string,
    significance: number,     // 1-10
    notes: string
  }>,
  
  // Unicode version history
  unicode_versions: Record<string, {
    date: string,
    characters: number,
    scripts_added: string[]
  }>,
  
  // Noto project coverage
  noto_coverage: Record<string, {
    families: string[],
    weights: string[],
    first_release: number
  }>
}
```

---

## Visualization Ideas

### 1. The Stream Collapses
Show how font availability drops off a cliff when you move from Latin to other scripts.

### 2. The Wait
Dumbbell chart showing years between Unicode support and first font availability.

### 3. The Weight Gap
Heatmap showing font weight coverage (thin to black) across scripts.

### 4. Speakers in Silence
Area chart showing billions of people whose scripts have inadequate font support.

### 5. Noto as Bridge
Show Noto project's attempt to fill the gap.

---

## Building the Dataset

```bash
# Clone the repository
git clone -b dataset https://github.com/khush-tawar/claude-use.git

# Run the build script
python3 build_master_dataset.py

# Fill data gaps
python3 fill_data_gaps.py
```

---

## Data Quality Notes

### Known Limitations
1. **Speaker populations**: Aggregated from CLDR territory data and Wikidata; may not reflect exact per-script usage
2. **Historical data**: Curated manually; focuses on significant/influential typefaces
3. **Noto coverage**: Based on GitHub repo structure; some fonts may have more/fewer weights
4. **Script mapping**: Google Fonts subset names mapped to ISO 15924 codes via manual lookup table

### Verification Steps
1. Cross-referenced Google Fonts API with actual font files
2. Validated ISO 15924 codes against Unicode registry
3. Checked CLDR version consistency
4. Verified Noto families against notofonts.github.io

---

## Citation

If you use this dataset, please cite:

```bibtex
@dataset{typography_colonialism_2024,
  title={Typography Colonialism Dataset},
  author={Tawar, Khush},
  year={2024},
  url={https://github.com/khush-tawar/claude-use/tree/dataset},
  note={Compiled from Google Fonts, Unicode CLDR, ISO 15924, and historical typography sources}
}
```

---

## Updates

- **v2.0** (2024): Added historical typefaces, Unicode version history, Noto coverage, combined timeline
- **v1.0** (2024): Initial dataset with Google Fonts and CLDR data

---

## License

Dataset: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)  
Underlying data sources maintain their respective licenses (see above).

---

## Contact

For questions or contributions, open an issue on the repository.