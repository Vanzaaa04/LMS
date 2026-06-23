import { notFound } from 'next/navigation';
import { MaterialReaderView } from '@/components/course/MaterialReaderView';
import { getStudentCourseDetail } from '@/lib/api/courseRepository';

export default async function CourseMaterialPage({
  params,
}: {
  params: Promise<{ courseId: string; materialId: string }>;
}) {
  const { courseId, materialId } = await params;
  const courseDetail = await getStudentCourseDetail(courseId);

  if (!courseDetail) {
    notFound();
  }

  let foundModule = null;
  let foundMaterial = null;
  for (const courseModule of courseDetail.tabs.materials) {
    const item = courseModule.items.find((entry) => entry.id === materialId);
    if (item) {
      foundModule = courseModule;
      foundMaterial = item;
      break;
    }
  }

  if (!foundModule || !foundMaterial) {
    notFound();
  }

  return (
    <MaterialReaderView
      course={courseDetail}
      currentModule={foundModule}
      currentMaterial={foundMaterial}
    />
  );
}
