#!/usr/bin/env python3
"""
Typography Colonialism - Dataset Enhancer
==========================================
Adds deep data journalism metrics to the master dataset:
1. Style/Italic availability gap
2. Category/Design diversity poverty
3. Monospace font gap (coding fonts)
4. Noto dependency analysis
5. Font freshness/maintenance metrics
6. Version maturity indicators
7. Operating system default fonts

Author: Auto-generated for Observable visualization
"""

import json
from collections import defaultdict
from datetime import datetime

# ============================================================
# 1. OPERATING SYSTEM DEFAULT FONTS
# ============================================================
# Sources:
# - https://docs.microsoft.com/en-us/typography/fonts/windows_11_font_list
# - https://developer.apple.com/fonts/system-fonts/
# - https://source.android.com/docs/core/fonts

OS_DEFAULT_FONTS = {
    "windows_11": {
        "Latn": ["Segoe UI", "Arial", "Times New Roman", "Calibri", "Cambria", "Consolas", "Verdana", "Tahoma", "Georgia"],
        "Cyrl": ["Segoe UI", "Arial", "Times New Roman"],
        "Grek": ["Segoe UI", "Arial", "Times New Roman"],
        "Arab": ["Segoe UI", "Arial", "Times New Roman", "Traditional Arabic", "Simplified Arabic"],
        "Hebr": ["Segoe UI", "Arial", "Times New Roman", "David", "Miriam"],
        "Thai": ["Tahoma", "Leelawadee UI"],
        "Deva": ["Mangal", "Aparajita", "Kokila", "Nirmala UI"],
        "Beng": ["Vrinda", "Nirmala UI"],
        "Taml": ["Latha", "Nirmala UI"],
        "Telu": ["Gautami", "Nirmala UI"],
        "Knda": ["Tunga", "Nirmala UI"],
        "Mlym": ["Kartika", "Nirmala UI"],
        "Gujr": ["Shruti", "Nirmala UI"],
        "Orya": ["Kalinga", "Nirmala UI"],
        "Guru": ["Raavi", "Nirmala UI"],
        "Sinh": ["Iskoola Pota"],
        "Hans": ["Microsoft YaHei", "SimSun", "SimHei", "DengXian"],
        "Hant": ["Microsoft JhengHei", "MingLiU"],
        "Jpan": ["Yu Gothic", "Yu Mincho", "Meiryo", "MS Gothic"],
        "Kore": ["Malgun Gothic", "Batang", "Gulim"],
        "Ethi": ["Ebrima", "Nyala"],
        "Armn": ["Segoe UI Historic"],
        "Geor": ["Segoe UI"],
        "Mymr": ["Myanmar Text"],
        "Khmr": ["Khmer UI", "Leelawadee UI"],
    },
    "macos_14": {
        "Latn": ["SF Pro", "Helvetica Neue", "Times", "Arial", "Menlo", "Monaco"],
        "Cyrl": ["SF Pro", "Helvetica Neue"],
        "Grek": ["SF Pro", "Helvetica Neue"],
        "Arab": ["SF Arabic", "Geeza Pro", "Al Nile"],
        "Hebr": ["SF Hebrew", "New Peninim MT", "Arial Hebrew"],
        "Thai": ["Thonburi", "SF Pro"],
        "Deva": ["Kohinoor Devanagari", "Devanagari MT"],
        "Beng": ["Kohinoor Bangla", "Bangla MN"],
        "Taml": ["Kohinoor Tamil", "Tamil MN"],
        "Telu": ["Kohinoor Telugu", "Telugu MN"],
        "Knda": ["Kannada MN"],
        "Mlym": ["Malayalam MN"],
        "Gujr": ["Kohinoor Gujarati", "Gujarati MT"],
        "Orya": ["Oriya MN"],
        "Guru": ["Gurmukhi MN"],
        "Sinh": ["Sinhala MN"],
        "Hans": ["PingFang SC", "Heiti SC", "Songti SC"],
        "Hant": ["PingFang TC", "Heiti TC"],
        "Jpan": ["Hiragino Sans", "Hiragino Mincho", "Apple SD Gothic Neo"],
        "Kore": ["Apple SD Gothic Neo", "AppleMyungjo"],
        "Ethi": ["Kefa"],
        "Armn": ["Mshtakan"],
        "Geor": ["Helvetica"],
        "Mymr": ["Myanmar MN"],
        "Khmr": ["Khmer MN"],
    },
    "android_14": {
        "Latn": ["Roboto", "Noto Sans", "Noto Serif", "Droid Sans Mono"],
        "Cyrl": ["Roboto", "Noto Sans"],
        "Grek": ["Roboto", "Noto Sans"],
        "Arab": ["Noto Naskh Arabic", "Noto Sans Arabic"],
        "Hebr": ["Noto Sans Hebrew"],
        "Thai": ["Noto Sans Thai"],
        "Deva": ["Noto Sans Devanagari"],
        "Beng": ["Noto Sans Bengali"],
        "Taml": ["Noto Sans Tamil"],
        "Telu": ["Noto Sans Telugu"],
        "Knda": ["Noto Sans Kannada"],
        "Mlym": ["Noto Sans Malayalam"],
        "Gujr": ["Noto Sans Gujarati"],
        "Orya": ["Noto Sans Oriya"],
        "Guru": ["Noto Sans Gurmukhi"],
        "Sinh": ["Noto Sans Sinhala"],
        "Hans": ["Noto Sans CJK SC"],
        "Hant": ["Noto Sans CJK TC"],
        "Jpan": ["Noto Sans CJK JP"],
        "Kore": ["Noto Sans CJK KR"],
        "Ethi": ["Noto Sans Ethiopic"],
        "Armn": ["Noto Sans Armenian"],
        "Geor": ["Noto Sans Georgian"],
        "Mymr": ["Noto Sans Myanmar"],
        "Khmr": ["Noto Sans Khmer"],
        "Laoo": ["Noto Sans Lao"],
        "Tibt": ["Noto Sans Tibetan"],
    },
    "ios_17": {
        "Latn": ["SF Pro", "SF Compact", "New York"],
        "Cyrl": ["SF Pro"],
        "Grek": ["SF Pro"],
        "Arab": ["SF Arabic"],
        "Hebr": ["SF Hebrew"],
        "Thai": ["Thonburi"],
        "Deva": ["Kohinoor Devanagari"],
        "Beng": ["Kohinoor Bangla"],
        "Taml": ["Kohinoor Tamil"],
        "Telu": ["Kohinoor Telugu"],
        "Knda": ["Kannada Sangam MN"],
        "Mlym": ["Malayalam Sangam MN"],
        "Gujr": ["Kohinoor Gujarati"],
        "Hans": ["PingFang SC"],
        "Hant": ["PingFang TC"],
        "Jpan": ["Hiragino Sans"],
        "Kore": ["Apple SD Gothic Neo"],
    }
}

