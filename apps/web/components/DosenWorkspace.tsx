import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Lab, Task } from '../types';
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Award, 
  FileText, 
  PlusCircle, 
  Calendar, 
  BookOpen, 
  Search,
  Trophy,
  ArrowRight,
  Clock,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Download
} from 'lucide-react';

interface DosenWorkspaceProps {
  labs: Lab[];
  tasks: Task[];
  onAddLab: (newLab: Lab) => void;
  onUpdateLab: (updatedLab: Lab) => void;
  onDeleteLab: (labId: string) => void;
  onAddTask: (newTask: Task) => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onGradeTask: (taskId: string, grade: number, feedback: string) => void;
  onGradeLabSubmission: (labId: string, grade: number) => void;
  setToast: (toast: { type: 'success' | 'info'; message: string } | null) => void;
}

// Helper demo entries that Dosen can grade
interface DemoGradingInfo {
  id: string;
  studentName: string;
  nim: string;
  labTitle: string;
  demoTitle: string;
  status: 'Lulus' | 'Perlu Demo' | 'Belum Mulai';
  score: number | null;
  grades: {
    tryOut: string;
    assignment: string;
    assessment: string;
  } | null;
  reviewedAt?: string;
}

const INITIAL_DEMOS: DemoGradingInfo[] = [
  {
    id: 'demo-1',
    studentName: 'Budi Santoso',
    nim: '2201083042',
    labTitle: 'Lab Pemrograman Web Pro',
    demoTitle: 'Demo ke-1: Pengambilan & Implementasi Dasar',
    status: 'Lulus',
    score: 95,
    grades: { tryOut: '10%', assignment: '45%', assessment: '45%' },
    reviewedAt: '24 Mei 2026, 11:32 WIB'
  },
  {
    id: 'demo-2',
    studentName: 'Budi Santoso',
    nim: '2201083042',
    labTitle: 'Lab Pemrograman Web Pro',
    demoTitle: 'Demo ke-2: Validasi Struktur & Array Pointer',
    status: 'Perlu Demo',
    score: null,
    grades: null
  },
  {
    id: 'demo-3',
    studentName: 'Budi Santoso',
    nim: '2201083042',
    labTitle: 'Lab Pemrograman Web Pro',
    demoTitle: 'Demo ke-3: Review Kompilasi Akhir',
    status: 'Belum Mulai',
    score: null,
    grades: null
  }
];

