import os
import glob

base_dir = r"d:\projectAslabBackend\apps\web\app\dashboard_admin\courses"
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            if "`/dosen/courses" in content or "'/dosen/courses" in content or '"/dosen/courses' in content:
                content = content.replace("`/dosen/courses", "`/dashboard_admin/courses")
                content = content.replace("'/dosen/courses", "'/dashboard_admin/courses")
                content = content.replace('"/dosen/courses', '"/dashboard_admin/courses')
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed redirects in {path}")
