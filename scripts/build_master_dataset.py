#!/usr/bin/env python3
"""
Typography Colonialism - Master Dataset Builder
================================================
Combines all data sources into a single comprehensive JSON file
for Observable visualization.

Sources:
- Google Fonts API (webfonts.json)
- ISO 15924 Script Codes (iso15924.txt)
- Unicode DerivedAge (DerivedAge.txt)
- CLDR Language Data (languageData.json)
- CLDR Territory Info (territoryInfo.json)
- CLDR Likely Subtags (likelySubtags.json)
- CLDR Script Metadata (scriptMetadata.json)

Output: master_dataset.json
"""

import json
import csv
import re
from collections import defaultdict
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================

PATHS = {
    "webfonts": "webfonts.json",
    "iso15924": "iso15924.txt",
    "derived_age": "DerivedAge.txt",
    "language_data": "cldr_extracted/languageData.json",
    "territory_info": "cldr_extracted/territoryInfo.json",
    "likely_subtags": "cldr_extracted/likelySubtags.json",
    "script_metadata": "cldr_extracted/scriptMetadata.json",
    "language_codes": "LanguageCodes (2).csv",
}

# Google Fonts subset → ISO 15924 code mapping
SUBSET_TO_SCRIPT = {
    "adlam": "Adlm",
    "ahom": "Ahom",
    "anatolian-hieroglyphs": "Hluw",
    "arabic": "Arab",
    "armenian": "Armn",
    "avestan": "Avst",
    "balinese": "Bali",
    "bamum": "Bamu",
    "bassa-vah": "Bass",
    "batak": "Batk",
    "bengali": "Beng",
    "bhaiksuki": "Bhks",
    "brahmi": "Brah",
    "braille": "Brai",
    "buginese": "Bugi",
    "buhid": "Buhd",
    "canadian-aboriginal": "Cans",
    "carian": "Cari",
    "caucasian-albanian": "Aghb",
    "chakma": "Cakm",
    "cham": "Cham",
    "cherokee": "Cher",
    "chinese-hongkong": "Hant",
    "chinese-simplified": "Hans",
    "chinese-traditional": "Hant",
    "chorasmian": "Chrs",
    "coptic": "Copt",
    "cuneiform": "Xsux",
    "cypriot": "Cprt",
    "cypro-minoan": "Cpmn",
    "cyrillic": "Cyrl",
    "cyrillic-ext": "Cyrl",
    "deseret": "Dsrt",
    "devanagari": "Deva",
    "dives-akuru": "Diak",
    "dogra": "Dogr",
    "duployan": "Dupl",
    "egyptian-hieroglyphs": "Egyp",
    "elbasan": "Elba",
    "elymaic": "Elym",
    "ethiopic": "Ethi",
    "georgian": "Geor",
    "glagolitic": "Glag",
    "gothic": "Goth",
    "grantha": "Gran",
    "greek": "Grek",
    "greek-ext": "Grek",
    "gujarati": "Gujr",
    "gunjala-gondi": "Gong",
    "gurmukhi": "Guru",
    "hanifi-rohingya": "Rohg",
    "hanunoo": "Hano",
    "hatran": "Hatr",
    "hebrew": "Hebr",
    "imperial-aramaic": "Armi",
    "inscriptional-pahlavi": "Phli",
    "inscriptional-parthian": "Prti",
    "japanese": "Jpan",
    "javanese": "Java",
    "kaithi": "Kthi",
    "kannada": "Knda",
    "kawi": "Kawi",
    "kayah-li": "Kali",
    "kharoshthi": "Khar",
    "khitan-small-script": "Kits",
    "khmer": "Khmr",
    "khojki": "Khoj",
    "khudawadi": "Sind",
    "kirat-rai": "Krai",
    "korean": "Kore",
    "lao": "Laoo",
    "latin": "Latn",
    "latin-ext": "Latn",
    "lepcha": "Lepc",
    "limbu": "Limb",
    "linear-a": "Lina",
    "linear-b": "Linb",
    "lisu": "Lisu",
    "lycian": "Lyci",
    "lydian": "Lydi",
    "mahajani": "Mahj",
    "makasar": "Maka",
    "malayalam": "Mlym",
    "mandaic": "Mand",
    "manichaean": "Mani",
    "marchen": "Marc",
    "masaram-gondi": "Gonm",
    "medefaidrin": "Medf",
    "meetei-mayek": "Mtei",
    "mende-kikakui": "Mend",
    "meroitic": "Mero",
    "meroitic-cursive": "Merc",
    "meroitic-hieroglyphs": "Mero",
    "miao": "Plrd",
    "modi": "Modi",
    "mongolian": "Mong",
    "mro": "Mroo",
    "multani": "Mult",
    "myanmar": "Mymr",
    "nabataean": "Nbat",
    "nag-mundari": "Nagm",
    "nandinagari": "Nand",
    "new-tai-lue": "Talu",
    "newa": "Newa",
    "nko": "Nkoo",
    "nushu": "Nshu",
    "nyiakeng-puachue-hmong": "Hmnp",
    "ogham": "Ogam",
    "ol-chiki": "Olck",
    "old-hungarian": "Hung",
    "old-italic": "Ital",
    "old-north-arabian": "Narb",
    "old-permic": "Perm",
    "old-persian": "Xpeo",
    "old-sogdian": "Sogo",
    "old-south-arabian": "Sarb",
    "old-turkic": "Orkh",
    "old-uyghur": "Ougr",
    "oriya": "Orya",
    "osage": "Osge",
    "osmanya": "Osma",
    "pahawh-hmong": "Hmng",
    "palmyrene": "Palm",
    "pau-cin-hau": "Pauc",
    "phags-pa": "Phag",
    "phoenician": "Phnx",
    "psalter-pahlavi": "Phlp",
    "rejang": "Rjng",
    "runic": "Runr",
    "samaritan": "Samr",
    "saurashtra": "Saur",
    "sharada": "Shrd",
    "shavian": "Shaw",
    "siddham": "Sidd",
    "signwriting": "Sgnw",
    "sinhala": "Sinh",
    "sogdian": "Sogd",
    "sora-sompeng": "Sora",
    "soyombo": "Soyo",
    "sundanese": "Sund",
    "sunuwar": "Sunu",
    "syloti-nagri": "Sylo",
    "syriac": "Syrc",
    "tagalog": "Tglg",
    "tagbanwa": "Tagb",
    "tai-le": "Tale",
    "tai-tham": "Lana",
    "tai-viet": "Tavt",
    "takri": "Takr",
    "tamil": "Taml",
    "tamil-supplement": "Taml",
    "tangsa": "Tnsa",
    "tangut": "Tang",
    "telugu": "Telu",
    "thaana": "Thaa",
    "thai": "Thai",
    "tibetan": "Tibt",
    "tifinagh": "Tfng",
    "tirhuta": "Tirh",
    "todhri": "Todr",
    "toto": "Toto",
    "ugaritic": "Ugar",
    "vai": "Vaii",
    "vietnamese": "Latn",  # Vietnamese uses Latin
    "vithkuqi": "Vith",
    "wancho": "Wcho",
    "warang-citi": "Wara",
    "yezidi": "Yezi",
    "yi": "Yiii",
    "zanabazar-square": "Zanb",
}