export const DosenWorkspace: React.FC<DosenWorkspaceProps> = ({
  labs,
  tasks,
  onAddLab,
  onUpdateLab,
  onDeleteLab,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onGradeTask,

  setToast
}) => {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const initialTab = (tabParam === 'labs' || tabParam === 'tasks' || tabParam === 'demo' || tabParam === 'grading')
    ? tabParam
    : 'labs';

  // Navigation Tabs for Dosen Control Center
  const [activeDosenTab, setActiveDosenTab] = useState<'labs' | 'tasks' | 'demo' | 'grading'>(initialTab);

  React.useEffect(() => {
    if (tabParam === 'labs' || tabParam === 'tasks' || tabParam === 'demo' || tabParam === 'grading') {
      const timer = setTimeout(() => setActiveDosenTab(tabParam), 0);
      return () => clearTimeout(timer);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'labs' | 'tasks' | 'demo' | 'grading') => {
    setActiveDosenTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    type: 'lab' | 'task' | 'demo';
  }>({ isOpen: false, id: '', title: '', type: 'lab' });

  const confirmDelete = () => {
    const { id, title, type } = deleteConfirm;
    if (type === 'lab') {
      onDeleteLab(id);
      setToast({ type: 'info', message: `Laboratorium "${title}" telah dihapus.` });
    } else if (type === 'task') {
      onDeleteTask(id);
      setToast({ type: 'info', message: `Tugas "${title}" telah dihapus.` });
    } else if (type === 'demo') {
      setDemoList(prev => prev.filter(d => d.id !== id));
      setToast({ type: 'info', message: `Demo "${title}" telah dihapus.` });
    }
    setDeleteConfirm({ isOpen: false, id: '', title: '', type: 'lab' });
  };


  // State to track expanded labs in grading center
  const [expandedLabs, setExpandedLabs] = useState<string[]>([]);

  const toggleLabCollapse = (labId: string) => {
    setExpandedLabs(prev => 
      prev.includes(labId) 
        ? prev.filter(id => id !== labId) 
        : [...prev, labId]
    );
  };

  // State to track expanded tasks and demos in grading center (default is collapsed)
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const toggleTaskCollapse = (taskId: string) => {
    setExpandedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const [expandedDemos, setExpandedDemos] = useState<string[]>([]);
  const toggleDemoCollapse = (demoTitle: string) => {
    setExpandedDemos(prev => prev.includes(demoTitle) ? prev.filter(t => t !== demoTitle) : [...prev, demoTitle]);
  };

  // Interactive local states for DEMOS
  const [demoList, setDemoList] = useState<DemoGradingInfo[]>(INITIAL_DEMOS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');

  // States for Manage Demo Form Modal
  const [isDemoSettingFormOpen, setIsDemoSettingFormOpen] = useState(false);
  const [editingDemoId, setEditingDemoId] = useState<string | null>(null);
  const [demoStudentName, setDemoStudentName] = useState('Budi Santoso');
  const [demoNim, setDemoNim] = useState('2201083042');
  const [demoLabTitle, setDemoLabTitle] = useState('');
  const [demoTitle, setDemoTitle] = useState('');
  const [demoStatus, setDemoStatus] = useState<'Lulus' | 'Perlu Demo' | 'Belum Mulai'>('Perlu Demo');
  const [demoScore, setDemoScore] = useState<string>('');

  // States for Quiz Builder Modal
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [quizTargetLab, setQuizTargetLab] = useState('');
  const [quizTargetDemo, setQuizTargetDemo] = useState('');
  const [quizQuestionText, setQuizQuestionText] = useState('');
  const [createdQuizQuestions, setCreatedQuizQuestions] = useState<{id: string, demoTitle: string, question: string, options: string[], correctOptionIndex: number | null}[]>([]);
  const [editingQuizQuestionId, setEditingQuizQuestionId] = useState<string | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '', '', '']);
  const [quizCorrectOptionIndex, setQuizCorrectOptionIndex] = useState<number | null>(null);
  const [expandedDemoQuestions, setExpandedDemoQuestions] = useState<string[]>([]);

  // 1. LAB STATE & MODAL FORM
  const [isLabFormOpen, setIsLabFormOpen] = useState(false);
  const [editingLabId, setEditingLabId] = useState<string | null>(null);
  const [labTitle, setLabTitle] = useState('');

  const [labDosen, setLabDosen] = useState('Dr. Aris Setiawan');
  const [labSemester, setLabSemester] = useState(4);
  const [labDescription, setLabDescription] = useState('');
  const [labInstructions, setLabInstructions] = useState('');
  const [labCourseName, setLabCourseName] = useState('');
  const [labCategory, setLabCategory] = useState('Rekayasa Perangkat Lunak');
  const [labThumbnailColor, setLabThumbnailColor] = useState('bg-gradient-to-br from-blue-500 to-indigo-600');
  const [labSyllabusText, setLabSyllabusText] = useState(''); // comma-separated or list lines

  // 2. TASK STATE & MODAL FORM
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskLabId, setTaskLabId] = useState(labs[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskFormatText, setTaskFormatText] = useState('File PDF Dokumen Laporan');

  // 3. GRADING STATES
  const [selectedTaskToGrade, setSelectedTaskToGrade] = useState<Task | null>(null);
  const [taskGradeInput, setTaskGradeInput] = useState<number>(90);
  const [taskFeedbackInput, setTaskFeedbackInput] = useState('');



  const [selectedDemoToGrade, setSelectedDemoToGrade] = useState<DemoGradingInfo | null>(null);
  const [demoGradeInput, setDemoGradeInput] = useState<number>(90);
  const [demoGradeTryOut, setDemoGradeTryOut] = useState<string>('');
  const [demoGradeAssignment, setDemoGradeAssignment] = useState<string>('');
  const [demoGradeAssessment, setDemoGradeAssessment] = useState<string>('');

  // Open Lab Form for Create
  const handleOpenAddLab = () => {
    setEditingLabId(null);
    setLabTitle('');
    setLabDosen('Dr. Aris Setiawan');
    setLabSemester(4);
    setLabDescription('');
    setLabInstructions('');
    setLabCourseName('');
    setLabCategory('Rekayasa Perangkat Lunak');
    setLabThumbnailColor('bg-gradient-to-br from-blue-500 to-indigo-600');
    setLabSyllabusText('Struktur Aplikasi Modern & Component-Oriented UI\nManajemen State Global dengan React Hooks & Context');
    setIsLabFormOpen(true);
  };

  // Open Lab Form for Edit
  const handleOpenEditLab = (lab: Lab) => {
    setEditingLabId(lab.id);
    setLabTitle(lab.title);
    setLabDosen(lab.dosen);
    setLabSemester(lab.semester);
    setLabDescription(lab.description);
    setLabInstructions(lab.instructions || '');
    setLabCourseName(lab.courseName || '');
    setLabCategory(lab.category);
    setLabThumbnailColor(lab.thumbnailColor || 'bg-gradient-to-br from-blue-500 to-indigo-600');
    setLabSyllabusText(lab.syllabus.join('\n'));
    setIsLabFormOpen(true);
  };

  // Save Lab (Submit Handler)
  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labTitle) {
      alert('Judul Lab wajib diisi.');
      return;
    }

    const syllabusArray = labSyllabusText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (editingLabId) {
      // Find old lab to keep registered status unless overridden
      const oldLab = labs.find(l => l.id === editingLabId);
      const updatedLab: Lab = {
        id: editingLabId,
        title: labTitle,
        dosen: labDosen,
        semester: Number(labSemester),
        description: labDescription,
        instructions: labInstructions || `### SKENARIO PRAKTIKUM: ${labTitle.toUpperCase()}`,
        courseName: labCourseName,
        syllabus: syllabusArray.length > 0 ? syllabusArray : ['Materi Sesi 1', 'Materi Sesi 2'],
        thumbnailColor: labThumbnailColor,
        isRegistered: oldLab ? oldLab.isRegistered : false,
        category: labCategory,
        labStatus: oldLab ? oldLab.labStatus : 'Belum Submit',
        labGrade: oldLab ? oldLab.labGrade : null,
        labSubmission: oldLab ? oldLab.labSubmission : null,
      };
      onUpdateLab(updatedLab);
      setToast({ type: 'success', message: `Laboratorium "${labTitle}" berhasil diperbarui!` });
    } else {
      const generatedId = `lab-${Date.now()}`;
      const newLab: Lab = {
        id: generatedId,
        title: labTitle,
        dosen: labDosen,
        semester: Number(labSemester),
        description: labDescription,
        instructions: labInstructions || `### SKENARIO PRAKTIKUM: ${labTitle.toUpperCase()}\n\nSilahkan implementasikan program mandiri.`,
        courseName: labCourseName,
        syllabus: syllabusArray.length > 0 ? syllabusArray : ['Materi Sesi 1', 'Materi Sesi 2'],
        thumbnailColor: labThumbnailColor,
        isRegistered: false,
        category: labCategory,
        labStatus: 'Belum Submit',
        labGrade: null,
        labSubmission: null,
      };
      onAddLab(newLab);
      setToast({ type: 'success', message: `Laboratorium baru "${labTitle}" berhasil ditambahkan!` });
    }

    setIsLabFormOpen(false);
  };

  // Delete Lab Handler
  const handleDeleteLabClick = (labId: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id: labId, title, type: 'lab' });
  };

  // Open Task Form for Edit
  const handleOpenEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskLabId(task.labId);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDeadline(task.deadline);
    setTaskFormatText(task.format.join('\n'));
    setIsTaskFormOpen(true);
  };

  // Save Task Handler
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskLabId) {
      alert('Judul Tugas dan Laboratorium wajib dipilih.');
      return;
    }

    const formatArray = taskFormatText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (editingTaskId) {
      const oldTask = tasks.find(t => t.id === editingTaskId);
      const updatedTask: Task = {
        id: editingTaskId,
        labId: taskLabId,
        title: taskTitle,
        description: taskDescription,
        format: formatArray,
        deadline: taskDeadline,
        deadlineRaw: oldTask ? oldTask.deadlineRaw : new Date(),
        submission: oldTask ? oldTask.submission : null
      };
      onUpdateTask(updatedTask);
      setToast({ type: 'success', message: `Tugas "${taskTitle.split(':')[0]}" berhasil diperbarui!` });
    } else {
      const generatedId = `task-${Date.now()}`;
      const newTask: Task = {
        id: generatedId,
        labId: taskLabId,
        title: taskTitle,
        description: taskDescription,
        format: formatArray,
        deadline: taskDeadline,
        deadlineRaw: new Date(Date.now() + 7 * 24 * 3600 * 1000), // Default 7 days from now
        submission: null
      };
      onAddTask(newTask);
      setToast({ type: 'success', message: `Tugas praktikum baru "${taskTitle.split(':')[0]}" berhasil dibuat!` });
    }

    setIsTaskFormOpen(false);
  };

  // Delete Task Handler
  const handleDeleteTaskClick = (taskId: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id: taskId, title: title.split(':')[0], type: 'task' });
  };

  const handleEditQuizQuestion = (q: {id: string, demoTitle: string, question: string, options: string[], correctOptionIndex: number | null}) => {
    setEditingQuizQuestionId(q.id);
    setQuizTargetDemo(q.demoTitle);
    setQuizQuestionText(q.question);
    setQuizOptions(q.options && q.options.length === 4 ? q.options : ['', '', '', '']);
    setQuizCorrectOptionIndex(q.correctOptionIndex ?? null);
    setIsQuizBuilderOpen(true);
  };

  const handleDeleteQuizQuestion = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      setCreatedQuizQuestions(prev => prev.filter(q => q.id !== id));
      setToast({ type: 'success', message: 'Soal berhasil dihapus!' });
    }
  };

  // Open Task Grading modal values
  const handleOpenTaskGrading = (task: Task) => {
    setSelectedTaskToGrade(task);
    setTaskGradeInput(task.submission?.grade || 90);
    setTaskFeedbackInput(task.submission?.feedback || 'Hasil pengerjaan sangat baik dan rapi.');
  };

  // Save Task Grade
  const handleSaveTaskGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToGrade) return;

    onGradeTask(selectedTaskToGrade.id, Number(taskGradeInput), taskFeedbackInput);
    setToast({ 
      type: 'success', 
      message: `Pemberian nilai ${taskGradeInput} untuk "${selectedTaskToGrade.title.split(':')[0]}" sukses!` 
    });
    setSelectedTaskToGrade(null);
  };

  // Save Demo Grade
  const handleSaveDemoGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemoToGrade) return;

    setDemoList(prev => prev.map(d => {
      if (d.id === selectedDemoToGrade.id) {
        return {
          ...d,
          status: 'Lulus',
          score: Number(demoGradeInput),
          grades: {
            tryOut: demoGradeTryOut,
            assignment: demoGradeAssignment,
            assessment: demoGradeAssessment
          },
          reviewedAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) + ' WIB'
        };
      }
      return d;
    }));

    setToast({ 
      type: 'success', 
      message: `Demo praktikum dinilai ${demoGradeInput}!` 
    });
    setSelectedDemoToGrade(null);
  };

  // Demo CRUD operations
  const handleOpenEditDemo = (demo: DemoGradingInfo) => {
    setEditingDemoId(demo.id);
    setDemoStudentName(demo.studentName);
    setDemoNim(demo.nim);
    setDemoLabTitle(demo.labTitle);
    setDemoTitle(demo.demoTitle);
    setDemoStatus(demo.status);
    setDemoScore(demo.score !== null ? String(demo.score) : '');
    setIsDemoSettingFormOpen(true);
  };

  const handleSaveDemoSetting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoStudentName || !demoTitle) {
      alert('Nama Praktikan dan Judul Demo wajib diisi.');
      return;
    }

    const scoreNum = demoScore === '' ? null : Number(demoScore);

    if (editingDemoId) {
      setDemoList(prev => prev.map(d => d.id === editingDemoId ? {
        ...d,
        studentName: demoStudentName,
        nim: demoNim,
        labTitle: demoLabTitle,
        demoTitle,
        status: demoStatus,
        score: scoreNum,
        reviewedAt: scoreNum !== null ? (d.reviewedAt || new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB') : undefined
      } : d));
      setToast({ type: 'success', message: `Data Demo "${demoTitle}" berhasil diperbarui!` });
    } else {
      const newD: DemoGradingInfo = {
        id: `demo-${Date.now()}`,
        studentName: demoStudentName,
        nim: demoNim,
        labTitle: demoLabTitle,
        demoTitle,
        status: demoStatus,
        score: scoreNum,
        grades: null,
        reviewedAt: scoreNum !== null ? new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) + ' WIB' : undefined
      };
      setDemoList(prev => [...prev, newD]);
      setToast({ type: 'success', message: `Demo baru berhasil dipublikasikan!` });
    }
    setIsDemoSettingFormOpen(false);
  };

  const handleDeleteDemoSetting = (id: string, title: string) => {
    setDeleteConfirm({ isOpen: true, id, title, type: 'demo' });
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* HEADER BANNER OF DOSEN WORKSPACE */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-6 md:p-8 shadow-md border border-indigo-200/20">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider text-blue-200">
              <Trophy size={11} /> Lecturer Dashboard
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-white">
              Sistem Manajemen Praktikum & Modul Dosen
            </h2>
            <p className="text-slate-200/85 text-xs max-w-2xl font-medium">
              Kelola aktivitas perkuliahan laboratorium, terbitkan soal modul mingguan, pantau aktivitas pendaftaran asisten, serta lakukan grading penugasan terperinci secara langsung.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <div className="bg-white/15 px-4 py-3 rounded-2xl border border-white/10 text-center shadow-inner">
              <span className="block text-[9px] font-black uppercase tracking-widest text-indigo-200">Total Kelas Lab</span>
              <strong className="block text-2xl font-extrabold text-white">{labs.length}</strong>
            </div>

          </div>
        </div>
      </div>

      {/* DASHBOARD SUB-TAB NAVIGATION */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => handleTabChange('labs')}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 uppercase tracking-wide leading-none ${
            activeDosenTab === 'labs'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="dosen-tab-labs"
        >
          <BookOpen size={14} /> Lab
        </button>
        <button
          onClick={() => handleTabChange('tasks')}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 uppercase tracking-wide leading-none ${
            activeDosenTab === 'tasks'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="dosen-tab-tasks"
        >
          <Calendar size={14} /> Tugas
        </button>
        <button
          onClick={() => handleTabChange('demo')}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 uppercase tracking-wide leading-none ${
            activeDosenTab === 'demo'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="dosen-tab-demo"
        >
          <Clock size={14} /> Demo
        </button>
        <button
          onClick={() => handleTabChange('grading')}
          className={`px-4 py-3 text-xs font-bold transition flex items-center gap-2 border-b-2 uppercase tracking-wide leading-none ${
            activeDosenTab === 'grading'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="dosen-tab-grading"
        >
          <Award size={14} /> Grading Tugas & Demo
        </button>
      </div>

      {/* GLOBAL SEARCH */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cari Lab, tugas, demo, atau nama mahasiswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow shadow-xs font-medium text-slate-700 placeholder-slate-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* RENDER ACTIVE TAB CORES */}

      {/* TAB 1: FORM CREATE, EDIT, DELETE LABORATORY */}
      {activeDosenTab === 'labs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Program Studi & Sesi Kelas Laboratorium</h3>
              <p className="text-slate-500 text-xs mt-0.5">Edit kurikulum rincian, syllabus perkuliahan, dan pengampu utama.</p>
            </div>
            <button
              onClick={handleOpenAddLab}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-900/10 shrink-0"
              id="btn-add-lab-dosen"
            >
              <PlusCircle size={15} /> Tambahkan Kelas Lab
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labs.filter(lab => 
              searchQuery === '' || 
              (lab.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
              (lab.courseName || '').toLowerCase().includes(searchQuery.toLowerCase())
            ).map((lab) => (
              <div 
                key={lab.id} 
                className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                      {lab.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Semester {lab.semester}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm leading-snug">{lab.title}</h4>
                    <p className="text-[11px] text-slate-450 mt-1 font-bold">Dosen Pengampu: {lab.dosen}</p>
                    <p className="text-slate-600 text-[11px] mt-2 line-clamp-2 leading-relaxed font-semibold">
                      {lab.description}
                    </p>
                  </div>


                </div>

                <div className="flex items-center justify-end border-t border-slate-100 pt-4 mt-4">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditLab(lab)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 border border-slate-150 rounded-lg transition"
                      title="Edit Lab"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteLabClick(lab.id, lab.title)}
                      className="p-1.5 text-red-500 hover:bg-red-50 border border-slate-150 rounded-lg transition"
                      title="Hapus Lab"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD / EDIT LAB MODAL POPUP */}
          {isLabFormOpen && (
            <div className="fixed inset-0 z-50 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-2xl shadow-xl p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setIsLabFormOpen(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full border border-slate-100 transition"
                >
                  <X size={16} />
                </button>

                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-5 uppercase tracking-wide">
                  {editingLabId ? 'Sunting Rincian Kelas Lab' : 'Tambah Laboratorium Baru'}
                </h3>

                <form onSubmit={handleSaveLab} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kategori Domain</label>
                    <input
                      type="text"
                      list="kategori-domain-list"
                      value={labCategory}
                      onChange={(e) => setLabCategory(e.target.value)}
                      placeholder="Ketik atau pilih kategori..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                      required
                    />
                    <datalist id="kategori-domain-list">
                      <option value="Rekayasa Perangkat Lunak" />
                      <option value="Infrastruktur Jaringan" />
                      <option value="Manajemen Data" />
                      <option value="Kecerdasan Buatan" />
                      <option value="Sistem Tertanam" />
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Judul Utama Laboratorium</label>
                    <input
                      type="text"
                      value={labTitle}
                      onChange={(e) => setLabTitle(e.target.value)}
                      placeholder="Contoh: Lab Pemrograman Web Pro"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Dosen Pengampu Utama</label>
                      <input
                        type="text"
                        value={labDosen}
                        onChange={(e) => setLabDosen(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Tingkat Semester Sesi</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={labSemester}
                        onChange={(e) => setLabSemester(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold"
                        required
                      />
                    </div>
                  </div>


                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Deskripsi Singkat Portal (Max 3 Kalimat)</label>
                    <textarea
                      value={labDescription}
                      onChange={(e) => setLabDescription(e.target.value)}
                      rows={2}
                      placeholder="Laboratorium difokuskan untuk membahas kerangka..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
                      required
                    />
                  </div>





                  <div className="border-t border-slate-100 pt-4 flex justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => setIsLabFormOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition"
                    >
                      Batalkan
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-1.5"
                    >
                      <Save size={14} /> Simpan Data
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}


      {/* TAB 2: FORM CREATE, EDIT, DELETE TASKS */}
      {activeDosenTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Penugasan Modul Pembelajaran Praktikum</h3>
              <p className="text-slate-500 text-xs mt-0.5">Kelola batas waktu deadline, format kuesioner penyelesaian, dan penugasan per laboratorium.</p>
            </div>

          </div>

          {/* Group tasks by Lab */}
          {(() => {

            if (labs.length === 0) {
              return (
                <div className="bg-white border border-slate-150 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  Belum ada laboratorium yang terdaftar di sistem.
                </div>
              );
            }

            return (
              <div className="space-y-8 animate-fade-in">
                {labs.filter(lab => {
                  if (searchQuery === '') return true;
                  const sq = searchQuery.toLowerCase();
                  if ((lab.title || '').toLowerCase().includes(sq) || (lab.courseName || '').toLowerCase().includes(sq)) return true;
                  const labTasks = tasks.filter((t) => t.labId === lab.id);
                  return labTasks.some(t => (t.title || '').toLowerCase().includes(sq) || (t.description || '').toLowerCase().includes(sq));
                }).map((lab) => {
                  const labTasks = tasks.filter((t) => t.labId === lab.id);

                  return (
                    <div key={lab.id} className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300">
                      {/* LAB HEADER */}
                      <div 
                        onClick={() => toggleLabCollapse(lab.id)}
                        className={`bg-slate-50/85 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition select-none ${expandedLabs.includes(lab.id) ? 'border-b border-slate-150' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-1">
                              {lab.courseName}
                            </span>
                            <h3 className="text-sm font-black text-slate-900 leading-tight">
                              {lab.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            <span className="text-[10.5px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl shadow-3xs">
                              {labTasks.length} Tugas Modul
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 shrink-0 shadow-3xs transition">
                            {expandedLabs.includes(lab.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </div>

                      {expandedLabs.includes(lab.id) && (
                        <div className="p-6 space-y-6 bg-white">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setEditingTaskId(null);
                                setTaskLabId(lab.id);
                                setTaskTitle('');
                                setTaskDescription('');
                                setTaskDeadline('20 Juni 2026, 23:59 WIB');
                                setTaskFormatText('File PDF Dokumen Laporan\nScreenshot Hasil Run');
                                setIsTaskFormOpen(true);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-900/10 shrink-0 cursor-pointer"
                            >
                              <PlusCircle size={15} /> Tambah Tugas Modul
                            </button>
                          </div>

                          {labTasks.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Belum ada tugas modul untuk praktikum ini.</p>
                          ) : (
                            <div className="space-y-3.5">
                              {labTasks.map((task) => (
                                <div 
                                  key={task.id} 
                                  className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all pl-5 border-l-4 border-l-indigo-500 hover:shadow-xs"
                                >
                                  <div className="space-y-1.5 max-w-xl">
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <span className="text-[10px] text-slate-400 font-bold">
                                        ID: {task.id}
                                      </span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{task.title}</h4>
                                    <p className="text-slate-500 text-[11px] font-semibold line-clamp-2">{task.description}</p>
                                    
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                      {task.format.map((fmt, fIdx) => (
                                        <span key={fIdx} className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 border border-slate-150 rounded">
                                          Format: {fmt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-col justify-between sm:items-end gap-3 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                                    <div className="text-left sm:text-right">
                                      <p className="text-[9px] text-slate-400 font-black tracking-wider uppercase">Batas Deadline</p>
                                      <p className="text-[11px] text-red-650 font-bold">{task.deadline}</p>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditTask(task)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 border border-slate-150 rounded-lg transition"
                                        title="Sunting Tugas"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTaskClick(task.id, task.title)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 border border-slate-150 rounded-lg transition"
                                        title="Hapus Tugas"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* ADD / EDIT TASK MODAL POPUP */}
          {isTaskFormOpen && (
            <div className="fixed inset-0 z-50 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white border border-slate-200 max-w-2xl w-full rounded-2xl shadow-xl p-8 relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setIsTaskFormOpen(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full border border-slate-100 transition"
                >
                  <X size={16} />
                </button>

                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-5 uppercase tracking-wide">
                  {editingTaskId ? 'Sunting Modul Tugas' : 'Buat Modul Tugas Baru'}
                </h3>

                <form onSubmit={handleSaveTask} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Pilih Laboratorium Induk</label>
                    <select
                      value={taskLabId}
                      onChange={(e) => setTaskLabId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                      disabled={labs.length === 0}
                    >
                      {labs.map((l) => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Judul Penugasan</label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Contoh: Tugas 03: REST API Authentication & Middleware"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Persyaratan & Deskripsi Tugas</label>
                    <textarea
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                      rows={3}
                      placeholder="Sebutkan langkah detail penyusunan kode, instruksi login JWT, dan rute middleware..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Batas Akhir (Deadline string)</label>
                      <input
                        type="text"
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                        placeholder="Contoh: 19 Juni 2026, 23:59 WIB"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Dokumen Format (Satu per baris)</label>
                      <textarea
                        value={taskFormatText}
                        onChange={(e) => setTaskFormatText(e.target.value)}
                        rows={2}
                        placeholder="Contoh: File PDF Dokumen Laporan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-mono focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-5 flex justify-end gap-3.5 font-sans mt-2">
                    <button
                      type="button"
                      onClick={() => setIsTaskFormOpen(false)}
                      className="px-5 py-2.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold"
                    >
                      Batalkan
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5 font-bold transition"
                    >
                      <Save size={14} /> Terapkan Tugas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}


      {/* TAB 3.5: ATUR JADWAL & KOMPONEN DEMO */}
      {activeDosenTab === 'demo' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Pengaturan Jadwal & Sesi Demo Praktikum</h3>
              <p className="text-slate-500 text-xs mt-0.5">Atur Demo interaktif tatap muka, kelola daftar praktikan, dan edit status kelulusan demo secara langsung.</p>
            </div>

          </div>

          {/* Group Demos by courseName */}
          {/* Group Demos by Lab */}
          {(() => {


            if (labs.length === 0) {
              return (
                <div className="bg-white border border-slate-150 rounded-2xl p-10 text-center text-slate-400 text-xs">
                  Belum ada laboratorium yang terdaftar di sistem.
                </div>
              );
            }

            return (
              <div className="space-y-8 animate-fade-in">
                {labs.filter(lab => {
                  if (searchQuery === '') return true;
                  const sq = searchQuery.toLowerCase();
                  if ((lab.title || '').toLowerCase().includes(sq) || (lab.courseName || '').toLowerCase().includes(sq)) return true;
                  const labDemos = demoList.filter((d) => d.labTitle === lab.title);
                  return labDemos.some(d => 
                    (d.demoTitle || '').toLowerCase().includes(sq) || 
                    (d.studentName || '').toLowerCase().includes(sq) || 
                    (d.nim || '').toLowerCase().includes(sq)
                  );
                }).map((lab) => {
                  const labDemos = demoList.filter((d) => d.labTitle === lab.title);

                  return (
                    <div key={lab.id} className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300">
                      {/* LAB HEADER */}
                      <div 
                        onClick={() => toggleLabCollapse(lab.id)}
                        className={`bg-slate-50/85 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition select-none ${expandedLabs.includes(lab.id) ? 'border-b border-slate-150' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-1">
                              {lab.courseName}
                            </span>
                            <h3 className="text-sm font-black text-slate-900 leading-tight">
                              {lab.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            <span className="text-[10.5px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl shadow-3xs">
                              {labDemos.length} Sesi Demo
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 shrink-0 shadow-3xs transition">
                            {expandedLabs.includes(lab.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </div>

                      {expandedLabs.includes(lab.id) && (
                        <div className="p-6 space-y-6 bg-white">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setQuizTargetLab(lab.title);
                                setEditingQuizQuestionId(null);
                                setQuizTargetDemo('');
                                setQuizQuestionText('');
                                setQuizOptions(['', '', '', '']);
                                setQuizCorrectOptionIndex(null);
                                setIsQuizBuilderOpen(true);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-900/10 shrink-0 cursor-pointer"
                            >
                              <FileQuestion size={15} /> Buat Soal Kuis
                            </button>
                            <button
                              onClick={() => {
                                setEditingDemoId(null);
                                setDemoStudentName('Mahasiswa Baru');
                                setDemoNim('2200000000');
                                setDemoLabTitle(lab.title);
                                setDemoTitle('');
                                setDemoStatus('Belum Mulai');
                                setDemoScore('');
                                setIsDemoSettingFormOpen(true);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-900/10 shrink-0 cursor-pointer"
                            >
                              <PlusCircle size={15} /> Tambah Demo
                            </button>
                          </div>

                          {labDemos.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic text-center py-4">Belum ada entri demo yang terpasang untuk praktikum ini.</p>
                          ) : (
                            <div className="divide-y divide-slate-100 bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-2xs">
                              {labDemos.map((demo) => {
                                const questionsForThisDemo = createdQuizQuestions.filter(q => q.demoTitle === demo.demoTitle);
                                return (
                                <div key={demo.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                      <h4 className="font-extrabold text-slate-950 text-xs leading-snug">{demo.demoTitle}</h4>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                                      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-150">
                                        <button
                                          onClick={() => {
                                            setExpandedDemoQuestions(prev => 
                                              prev.includes(demo.id) ? prev.filter(id => id !== demo.id) : [...prev, demo.id]
                                            );
                                          }}
                                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 border border-dashed border-indigo-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                                          title="Lihat Soal"
                                        >
                                          {expandedDemoQuestions.includes(demo.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                          <span className="text-[10px] font-bold pr-1">{questionsForThisDemo.length} Soal</span>
                                        </button>
                                        <button
                                          onClick={() => handleOpenEditDemo(demo)}
                                          className="p-1.5 text-blue-600 hover:bg-blue-50 border border-dashed border-blue-200 rounded-lg transition cursor-pointer animate-none"
                                          title="Edit Demo"
                                        >
                                          <Edit size={12} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteDemoSetting(demo.id, demo.demoTitle)}
                                          className="p-1.5 text-red-500 hover:bg-red-50 border border-dashed border-red-200 rounded-lg transition cursor-pointer animate-none"
                                          title="Hapus Demo"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  {expandedDemoQuestions.includes(demo.id) && (
                                    <div className="px-5 pb-5 pt-1 space-y-2 animate-fade-in">
                                      {questionsForThisDemo.length === 0 ? (
                                        <p className="text-[10px] text-slate-400 italic">Belum ada soal kuis yang dibuat untuk sesi demo ini.</p>
                                      ) : (
                                        <div className="space-y-2">
                                          {questionsForThisDemo.map((q, idx) => (
                                            <div key={q.id || idx} className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs flex items-start gap-2 justify-between">
                                              <div className="flex items-start gap-2">
                                                <span className="bg-indigo-100 text-indigo-700 font-black px-2 py-0.5 rounded shrink-0">{idx + 1}</span>
                                                <p className="text-slate-700 font-semibold mt-0.5">{q.question}</p>
                                              </div>
                                              <div className="flex gap-1 shrink-0">
                                                <button onClick={() => handleEditQuizQuestion(q)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition" title="Edit Soal">
                                                  <Edit size={12} />
                                                </button>
                                                <button onClick={() => handleDeleteQuizQuestion(q.id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition" title="Hapus Soal">
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )})}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* MANAGE DEMO MODAL POPUP */}
          {isDemoSettingFormOpen && (
            <div className="fixed inset-0 z-50 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setIsDemoSettingFormOpen(false)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full border border-slate-100 transition"
                >
                  <X size={16} />
                </button>

                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-5 uppercase tracking-wide">
                  {editingDemoId ? 'Sunting Slot Demo Praktikan' : 'Buat Sesi Demo Baru'}
                </h3>

                <form onSubmit={handleSaveDemoSetting} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Nama Mahasiswa / Praktikan</label>
                    <input
                      type="text"
                      value={demoStudentName}
                      onChange={(e) => setDemoStudentName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-850 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-455 mb-1">NIM Mahasiswa</label>
                    <input
                      type="text"
                      value={demoNim}
                      onChange={(e) => setDemoNim(e.target.value)}
                      placeholder="Contoh: 2201083042"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-755 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Judul Demo / Topik Pengujian</label>
                    <input
                      type="text"
                      value={demoTitle}
                      onChange={(e) => setDemoTitle(e.target.value)}
                      placeholder="Contoh: Demo ke-4: Uji Pertahanan Aplikasi Akhir"
                      className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Kelas Laboratorium Induk</label>
                    <select
                      value={demoLabTitle}
                      onChange={(e) => setDemoLabTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-850 font-bold focus:bg-white"
                    >
                      {labs.map((l) => (
                        <option key={l.id} value={l.title}>{l.title}</option>
                      ))}
                      <option value="Lab Independen / Sesi Khusus">Lab Independen / Sesi Khusus</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Status Demo</label>
                      <select
                        value={demoStatus}
                        onChange={(e) => setDemoStatus(e.target.value as DemoGradingInfo['status'])}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold"
                      >
                        <option value="Belum Mulai">Belum Mulai</option>
                        <option value="Perlu Demo">Perlu Demo</option>
                        <option value="Lulus">Lulus (Telah Dinilai)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Skor Nilai Demo (Opsional)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Belum ada skor"
                        value={demoScore}
                        onChange={(e) => setDemoScore(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-855 font-bold"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end gap-3.5 font-sans">
                    <button
                      type="button"
                      onClick={() => setIsDemoSettingFormOpen(false)}
                      className="px-4 py-2.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 font-bold uppercase tracking-wide text-[10px] transition"
                    >
                      <Save size={14} /> Simpan Sesi Demo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUIZ BUILDER MODAL POPUP */}
      {isQuizBuilderOpen && (
        <div className="fixed inset-0 z-60 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsQuizBuilderOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full border border-slate-100 transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-5 uppercase tracking-wide">
              Bank Soal & Konfigurasi Kuis
            </h3>

            <form autoComplete="off" onSubmit={(e) => {
              e.preventDefault();
              if (quizCorrectOptionIndex === null) {
                alert('Pilih salah satu kunci jawaban yang benar terlebih dahulu.');
                return;
              }
              if (editingQuizQuestionId) {
                setCreatedQuizQuestions(createdQuizQuestions.map(q => q.id === editingQuizQuestionId ? {
                  ...q,
                  demoTitle: quizTargetDemo,
                  question: quizQuestionText,
                  options: quizOptions,
                  correctOptionIndex: quizCorrectOptionIndex
                } : q));
              } else {
                setCreatedQuizQuestions([...createdQuizQuestions, { 
                  id: Math.random().toString(36).substr(2, 9),
                  demoTitle: quizTargetDemo, 
                  question: quizQuestionText,
                  options: quizOptions,
                  correctOptionIndex: quizCorrectOptionIndex
                }]);
              }
              setQuizQuestionText('');
              setQuizOptions(['', '', '', '']);
              setQuizCorrectOptionIndex(null);
              setEditingQuizQuestionId(null);
              setIsQuizBuilderOpen(false);
              setToast({ type: 'success', message: editingQuizQuestionId ? 'Soal kuis berhasil diperbarui!' : 'Soal kuis berhasil disimpan ke bank soal!' });
            }} className="space-y-4 text-xs font-semibold">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Laboratorium Terkait</label>
                <input
                  type="text"
                  value={quizTargetLab}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Pilih Sesi Demo (Tautan Kuis)</label>
                <select
                  value={quizTargetDemo}
                  onChange={(e) => setQuizTargetDemo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold focus:bg-white"
                  required
                >
                  <option value="" disabled>-- Pilih Demo Praktikum --</option>
                  {demoList.filter(d => d.labTitle === quizTargetLab).map(d => d.demoTitle).filter((v, i, a) => a.indexOf(v) === i).map((title, idx) => (
                    <option key={idx} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Pertanyaan Soal</label>
                <textarea
                  value={quizQuestionText}
                  onChange={(e) => setQuizQuestionText(e.target.value)}
                  placeholder="Ketikkan deskripsi pertanyaan kuis..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Pilihan Ganda & Kunci Jawaban</label>
                
                {[0, 1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      checked={quizCorrectOptionIndex === idx}
                      onChange={() => setQuizCorrectOptionIndex(idx)}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" 
                    />
                    <input 
                      type="text" 
                      autoComplete="new-password"
                      value={quizOptions[idx]}
                      onChange={(e) => {
                        const newOptions = [...quizOptions];
                        newOptions[idx] = e.target.value;
                        setQuizOptions(newOptions);
                      }}
                      placeholder={`Opsi ${String.fromCharCode(65 + idx)}...`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                ))}
                <p className="text-[9px] text-slate-400 italic pt-1">* Pilih salah satu tombol radio untuk menandai kunci jawaban yang benar.</p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3.5 font-sans">
                <button
                  type="button"
                  onClick={() => setIsQuizBuilderOpen(false)}
                  className="px-4 py-2.5 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 font-bold uppercase tracking-wide text-[10px] transition"
                >
                  <Save size={14} /> Simpan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* TAB 4: GRADING TUGAS MODUL & DEMO LAB */}
      {activeDosenTab === 'grading' && (
        <div className="space-y-8">
          
          {(() => {
            // Filter labs that have either active task submissions or registered demos to grade
            const labsToRender = labs.filter((lab) => {
              const hasTasks = tasks.some((t) => t.labId === lab.id && t.submission);
              const hasDemos = demoList.some((d) => d.labTitle === lab.title);
              
              if (!(hasTasks || hasDemos)) return false;

              if (searchQuery === '') return true;
              const sq = searchQuery.toLowerCase();
              if ((lab.title || '').toLowerCase().includes(sq) || (lab.courseName || '').toLowerCase().includes(sq)) return true;
              
              const labTasks = tasks.filter((t) => t.labId === lab.id && t.submission);
              const labDemos = demoList.filter((d) => d.labTitle === lab.title);
              
              const matchTask = labTasks.some(t => 
                (t.title || '').toLowerCase().includes(sq) || 
                (t.submission && (t.submission.studentName || '').toLowerCase().includes(sq)) ||
                (t.submission && (t.submission.nim || '').toLowerCase().includes(sq))
              );
              
              const matchDemo = labDemos.some(d =>
                (d.demoTitle || '').toLowerCase().includes(sq) ||
                (d.studentName || '').toLowerCase().includes(sq) ||
                (d.nim || '').toLowerCase().includes(sq)
              );

              return matchTask || matchDemo;
            });

            if (labsToRender.length === 0) {
              return (
                <div className="bg-white border border-slate-150 rounded-2xl p-10 text-center text-slate-400 text-xs font-semibold">
                  Belum ada antrean penilaian tugas modul maupun Demo tatap muka dari mahasiswa di sistem.
                </div>
              );
            }

            return (
              <div className="space-y-8 animate-fade-in">
                {labsToRender.map((lab) => {
                  const labTasks = tasks.filter((t) => t.labId === lab.id && t.submission);
                  const labDemos = demoList.filter((d) => d.labTitle === lab.title);

                  return (
                    <div key={lab.id} className="bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300">
                      {/* 1. LAYER: LAB HEADER & COURSE INFORMATION */}
                      <div 
                        onClick={() => toggleLabCollapse(lab.id)}
                        className={`bg-slate-50/85 px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition select-none ${expandedLabs.includes(lab.id) ? 'border-b border-slate-150' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block leading-none mb-1">
                              {lab.courseName}
                            </span>
                            <h3 className="text-sm font-black text-slate-900 leading-tight">
                              {lab.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            <span className="text-[10.5px] font-black text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl shadow-3xs">
                              {labTasks.length} Tugas Modul
                            </span>
                            <span className="text-[10.5px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl shadow-3xs">
                              {labDemos.length} Sesi Demo
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-800 shrink-0 shadow-3xs transition">
                            {expandedLabs.includes(lab.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </div>

                      {expandedLabs.includes(lab.id) && (
                        <div className="p-6 space-y-6">
                        {/* 2. LAYER: TUGAS MODUL */}
                        <div className="space-y-3.5">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 pl-0.5">
                            <FileText size={14} className="text-blue-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                              Tugas:
                            </h4>
                          </div>

                          {labTasks.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic pl-1">Tidak ada tugas modul yang terkumpul untuk praktikum ini.</p>
                          ) : (
                            <div className="space-y-4">
                              {labTasks.map((task) => {
                                const sub = task.submission!;
                                return (
                                  <div key={task.id} className="bg-slate-50/40 border border-slate-150 rounded-2xl p-4.5 space-y-4">
                                    <div 
                                      onClick={() => toggleTaskCollapse(task.id)}
                                      className="border-b border-dashed border-slate-205/60 pb-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 px-2 pt-2 -mx-2 rounded-t-xl transition"
                                    >
                                      <h5 className="font-extrabold text-xs text-slate-900 leading-tight">
                                        <span className="text-slate-500 font-mono">{task.id}</span> — {task.title}
                                      </h5>
                                      <div className="text-slate-400">
                                        {!expandedTasks.includes(task.id) ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                      </div>
                                    </div>

                                    {expandedTasks.includes(task.id) && (
                                    <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-4.5">
                                      {/* 3. LAYER: DAFTAR PESERTA YANG PERLU DINILAI */}
                                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-450 pb-2 border-b border-slate-100">
                                        <span>Daftar Peserta / Praktikan</span>
                                        <span className={`px-2 py-0.5 rounded-md ${
                                          sub.status === 'Selesai' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                            : 'bg-amber-50 text-amber-700 border border-amber-120'
                                        }`}>{sub.status}</span>
                                      </div>

                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 bg-indigo-50 border border-indigo-150 text-indigo-700 font-black text-xs rounded-full flex items-center justify-center">
                                              BS
                                            </div>
                                            <div>
                                              <strong className="text-slate-800 text-xs font-black">{sub.studentName || 'Budi Santoso'}</strong>
                                              <span className="text-[10px] text-slate-450 ml-2 font-mono font-bold">(NIM {sub.nim || '2201083042'})</span>
                                            </div>
                                          </div>

                                          <div className="pl-9 space-y-1.5 text-[11px] text-slate-500 font-semibold leading-relaxed">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                              <span className="flex items-center gap-1.5 flex-wrap">
                                                <span>📄 Berkas: <strong className="text-slate-700">{sub.fileName}</strong> ({sub.fileSize})</span>
                                                <button 
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setToast({ type: 'info', message: `Mengunduh berkas ${sub.fileName}...` });
                                                  }}
                                                  className="ml-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors shadow-3xs"
                                                >
                                                  <Download size={10} /> Unduh
                                                </button>
                                              </span>
                                              <span className="text-slate-300">|</span>
                                              <span>Kirim: <span className="text-slate-400 font-bold">{sub.submittedAt}</span></span>
                                            </div>
                                            {sub.note && (
                                              <p className="text-slate-500 italic bg-slate-50 border border-slate-100/70 p-2.5 rounded-lg mt-1 font-medium">
                                                “{sub.note}”
                                              </p>
                                            )}
                                            {sub.feedback && (
                                              <div className="text-[11px] bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl text-blue-755 mt-2 font-bold flex flex-col gap-1">
                                                <span className="text-[9px] uppercase tracking-wider text-blue-550 block font-black">Catatan Koreksi dari Pengampu / Asisten</span>
                                                <p className="font-semibold text-slate-705 leading-relaxed">{sub.feedback}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center pl-9 md:pl-0">
                                          {sub.grade !== null ? (
                                            <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl px-3 py-2 text-xs font-black flex items-center gap-1 leading-none shadow-3xs">
                                              <Award size={13} /> Score: {sub.grade} / 100
                                            </div>
                                          ) : (
                                            <span className="text-[10px] font-bold text-amber-655 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-100/80 leading-none">
                                              Belum Dinilai
                                            </span>
                                          )}

                                          <button
                                            onClick={() => handleOpenTaskGrading(task)}
                                            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-600 border border-blue-150 text-blue-700 hover:text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                                          >
                                            {sub.grade !== null ? 'Re-grade' : 'Beri Nilai'} <ArrowRight size={12} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* 2. LAYER: DEMO PRAKTIKUM */}
                        <div className="space-y-3.5 pt-4">
                          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 pl-0.5">
                            <Clock size={14} className="text-indigo-600" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                              Demo:
                            </h4>
                          </div>

                          {labDemos.length === 0 ? (
                            <p className="text-[11px] text-slate-400 italic pl-1">Tidak ada Demo praktikum untuk modul ini.</p>
                          ) : (
                            <div className="space-y-4">
                              {(() => {
                                // Only show students who have already completed the demo
                                const completedDemos = labDemos.filter(d => d.status !== 'Perlu Demo');
                                
                                if (completedDemos.length === 0) {
                                  return (
                                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 text-center">
                                      <p className="text-[11px] font-semibold text-slate-400">Belum ada peserta yang mengerjakan demo ini.</p>
                                    </div>
                                  );
                                }

                                // Group demos of this lab by demoTitle so that we show them cleanly
                                const demosByTitle: { [title: string]: DemoGradingInfo[] } = {};
                                completedDemos.forEach((demo) => {
                                  if (!demosByTitle[demo.demoTitle]) {
                                    demosByTitle[demo.demoTitle] = [];
                                  }
                                  demosByTitle[demo.demoTitle].push(demo);
                                });

                                return Object.keys(demosByTitle).map((demoTitle) => {
                                  const entries = demosByTitle[demoTitle];
                                  return (
                                    <div key={demoTitle} className="bg-slate-50/40 border border-slate-150 rounded-2xl p-4.5 space-y-4">
                                      <div 
                                        onClick={() => toggleDemoCollapse(demoTitle)}
                                        className="border-b border-dashed border-slate-205/60 pb-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 px-2 pt-2 -mx-2 rounded-t-xl transition"
                                      >
                                        <h5 className="font-extrabold text-xs text-slate-900 leading-tight">
                                          {demoTitle}
                                        </h5>
                                        <div className="text-slate-400">
                                          {!expandedDemos.includes(demoTitle) ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                                        </div>
                                      </div>

                                      {expandedDemos.includes(demoTitle) && (
                                      <div className="bg-white border border-slate-150 rounded-xl p-4 space-y-4">
                                        {/* 3. LAYER: DAFTAR PESERTA YANG PERLU DINILAI */}
                                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-450 pb-2 border-b border-slate-100">
                                          Daftar Peserta / Penguji
                                        </div>

                                        <div className="space-y-4 divide-y divide-slate-100">
                                          {entries.map((demo, idx) => (
                                            <div key={demo.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-5 ${idx > 0 ? 'pt-4' : ''}`}>
                                              <div className="space-y-2">
                                                <div className="flex items-center gap-2.5">
                                                  <div className="w-7 h-7 bg-indigo-50 border border-indigo-150 text-indigo-700 font-black text-xs rounded-full flex items-center justify-center">
                                                    BS
                                                  </div>
                                                  <div>
                                                    <strong className="text-slate-800 text-xs font-black">{demo.studentName}</strong>
                                                    <span className="text-[10px] text-slate-450 ml-2 font-mono font-bold">(NIM {demo.nim})</span>
                                                  </div>
                                                </div>

                                                <div className="pl-9 flex flex-wrap items-center gap-3">
                                                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                                    demo.status === 'Lulus' 
                                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                      : demo.status === 'Perlu Demo' 
                                                      ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                  }`}>
                                                    {demo.status === 'Lulus' ? '✓ Lulus / Berhasil' : demo.status}
                                                  </span>
                                                  {demo.reviewedAt && (
                                                    <span className="text-[10.5px] text-slate-400 font-semibold italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                                      Selesai: {demo.reviewedAt}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-3 shrink-0 self-end md:self-center pl-9 md:pl-0">
                                                {demo.score !== null ? (
                                                  <div className="flex flex-col items-end gap-1">
                                                    <div className="bg-indigo-50 text-indigo-800 border border-indigo-150 rounded-xl px-3 py-2 text-xs font-black flex items-center gap-1 leading-none shadow-3xs">
                                                      <Award size={13} /> Skor Demo: {demo.score} / 100
                                                    </div>
                                                    {demo.grades && (
                                                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                                                        <span>TO: {demo.grades.tryOut}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <span>Ass: {demo.grades.assignment}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <span>Eval: {demo.grades.assessment}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className="flex flex-col items-end gap-1 opacity-75">
                                                    <div className="bg-slate-100 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black flex items-center gap-1 leading-none shadow-3xs">
                                                      <Award size={13} /> Skor Demo: 0 / 100
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                                                      <span>TO: 0</span>
                                                      <span className="text-slate-300">|</span>
                                                      <span>Ass: 0</span>
                                                      <span className="text-slate-300">|</span>
                                                      <span>Eval: 0</span>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
                })}
              </div>
            );
          })()}

          {/* TASK GRADING MODAL POPUP */}
          {selectedTaskToGrade && (
            <div className="fixed inset-0 z-50 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-xl p-6 relative">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToGrade(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full border border-slate-100 transition"
                >
                  <X size={16} />
                </button>

                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-5 uppercase tracking-wide">
                  Grading Tugas Praktikum Modul
                </h3>

                <form onSubmit={handleSaveTaskGrading} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Tugas Modul</label>
                    <p className="font-extrabold text-xs text-slate-800 mt-1">{selectedTaskToGrade.title}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Dokumen Berkas Dikirim</label>
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 border border-slate-200/80 rounded-xl mt-1">
                      <p className="font-mono text-slate-700 truncate mr-3">
                        {selectedTaskToGrade.submission?.fileName} ({selectedTaskToGrade.submission?.fileSize})
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setToast({ type: 'info', message: `Mengunduh berkas ${selectedTaskToGrade.submission?.fileName}...` });
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-3xs shrink-0 cursor-pointer"
                      >
                        <Download size={12} /> Unduh Berkas
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Skor Nilai Mahasiswa (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={taskGradeInput}
                      onChange={(e) => setTaskGradeInput(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-850 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450 mb-1">Catatan Koreksi dari Pengampu / Asisten</label>
                    <textarea
                      value={taskFeedbackInput}
                      onChange={(e) => setTaskFeedbackInput(e.target.value)}
                      rows={3}
                      placeholder="Tulis kritik, apresiasi, atau poin perbaikan algoritma..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-semibold"
                      required
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => setSelectedTaskToGrade(null)}
                      className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                    >
                      Kirim Nilai
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* DEMO GRADING MODAL POPUP */}
          {selectedDemoToGrade && (
            <div className="fixed inset-0 z-50 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-xl p-6 relative">
                <button
                  type="button"
                  onClick={() => setSelectedDemoToGrade(null)}
                  className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full border border-slate-100 transition"
                >
                  <X size={16} />
                </button>

                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 mb-5 uppercase tracking-wide">
                  Penilaian Demo Sesi Praktikum
                </h3>

                <form onSubmit={handleSaveDemoGrading} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Sesi Demo Praktikum</label>
                    <p className="font-extrabold text-xs text-slate-800 mt-1 leading-snug">{selectedDemoToGrade.demoTitle}</p>
                    <p className="text-[10px] text-slate-400">{selectedDemoToGrade.labTitle}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-450">Aspek Tanya Jawab</label>
                    <p className="text-slate-600 leading-relaxed font-semibold mt-1">
                      Uji logika penulisan parameter, penanganan error, ketepatan rancangan data, serta pemahaman materi.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 w-24">Try Out</label>
                      <input
                        type="text"
                        value={demoGradeTryOut}
                        onChange={(e) => setDemoGradeTryOut(e.target.value)}
                        placeholder="e.g. 10%"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 w-24">Assignment</label>
                      <input
                        type="text"
                        value={demoGradeAssignment}
                        onChange={(e) => setDemoGradeAssignment(e.target.value)}
                        placeholder="e.g. 45%"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 w-24">Assessment</label>
                      <input
                        type="text"
                        value={demoGradeAssessment}
                        onChange={(e) => setDemoGradeAssessment(e.target.value)}
                        placeholder="e.g. 45%"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 mt-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-450 w-24">Total Skor</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={demoGradeInput}
                        onChange={(e) => setDemoGradeInput(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-indigo-700 text-sm font-black focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => setSelectedDemoToGrade(null)}
                      className="px-4 py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-lg"
                    >
                      Bobotkan Nilai
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-100 bg-slate-930/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative border border-slate-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
              <Trash2 size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">Hapus {deleteConfirm.type === 'lab' ? 'Laboratorium' : deleteConfirm.type === 'task' ? 'Tugas' : 'Demo'}?</h3>
            <p className="text-xs text-slate-500 font-medium mb-8 px-2">
              Apakah Anda yakin ingin menghapus <strong className="text-slate-800 font-bold">&quot;{deleteConfirm.title}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition shadow-lg shadow-red-600/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
