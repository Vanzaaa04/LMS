import type {
  ApiAssignment,
  ApiCourseDetail,
  ApiCourseListItem,
  ApiLab,
  ApiMaterial,
  ApiQuiz,
} from '@/lib/api/courseApi';
import type {
  Course,
  CourseContentItem,
  CourseContentType,
  CourseDetail,
  CourseModule,
  LecturerCourse,
  LecturerCourseModule,
  LecturerManageCourseData,
  LecturerModuleAssessment,
  LecturerModuleMaterial,
} from '@/lib/types/course';

const DEFAULT_COURSE_CATEGORY = 'Computer Science';
const DEFAULT_COURSE_LEVEL = 'Intermediate';
const DEFAULT_CREDIT_HOURS = 3;
const DEFAULT_DURATION_WEEKS = 12;
const DEFAULT_SEMESTER = '2026';
const DEFAULT_TERM_LABEL = 'Fall Semester 2026';
const DEFAULT_BANNER_CLASS = 'bg-gradient-to-br from-[#0A3A9C] via-[#0A4AB8] to-[#0A2E7A]';
const DEFAULT_IMAGE_URL =
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80';

export function mapApiCoursesToStudentCourses(
  courses: ApiCourseListItem[],
  enrolledCourseIds: string[] = []
): Course[] {
  return courses.map((course) => mapApiCourseToStudentCourse(course, enrolledCourseIds));
}

export function mapApiCourseToStudentCourse(
  course: ApiCourseListItem,
  enrolledCourseIds: string[] = []
): Course {
  const instructorName = course.instructor?.name ?? 'Belum ada dosen';
  const isEnrolled = enrolledCourseIds.includes(course.id);

  return {
    id: course.id,
    code: createCourseCode(course.title),
    semester: course.semester ?? DEFAULT_SEMESTER,
    level: DEFAULT_COURSE_LEVEL,
    category: course.department ?? DEFAULT_COURSE_CATEGORY,
    title: course.title,
    bannerColorClass: DEFAULT_BANNER_CLASS,
    bannerEmoji: createCourseInitials(course.title),
    description: course.description ?? 'Course description is being prepared by the lecturer.',
    instructorName,
    instructorInitials: createPersonInitials(instructorName),
    instructorRole: course.instructor ? 'Course Instructor' : '-',
    creditHours: course.credits ?? DEFAULT_CREDIT_HOURS,
    progressPercentage: 0,
    status: isEnrolled ? 'ongoing' : 'notstart',
    totalMaterials: 0,
    totalQuizzes: 0,
    isNew: false,
    durationWeeks: DEFAULT_DURATION_WEEKS,
    className: course.className,
  };
}

export function mapLecturerCourseToStudentCourse(
  course: LecturerCourse,
  enrolledCourseIds: string[] = []
): Course {
  const isEnrolled = enrolledCourseIds.includes(course.id);
  
  return {
    id: course.id,
    code: course.code,
    semester: course.semester ?? DEFAULT_SEMESTER,
    level: DEFAULT_COURSE_LEVEL,
    category: course.department,
    title: course.title,
    bannerColorClass: DEFAULT_BANNER_CLASS,
    bannerEmoji: createCourseInitials(course.title),
    description: course.description ?? 'Course description is being prepared by the lecturer.',
    instructorName: 'Lecturer',
    instructorInitials: 'L',
    instructorRole: 'Lecturer',
    creditHours: course.credits ?? DEFAULT_CREDIT_HOURS,
    progressPercentage: 0,
    status: isEnrolled ? 'ongoing' : 'notstart',
    totalMaterials: course.moduleCount,
    totalQuizzes: 0,
    isNew: true,
    durationWeeks: DEFAULT_DURATION_WEEKS,
  };
}