# Unicode version release dates
UNICODE_VERSION_DATES = {
    "1.0": "1991-10-01",
    "1.0.1": "1992-06-01",
    "1.1": "1993-06-01",
    "2.0": "1996-07-01",
    "2.1": "1998-05-01",
    "3.0": "1999-09-01",
    "3.1": "2001-03-01",
    "3.2": "2002-03-01",
    "4.0": "2003-04-01",
    "4.1": "2005-03-31",
    "5.0": "2006-07-14",
    "5.1": "2008-04-04",
    "5.2": "2009-10-01",
    "6.0": "2010-10-11",
    "6.1": "2012-01-31",
    "6.2": "2012-09-26",
    "6.3": "2013-09-30",
    "7.0": "2014-06-16",
    "8.0": "2015-06-17",
    "9.0": "2016-06-21",
    "10.0": "2017-06-20",
    "11.0": "2018-06-05",
    "12.0": "2019-03-05",
    "12.1": "2019-05-07",
    "13.0": "2020-03-10",
    "14.0": "2021-09-14",
    "15.0": "2022-09-13",
    "15.1": "2023-09-12",
    "16.0": "2024-09-10",
}

# ============================================================
# DATA LOADING FUNCTIONS
# ============================================================

def load_json(path):
    """Load a JSON file."""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_iso15924(path):
    """Parse ISO 15924 script codes file."""
    scripts = {}
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split(';')
            if len(parts) >= 6:
                code = parts[0]
                scripts[code] = {
                    "code": code,
                    "number": parts[1],
                    "name_en": parts[2],
                    "name_fr": parts[3],
                    "pva": parts[4] if parts[4] else None,
                    "unicode_version": parts[5] if parts[5] else None,
                    "date_added": parts[6] if len(parts) > 6 else None,
                }
    return scripts

