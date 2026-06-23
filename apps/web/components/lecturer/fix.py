import os
import glob
import re

components_dir = r"d:\projectAslabBackend\apps\web\components\lecturer"
files = glob.glob(os.path.join(components_dir, "*.tsx"))

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Only process if it has the string
    if "/dosen/courses" not in content:
        continue
        
    print(f"Fixing {os.path.basename(file_path)}")
    
    # Check if hook is already imported
    if "useCourseBasePath" not in content:
        # insert import after 'use client'; or at top
        if content.startswith("'use client';"):
            content = content.replace("'use client';", "'use client';\nimport { useCourseBasePath } from '@/hooks/useCourseBasePath';")
        else:
            content = "import { useCourseBasePath } from '@/hooks/useCourseBasePath';\n" + content
            
    # Insert the hook call inside the component. We'll do a simple regex to find the main exported function
    # export function LecturerCoursesView({
    # export function LecturerCourseSettingsView(
    match = re.search(r"export\s+function\s+([A-Z][a-zA-Z0-9_]+)\s*\(.*?\)\s*{", content, re.DOTALL)
    if match:
        func_declaration = match.group(0)
        # Check if we already added it
        if "const basePath = useCourseBasePath();" not in content:
            new_func_declaration = func_declaration + "\n  const basePath = useCourseBasePath();\n"
            content = content.replace(func_declaration, new_func_declaration)
            
    # Replace strings
    # case 1: href="/dosen/courses" -> href={basePath}
    content = content.replace('href="/dosen/courses"', 'href={basePath}')
    content = content.replace("href='/dosen/courses'", "href={basePath}")
    # case 2: href={`/dosen/courses/${id}`} -> href={`${basePath}/${id}`}
    content = content.replace('`/dosen/courses/', '`${basePath}/')
    content = content.replace('`/dosen/courses`', '`${basePath}`')
    # case 3: string '/dosen/courses'
    content = content.replace("'/dosen/courses'", "basePath")
    content = content.replace('"/dosen/courses"', "basePath")
    
    # Write back
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Done!")
