import { create } from 'zustand';
import { Lab, Task, StudentProfile, TaskSubmission } from './types';
import { INITIAL_LABS, INITIAL_TASKS, INITIAL_STUDENT_PROFILE } from './data';

interface AppState {
  labs: Lab[];
  tasks: Task[];
  student: StudentProfile;
  toast: { type: 'success' | 'info' | 'error'; message: string } | null;
  
  // Setters
  setToast: (toast: { type: 'success' | 'info' | 'error'; message: string } | null) => void;

  // Lab Actions
  handleAddLab: (newLab: Lab) => void;
  handleUpdateLab: (updatedLab: Lab) => void;
  handleDeleteLab: (labId: string) => void;
  handleSubmitLabRegistration: (labId: string, notes: string) => void;
  handleSubmitLab: (labId: string, fileName: string, fileSize: string, studentNote: string) => void;
  handleGradeLabSubmission: (labId: string, grade: number) => void;

  // Task Actions
  handleAddTask: (newTask: Task) => void;
  handleUpdateTask: (updatedTask: Task) => void;
  handleDeleteTask: (taskId: string) => void;
  handleSubmitTask: (taskId: string, fileName: string, fileSize: string, studentNote: string) => void;
  handleCancelTaskSubmission: (taskId: string) => void;
  handleGradeTask: (taskId: string, grade: number, feedback: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  labs: INITIAL_LABS,
  tasks: INITIAL_TASKS,
  student: INITIAL_STUDENT_PROFILE,
  toast: null,

  setToast: (toast) => {
    set({ toast });
    if (toast) {
      setTimeout(() => {
        set({ toast: null });
      }, 4000);
    }
  },

  // --- LAB ACTIONS ---
  handleAddLab: (newLab) => set((state) => ({ labs: [...state.labs, newLab] })),
  
  handleUpdateLab: (updatedLab) => set((state) => ({
    labs: state.labs.map((l) => (l.id === updatedLab.id ? updatedLab : l)),
  })),

  handleDeleteLab: (labId) => set((state) => ({
    labs: state.labs.filter((l) => l.id !== labId),
    tasks: state.tasks.filter((t) => t.labId !== labId),
  })),

  handleSubmitLabRegistration: (labId, notes) => set((state) => ({
    labs: state.labs.map((lab) =>
      lab.id === labId
        ? {
            ...lab,
            isRegistered: true,
            registrationNotes: notes,
            registeredAt: new Date().toLocaleDateString('id-ID', { hour: 'numeric', minute: 'numeric' }),
          }
        : lab
    ),
  })),

  handleSubmitLab: (labId, fileName, fileSize, studentNote) => set((state) => ({
    labs: state.labs.map((lab) =>
      lab.id === labId
        ? {
            ...lab,
            labStatus: 'Sudah Submit, menunggu penilaian',
            labSubmission: {
              submittedAt: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) + ' WIB',
              fileName,
              fileSize,
              note: studentNote,
            },
          }
        : lab
    ),
  })),

  handleGradeLabSubmission: (labId, grade) => set((state) => ({
    labs: state.labs.map((l) => {
      if (l.id === labId) {
        return {
          ...l,
          labGrade: grade,
          labStatus: 'Sudah Dinilai' as const,
        };
      }
      return l;
    }),
  })),


  // --- TASK ACTIONS ---
  handleAddTask: (newTask) => set((state) => ({ tasks: [...state.tasks, newTask] })),

  handleUpdateTask: (updatedTask) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
  })),

  handleDeleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId),
  })),

  handleSubmitTask: (taskId, fileName, fileSize, studentNote) => set((state) => {
    const timestamp = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';

    const newSubmission: TaskSubmission = {
      submittedAt: timestamp,
      fileName,
      fileSize,
      note: studentNote,
      grade: null,
      feedback: null,
      status: 'Menunggu Penilaian',
    };

    return {
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, submission: newSubmission } : task
      ),
    };
  }),

  handleCancelTaskSubmission: (taskId) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === taskId ? { ...task, submission: null } : task
    ),
  })),

  handleGradeTask: (taskId, grade, feedback) => set((state) => ({
    tasks: state.tasks.map((t) => {
      if (t.id === taskId && t.submission) {
        return {
          ...t,
          submission: {
            ...t.submission,
            grade,
            feedback,
            status: 'Selesai' as const,
          },
        };
      }
      return t;
    }),
  })),

}));
