import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import type { LecturerCourse } from '@/lib/types/course';
import './LecturerCoursesView.css';

interface LecturerCoursesViewProps {
  courses: LecturerCourse[];
  searchQuery: string;
}

const COURSE_STATUS_STYLE: Record<LecturerCourse['status'], { background: string; color: string }> = {
  Active: { background: '#E7F6EE', color: '#187346' },
  Draft: { background: '#FFF4DE', color: '#946200' },
  Archived: { background: '#F1F2F4', color: '#6B7280' },
};

export function LecturerCoursesView({
  courses,
  searchQuery,
}: LecturerCoursesViewProps) {
  const filteredCourses = filterCourses(courses, searchQuery);
  const activeCourseCount = courses.filter((course) => course.status === 'Active').length;
  const totalStudents = courses.reduce((total, course) => total + course.studentCount, 0);

  return (
    <div className="courses-view-wrapper dashboard-content">
      <section className="courses-header">
        <div className="courses-header-left">
          <p>Lecturer Workspace</p>
          <h1>Teaching Courses</h1>
          <p className="subtitle">
            Manage your active classes, review schedules, and prepare learning activities from one course list.
          </p>
        </div>

        <Link
          href="/dosen/courses/create"
          className="btn-create-course"
        >
          <span>+</span>
          Create New Course
        </Link>
      </section>

      <section className="courses-summary">
        <SummaryCard label="Owned Courses" value={courses.length.toString()} helper={`${activeCourseCount} active this term`} />
        <SummaryCard label="Students Enrolled" value={totalStudents.toString()} helper="Across all owned courses" />
        <SummaryCard label="Pending Setup" value={courses.filter((course) => course.status === 'Draft').length.toString()} helper="Draft courses need review" />
      </section>

      <section className="list-header">
        <div>
          <h2>Course List</h2>
          <p>Select a course to manage materials, quizzes, assignments, labs, and student activity.</p>
        </div>
        <p className="list-count">
          {filteredCourses.length} courses shown
        </p>
      </section>

      {filteredCourses.length > 0 ? (
        <div className="course-grid">
          {filteredCourses.map((course) => (
            <LecturerCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <EmptyCoursesState />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="summary-card">
      <p className="summary-label">{label}</p>
      <div className="summary-bottom">
        <strong className="summary-value">{value}</strong>
        <span className="summary-helper">{helper}</span>
      </div>
    </article>
  );
}

function LecturerCourseCard({ course }: { course: LecturerCourse }) {
  const statusStyle = COURSE_STATUS_STYLE[course.status];

  return (
    <article className="course-card">
      <div className="course-image-wrap">
        <Image
          src={course.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 384px, (min-width: 768px) 50vw, 100vw"
        />
        <div className="course-image-overlay" />
        <div className="course-badges">
          <span className="badge-code">{course.code}</span>
          <span className="badge-status" style={statusStyle}>{course.status}</span>
        </div>
      </div>

      <div className="course-body">
        <p className="course-dept">{course.department}</p>
        <h3 className="course-title">{course.title}</h3>

        <div className="course-metrics">
          <CourseMetric icon={<StudentsIcon />} value={`${course.studentCount} Students`} />
          <CourseMetric icon={<ModulesIcon />} value={`${course.moduleCount} Modules`} />
          <CourseMetric icon={<AssignmentIcon />} value={`${course.assignmentCount} Tasks`} />
        </div>

        <Link
          href={`/dosen/courses/${course.id}`}
          className="btn-manage-course"
        >
          Manage Course
        </Link>
      </div>
    </article>
  );
}

function CourseMetric({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="metric-item">
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function EmptyCoursesState() {
  return (
    <div className="empty-state">
      <h2>No courses found</h2>
      <p>Try a different search keyword or create a new course.</p>
    </div>
  );
}

function filterCourses(courses: LecturerCourse[], searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return courses;
  }

  return courses.filter((course) => {
    return [
      course.code,
      course.title,
      course.department,
      course.status,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

function StudentsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM1.5 16a5.5 5.5 0 0 1 11 0M13 8.5a2.4 2.4 0 0 0 0-4.8M14.2 15.5a4.1 4.1 0 0 0-2-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ModulesIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 7h8M5 10h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function AssignmentIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M6 3h6l2 2v12H4V3h2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 9h4M7 12h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
