#!/usr/bin/env python3
"""Quick checks that need no browser: data files are valid, the New Testament
dates make sense, and every local file a page points to exists.

  python3 tools/check.py
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
problems = []

# 1. every data file parses
data = {}
for p in sorted(glob.glob('data/*.json')):
    try:
        data[p] = json.load(open(p, encoding='utf-8'))
    except Exception as e:
        problems.append(f'{p} is not valid JSON: {e}')

# 2. New Testament dates (data/books.json is the single source for three pages)
B = data.get('data/books.json')
if B:
    books = B['books']
    if len(books) != 27:
        problems.append(f'books.json has {len(books)} books, expected 27')
    by = {b['slug']: b for b in books}
    for b in books:
        for view, d in (('conservative', b), ('critical', b.get('crit') or {})):
            if not {'start', 'end'} <= d.keys():
                problems.append(f"{b['name']}: missing {view} start/end")
            elif d['start'] > d['end']:
                problems.append(f"{b['name']}: {view} start {d['start']} is after end {d['end']}")
    if 'luke' in by and 'acts' in by and by['luke']['end'] > by['acts']['start']:
        problems.append('Luke must be dated no later than Acts begins (Acts 1:1)')
    if sum(1 for e in B['events'] if e.get('marker')) != 1:
        problems.append('books.json should have exactly one marker event (AD 70)')
    for e in B['events'] + B['journeys']:
        if e['start'] > e['end']:
            problems.append(f"event {e['name']}: start after end")

# 3. journey maps: every route key has a chip, every place has coordinates
for p in ('data/paul-journeys.json', 'data/jesus-journeys.json'):
    J = data.get(p)
    if not J:
        continue
    for k in J['R']:
        if k not in J['J']:
            problems.append(f'{p}: route {k} has no journey entry')
    for slug, c in J['C'].items():
        if len(c.get('ll', [])) != 2:
            problems.append(f'{p}: place {slug} has no coordinates')

# 4. local links and files referenced by each page exist
attr = re.compile(r'(?:src|href)="([^"#:?]+)(?:\?[^"]*)?"')
for page in sorted(glob.glob('*.html')):
    s = open(page, encoding='utf-8').read()
    for target in attr.findall(s):
        if target.startswith(('/', 'mailto')) or target.endswith('/'):
            continue
        if not os.path.exists(target):
            problems.append(f'{page} points to missing file {target}')

if problems:
    print('Problems found:')
    print('\n'.join(' - ' + x for x in problems))
    sys.exit(1)
print(f'All good: {len(data)} data files, {len(glob.glob("*.html"))} pages checked.')