def load_derived_age(path):
    """Parse Unicode DerivedAge.txt to get script → Unicode version mapping."""
    # This maps codepoint ranges to Unicode versions
    # We'll use it to determine when scripts were added
    age_data = []
    current_version = None
    
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                if 'Age=V' in line or 'Age=' in line:
                    match = re.search(r'Age\s*=\s*V?(\d+[\._]\d+)', line, re.IGNORECASE)
                    if match:
                        current_version = match.group(1).replace('_', '.')
                continue
            
            # Parse: "0000..001F    ; 1.1 #  [32] ..."
            match = re.match(r'([0-9A-Fa-f]+)(?:\.\.([0-9A-Fa-f]+))?\s*;\s*([\d.]+)', line)
            if match:
                start = int(match.group(1), 16)
                end = int(match.group(2), 16) if match.group(2) else start
                version = match.group(3)
                age_data.append({
                    "start": start,
                    "end": end,
                    "version": version
                })
    
    return age_data

def load_csv(path):
    """Load a CSV file."""
    data = []
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

# ============================================================
# DATA PROCESSING FUNCTIONS
# ============================================================

def process_fonts(webfonts_data):
    """Process Google Fonts data."""
    fonts = []
    
    for item in webfonts_data.get('items', []):
        # Extract variants (weights)
        variants = item.get('variants', [])
        weights = set()
        styles = set()
        
        for v in variants:
            # Parse weight from variant string
            if v == 'regular':
                weights.add('400')
                styles.add('normal')
            elif v == 'italic':
                weights.add('400')
                styles.add('italic')
            elif v.endswith('italic'):
                weight = v.replace('italic', '')
                weights.add(weight if weight else '400')
                styles.add('italic')
            else:
                weights.add(v)
                styles.add('normal')
        
        # Map subsets to ISO 15924 scripts
        subsets = item.get('subsets', [])
        scripts = set()
        for subset in subsets:
            if subset in SUBSET_TO_SCRIPT:
                scripts.add(SUBSET_TO_SCRIPT[subset])
        
        # Determine if this is a Noto font
        is_noto = item['family'].lower().startswith('noto')
        
        font = {
            "family": item['family'],
            "category": item.get('category', 'unknown'),
            "subsets": subsets,
            "scripts": list(scripts),
            "variants": variants,
            "weights": list(weights),
            "styles": list(styles),
            "last_modified": item.get('lastModified', ''),
            "version": item.get('version', ''),
            "is_noto": is_noto,
        }
        fonts.append(font)
    
    return fonts

