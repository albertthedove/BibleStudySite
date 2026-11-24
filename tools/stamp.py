#!/usr/bin/env python3
"""Set every ?v= version tag from the file's content, so browsers fetch a fresh
copy whenever a file changes and keep their cached copy when it hasn't.

  python3 tools/stamp.py           rewrite the tags
  python3 tools/stamp.py --check   fail if any tag is out of date (used by the automatic checks)

Run it after editing anything in assets/ or data/.
"""
import glob, hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)


def h(data: bytes) -> str:
    return hashlib.sha1(data).hexdigest()[:8]


def file_hash(path: str) -> str:
    with open(path, 'rb') as f:
        return h(f.read())


def data_hash() -> str:
    # one tag for all data files, used by the JS that fetches them
    return h(b''.join(open(p, 'rb').read() for p in sorted(glob.glob('data/*.json'))))


changed = []


def rewrite(path, fn):
    s = open(path, encoding='utf-8').read()
    t = fn(s)
    if t != s:
        changed.append(path)
        if '--check' not in sys.argv:
            open(path, 'w', encoding='utf-8').write(t)


# 1. JS that fetches data files: getJSON = u => fetch(u + ... + 'v=XXXX')
dh = data_hash()
for js in glob.glob('assets/*.js'):
    rewrite(js, lambda s: re.sub(r"'v=[0-9A-Za-z]+'\)", f"'v={dh}')", s))

# 2. HTML references to assets/ and data/ files (after step 1, so JS hashes are final)
ref = re.compile(r'((?:assets|data)/[\w./-]+\.(?:js|css|json))\?v=[0-9A-Za-z]+')
for page in glob.glob('*.html'):
    rewrite(page, lambda s: ref.sub(lambda m: m.group(1) + '?v=' + file_hash(m.group(1))
                                     if os.path.exists(m.group(1)) else m.group(0), s))

if '--check' in sys.argv:
    if changed:
        print('Version tags are out of date in: ' + ', '.join(changed))
        print('Run: python3 tools/stamp.py')
        sys.exit(1)
    print('Version tags are up to date.')
else:
    print('Updated: ' + (', '.join(changed) or 'nothing'))
