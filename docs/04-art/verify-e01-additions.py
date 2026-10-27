"""Read-only verification of the Episode01 draft assets; requires Pillow.

Run from any directory. The manifest records provenance, not runtime adoption.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image

root = Path(__file__).resolve().parents[2]
manifest_path = root / 'docs/04-art/manifests/e01-30-scene-additions.json'

def inspect(path):
    with Image.open(path) as image:
        image.load()
        result = {'width': image.width, 'height': image.height, 'mode': image.mode,
                  'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        if 'A' in image.getbands():
            alpha = image.getchannel('A')
            result['alphaExtrema'] = list(alpha.getextrema())
            result['alphaBounds'] = list(alpha.getbbox())
        return result

def verify():
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    assert len(manifest['assets']) == 11
    assert len({entry['id'] for entry in manifest['assets']}) == 11
    for entry in manifest['assets']:
        path = (root / entry['path']).resolve()
        assert path.is_relative_to(root / 'docs/04-art'), entry['id']
        actual = inspect(path)
        assert actual == entry['image'], entry['id']
        if entry['kind'] == 'character':
            assert actual['alphaExtrema'] == [0, 255], entry['id']
            assert actual['width'] == actual['height'], entry['id']
            assert (root / entry['profile']).is_file(), entry['id']
        else:
            assert abs(actual['width'] / actual['height'] - 16 / 9) < 0.01, entry['id']
        assert entry['prompt'] and entry['sourceFile'] and entry['scenes'], entry['id']
        print(entry['id'], actual['width'], actual['height'], actual['mode'], 'OK')
    reused = manifest['reusedAssets']
    assert len(reused) == 9
    for entry in reused:
        path = (root / entry['path']).resolve()
        assert path.is_relative_to(root / 'src/assets/images/characters/saori'), entry['id']
        actual = inspect(path)
        assert actual == entry['image'], entry['id']
        # Preserve existing opacity values (some source full-body assets peak below 255).
        assert actual['alphaExtrema'][0] == 0 and actual['alphaExtrema'][1] >= 128, entry['id']
        print(entry['id'], 'existing asset, unchanged OK')

if __name__ == '__main__':
    verify()