export function mapApiCourseDetailToStudentCourseDetail(
  course: ApiCourseDetail,
  enrolledCourseIds: string[] = []
): CourseDetail {
  const baseCourse = mapApiCourseToStudentCourse(course, enrolledCourseIds);

  let totalMaterials = 0;
  let totalQuizzes = 0;
  const tabs = {
    materials: [] as CourseModule[],
    quizzes: [] as CourseModule[],
    assignments: [] as CourseModule[],
    labs: [] as CourseModule[],
  };

  course.modules?.forEach((apiModule, index) => {
    const moduleName = apiModule.title || `Module ${index + 1}`;
    
    if (apiModule.materials?.length > 0) {
      const items = mapMaterialsToContentItems(apiModule.materials);
      tabs.materials.push({ id: apiModule.id, title: moduleName, items });
      totalMaterials += items.length;
    }
    
    if (apiModule.quizzes?.length > 0) {
      const items = mapQuizzesToContentItems(apiModule.quizzes);
      tabs.quizzes.push({ id: apiModule.id, title: moduleName, items });
      totalQuizzes += items.length;
    }

    if (apiModule.assignments?.length > 0) {
      const items = mapAssignmentsToContentItems(apiModule.assignments);
      tabs.assignments.push({ id: apiModule.id, title: moduleName, items });
    }

    if (apiModule.labs?.length > 0) {
      const items = mapLabsToContentItems(apiModule.labs);
      tabs.labs.push({ id: apiModule.id, title: moduleName, items });
    }
  });

  return {
    ...baseCourse,
    subtitle: '',
    breadcrumbLabel: course.title,
    heroAccentLabel: 'COURSE MODULE',
    totalMaterials,
    totalQuizzes,
    tabs,
    schedule: [],
  };
}

export function mapApiCoursesToLecturerCourses(courses: ApiCourseListItem[]): LecturerCourse[] {
  return courses.map((course) => ({
    id: course.id,
    code: createCourseCode(course.title),
    title: course.title,
    description: course.description ?? undefined,
    department: course.department ?? DEFAULT_COURSE_CATEGORY,
    semester: course.semester ?? DEFAULT_TERM_LABEL,
    credits: course.credits ?? DEFAULT_CREDIT_HOURS,
    teachingFormat: course.teachingFormat ?? undefined,
    enrollmentCap: course.enrollmentCap ?? undefined,
    studentCount: course._count?.enrollments ?? 0,
    moduleCount: 1,
    assignmentCount: 0,
    status: mapLecturerCourseStatus(course.status),
    imageUrl: DEFAULT_IMAGE_URL,
  }));
}

export function mapApiCourseDetailToLecturerManageCourse(course: ApiCourseDetail): LecturerManageCourseData {
  const lecturerCourse = mapApiCoursesToLecturerCourses([course])[0];
  
  let totalAssignments = 0;
  
  const modules: LecturerCourseModule[] = (course.modules || []).map((apiModule, index) => {
    const materials = mapApiMaterialsToLecturerMaterials(apiModule.materials || []);
    const assignments = mapApiAssignmentsToLecturerAssessments(apiModule.assignments || []);
    const labs = mapApiLabsToLecturerAssessments(apiModule.labs || []);
    
    totalAssignments += assignments.length + labs.length;

    return {
      id: apiModule.id,
      orderLabel: `M${index + 1}`,
      title: apiModule.title || `Module ${index + 1}`,
      description: apiModule.description ?? undefined,
      weekLabel: `Week ${index + 1}`,
      status: 'Published',
      durationWeeks: 1,
      materials,
      assessments: [...assignments, ...labs],
      defaultExpanded: index === 0,
    };
  });

  return {
    course: {
      ...lecturerCourse,
      moduleCount: modules.length,
      assignmentCount: totalAssignments,
    },
    termLabel: course.semester ?? DEFAULT_TERM_LABEL,
    credits: course.credits ?? DEFAULT_CREDIT_HOURS,
    enrolledStudents: course._count?.enrollments ?? 0,
    weeklyGrowth: 0,
    modules,
  };
}

function mapApiLabsToLecturerAssessments(labs: ApiLab[]): LecturerModuleAssessment[] {
  return labs.map((lab) => ({
    id: lab.id,
    title: lab.title,
    kind: 'lab' as any,
    meta: 'Practical Lab',
    description: lab.instructions,
    status: 'Active',
    submittedCount: 0,
    studentCount: 0,
    badgeLabel: 'Practical Lab',
    badgeTone: 'brand',
  }));
}

function mapMaterialsToContentItems(materials: ApiMaterial[]): CourseContentItem[] {
  return materials.map((material) => ({
    id: material.id,
    title: material.title,
    type: mapMaterialType(material.type),
    meta: createMaterialMeta(material),
    summary: material.content ?? material.url ?? undefined,
    content: {
      markdown: material.type === 'TEXT' ? material.content ?? '' : undefined,
      videoUrl: material.type === 'VIDEO' ? material.url ?? undefined : undefined,
      downloadUrl: material.type === 'DOCUMENT' ? material.url ?? undefined : undefined,
      downloadLabel: material.type === 'DOCUMENT' ? material.title : undefined,
      previewText: material.content ?? undefined,
    },
  }));
}

