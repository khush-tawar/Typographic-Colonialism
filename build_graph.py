#!/usr/bin/env python3
"""
Typography Colonialism - Graph Structure Builder
=================================================
Creates nodes and edges for network visualizations:

NODES:
- Scripts (164)
- Fonts (1916)
- Categories (5)
- Countries (150+)

EDGES:
- font_supports_script: Font → Script
- script_shares_font: Script ↔ Script (co-occurrence)
- script_used_in_country: Script → Country
- scripts_in_same_family: Script ↔ Script (linguistic)
- font_same_designer: Font ↔ Font
- font_same_category: Font ↔ Font (within script)
"""

import json
from collections import defaultdict
from itertools import combinations

def build_graph():
    print("Loading master dataset...")
    with open('master_dataset.json', 'r') as f:
        data = json.load(f)
    
    fonts = data.get('fonts', [])
    scripts = data.get('scripts', {})
    
    # ========================================
    # BUILD NODES
    # ========================================
    print("Building nodes...")
    
    nodes = {
        'scripts': [],
        'fonts': [],
        'categories': [],
        'countries': [],
    }
    
    # Script nodes
    for code, script in scripts.items():
        nodes['scripts'].append({
            'id': f"script_{code}",
            'type': 'script',
            'code': code,
            'name': script.get('name', code),
            'speakers': script.get('speakers', 0),
            'fontCount': script.get('font_count', 0),
            'languageCount': len(script.get('languages', [])),
            'countryCount': len(script.get('countries', [])),
            'rtl': script.get('rtl', False),
            'unicodeVersion': script.get('unicode_version'),
            'notoCoverage': script.get('noto_weight_count', 0) / 9,
        })
    
    # Font nodes
    for i, font in enumerate(fonts):
        nodes['fonts'].append({
            'id': f"font_{i}",
            'type': 'font',
            'family': font.get('family'),
            'category': font.get('category'),
            'isNoto': font.get('is_noto', False),
            'scriptCount': len(font.get('scripts', [])),
            'weightCount': len(font.get('weights', [])),
            'variantCount': len(font.get('variants', [])),
        })
    
    # Category nodes
    categories = ['sans-serif', 'serif', 'display', 'handwriting', 'monospace']
    for cat in categories:
        cat_fonts = [f for f in fonts if f.get('category') == cat]
        nodes['categories'].append({
            'id': f"category_{cat}",
            'type': 'category',
            'name': cat,
            'fontCount': len(cat_fonts),
        })
    
    # Country nodes
    all_countries = set()
    for script in scripts.values():
        all_countries.update(script.get('countries', []))
    
    for country in all_countries:
        nodes['countries'].append({
            'id': f"country_{country}",
            'type': 'country',
            'code': country,
        })
    
    # ========================================
    # BUILD EDGES
    # ========================================
    print("Building edges...")
    
    edges = {
        'font_supports_script': [],
        'script_shares_fonts': [],
        'script_in_country': [],
        'font_in_category': [],
        'scripts_co_occur': [],
    }
    
    # Create font family to index lookup
    font_lookup = {f.get('family'): i for i, f in enumerate(fonts)}
    
    # 1. Font → Script edges
    print("  - Font supports script edges...")
    for i, font in enumerate(fonts):
        for script_code in font.get('scripts', []):
            edges['font_supports_script'].append({
                'source': f"font_{i}",
                'target': f"script_{script_code}",
                'type': 'supports',
                'weight': 1,
            })
    
    # 2. Script ↔ Script edges (shared fonts)
    print("  - Script co-occurrence edges...")
    script_fonts = defaultdict(set)
    for i, font in enumerate(fonts):
        for script_code in font.get('scripts', []):
            script_fonts[script_code].add(i)
    
    script_pairs = defaultdict(int)
    for i, font in enumerate(fonts):
        script_list = font.get('scripts', [])
        if len(script_list) > 1:
            for s1, s2 in combinations(sorted(script_list), 2):
                script_pairs[(s1, s2)] += 1
    
    for (s1, s2), shared_count in script_pairs.items():
        if shared_count >= 1:  # At least 1 shared font
            edges['scripts_co_occur'].append({
                'source': f"script_{s1}",
                'target': f"script_{s2}",
                'type': 'co_occur',
                'sharedFonts': shared_count,
                'weight': shared_count,
            })
    
    # 3. Script → Country edges
    print("  - Script in country edges...")
    for code, script in scripts.items():
        for country in script.get('countries', []):
            edges['script_in_country'].append({
                'source': f"script_{code}",
                'target': f"country_{country}",
                'type': 'used_in',
                'weight': 1,
            })
    
    # 4. Font → Category edges
    print("  - Font in category edges...")
    for i, font in enumerate(fonts):
        cat = font.get('category')
        if cat:
            edges['font_in_category'].append({
                'source': f"font_{i}",
                'target': f"category_{cat}",
                'type': 'belongs_to',
                'weight': 1,
            })
    
    # ========================================
    # BUILD ADJACENCY LISTS (for fast lookup)
    # ========================================
    print("Building adjacency lists...")
    
    adjacency = {
        'script_to_fonts': defaultdict(list),
        'font_to_scripts': defaultdict(list),
        'script_to_countries': defaultdict(list),
        'country_to_scripts': defaultdict(list),
        'script_neighbors': defaultdict(list),  # Scripts sharing fonts
    }
    
    for i, font in enumerate(fonts):
        for script_code in font.get('scripts', []):
            adjacency['script_to_fonts'][script_code].append(font.get('family'))
            adjacency['font_to_scripts'][font.get('family')].append(script_code)
    
    for code, script in scripts.items():
        for country in script.get('countries', []):
            adjacency['script_to_countries'][code].append(country)
            adjacency['country_to_scripts'][country].append(code)
    
    for (s1, s2), count in script_pairs.items():
        adjacency['script_neighbors'][s1].append({'script': s2, 'sharedFonts': count})
        adjacency['script_neighbors'][s2].append({'script': s1, 'sharedFonts': count})
    
    # Convert to regular dicts for JSON
    adjacency = {k: dict(v) for k, v in adjacency.items()}
    
    # ========================================
    # COMPUTE GRAPH METRICS
    # ========================================
    print("Computing graph metrics...")
    
    metrics = {
        'node_counts': {
            'scripts': len(nodes['scripts']),
            'fonts': len(nodes['fonts']),
            'categories': len(nodes['categories']),
            'countries': len(nodes['countries']),
            'total': sum(len(v) for v in nodes.values()),
        },
        'edge_counts': {
            'font_supports_script': len(edges['font_supports_script']),
            'scripts_co_occur': len(edges['scripts_co_occur']),
            'script_in_country': len(edges['script_in_country']),
            'font_in_category': len(edges['font_in_category']),
            'total': sum(len(v) for v in edges.values()),
        },
        'script_connectivity': {},
        'font_reach': {},
    }
    
    # Script connectivity (how many scripts each script shares fonts with)
    for code in scripts.keys():
        neighbors = adjacency['script_neighbors'].get(code, [])
        metrics['script_connectivity'][code] = {
            'degree': len(neighbors),
            'total_shared_fonts': sum(n['sharedFonts'] for n in neighbors),
        }
    
    # ========================================
    # CREATE SIMPLIFIED NETWORK FOR D3 FORCE
    # ========================================
    print("Creating D3-ready network data...")
    
    # Script network (most useful for visualization)
    script_network = {
        'nodes': [],
        'links': [],
    }
    
    # Add script nodes with computed metrics
    for script_node in nodes['scripts']:
        code = script_node['code']
        conn = metrics['script_connectivity'].get(code, {})
        script_node['degree'] = conn.get('degree', 0)
        script_node['sharedFontTotal'] = conn.get('total_shared_fonts', 0)
        script_network['nodes'].append(script_node)
    
    # Add co-occurrence links
    for edge in edges['scripts_co_occur']:
        script_network['links'].append({
            'source': edge['source'].replace('script_', ''),
            'target': edge['target'].replace('script_', ''),
            'value': edge['sharedFonts'],
        })
    
    # ========================================
    # SAVE GRAPH DATA
    # ========================================
    graph_data = {
        'nodes': nodes,
        'edges': edges,
        'adjacency': adjacency,
        'metrics': metrics,
        'networks': {
            'script_network': script_network,
        },
    }
    
    # Save as separate file
    with open('graph_structure.json', 'w', encoding='utf-8') as f:
        json.dump(graph_data, f, indent=2, ensure_ascii=False)
    
    # Add to master dataset
    data['graph'] = graph_data
    
    with open('master_dataset.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Graph structure created!")
    print(f"   Saved to graph_structure.json")
    print(f"   Added to master_dataset.json")
    
    print(f"\n📊 GRAPH SUMMARY:")
    print(f"   Nodes: {metrics['node_counts']['total']:,}")
    for k, v in metrics['node_counts'].items():
        if k != 'total':
            print(f"     - {k}: {v:,}")
    
    print(f"\n   Edges: {metrics['edge_counts']['total']:,}")
    for k, v in metrics['edge_counts'].items():
        if k != 'total':
            print(f"     - {k}: {v:,}")
    
    print(f"\n🔗 SCRIPT NETWORK:")
    print(f"   Nodes: {len(script_network['nodes'])}")
    print(f"   Links: {len(script_network['links'])}")
    
    # Most connected scripts
    print(f"\n   Most connected scripts:")
    sorted_scripts = sorted(
        nodes['scripts'], 
        key=lambda x: x.get('degree', 0), 
        reverse=True
    )[:10]
    for s in sorted_scripts:
        print(f"     {s['name']}: degree={s.get('degree', 0)}, shared fonts={s.get('sharedFontTotal', 0)}")
    
    return graph_data

if __name__ == "__main__":
    build_graph()