# ============================================================
# 2. SUBSET TO ISO 15924 MAPPING (for accurate analysis)
# ============================================================
SUBSET_TO_SCRIPT = {
    'latin': 'Latn', 'latin-ext': 'Latn', 'cyrillic': 'Cyrl', 'cyrillic-ext': 'Cyrl',
    'greek': 'Grek', 'greek-ext': 'Grek', 'vietnamese': 'Latn', 'arabic': 'Arab',
    'hebrew': 'Hebr', 'thai': 'Thai', 'devanagari': 'Deva', 'bengali': 'Beng',
    'tamil': 'Taml', 'telugu': 'Telu', 'kannada': 'Knda', 'malayalam': 'Mlym',
    'gujarati': 'Gujr', 'oriya': 'Orya', 'gurmukhi': 'Guru', 'sinhala': 'Sinh',
    'khmer': 'Khmr', 'lao': 'Laoo', 'myanmar': 'Mymr', 'tibetan': 'Tibt',
    'ethiopic': 'Ethi', 'cherokee': 'Cher', 'canadian-aboriginal': 'Cans',
    'armenian': 'Armn', 'georgian': 'Geor', 'japanese': 'Jpan', 'korean': 'Kore',
    'chinese-simplified': 'Hans', 'chinese-traditional': 'Hant', 'chinese-hongkong': 'Hant',
    'adlam': 'Adlm', 'nko': 'Nkoo', 'tifinagh': 'Tfng', 'vai': 'Vaii',
    'javanese': 'Java', 'sundanese': 'Sund', 'balinese': 'Bali', 'buginese': 'Bugi',
    'syriac': 'Syrc', 'thaana': 'Thaa', 'mongolian': 'Mong', 'yi': 'Yiii',
}

