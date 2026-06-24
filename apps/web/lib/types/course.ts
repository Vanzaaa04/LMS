export type CourseContentType = 'video' | 'document' | 'article' | 'quiz' | 'assignment' | 'lab';
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | string;
export type CourseContentTab = 'materials' | 'quizzes' | 'assignments' | 'labs';
export type AssignmentEditorMode = 'create' | 'edit';

export interface CourseContentItem {
  id: string;
  title: string;
  type: CourseContentType;
  meta: string;
  summary?: string;
  content?: {
    markdown?: string;
    videoUrl?: string;
    downloadUrl?: string;
    downloadLabel?: string;
    previewText?: string;
  };
  isCompleted?: boolean;
  templateName?: string;
  templateUrl?: string;
  submissionRequirement?: string;
  submissionStatus?: 'pending' | 'submitted' | 'graded' | null;
  submissionScore?: number | null;
}

export interface CourseModule {
  id: string;
  title: string;
  items: CourseContentItem[];
}

export interface Course {
  id: string;
  code: string;
  semester: string;
  level: string;
  category: string;
  title: string;
  bannerColorClass: string;
  bannerEmoji: string;
  description: string;
  instructorName: string;
  instructorInitials: string;
  instructorRole: string;
  creditHours: number;
  progressPercentage: number;
  status: 'ongoing' | 'completed' | 'notstart';
  totalMaterials: number;
  totalQuizzes: number;
  isNew?: boolean;
  durationWeeks?: number;
  className?: string;
}

export interface CourseDetail extends Course {
  subtitle: string;
  heroAccentLabel: string;
  breadcrumbLabel: string;
  schedule: string[];
  tabs: {
    materials: CourseModule[];
    quizzes: CourseModule[];
    assignments: CourseModule[];
    labs: CourseModule[];
  };
}

export interface LecturerCourse {
  id: string;
  code: string;
  title: string;
  description?: string;
  department: string;
  semester?: string;
  credits?: number;
  teachingFormat?: string;
  enrollmentCap?: number;
  studentCount: number;
  moduleCount: number;
  assignmentCount: number;
  status: 'Active' | 'Draft' | 'Archived';
  imageUrl: string;
}

export type LecturerMaterialKind = 'video' | 'document' | 'link';
export type LecturerMaterialVisibility = 'Published' | 'Draft' | 'Hidden';

export interface LecturerModuleMaterial {
  id: string;
  title: string;
  kind: LecturerMaterialKind;
  meta: string;
  description?: string;
  visibilityStatus: LecturerMaterialVisibility;
  fileName?: string;
  fileMeta?: string;
  externalUrl?: string;
}

export type LecturerAssignmentStatus = 'Active' | 'Draft' | 'Scheduled' | 'Closed' | string;

export interface LecturerModuleAssessment {
  id: string;
  title: string;
  kind: 'quiz' | 'assignment' | 'lab';
  meta: string;
  description: string;
  status: LecturerAssignmentStatus;
  assignedDate?: string;
  deadline?: string;
  submissionRequirement?: string;
  templateName?: string;
  templateMeta?: string;
  templateUrl?: string;
  submittedCount?: number;
  studentCount?: number;
  badgeLabel?: string;
  badgeTone?: 'brand' | 'neutral' | 'success' | 'warning' | 'danger';
}

export interface LecturerCourseModule {
  id: string;
  orderLabel: string;
  title: string;
  description?: string;
  weekLabel: string;
  status: 'Published' | 'Draft' | 'Hidden';
  durationWeeks: number;
  materials: LecturerModuleMaterial[];
  assessments: LecturerModuleAssessment[];
  defaultExpanded?: boolean;
}

export interface LecturerManageCourseData {
  course: LecturerCourse;
  termLabel: string;
  credits: number;
  enrolledStudents: number;
  weeklyGrowth: number;
  modules: LecturerCourseModule[];
}

// Student Progress & Submissions
export interface StudentProgressData {
  student: {
    id: string;
    name: string;
    email: string;
    avatarInitials: string;
    major: string;
    year: number;
    enrollmentDate: string;
  };
  course: LecturerCourse;
  overallProgress: number;
  status: 'On Track' | 'At Risk' | 'Behind';
  lastActive: string;
  grade: {
    current: number;
    letter: string;
  };
  moduleProgress: {
    moduleId: string;
    moduleTitle: string;
    orderLabel: string;
    progress: number;
    completedItems: number;
    totalItems: number;
    status: 'Completed' | 'In Progress' | 'Not Started';
    lastActivity?: string;
  }[];
  recentSubmissions: {
    id: string;
    title: string;
    type: 'Assignment' | 'Quiz' | 'Lab';
    submittedAt: string;
    score?: number;
    status: 'Graded' | 'Pending' | 'Late';
  }[];
}

export interface AssignmentSubmission {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatarInitials: string;
  };
  submittedAt: string;
  status: 'Graded' | 'Pending' | 'Late';
  score?: number;
  fileUrl?: string;
  note?: string;
  feedback?: string;
}

export interface AssignmentSubmissionsData {
  assignment: LecturerModuleAssessment;
  course: LecturerCourse;
  moduleInfo: {
    id: string;
    title: string;
    orderLabel: string;
  };
  stats: {
    totalStudents: number;
    submitted: number;
    graded: number;
    averageScore: number;
  };
  submissions: AssignmentSubmission[];
}

export interface LecturerEnrollmentStudent {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  progressPercentage: number;
}

export interface LecturerEnrollmentData {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  termLabel: string;
  students: LecturerEnrollmentStudent[];
}

export type ProgressItemStatus = 'Completed' | 'In Progress' | 'Not Started';

export interface StudentMaterialProgress {
  id: string;
  title: string;
  type: string;
  moduleLabel: string;
  status: ProgressItemStatus;
  completedAt?: string;
}

export type GradingStatus = 'Graded' | 'Submitted' | 'Missing' | 'Draft';

export interface StudentAssignmentProgress {
  id: string;
  title: string;
  moduleLabel: string;
  status: GradingStatus;
  score?: number;
  maxScore: number;
  submittedAt?: string;
}

export interface LecturerStudentProgressData {
  student: {
    name: string;
    email: string;
    dateJoined: string;
  };
  course: LecturerCourse;
  termLabel: string;
  summary: {
    materialProgressPercentage: number;
    completedMaterials: number;
    totalMaterials: number;
    gradedAssignments: number;
    totalAssignments: number;
    averageAssignmentScore: number | null;
  };
  materials: StudentMaterialProgress[];
  assignments: StudentAssignmentProgress[];
}
