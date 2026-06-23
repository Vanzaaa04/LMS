import os

paths = [
    r'd:\projectAslabBackend\apps\web\app',
    r'd:\projectAslabBackend\apps\web\components',
    r'd:\projectAslabBackend\apps\web\lib',
    r'd:\projectAslabBackend\apps\web\data.ts'
]

for p in paths:
    if os.path.isdir(p):
        for root, dirs, files in os.walk(p):
            for f in files:
                if f.endswith(('.ts', '.tsx', '.js', '.jsx')):
                    filepath = os.path.join(root, f)
                    with open(filepath, 'r', encoding='utf-8') as file:
                        content = file.read()
                    if 'localStorage' in content:
                        content = content.replace('localStorage', 'sessionStorage')
                        with open(filepath, 'w', encoding='utf-8') as file:
                            file.write(content)
                        print(f"Updated {filepath}")
    elif os.path.isfile(p):
        filepath = p
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        if 'localStorage' in content:
            content = content.replace('localStorage', 'sessionStorage')
            with open(filepath, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Updated {filepath}")
