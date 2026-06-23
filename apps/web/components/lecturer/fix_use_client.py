import os
import glob

components_dir = r"d:\projectAslabBackend\apps\web\components\lecturer"
files = glob.glob(os.path.join(components_dir, "*.tsx"))

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # If it uses useCourseBasePath but doesn't have use client, add it
    if "useCourseBasePath" in content and "'use client';" not in content and '"use client";' not in content:
        print(f"Adding 'use client' to {os.path.basename(file_path)}")
        content = '"use client";\n' + content
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
            
print("Done adding use client")