def calculate_script_statistics(fonts, iso15924_data, territory_info, language_data, script_metadata, likely_subtags):
    """Calculate comprehensive statistics for each script."""
    
    # Initialize script data
    scripts = {}
    
    for code, iso_data in iso15924_data.items():
        scripts[code] = {
            "code": code,
            "name": iso_data['name_en'],
            "name_fr": iso_data['name_fr'],
            "unicode_version": iso_data['unicode_version'],
            "unicode_date": UNICODE_VERSION_DATES.get(iso_data['unicode_version'], None),
            "font_count": 0,
            "fonts_by_category": defaultdict(int),
            "fonts_by_weight": defaultdict(int),
            "noto_font_count": 0,
            "first_google_font_date": None,
            "languages": [],
            "countries": [],
            "speakers": 0,
            "rtl": False,
            "origin_country": None,
        }
    
    # Count fonts per script
    for font in fonts:
        for script_code in font['scripts']:
            if script_code in scripts:
                scripts[script_code]['font_count'] += 1
                scripts[script_code]['fonts_by_category'][font['category']] += 1
                
                for weight in font['weights']:
                    scripts[script_code]['fonts_by_weight'][weight] += 1
                
                if font['is_noto']:
                    scripts[script_code]['noto_font_count'] += 1
                
                # Track first font date
                if font['last_modified']:
                    current_first = scripts[script_code]['first_google_font_date']
                    if current_first is None or font['last_modified'] < current_first:
                        scripts[script_code]['first_google_font_date'] = font['last_modified']
    
    # Add metadata from CLDR
    if script_metadata:
        for code, meta in script_metadata.get('scriptMetadata', {}).items():
            if code in scripts:
                scripts[code]['rtl'] = meta.get('rtl') == 'YES'
                scripts[code]['origin_country'] = meta.get('originCountry')
                scripts[code]['rank'] = meta.get('rank', 99)
    
    # Calculate speakers from territory info + language data
    lang_to_script = {}
    if language_data:
        for lang, data in language_data.get('supplemental', {}).get('languageData', {}).items():
            if '-alt-' not in lang:  # Skip alternate scripts
                script_list = data.get('_scripts', [])
                if script_list:
                    lang_to_script[lang.split('_')[0]] = script_list[0]  # Primary script
    
    # Also use likely subtags for comprehensive language → script mapping
    if likely_subtags:
        for lang, subtag in likely_subtags.get('supplemental', {}).get('likelySubtags', {}).items():
            base_lang = lang.split('-')[0].split('_')[0]
            if base_lang not in lang_to_script:
                # Parse: "aa-Latn-ET" → Latn
                parts = subtag.split('-')
                if len(parts) >= 2 and len(parts[1]) == 4:
                    lang_to_script[base_lang] = parts[1]
    
    # Calculate speakers per script from territory data
    if territory_info:
        for country_code, country_data in territory_info.get('supplemental', {}).get('territoryInfo', {}).items():
            country_pop = int(float(country_data.get('_population', 0)))
            
            for lang, lang_data in country_data.get('languagePopulation', {}).items():
                base_lang = lang.split('_')[0]
                pop_percent = float(lang_data.get('_populationPercent', 0))
                lang_speakers = int(country_pop * pop_percent / 100)
                
                # Get script for this language
                script_code = lang_to_script.get(base_lang)
                
                # Handle special cases like "uz_Arab" which specify script
                if '_' in lang:
                    script_suffix = lang.split('_')[1]
                    if len(script_suffix) == 4:
                        script_code = script_suffix
                
                if script_code and script_code in scripts:
                    scripts[script_code]['speakers'] += lang_speakers
                    
                    if base_lang not in scripts[script_code]['languages']:
                        scripts[script_code]['languages'].append(base_lang)
                    
                    if country_code not in scripts[script_code]['countries']:
                        scripts[script_code]['countries'].append(country_code)
    
    # Convert defaultdicts to regular dicts
    for code in scripts:
        scripts[code]['fonts_by_category'] = dict(scripts[code]['fonts_by_category'])
        scripts[code]['fonts_by_weight'] = dict(scripts[code]['fonts_by_weight'])
    
    return scripts

def build_timeline(fonts, scripts):
    """Build year-by-year timeline of font additions."""
    timeline = defaultdict(lambda: defaultdict(int))
    
    for font in fonts:
        if font['last_modified']:
            try:
                year = font['last_modified'][:4]
                for script in font['scripts']:
                    timeline[year][script] += 1
            except:
                pass
    
    # Convert to cumulative
    all_years = sorted(timeline.keys())
    cumulative = {}
    
    for script_code in scripts.keys():
        cumulative[script_code] = {}
        running_total = 0
        for year in all_years:
            running_total += timeline[year].get(script_code, 0)
            cumulative[script_code][year] = running_total
    
    return {
        "yearly": {y: dict(d) for y, d in timeline.items()},
        "cumulative": cumulative,
        "years": all_years,
    }

def calculate_inequality_metrics(scripts):
    """Calculate inequality metrics for each script."""
    metrics = []
    
    # Get Latin as baseline
    latin_fonts = scripts.get('Latn', {}).get('font_count', 1)
    latin_speakers = scripts.get('Latn', {}).get('speakers', 1)
    latin_ratio = latin_fonts / (latin_speakers / 100_000_000) if latin_speakers > 0 else 0
    
    for code, data in scripts.items():
        if data['font_count'] == 0 and data['speakers'] == 0:
            continue
            
        speakers = data['speakers']
        fonts = data['font_count']
        
        # Fonts per 100 million speakers
        fonts_per_100m = (fonts / (speakers / 100_000_000)) if speakers > 0 else 0
        
        # Inequality ratio vs Latin
        inequality_ratio = latin_ratio / fonts_per_100m if fonts_per_100m > 0 else float('inf')
        
        # Weight coverage (out of 9 standard weights)
        weight_coverage = len(data['fonts_by_weight']) / 9
        
        metrics.append({
            "code": code,
            "name": data['name'],
            "speakers": speakers,
            "font_count": fonts,
            "fonts_per_100m": round(fonts_per_100m, 4),
            "inequality_ratio": round(inequality_ratio, 2) if inequality_ratio != float('inf') else None,
            "weight_coverage": round(weight_coverage, 2),
            "noto_coverage": data['noto_font_count'] > 0,
            "language_count": len(data['languages']),
            "country_count": len(data['countries']),
        })
    
    return sorted(metrics, key=lambda x: x['speakers'], reverse=True)

