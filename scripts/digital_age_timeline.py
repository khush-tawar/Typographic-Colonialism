#!/usr/bin/env python3
"""
Typography Colonialism - Digital Age Timeline
==============================================
Documents when each script entered the digital age:
1. First bitmap font
2. First scalable/TrueType font  
3. First free/open font
4. First Google Fonts entry
5. Unicode encoding version

Sources:
- Unicode version history
- Microsoft typography archives
- SIL International font releases
- Apple typography history
- Google Fonts timeline
- Academic typography research
"""

import json
from datetime import datetime

# ============================================================
# SCRIPT DIGITAL TIMELINE
# ============================================================
# Research compiled from multiple sources

SCRIPT_DIGITAL_TIMELINE = {
    # === MAJOR SCRIPTS (detailed timeline) ===
    
    "Latn": {
        "name": "Latin",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1968, "context": "PLATO system, then Xerox Alto"},
        "first_scalable": {"year": 1984, "font": "Times (PostScript)", "company": "Adobe/Linotype"},
        "first_truetype": {"year": 1991, "font": "Times New Roman", "company": "Monotype/Microsoft"},
        "first_free": {"year": 1996, "font": "Bitstream Vera", "org": "Bitstream/Gnome"},
        "first_google_fonts": {"year": 2010, "font": "Droid Sans", "date": "2010-05-19"},
        "digital_age_start": 1984,
        "years_head_start": 0,
        "notes": "The reference point - all other scripts measured against Latin"
    },
    
    "Cyrl": {
        "name": "Cyrillic",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1980, "context": "Soviet computer systems"},
        "first_scalable": {"year": 1990, "font": "ParaType fonts", "company": "ParaType"},
        "first_truetype": {"year": 1992, "font": "Arial Cyrillic", "company": "Microsoft"},
        "first_free": {"year": 2003, "font": "PT Sans", "org": "ParaType"},
        "first_google_fonts": {"year": 2010, "font": "Droid Sans", "date": "2010-05-19"},
        "digital_age_start": 1990,
        "years_head_start": -6,
        "notes": "ParaType (Russia) pioneered Cyrillic digital type"
    },
    
    "Grek": {
        "name": "Greek",
        "unicode_version": "1.0", 
        "unicode_year": 1991,
        "first_bitmap": {"year": 1982, "context": "Academic computing"},
        "first_scalable": {"year": 1989, "font": "GFS Didot", "company": "Greek Font Society"},
        "first_truetype": {"year": 1992, "font": "Arial Greek", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "GFS fonts", "org": "Greek Font Society"},
        "first_google_fonts": {"year": 2010, "font": "Droid Sans", "date": "2010-05-19"},
        "digital_age_start": 1989,
        "years_head_start": -5,
        "notes": "Greek Font Society preserved typographic heritage"
    },
    
    "Arab": {
        "name": "Arabic",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1982, "context": "Sakhr computers (Kuwait)"},
        "first_scalable": {"year": 1989, "font": "Arabic Typesetting", "company": "Monotype"},
        "first_truetype": {"year": 1993, "font": "Traditional Arabic", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "Scheherazade", "org": "SIL International"},
        "first_google_fonts": {"year": 2011, "font": "Droid Arabic Naskh", "date": "2011-03-15"},
        "digital_age_start": 1989,
        "years_head_start": -5,
        "notes": "Complex shaping requirements delayed quality fonts"
    },
    
    "Hebr": {
        "name": "Hebrew",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1984, "context": "Israeli computing"},
        "first_scalable": {"year": 1990, "font": "Hadassah", "company": "Various"},
        "first_truetype": {"year": 1992, "font": "David", "company": "Microsoft"},
        "first_free": {"year": 2005, "font": "Ezra SIL", "org": "SIL International"},
        "first_google_fonts": {"year": 2011, "font": "Alef", "date": "2011-08-10"},
        "digital_age_start": 1990,
        "years_head_start": -6,
        "notes": "Strong Israeli tech sector supported development"
    },
    
    "Deva": {
        "name": "Devanagari",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1983, "context": "CDAC GIST project, India"},
        "first_scalable": {"year": 1991, "font": "Raghu", "company": "CDAC India"},
        "first_truetype": {"year": 1996, "font": "Mangal", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "Lohit Devanagari", "org": "Red Hat"},
        "first_google_fonts": {"year": 2011, "font": "Lohit Devanagari", "date": "2011-05-25"},
        "digital_age_start": 1991,
        "years_head_start": -7,
        "notes": "CDAC India pioneered Indic digital typography"
    },
    
    "Beng": {
        "name": "Bengali (Bangla)",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1986, "context": "Ananda Computers, Bangladesh"},
        "first_scalable": {"year": 1995, "font": "SutonnyMJ", "company": "Various"},
        "first_truetype": {"year": 1998, "font": "Vrinda", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "Lohit Bengali", "org": "Red Hat"},
        "first_google_fonts": {"year": 2012, "font": "Lohit Bengali", "date": "2012-03-14"},
        "digital_age_start": 1995,
        "years_head_start": -11,
        "notes": "Complex conjuncts made digital rendering difficult"
    },
    
    "Taml": {
        "name": "Tamil",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1985, "context": "TSCII standard development"},
        "first_scalable": {"year": 1999, "font": "Latha", "company": "Microsoft"},
        "first_truetype": {"year": 1999, "font": "Latha", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "Lohit Tamil", "org": "Red Hat"},
        "first_google_fonts": {"year": 2012, "font": "Lohit Tamil", "date": "2012-03-14"},
        "digital_age_start": 1999,
        "years_head_start": -15,
        "notes": "Tamil script encoding was contentious, delayed standardization"
    },
    
    "Telu": {
        "name": "Telugu",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1988, "context": "C-DAC efforts"},
        "first_scalable": {"year": 1999, "font": "Gautami", "company": "Microsoft"},
        "first_truetype": {"year": 1999, "font": "Gautami", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "Lohit Telugu", "org": "Red Hat"},
        "first_google_fonts": {"year": 2012, "font": "Lohit Telugu", "date": "2012-03-14"},
        "digital_age_start": 1999,
        "years_head_start": -15,
        "notes": "Telugu has most complex character combinations of Indic scripts"
    },
    
    "Thai": {
        "name": "Thai",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1986, "context": "Thai government systems"},
        "first_scalable": {"year": 1992, "font": "Cordia", "company": "Various"},
        "first_truetype": {"year": 1995, "font": "Tahoma Thai", "company": "Microsoft"},
        "first_free": {"year": 2003, "font": "Garuda", "org": "TLWG"},
        "first_google_fonts": {"year": 2012, "font": "Chonburi", "date": "2012-09-05"},
        "digital_age_start": 1992,
        "years_head_start": -8,
        "notes": "Thai Linux Working Group created essential free fonts"
    },
    
    "Jpan": {
        "name": "Japanese",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1978, "context": "Japanese word processors"},
        "first_scalable": {"year": 1989, "font": "Morisawa fonts", "company": "Morisawa"},
        "first_truetype": {"year": 1993, "font": "MS Gothic", "company": "Microsoft"},
        "first_free": {"year": 2002, "font": "Kochi", "org": "Community"},
        "first_google_fonts": {"year": 2014, "font": "Noto Sans JP", "date": "2014-07-16"},
        "digital_age_start": 1989,
        "years_head_start": -5,
        "notes": "High commercial font market; free fonts came late"
    },
    
    "Kore": {
        "name": "Korean",
        "unicode_version": "1.1",
        "unicode_year": 1993,
        "first_bitmap": {"year": 1982, "context": "Korean PC development"},
        "first_scalable": {"year": 1992, "font": "Batang/Gulim", "company": "Korean vendors"},
        "first_truetype": {"year": 1995, "font": "Batang", "company": "Microsoft"},
        "first_free": {"year": 2003, "font": "UnBatang", "org": "Korean community"},
        "first_google_fonts": {"year": 2014, "font": "Noto Sans KR", "date": "2014-07-16"},
        "digital_age_start": 1992,
        "years_head_start": -8,
        "notes": "Hangul's 11,172 syllable blocks make font creation massive"
    },
    
    "Hans": {
        "name": "Chinese Simplified",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1981, "context": "Chinese computing development"},
        "first_scalable": {"year": 1991, "font": "SimSun", "company": "Zhongyi"},
        "first_truetype": {"year": 1995, "font": "SimSun", "company": "Microsoft/Zhongyi"},
        "first_free": {"year": 2004, "font": "WenQuanYi", "org": "Community"},
        "first_google_fonts": {"year": 2014, "font": "Noto Sans SC", "date": "2014-07-16"},
        "digital_age_start": 1991,
        "years_head_start": -7,
        "notes": "70,000+ characters make CJK font creation enormous undertaking"
    },
    
    "Hant": {
        "name": "Chinese Traditional",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1984, "context": "Taiwan computing"},
        "first_scalable": {"year": 1992, "font": "MingLiU", "company": "DynaLab"},
        "first_truetype": {"year": 1995, "font": "MingLiU", "company": "Microsoft/DynaLab"},
        "first_free": {"year": 2005, "font": "AR PL fonts", "org": "Arphic"},
        "first_google_fonts": {"year": 2014, "font": "Noto Sans TC", "date": "2014-07-16"},
        "digital_age_start": 1992,
        "years_head_start": -8,
        "notes": "More complex characters than Simplified Chinese"
    },
    
    "Ethi": {
        "name": "Ethiopic",
        "unicode_version": "3.0",
        "unicode_year": 1999,
        "first_bitmap": {"year": 1987, "context": "Ethiopian government computing"},
        "first_scalable": {"year": 1997, "font": "GF Zemen", "company": "Various"},
        "first_truetype": {"year": 2001, "font": "Nyala", "company": "Microsoft"},
        "first_free": {"year": 2003, "font": "Abyssinica SIL", "org": "SIL International"},
        "first_google_fonts": {"year": 2015, "font": "Noto Sans Ethiopic", "date": "2015-09-16"},
        "digital_age_start": 1997,
        "years_head_start": -13,
        "notes": "Unicode support came 8 years after Latin"
    },
    
    "Armn": {
        "name": "Armenian",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1988, "context": "Armenian computing"},
        "first_scalable": {"year": 1997, "font": "ArmNet", "company": "Various"},
        "first_truetype": {"year": 2000, "font": "Sylfaen", "company": "Microsoft"},
        "first_free": {"year": 2005, "font": "DejaVu Armenian", "org": "DejaVu"},
        "first_google_fonts": {"year": 2015, "font": "Noto Sans Armenian", "date": "2015-01-07"},
        "digital_age_start": 1997,
        "years_head_start": -13,
        "notes": "Small speaking population delayed commercial interest"
    },
    
    "Geor": {
        "name": "Georgian",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1990, "context": "Georgian computing"},
        "first_scalable": {"year": 1998, "font": "Georgian Academy", "company": "Various"},
        "first_truetype": {"year": 2000, "font": "Sylfaen", "company": "Microsoft"},
        "first_free": {"year": 2005, "font": "DejaVu Georgian", "org": "DejaVu"},
        "first_google_fonts": {"year": 2015, "font": "Noto Sans Georgian", "date": "2015-01-07"},
        "digital_age_start": 1998,
        "years_head_start": -14,
        "notes": "Has three script variants (Mkhedruli, Asomtavruli, Nuskhuri)"
    },
    
    "Mymr": {
        "name": "Myanmar (Burmese)",
        "unicode_version": "3.0",
        "unicode_year": 1999,
        "first_bitmap": {"year": 1995, "context": "Myanmar government"},
        "first_scalable": {"year": 2002, "font": "Myanmar1", "company": "Various"},
        "first_truetype": {"year": 2005, "font": "Padauk", "company": "SIL"},
        "first_free": {"year": 2005, "font": "Padauk", "org": "SIL International"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Myanmar", "date": "2016-02-29"},
        "digital_age_start": 2005,
        "years_head_start": -21,
        "notes": "Zawgyi non-Unicode encoding dominated until 2019"
    },
    
    "Khmr": {
        "name": "Khmer (Cambodian)",
        "unicode_version": "3.0",
        "unicode_year": 1999,
        "first_bitmap": {"year": 1992, "context": "Khmer computing initiatives"},
        "first_scalable": {"year": 2004, "font": "Khmer OS", "company": "Open Institute"},
        "first_truetype": {"year": 2005, "font": "Khmer OS", "company": "Open Institute"},
        "first_free": {"year": 2004, "font": "Khmer OS", "org": "Open Institute"},
        "first_google_fonts": {"year": 2015, "font": "Battambang", "date": "2015-04-22"},
        "digital_age_start": 2004,
        "years_head_start": -20,
        "notes": "Has the largest alphabet in the world (74 letters)"
    },
    
    "Sinh": {
        "name": "Sinhala",
        "unicode_version": "3.0",
        "unicode_year": 1999,
        "first_bitmap": {"year": 1990, "context": "Sri Lankan computing"},
        "first_scalable": {"year": 2003, "font": "Iskoola Pota", "company": "Microsoft"},
        "first_truetype": {"year": 2003, "font": "Iskoola Pota", "company": "Microsoft"},
        "first_free": {"year": 2004, "font": "LKLUG fonts", "org": "LKLUG"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Sinhala", "date": "2016-02-29"},
        "digital_age_start": 2003,
        "years_head_start": -19,
        "notes": "Complex vowel diacritics made rendering challenging"
    },
    
    "Laoo": {
        "name": "Lao",
        "unicode_version": "1.0",
        "unicode_year": 1991,
        "first_bitmap": {"year": 1994, "context": "Lao PDR computing"},
        "first_scalable": {"year": 2003, "font": "Phetsarath", "company": "Laos government"},
        "first_truetype": {"year": 2003, "font": "Phetsarath", "company": "Laos government"},
        "first_free": {"year": 2003, "font": "Phetsarath", "org": "Laos STEA"},
        "first_google_fonts": {"year": 2015, "font": "Phetsarath", "date": "2015-01-07"},
        "digital_age_start": 2003,
        "years_head_start": -19,
        "notes": "Government-led standardization came late"
    },
    
    "Tibt": {
        "name": "Tibetan",
        "unicode_version": "2.0",
        "unicode_year": 1996,
        "first_bitmap": {"year": 1990, "context": "Tibetan exile communities"},
        "first_scalable": {"year": 1997, "font": "Tibetan Machine Uni", "company": "THDL"},
        "first_truetype": {"year": 1997, "font": "Tibetan Machine Uni", "company": "THDL"},
        "first_free": {"year": 1997, "font": "Tibetan Machine Uni", "org": "THDL"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Tibetan", "date": "2016-02-29"},
        "digital_age_start": 1997,
        "years_head_start": -13,
        "notes": "Tibetan & Himalayan Digital Library pioneered preservation"
    },
    
    # === MINORITY/HISTORICAL SCRIPTS (later digital adoption) ===
    
    "Cher": {
        "name": "Cherokee",
        "unicode_version": "3.0",
        "unicode_year": 1999,
        "first_bitmap": {"year": 1994, "context": "Cherokee Nation computing"},
        "first_scalable": {"year": 2001, "font": "Plantagenet Cherokee", "company": "Ross Mills"},
        "first_truetype": {"year": 2001, "font": "Plantagenet Cherokee", "company": "Apple"},
        "first_free": {"year": 2004, "font": "FreeSans Cherokee", "org": "GNU"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Cherokee", "date": "2016-02-29"},
        "digital_age_start": 2001,
        "years_head_start": -17,
        "notes": "Cherokee Nation invested in language preservation"
    },
    
    "Cans": {
        "name": "Canadian Aboriginal",
        "unicode_version": "3.0",
        "unicode_year": 1999,
        "first_bitmap": {"year": 1996, "context": "Canadian Indigenous computing"},
        "first_scalable": {"year": 2003, "font": "Euphemia", "company": "Tiro Typeworks"},
        "first_truetype": {"year": 2003, "font": "Euphemia", "company": "Microsoft/Tiro"},
        "first_free": {"year": 2007, "font": "Aboriginal Sans", "org": "LanguageGeek"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Canadian Aboriginal", "date": "2016-02-29"},
        "digital_age_start": 2003,
        "years_head_start": -19,
        "notes": "Unified Canadian Aboriginal Syllabics covers multiple languages"
    },
    
    "Nkoo": {
        "name": "N'Ko",
        "unicode_version": "5.0",
        "unicode_year": 2006,
        "first_bitmap": {"year": 1997, "context": "N'Ko literacy movement"},
        "first_scalable": {"year": 2006, "font": "Kanjamadi", "company": "Various"},
        "first_truetype": {"year": 2008, "font": "Ebrima", "company": "Microsoft"},
        "first_free": {"year": 2012, "font": "Noto Sans NKo", "org": "Google"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans NKo", "date": "2016-02-29"},
        "digital_age_start": 2006,
        "years_head_start": -22,
        "notes": "Script created in 1949, Unicode came 57 years later"
    },
    
    "Tfng": {
        "name": "Tifinagh (Berber)",
        "unicode_version": "4.1",
        "unicode_year": 2005,
        "first_bitmap": {"year": 2000, "context": "IRCAM Morocco"},
        "first_scalable": {"year": 2005, "font": "Tifinaghe-IRCAM", "company": "IRCAM"},
        "first_truetype": {"year": 2005, "font": "Tifinaghe-IRCAM", "company": "IRCAM"},
        "first_free": {"year": 2005, "font": "Tifinaghe-IRCAM", "org": "IRCAM Morocco"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Tifinagh", "date": "2016-02-29"},
        "digital_age_start": 2005,
        "years_head_start": -21,
        "notes": "Ancient Berber script, standardized for modern use in Morocco"
    },
    
    "Vaii": {
        "name": "Vai",
        "unicode_version": "5.1",
        "unicode_year": 2008,
        "first_bitmap": {"year": 2005, "context": "Liberia literacy projects"},
        "first_scalable": {"year": 2008, "font": "Dukor", "company": "Jason Glavy"},
        "first_truetype": {"year": 2008, "font": "Ebrima", "company": "Microsoft"},
        "first_free": {"year": 2013, "font": "Noto Sans Vai", "org": "Google"},
        "first_google_fonts": {"year": 2016, "font": "Noto Sans Vai", "date": "2016-02-29"},
        "digital_age_start": 2008,
        "years_head_start": -24,
        "notes": "One of the few independently invented African scripts"
    },
    
    "Adlm": {
        "name": "Adlam",
        "unicode_version": "9.0",
        "unicode_year": 2016,
        "first_bitmap": {"year": 2014, "context": "Adlam creators' work"},
        "first_scalable": {"year": 2016, "font": "Noto Sans Adlam", "company": "Google"},
        "first_truetype": {"year": 2016, "font": "Noto Sans Adlam", "company": "Google"},
        "first_free": {"year": 2016, "font": "Noto Sans Adlam", "org": "Google"},
        "first_google_fonts": {"year": 2019, "font": "Noto Sans Adlam", "date": "2019-05-01"},
        "digital_age_start": 2016,
        "years_head_start": -32,
        "notes": "Script created in 1989 by teenagers in Guinea"
    },
}

def calculate_wait_times():
    """Calculate how long each script waited for digital fonts."""
    
    latin_start = 1984  # Adobe PostScript fonts
    
    results = []
    for code, data in SCRIPT_DIGITAL_TIMELINE.items():
        digital_start = data.get('digital_age_start', 2020)
        years_behind = digital_start - latin_start
        
        # Calculate wait for free fonts
        first_free_year = data.get('first_free', {}).get('year', 2020)
        latin_free_year = 1996  # Bitstream Vera
        years_waiting_free = first_free_year - latin_free_year
        
        # Calculate wait for Google Fonts
        first_gf_year = int(data.get('first_google_fonts', {}).get('date', '2020-01-01')[:4])
        latin_gf_year = 2010
        years_waiting_gf = first_gf_year - latin_gf_year
        
        results.append({
            'code': code,
            'name': data['name'],
            'unicode_version': data.get('unicode_version'),
            'unicode_year': data.get('unicode_year'),
            'digital_age_start': digital_start,
            'years_behind_latin': years_behind,
            'first_free_font_year': first_free_year,
            'years_waiting_for_free': years_waiting_free,
            'first_google_fonts_year': first_gf_year,
            'years_waiting_for_google': years_waiting_gf,
            'first_scalable_font': data.get('first_scalable', {}).get('font'),
            'first_scalable_year': data.get('first_scalable', {}).get('year'),
            'first_free_font': data.get('first_free', {}).get('font'),
            'notes': data.get('notes'),
        })
    
    return sorted(results, key=lambda x: x['years_behind_latin'], reverse=True)

def main():
    """Generate digital timeline data."""
    
    print("Calculating script digital age timeline...")
    
    timeline = calculate_wait_times()
    
    output = {
        'metadata': {
            'description': 'When each script entered the digital age',
            'reference_point': 'Latin script PostScript fonts (1984)',
            'sources': [
                'Unicode version history',
                'Microsoft Typography archives',
                'SIL International font releases', 
                'Apple typography history',
                'Google Fonts release dates',
                'Academic typography research'
            ],
            'generated': datetime.now().isoformat(),
        },
        'detailed_timeline': SCRIPT_DIGITAL_TIMELINE,
        'wait_times': timeline,
        'summary': {
            'scripts_analyzed': len(timeline),
            'longest_wait': max(timeline, key=lambda x: x['years_behind_latin']),
            'earliest_adopter': min([t for t in timeline if t['code'] != 'Latn'], 
                                   key=lambda x: x['years_behind_latin']),
            'average_years_behind': sum(t['years_behind_latin'] for t in timeline) / len(timeline),
        }
    }
    
    with open('digital_age_timeline.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Saved to digital_age_timeline.json")
    
    print("\n" + "="*70)
    print("YEARS BEHIND LATIN'S DIGITAL AGE (1984)")
    print("="*70)
    
    for t in timeline[:20]:
        years = t['years_behind_latin']
        bar = '█' * min(32, years) + '░' * max(0, 32 - years)
        print(f"  {t['name']:<25} {bar} +{years:>2} years ({t['digital_age_start']})")
    
    print("\n" + "="*70)
    print("YEARS WAITING FOR FREE FONTS (after Bitstream Vera 1996)")
    print("="*70)
    
    for t in sorted(timeline, key=lambda x: x['years_waiting_for_free'], reverse=True)[:15]:
        years = t['years_waiting_for_free']
        if years > 0:
            bar = '█' * min(20, years) + '░' * max(0, 20 - years)
            print(f"  {t['name']:<25} {bar} +{years:>2} years ({t['first_free_font_year']})")

if __name__ == "__main__":
    main()