function mapApiMaterialsToLecturerMaterials(materials: ApiMaterial[]): LecturerModuleMaterial[] {
  return materials.map((material) => ({
    id: material.id,
    title: material.title,
    kind: material.type === 'VIDEO' ? 'video' : material.type === 'DOCUMENT' ? 'document' : 'link',
    meta: createMaterialMeta(material),
    description: material.content ?? undefined,
    visibilityStatus: 'Published',
    fileName: material.url ?? undefined,
    externalUrl: material.type === 'TEXT' ? undefined : material.url ?? undefined,
  }));
}

function mapApiAssignmentsToLecturerAssessments(
  assignments: ApiAssignment[]
): LecturerModuleAssessment[] {
  return assignments.map((assignment) => {
    const submittedCount = assignment._count?.submissions ?? 0;
    return {
      id: assignment.id,
      title: assignment.title,
      kind: 'assignment',
      meta: `Due ${formatDate(assignment.deadline)}`,
      description: assignment.description,
      status: mapAssignmentStatus(assignment.status),
      deadline: assignment.deadline,
      submissionRequirement: assignment.submissionRequirement ?? 'File Upload (PDF, DOCX, ZIP)',
      templateName: assignment.templateName ?? undefined,
      templateUrl: assignment.templateUrl ?? undefined,
      templateMeta: assignment.templateUrl ? 'Template Attached' : undefined,
      submittedCount,
      studentCount: 0,
      badgeLabel: `${submittedCount} Submission${submittedCount !== 1 ? 's' : ''}`,
      badgeTone: submittedCount > 0 ? 'success' : 'brand',
    };
  });
}

function mapAssignmentStatus(status?: string) {
  if (status === 'DRAFT') {
    return 'Draft';
  }

  if (status === 'ACTIVE' || status === 'PUBLISHED') {
    return 'Active';
  }

  return 'Active';
}

function createLecturerModules(
  materials: LecturerModuleMaterial[],
  assessments: LecturerModuleAssessment[]
): LecturerCourseModule[] {
  if (materials.length === 0 && assessments.length === 0) {
    return [];
  }

  return [
    {
      id: 'api-module-1',
      orderLabel: 'M1',
      title: 'Course Content',
      weekLabel: 'Current Module',
      status: 'Published',
      durationWeeks: DEFAULT_DURATION_WEEKS,
      materials,
      assessments,
      defaultExpanded: true,
    },
  ];
}

function mapAssignmentsToContentItems(assignments: ApiAssignment[]): CourseContentItem[] {
  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    type: 'assignment',
    meta: `Due ${formatDate(assignment.deadline)}`,
    summary: assignment.description,
    submissionRequirement: assignment.submissionRequirement,
    templateName: assignment.templateName ?? undefined,
    templateUrl: assignment.templateUrl ?? undefined,
  }));
}

function mapQuizzesToContentItems(quizzes: ApiQuiz[]): CourseContentItem[] {
  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    type: 'quiz',
    meta: `${quiz.timeLimit ?? 30} mins`,
  }));
}

function mapLabsToContentItems(labs: ApiLab[]): CourseContentItem[] {
  return labs.map((lab) => ({
    id: lab.id,
    title: lab.title,
    type: 'lab',
    meta: 'Practical Lab',
    summary: lab.instructions,
  }));
}

function createSingleModule(title: string, items: CourseContentItem[]): CourseModule[] {
  if (items.length === 0) {
    return [];
  }

  return [{ id: 'api-module-1', title, items }];
}

function mapMaterialType(type: ApiMaterial['type']): CourseContentType {
  if (type === 'VIDEO') {
    return 'video';
  }

  if (type === 'DOCUMENT') {
    return 'document';
  }

  return 'article';
}

function createMaterialMeta(material: ApiMaterial) {
  if (material.type === 'VIDEO') {
    return 'Video';
  }

  if (material.type === 'DOCUMENT') {
    return 'Downloadable Document';
  }

  return 'Reading Material';
}

function createCourseCode(title: string) {
  const prefix = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return `${prefix || 'RD'}-API`;
}

function mapLecturerCourseStatus(status?: string | null): LecturerCourse['status'] {
  if (status === 'Draft') {
    return 'Draft';
  }

  if (status === 'Archived') {
    return 'Archived';
  }

  return 'Active';
}

function createCourseInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function createPersonInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue));
}