# ============================================================
# MAIN BUILDER
# ============================================================

def build_master_dataset():
    """Build the complete master dataset."""
    print("Loading data sources...")
    
    # Load all data
    webfonts = load_json(PATHS['webfonts'])
    iso15924 = load_iso15924(PATHS['iso15924'])
    
    try:
        language_data = load_json(PATHS['language_data'])
    except:
        language_data = None
        print("  Warning: Could not load language_data.json")
    
    try:
        territory_info = load_json(PATHS['territory_info'])
    except:
        territory_info = None
        print("  Warning: Could not load territoryInfo.json")
    
    try:
        likely_subtags = load_json(PATHS['likely_subtags'])
    except:
        likely_subtags = None
        print("  Warning: Could not load likelySubtags.json")
    
    try:
        script_metadata = load_json(PATHS['script_metadata'])
    except:
        script_metadata = None
        print("  Warning: Could not load scriptMetadata.json")
    
    print("Processing fonts...")
    fonts = process_fonts(webfonts)
    print(f"  Processed {len(fonts)} fonts")
    
    print("Calculating script statistics...")
    scripts = calculate_script_statistics(
        fonts, iso15924, territory_info, language_data, script_metadata, likely_subtags
    )
    scripts_with_fonts = {k: v for k, v in scripts.items() if v['font_count'] > 0 or v['speakers'] > 0}
    print(f"  Analyzed {len(scripts_with_fonts)} active scripts")
    
    print("Building timeline...")
    timeline = build_timeline(fonts, scripts)
    
    print("Calculating inequality metrics...")
    inequality_metrics = calculate_inequality_metrics(scripts)
    
    # Build final dataset
    master_dataset = {
        "metadata": {
            "generated": datetime.now().isoformat(),
            "version": "1.0",
            "sources": {
                "google_fonts": "https://fonts.google.com/metadata/fonts",
                "iso15924": "https://www.unicode.org/iso15924/",
                "cldr": "https://github.com/unicode-org/cldr-json",
                "unicode": "https://www.unicode.org/ucd/"
            },
            "counts": {
                "total_fonts": len(fonts),
                "total_scripts": len(scripts_with_fonts),
                "scripts_with_fonts": len([s for s in scripts_with_fonts.values() if s['font_count'] > 0]),
            }
        },
        "fonts": fonts,
        "scripts": scripts_with_fonts,
        "timeline": timeline,
        "inequality_metrics": inequality_metrics,
        "unicode_version_dates": UNICODE_VERSION_DATES,
        "subset_to_script_map": SUBSET_TO_SCRIPT,
    }
    
    # Save
    output_path = "master_dataset.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(master_dataset, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Master dataset saved to {output_path}")
    print(f"   Size: {len(json.dumps(master_dataset)) / 1024 / 1024:.2f} MB")
    
    # Print summary
    print("\n📊 Dataset Summary:")
    print(f"   Fonts: {len(fonts)}")
    print(f"   Scripts with data: {len(scripts_with_fonts)}")
    print(f"   Scripts with fonts: {master_dataset['metadata']['counts']['scripts_with_fonts']}")
    
    # Top scripts by font count
    top_by_fonts = sorted(scripts_with_fonts.items(), key=lambda x: x[1]['font_count'], reverse=True)[:10]
    print("\n   Top 10 scripts by font count:")
    for code, data in top_by_fonts:
        print(f"     {code}: {data['font_count']} fonts ({data['name']})")
    
    # Top scripts by speakers
    top_by_speakers = sorted(scripts_with_fonts.items(), key=lambda x: x[1]['speakers'], reverse=True)[:10]
    print("\n   Top 10 scripts by speakers:")
    for code, data in top_by_speakers:
        print(f"     {code}: {data['speakers']:,} speakers ({data['name']})")
    
    return master_dataset

if __name__ == "__main__":
    build_master_dataset()
