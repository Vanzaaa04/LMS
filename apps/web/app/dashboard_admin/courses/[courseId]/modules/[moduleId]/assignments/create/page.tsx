import { redirect } from 'next/navigation';

export default async function Page(props: { params: Promise<any> }) {
  const resolvedParams = await props.params;
  const courseId = resolvedParams.courseId;
  redirect(`/dashboard_admin/courses/${courseId}`);
}
