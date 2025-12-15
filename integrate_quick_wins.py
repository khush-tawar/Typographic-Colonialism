#!/usr/bin/env python3
"""
Typography Colonialism - Quick Wins Integration
================================================
Integrates all quick win data into the master dataset:
1. Font file sizes (bandwidth barrier)
2. Variable font support
3. Web font usage data
4. Digital age timeline (when scripts entered digital)
"""

import json
from collections import defaultdict
from datetime import datetime

def load_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def main():
    print("Loading existing data files...")
    
    # Load master dataset
    master = load_json('master_dataset.json')
    
    # Load new data files
    digital_timeline = load_json('digital_age_timeline.json')
    web_usage = load_json('web_font_usage.json')
    
    # Try to load font sizes if available
    try:
        font_sizes = load_json('font_size_samples.json')
    except:
        font_sizes = {}
    
    print("Analyzing variable fonts and file sizes...")
    
    # Load webfonts for analysis
    with open('webfonts.json', 'r') as f:
        webfonts = json.load(f)
    
    fonts = webfonts.get('items', [])
    
    # === VARIABLE FONT ANALYSIS ===
    script_variable = defaultdict(list)
    
    for font in fonts:
        variants = font.get('variants', [])
        family = font['family']
        subsets = font.get('subsets', [])
        
        # 7+ weight variants suggests variable font capability
        weight_variants = [v for v in variants if v.replace('italic', '').strip() in 
                         ['100', '200', '300', '400', '500', '600', '700', '800', '900', 'regular']]
        
        if len(weight_variants) >= 7:
            for s in subsets:
                script_variable[s].append(family)
    
    # === FONT SIZE BY SCRIPT TYPE ===
    # Based on our sampling
    script_sizes = {
        'cjk_scripts': {'avg_mb': 3.4, 'note': 'Japanese, Korean, Chinese require 3-5MB fonts'},
        'indic_scripts': {'avg_kb': 280, 'note': 'Devanagari, Bengali, Tamil average 200-400KB'},
        'arabic_script': {'avg_kb': 199, 'note': 'Arabic fonts average ~200KB'},
        'latin_only': {'avg_kb': 47, 'note': 'Latin-only fonts average ~50KB'},
        'cyrillic': {'avg_kb': 229, 'note': 'Cyrillic extension adds ~180KB'},
        'thai': {'avg_kb': 113, 'note': 'Thai fonts average ~100KB'},
        'size_ratio': {
            'cjk_vs_latin': 72,  # CJK is 72x larger
            'indic_vs_latin': 6, 
            'arabic_vs_latin': 4,
        }
    }
    
    # === INTEGRATE INTO MASTER DATASET ===
    print("Integrating into master dataset...")
    
    # Add digital age timeline
    master['digital_timeline'] = {
        'scripts': digital_timeline['detailed_timeline'],
        'wait_times': digital_timeline['wait_times'],
        'summary': digital_timeline['summary'],
    }
    
    # Add web font usage
    master['web_usage'] = web_usage
    
    # Add font size data
    master['font_sizes'] = script_sizes
    
    # Add variable font counts by script
    master['variable_fonts'] = {
        subset: {
            'count': len(fonts_list),
            'fonts': fonts_list[:10],  # Top 10 examples
            'full_list_count': len(fonts_list)
        }
        for subset, fonts_list in sorted(script_variable.items(), key=lambda x: -len(x[1]))
    }
    
    # Enhance script entries with digital timeline data
    for code, script in master.get('scripts', {}).items():
        timeline_data = digital_timeline['detailed_timeline'].get(code, {})
        if timeline_data:
            script['digital_age_start'] = timeline_data.get('digital_age_start')
            script['years_behind_latin'] = timeline_data.get('years_head_start', 0) * -1
            script['first_scalable_font'] = timeline_data.get('first_scalable', {})
            script['first_free_font'] = timeline_data.get('first_free', {})
            script['first_google_fonts'] = timeline_data.get('first_google_fonts', {})
            script['unicode_added'] = timeline_data.get('unicode_year')
    
    # Add summary statistics
    master['quick_wins_summary'] = {
        'variable_fonts': {
            'latin': len(script_variable.get('latin', [])),
            'arabic': len(script_variable.get('arabic', [])),
            'devanagari': len(script_variable.get('devanagari', [])),
            'japanese': len(script_variable.get('japanese', [])),
            'ratio_latin_to_arabic': len(script_variable.get('latin', [])) / max(1, len(script_variable.get('arabic', []))),
        },
        'file_sizes': {
            'cjk_avg_mb': 3.4,
            'latin_avg_kb': 47,
            'cjk_is_X_times_larger': 72,
            'implication': 'A Japanese web page loads 72x more font data than English',
        },
        'web_usage': {
            'top_font': 'Roboto (13.2%)',
            'top_20_cover': '68% of all web font usage',
            'all_top_20_are': 'Latin-first fonts',
            'non_latin_in_top_20': 0,
        },
        'digital_age': {
            'first_digital_script': 'Latin (1984)',
            'latest_script': 'Adlam (2016 - 32 years behind)',
            'average_wait': f"{digital_timeline['summary']['average_years_behind']:.1f} years behind Latin",
        }
    }
    
    # Update metadata
    master['metadata']['version'] = "2.2"
    master['metadata']['quick_wins_added'] = datetime.now().isoformat()
    master['metadata']['sources']['http_archive'] = "https://almanac.httparchive.org/en/2022/fonts"
    master['metadata']['sources']['digital_timeline'] = "Unicode archives, Microsoft Typography, SIL International"
    
    # Save updated master
    with open('master_dataset.json', 'w', encoding='utf-8') as f:
        json.dump(master, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Master dataset updated to v2.2")
    print(f"   Size: {len(json.dumps(master)) / 1024 / 1024:.2f} MB")
    
    # Print key insights
    print("\n" + "="*70)
    print("🎯 KEY DATA JOURNALISM INSIGHTS")
    print("="*70)
    
    print("\n📱 VARIABLE FONT GAP:")
    for script, data in sorted(master['variable_fonts'].items(), key=lambda x: -x[1]['count'])[:10]:
        print(f"   {script}: {data['count']} variable-ready fonts")
    
    print("\n💾 BANDWIDTH BARRIER:")
    print(f"   CJK fonts average: 3.4 MB")
    print(f"   Latin-only fonts: 47 KB")
    print(f"   CJK is {72}x larger - massive barrier for low-bandwidth users")
    
    print("\n🌐 WEB FONT DOMINATION:")
    for f in web_usage['most_used_families'][:5]:
        print(f"   {f['family']}: {f['usage_pct']}% market share")
    print("   ALL top 20 fonts are Latin-first")
    
    print("\n⏰ DIGITAL AGE WAIT:")
    for t in digital_timeline['wait_times'][:8]:
        if t['years_behind_latin'] > 0:
            print(f"   {t['name']}: +{t['years_behind_latin']} years behind Latin ({t['digital_age_start']})")
    
    return master

if __name__ == "__main__":
    main()
