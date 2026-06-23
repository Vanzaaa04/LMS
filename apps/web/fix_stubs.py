import os

stub_content = '''export default function Page() {
  return <div>Coming soon</div>;
}
'''

empty_files = [
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\create\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\assignments\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\enrollment\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\enrollment\[studentId]\progress\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\create\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\edit\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\assignments\create\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\assignments\[assignmentId]\edit\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\assignments\[assignmentId]\submissions\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\materials\create\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\materials\[materialId]\edit\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\quizzes\create\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\modules\[moduleId]\quizzes\[quizId]\edit\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\[courseId]\settings\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dosen\courses\[courseId]\modules\[moduleId]\quizzes\create\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\dosen\courses\[courseId]\modules\[moduleId]\quizzes\[quizId]\edit\page.tsx',
    r'd:\projectAslabBackend\apps\web\app\forgot-password\page.tsx',
]

layout_stub = '''export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
'''

layout_files = [
    r'd:\projectAslabBackend\apps\web\app\dashboard_admin\courses\layout.tsx',
]

count = 0
for f in empty_files:
    if os.path.isfile(f) and os.path.getsize(f) == 0:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(stub_content)
        count += 1
        print(f"  Stub: {f}")

for f in layout_files:
    if os.path.isfile(f) and os.path.getsize(f) == 0:
        with open(f, 'w', encoding='utf-8') as fh:
            fh.write(layout_stub)
        count += 1
        print(f"  Layout: {f}")

print(f"\nDone! {count} files restored with stubs.")
