import os

paths = [
    r'd:\projectAslabBackend\apps\web\app',
    r'd:\projectAslabBackend\apps\web\components',
    r'd:\projectAslabBackend\apps\web\lib',
    r'd:\projectAslabBackend\apps\web\data.ts'
]

count = 0
for p in paths:
    if os.path.isdir(p):
        for root, dirs, files in os.walk(p):
            for f in files:
                if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    filepath = os.path.join(root, f)
                    with open(filepath, 'r', encoding='utf-8') as fh:
                        content = fh.read()
                    if 'localStorage' in content:
                        new_content = content.replace('localStorage', 'sessionStorage')
                        with open(filepath, 'w', encoding='utf-8') as fh:
                            fh.write(new_content)
                        count += 1
                        print(f"  Updated: {filepath}")
    elif os.path.isfile(p):
        with open(p, 'r', encoding='utf-8') as fh:
            content = fh.read()
        if 'localStorage' in content:
            new_content = content.replace('localStorage', 'sessionStorage')
            with open(p, 'w', encoding='utf-8') as fh:
                fh.write(new_content)
            count += 1
            print(f"  Updated: {p}")

print(f"\nDone! {count} files updated.")