def analyze_google_fonts():
    """Analyze Google Fonts for deep metrics."""
    
    with open('webfonts.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    fonts = data.get('items', [])
    
    # Initialize metrics containers
    metrics = {
        'italic_availability': {},
        'category_diversity': {},
        'monospace_gap': {},
        'noto_dependency': {},
        'font_freshness': {},
        'version_maturity': {},
        'variant_richness': {},
        'scripts_without_alternatives': [],
        'design_poverty_index': {},
    }
    
    # Per-script accumulators
    script_data = defaultdict(lambda: {
        'fonts': [],
        'italic_count': 0,
        'total_count': 0,
        'categories': defaultdict(int),
        'monospace_count': 0,
        'noto_count': 0,
        'non_noto_count': 0,
        'update_dates': [],
        'versions': [],
        'variant_counts': [],
        'designers': set(),
    })
    
    for font in fonts:
        subsets = font.get('subsets', [])
        variants = font.get('variants', [])
        category = font.get('category', 'unknown')
        family = font.get('family', '')
        is_noto = family.startswith('Noto')
        last_mod = font.get('lastModified', '')
        version = font.get('version', 'v1')
        
        has_italic = any('italic' in v for v in variants)
        is_monospace = category == 'monospace'
        
        for subset in subsets:
            sd = script_data[subset]
            sd['fonts'].append(family)
            sd['total_count'] += 1
            sd['categories'][category] += 1
            sd['variant_counts'].append(len(variants))
            
            if has_italic:
                sd['italic_count'] += 1
            if is_monospace:
                sd['monospace_count'] += 1
            if is_noto:
                sd['noto_count'] += 1
            else:
                sd['non_noto_count'] += 1
            if last_mod:
                sd['update_dates'].append(last_mod)
            if version:
                try:
                    v_num = int(version.replace('v', ''))
                    sd['versions'].append(v_num)
                except:
                    pass
    
    # Calculate final metrics
    for subset, sd in script_data.items():
        if sd['total_count'] < 1:
            continue
        
        script_code = SUBSET_TO_SCRIPT.get(subset, subset)
        
        # Italic availability
        italic_pct = (sd['italic_count'] / sd['total_count'] * 100) if sd['total_count'] > 0 else 0
        metrics['italic_availability'][subset] = {
            'script_code': script_code,
            'italic_fonts': sd['italic_count'],
            'total_fonts': sd['total_count'],
            'percentage': round(italic_pct, 1),
        }
        
        # Category diversity
        num_categories = len([c for c, v in sd['categories'].items() if v > 0])
        metrics['category_diversity'][subset] = {
            'script_code': script_code,
            'diversity_score': num_categories,
            'categories': dict(sd['categories']),
            'total_fonts': sd['total_count'],
        }
        
        # Monospace gap
        mono_pct = (sd['monospace_count'] / sd['total_count'] * 100) if sd['total_count'] > 0 else 0
        metrics['monospace_gap'][subset] = {
            'script_code': script_code,
            'monospace_fonts': sd['monospace_count'],
            'total_fonts': sd['total_count'],
            'percentage': round(mono_pct, 1),
        }
        
        # Noto dependency
        noto_pct = (sd['noto_count'] / sd['total_count'] * 100) if sd['total_count'] > 0 else 0
        dependency_status = "diverse"
        if noto_pct >= 100 and sd['non_noto_count'] == 0:
            dependency_status = "noto_only"
        elif noto_pct >= 80:
            dependency_status = "noto_dependent"
        elif noto_pct >= 50:
            dependency_status = "mostly_noto"
        
        metrics['noto_dependency'][subset] = {
            'script_code': script_code,
            'noto_fonts': sd['noto_count'],
            'non_noto_fonts': sd['non_noto_count'],
            'total_fonts': sd['total_count'],
            'noto_percentage': round(noto_pct, 1),
            'dependency_status': dependency_status,
        }
        
        if sd['non_noto_count'] == 0 and sd['noto_count'] > 0:
            metrics['scripts_without_alternatives'].append({
                'subset': subset,
                'script_code': script_code,
                'noto_fonts': sd['noto_count'],
            })
        
        # Variant richness
        avg_variants = sum(sd['variant_counts']) / len(sd['variant_counts']) if sd['variant_counts'] else 0
        metrics['variant_richness'][subset] = {
            'script_code': script_code,
            'average_variants': round(avg_variants, 1),
            'total_fonts': sd['total_count'],
        }
        
        # Font freshness
        if sd['update_dates']:
            try:
                parsed = [datetime.strptime(d, '%Y-%m-%d') for d in sd['update_dates']]
                avg_date = datetime.fromtimestamp(sum(d.timestamp() for d in parsed) / len(parsed))
                most_recent = max(parsed)
                metrics['font_freshness'][subset] = {
                    'script_code': script_code,
                    'avg_update': avg_date.strftime('%Y-%m'),
                    'most_recent': most_recent.strftime('%Y-%m-%d'),
                    'total_fonts': sd['total_count'],
                }
            except:
                pass
        
        # Version maturity
        if sd['versions']:
            avg_version = sum(sd['versions']) / len(sd['versions'])
            metrics['version_maturity'][subset] = {
                'script_code': script_code,
                'average_version': round(avg_version, 1),
                'total_fonts': sd['total_count'],
            }
        
        # Design Poverty Index (composite metric)
        # Lower = more impoverished
        italic_score = italic_pct / 100
        diversity_score = num_categories / 5  # Max 5 categories
        mono_score = min(1, sd['monospace_count'] / 5)  # Need at least 5 mono fonts
        alternative_score = 1 - (noto_pct / 100)  # More non-Noto = better
        variant_score = min(1, avg_variants / 10)  # 10+ variants = good
        
        poverty_index = (
            italic_score * 0.15 +
            diversity_score * 0.25 +
            mono_score * 0.15 +
            alternative_score * 0.25 +
            variant_score * 0.20
        )
        
        metrics['design_poverty_index'][subset] = {
            'script_code': script_code,
            'poverty_index': round(poverty_index, 3),
            'components': {
                'italic': round(italic_score, 2),
                'diversity': round(diversity_score, 2),
                'monospace': round(mono_score, 2),
                'alternatives': round(alternative_score, 2),
                'variants': round(variant_score, 2),
            },
            'total_fonts': sd['total_count'],
        }
    
    return metrics

def enhance_master_dataset():
    """Add all new metrics to the master dataset."""
    
    print("Loading master dataset...")
    with open('master_dataset.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print("Analyzing Google Fonts for deep metrics...")
    metrics = analyze_google_fonts()
    
    # Add OS default fonts
    print("Adding OS default font data...")
    data['os_default_fonts'] = OS_DEFAULT_FONTS
    
    # Add all new metrics
    print("Adding deep journalism metrics...")
    data['deep_metrics'] = metrics
    
    # Calculate summary statistics
    print("Calculating summary statistics...")
    
    # Scripts without any non-Noto alternatives
    noto_only_scripts = len(metrics['scripts_without_alternatives'])
    
    # Average design poverty by script type
    poverty_scores = [v['poverty_index'] for v in metrics['design_poverty_index'].values()]
    avg_poverty = sum(poverty_scores) / len(poverty_scores) if poverty_scores else 0
    
    # Monospace deserts (0 monospace fonts)
    mono_deserts = len([v for v in metrics['monospace_gap'].values() if v['monospace_fonts'] == 0])
    
    # Italic deserts (0% italic)
    italic_deserts = len([v for v in metrics['italic_availability'].values() if v['italic_fonts'] == 0])
    
    data['summary_stats'] = {
        'total_fonts': len(data.get('fonts', [])),
        'total_subsets_analyzed': len(metrics['design_poverty_index']),
        'noto_only_scripts': noto_only_scripts,
        'average_design_poverty_index': round(avg_poverty, 3),
        'monospace_desert_scripts': mono_deserts,
        'italic_desert_scripts': italic_deserts,
        'os_systems_tracked': len(OS_DEFAULT_FONTS),
    }
    
    # Update metadata
    data['metadata']['enhanced'] = datetime.now().isoformat()
    data['metadata']['version'] = "2.1"
    data['metadata']['sources']['os_fonts_windows'] = "https://docs.microsoft.com/en-us/typography/fonts/windows_11_font_list"
    data['metadata']['sources']['os_fonts_macos'] = "https://developer.apple.com/fonts/system-fonts/"
    data['metadata']['sources']['os_fonts_android'] = "https://source.android.com/docs/core/fonts"
    
    # Save enhanced dataset
    output_path = 'master_dataset.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Enhanced master dataset saved to {output_path}")
    print(f"   Size: {len(json.dumps(data)) / 1024 / 1024:.2f} MB")
    
    # Print insights
    print("\n" + "="*60)
    print("📊 DATA JOURNALISM INSIGHTS")
    print("="*60)
    
    print(f"\n🚨 NOTO DEPENDENCY:")
    print(f"   {noto_only_scripts} scripts have ZERO non-Noto alternatives")
    top_dependent = sorted(metrics['scripts_without_alternatives'], 
                          key=lambda x: -x['noto_fonts'])[:10]
    for s in top_dependent[:5]:
        print(f"   - {s['subset']}: Only {s['noto_fonts']} Noto font(s)")
    
    print(f"\n💻 MONOSPACE GAP:")
    print(f"   {mono_deserts} scripts have NO monospace/coding fonts")
    mono_sorted = sorted(metrics['monospace_gap'].items(), 
                        key=lambda x: -x[1]['total_fonts'])
    for k, v in [(k,v) for k,v in mono_sorted if v['monospace_fonts'] == 0][:5]:
        print(f"   - {k}: {v['total_fonts']} fonts, 0 monospace")
    
    print(f"\n✒️ ITALIC AVAILABILITY:")
    low_italic = sorted([(k,v) for k,v in metrics['italic_availability'].items() 
                        if v['total_fonts'] >= 10],
                       key=lambda x: x[1]['percentage'])[:5]
    for k, v in low_italic:
        print(f"   - {k}: {v['percentage']}% italic ({v['italic_fonts']}/{v['total_fonts']})")
    
    print(f"\n🎨 DESIGN DIVERSITY:")
    low_diversity = sorted([(k,v) for k,v in metrics['category_diversity'].items()
                           if v['total_fonts'] >= 5],
                          key=lambda x: x[1]['diversity_score'])[:5]
    for k, v in low_diversity:
        print(f"   - {k}: Only {v['diversity_score']} categories (of 5)")
    
    print(f"\n📉 DESIGN POVERTY INDEX (lower = worse):")
    poverty_sorted = sorted(metrics['design_poverty_index'].items(),
                           key=lambda x: x[1]['poverty_index'])[:10]
    for k, v in poverty_sorted:
        if v['total_fonts'] >= 3:
            print(f"   - {k}: {v['poverty_index']:.3f} ({v['total_fonts']} fonts)")
    
    return data

if __name__ == "__main__":
    enhance_master_dataset()
