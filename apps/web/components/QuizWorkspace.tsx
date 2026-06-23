import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Quiz, StudentQuizAttempt, Lab, StudentProfile } from '../types';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CheckCircle2, 
  X, 
  HelpCircle, 
  Bookmark, 
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface QuizWorkspaceProps {
  quizzes: Quiz[];
  attempts: StudentQuizAttempt[];
  labs: Lab[];
  student: StudentProfile;
  onAddAttempt: (attempt: StudentQuizAttempt) => void;
  onBackToLab: (labId?: string) => void;
  initialQuizId?: string;
}

export const QuizWorkspace: React.FC<QuizWorkspaceProps> = ({
  quizzes,

  labs,
  student,
  onAddAttempt,
  onBackToLab,
  initialQuizId
}) => {
  // Navigation & session screens
  const [screen, setScreen] = useState<'detail' | 'active' | 'result' | 'discussion'>('detail');
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [viewingAttempt, setViewingAttempt] = useState<StudentQuizAttempt | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active quiz session states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const selectedAnswersRef = React.useRef<{ [questionId: string]: number }>({});
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]); // "Flag for review" equivalent
  const [timeLeft, setTimeLeft] = useState<number>(0); // active countdown in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<StudentQuizAttempt | null>(null);

  // Initialize from URL params if quizId is provided
  useEffect(() => {
    let targetQuizId = initialQuizId;
    
    if (!targetQuizId && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      targetQuizId = urlParams.get('quizId') || undefined;
    }

    if (targetQuizId) {
      const quiz = quizzes.find(q => q.id === targetQuizId);
      if (quiz) {
        setTimeout(() => {
          setSelectedQuiz(quiz);
          
          let initialScreen: 'detail' | 'active' = 'detail';
          try {
            const saved = sessionStorage.getItem('quiz_state_' + targetQuizId);
            if (saved) {
              const parsed = JSON.parse(saved);
              setSelectedAnswers(parsed.selectedAnswers || {});
              selectedAnswersRef.current = parsed.selectedAnswers || {};
              setMarkedQuestions(parsed.markedQuestions || []);
              setTimeLeft(parsed.timeLeft || (quiz.timeLimitMinutes * 60));
              
              // Check URL for specific question index
              let urlIndex = parsed.currentQuestionIndex || 0;
              const tabQuery = new URLSearchParams(window.location.search).get('tab');
              if (tabQuery) {
                const match = tabQuery.match(/\/soal-(\d+)/);
                if (match) {
                  const parsedIndex = parseInt(match[1], 10) - 1;
                  if (parsedIndex >= 0 && parsedIndex < quiz.questions.length) {
                    urlIndex = parsedIndex;
                  }
                }
              }
              setCurrentQuestionIndex(urlIndex);
              initialScreen = 'active';
            }
          } catch {}
          
          setScreen(initialScreen);
          
          // Clear the URL param without refreshing so it doesn't get stuck (only if from URL params)
          if (!initialQuizId && typeof window !== 'undefined') {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        }, 0);
      }
    }
  }, [quizzes, initialQuizId]);

  // Ticking effects for the active quiz countdown
  useEffect(() => {
    if (screen !== 'active' || !selectedQuiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out!
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, selectedQuiz]);

  // Save state continuously while active
  useEffect(() => {
    if (selectedQuiz && screen === 'active') {
      sessionStorage.setItem('quiz_state_' + selectedQuiz.id, JSON.stringify({
        selectedAnswers,
        markedQuestions,
        timeLeft,
        currentQuestionIndex
      }));
    }
  }, [selectedAnswers, markedQuestions, timeLeft, currentQuestionIndex, screen, selectedQuiz]);

  // Format timer helper (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateQuestionUrl = (index: number) => {
    const tabQuery = searchParams.get('tab');
    if (tabQuery) {
      const baseTab = tabQuery.split('/soal-')[0];
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('tab', `${baseTab}/soal-${index + 1}`);
      router.replace(`${pathname}?${newParams.toString()}`);
    }
  };

  const handleSetQuestionIndex = (index: number) => {
    setCurrentQuestionIndex(index);
    updateQuestionUrl(index);
  };

  // Start executing the quiz
  const handleStartQuiz = () => {
    if (!selectedQuiz) return;
    
    let startIndex = 0;
    const tabQuery = searchParams.get('tab');
    if (tabQuery) {
      const match = tabQuery.match(/\/soal-(\d+)/);
      if (match) {
        startIndex = parseInt(match[1], 10) - 1;
        if (startIndex < 0 || startIndex >= selectedQuiz.questions.length) startIndex = 0;
      }
    }

    setCurrentQuestionIndex(startIndex);
    setSelectedAnswers({});
    selectedAnswersRef.current = {};
    setMarkedQuestions([]);
    setTimeLeft(selectedQuiz.timeLimitMinutes * 60);
    setScreen('active');
    
    updateQuestionUrl(startIndex);
  };

  // Select an option for currently viewed question
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => {
      const nextAnswers = {
        ...prev,
        [questionId]: optionIndex
      };
      selectedAnswersRef.current = nextAnswers;
      return nextAnswers;
    });
  };

  // Toggle "Flag/Ragu-ragu" marker
  const toggleMarkQuestion = (questionId: string) => {
    setMarkedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  function handleAutoSubmit() {
    if (!selectedQuiz) return;
    submitQuizAnswers();
    alert('Waktu kuis habis! Jawaban Anda telah dikumpulkan secara otomatis.');
  }

  // Actually aggregate score and submit
  function submitQuizAnswers() {
    if (!selectedQuiz) return;
    setIsSubmitModalOpen(false);

    // Calculate score
    const questions = selectedQuiz.questions;
    let correctCount = 0;
    
    questions.forEach(q => {
      const studentAnswer = selectedAnswersRef.current[q.id];
      if (studentAnswer !== undefined && studentAnswer === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);

    const newAttempt: StudentQuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: selectedQuiz.id,
      studentName: student.name,
      nim: student.nim,
      score: finalScore,
      correctAnswersCount: correctCount,
      totalQuestionsCount: questions.length,
      completedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB',
      selectedAnswers: { ...selectedAnswersRef.current }
    };

    sessionStorage.removeItem('quiz_state_' + selectedQuiz.id);

    onAddAttempt(newAttempt);
    setLatestAttempt(newAttempt);
    setScreen('result');
  };

  const handleManualSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  // View discussion of an old or just finished attempt
  const handleViewDiscussion = (attempt: StudentQuizAttempt) => {
    const matchingQuiz = quizzes.find(q => q.id === attempt.quizId);
    if (!matchingQuiz) return;
    setSelectedQuiz(matchingQuiz);
    setViewingAttempt(attempt);
    setScreen('discussion');
  };

  // Back to main listing (Now calls onBackToLab)
  const handleGoBackToList = () => {
    onBackToLab(selectedQuiz?.labId);
  };

  // Get matching lab names
  const getLabTitle = (labId: string) => {
    const lab = labs.find(l => l.id === labId);
    return lab ? lab.title : 'Laboratorium Umum';
  };

  if (!selectedQuiz && screen === 'detail') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 space-y-4">
        <HelpCircle size={48} className="text-slate-300" />
        <p>Memuat sesi kuis atau sesi tidak ditemukan...</p>
        <button onClick={() => onBackToLab()} className="px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl mt-4 hover:bg-slate-50">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800" id="quiz-workspace-container">
      


      {/* ==========================================
          SCREEN 2: QUIZ DETAIL & PRE-START RULE PAGE
         ========================================== */}
      {screen === 'detail' && selectedQuiz && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in" id="quiz-preflight-card">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Konfirmasi Partisipasi Ujian
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {selectedQuiz.title}
            </h3>
            <p className="text-xs font-bold text-slate-400">
              Materi Terkait: {getLabTitle(selectedQuiz.labId)}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3 text-xs leading-relaxed font-semibold text-slate-650">
            <h4 className="font-extrabold text-slate-800 border-b border-slate-200/80 pb-2">Ketentuan & Aturan Kuis:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Kuis terdiri dari <strong className="text-slate-900">{selectedQuiz.questions.length} butir pertanyaan</strong> pilihan ganda.</li>
              <li>Waktu pengerjaan dibatasi maksimum <strong className="text-slate-900">{selectedQuiz.timeLimitMinutes} Menit</strong>.</li>
              <li>Kuis bersifat satu arah pengerjaan & langsung terekam pada sistem nilai dosen.</li>
              <li>Jika waktu habis sebelum sempat disubmit manual, <strong className="text-slate-900 border-b border-amber-300">sistem otomatis mengamankan</strong> sisa jawaban yang telah terisi.</li>
              <li>Gunakan fitur <span className="text-amber-600 font-extrabold">Ragu-Ragu</span> bila belum meyakini jawaban agar tidak terlewat.</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-3.5 text-center">
            <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">WAKTU LIMIT</p>
              <p className="font-black text-slate-800 text-sm mt-0.5">{selectedQuiz.timeLimitMinutes} m</p>
            </div>
            <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">JUMLAH SOAL</p>
              <p className="font-black text-slate-800 text-sm mt-0.5">{selectedQuiz.questions.length} Butir</p>
            </div>
            <div className="p-3 bg-purple-50/50 border border-purple-100/50 rounded-2xl">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">KATEGORI</p>
              <p className="font-black text-slate-800 text-sm mt-0.5 truncate uppercase">Pilihan Ganda</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleGoBackToList}
              className="flex-1 py-3 border border-slate-200 text-slate-750 hover:bg-slate-50 text-xs font-extrabold rounded-2xl transition shadow-3xs"
            >
              Kembali
            </button>
            <button
              onClick={handleStartQuiz}
              className="flex-1 py-3 bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-100/80 transition"
              id="btn-confirm-start-quiz"
            >
              Mulai Tes Sekarang
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          SCREEN 3: ACTIVE INTERACTIVE TEST COMPONENT
         ========================================== */}
      {screen === 'active' && selectedQuiz && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in" id="quiz-active-interface">
          
          {/* Main Question Column */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              
              {/* Question Header Status */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-blue-600 uppercase tracking-widest">
                    SOAL NOMOR
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-slate-900">{currentQuestionIndex + 1}</span>
                    <span className="text-slate-400 text-xs">dari {selectedQuiz.questions.length}</span>
                  </div>
                </div>

                {/* VISUAL TIMER COUNTDOWN DISPLAY */}
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border transition duration-300 ${
                  timeLeft <= 60 
                    ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                    : 'bg-slate-50 border-slate-150 text-slate-700 animate-slide-in'
                }`}>
                  <Clock size={16} />
                  <span className="font-mono font-bold text-xs tracking-wider">
                    Sisa Waktu: {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-slate-900 font-extrabold text-sm sm:text-base leading-relaxed pl-1">
                {selectedQuiz.questions[currentQuestionIndex].questionText}
              </div>

              {/* Multiple Choice Options List */}
              <div className="space-y-3">
                {selectedQuiz.questions[currentQuestionIndex].options.map((option, index) => {
                  const qId = selectedQuiz.questions[currentQuestionIndex].id;
                  const isChecked = selectedAnswers[qId] === index;
                  const letter = String.fromCharCode(65 + index); // A, B, C, D...

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(qId, index)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 select-none ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/40 shadow-3xs ring-1 ring-blue-500'
                          : 'border-slate-150 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                      id={`opt-btn-${index}`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition ${
                        isChecked
                          ? 'bg-blue-600 text-white shadow-3xs shadow-blue-200'
                          : 'bg-slate-105 text-slate-500 border border-slate-205'
                      } `}>
                        {letter}
                      </div>
                      <span className={`text-xs sm:text-[13px] leading-relaxed pt-0.5 font-semibold ${
                        isChecked ? 'text-blue-900 font-extrabold' : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Controls bar at bottom of card */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex w-full md:w-auto gap-2 order-2 md:order-1">
                  <button
                    onClick={() => handleSetQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 ${
                      currentQuestionIndex === 0
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                        : 'bg-white hover:bg-slate-50 text-slate-700 transition'
                    }`}
                  >
                    <ChevronLeft size={14} />
                    <span>Kembali</span>
                  </button>
                  <button
                    onClick={() => handleSetQuestionIndex(Math.min(selectedQuiz.questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === selectedQuiz.questions.length - 1}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 ${
                      currentQuestionIndex === selectedQuiz.questions.length - 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400'
                        : 'bg-white hover:bg-slate-50 text-slate-700 transition'
                    }`}
                  >
                    <span>Lanjut</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="flex w-full md:w-auto items-center gap-2 order-1 md:order-2">
                  {/* Yellow Doubt flag widget */}
                  <button
                    onClick={() => toggleMarkQuestion(selectedQuiz.questions[currentQuestionIndex].id)}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${
                      markedQuestions.includes(selectedQuiz.questions[currentQuestionIndex].id)
                        ? 'bg-amber-500 border-amber-650 text-white shadow-3xs shadow-amber-200'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/50'
                    }`}
                  >
                    <Bookmark size={13} fill={markedQuestions.includes(selectedQuiz.questions[currentQuestionIndex].id) ? "white" : "none"} />
                    <span>Ragu-ragu</span>
                  </button>

                  {/* Submission triggers */}
                  {currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                    <button
                      onClick={handleManualSubmitClick}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow-sm transition"
                      id="btn-complete-quiz"
                    >
                      Kumpulkan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetQuestionIndex(currentQuestionIndex + 1)}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition"
                    >
                      Selesai & Lanjut
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Question Nav Grid */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs">
              <h4 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider mb-4 border-b border-slate-55 pb-2.5">
                Rangkuman Jawaban
              </h4>

              {/* Map of all numbers */}
              <div className="flex flex-wrap gap-2.5" id="assessment-question-map">
                {selectedQuiz.questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isMarked = markedQuestions.includes(q.id);
                  const isCurrent = currentQuestionIndex === idx;

                  // Determine styled border and color
                  let styleClasses = '';
                  if (isCurrent) {
                    styleClasses = 'ring-2 ring-blue-600 border-blue-600 text-blue-700 font-black';
                  }

                  if (isMarked) {
                    styleClasses += ' bg-amber-500 border-amber-550 text-white hover:bg-amber-600';
                  } else if (isAnswered) {
                    styleClasses += ' bg-blue-600 border-blue-600 text-white hover:bg-blue-750';
                  } else {
                    styleClasses += ' bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSetQuestionIndex(idx)}
                      className={`h-9 w-9 text-xs font-black rounded-xl border flex items-center justify-center transition-all ${styleClasses}`}
                      id={`nav-num-${idx}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend guide */}
              <div className="border-t border-slate-100/80 pt-4 mt-5 space-y-2 text-[10.5px] font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-blue-600 border border-blue-600" />
                  <span>Sudah Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-amber-500 border border-amber-605" />
                  <span>Mark Ragu-Ragu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-200" />
                  <span>Belum Diisi</span>
                </div>
              </div>

              <button
                onClick={handleManualSubmitClick}
                className="w-full mt-6 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-extrabold text-xs rounded-xl shadow-3xs transition"
              >
                Akhiri Tes ini
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          SCREEN 4: SUBMITTED QUIZ RESULT / SUMMARY BADGE
         ========================================== */}
      {screen === 'result' && latestAttempt && selectedQuiz && (
        <div className="max-w-xl mx-auto bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-md text-center space-y-6 animate-fade-in" id="quiz-result-view">
          
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider w-fit mx-auto">
              HASIL PEMBUKTIAN DINILAI
            </p>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Kuis Evaluasi Terkirim
            </h3>
            <p className="text-slate-450 text-xs font-semibold leading-relaxed">
              Selamat! Anda telah mengirimkan lembar kuis dengan performa berikut:
            </p>
          </div>

          {/* Huge Score Circle Area */}
          <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl max-w-sm mx-auto space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none text-center">NILAI AKHIR</p>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-4xl font-black text-blue-600 tracking-tight">{latestAttempt.score}</span>
                <span className="text-slate-400 text-xl font-bold">/ 100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-3 text-xs leading-none">
              <div className="p-2 border-r border-slate-150">
                <p className="text-slate-400 font-extrabold text-[10px] uppercase">BENAR</p>
                <p className="text-slate-800 font-black text-sm mt-1">{latestAttempt.correctAnswersCount} / {latestAttempt.totalQuestionsCount}</p>
              </div>
              <div className="p-2">
                <p className="text-slate-400 font-extrabold text-[10px] uppercase">PERSENTASE</p>
                <p className="text-slate-800 font-black text-sm mt-1">{latestAttempt.score}%</p>
              </div>
            </div>
          </div>

          {/* Pedagogy summary assessment text */}
          <div className="p-4 border border-blue-50 bg-blue-50/20 text-slate-700 rounded-2xl text-xs font-semibold leading-relaxed">
            {latestAttempt.score === 100 && "🏆 Sempurna! Anda menguasai seluruh muatan materi praktikum ini tanpa cela. Pertahankan konsistensi ini!"}
            {latestAttempt.score >= 80 && latestAttempt.score < 100 && "🏅 Luar biasa! Pemahaman Anda tentang topik instruksi laboratorium sangat solid dan di atas rata-rata kelas."}
            {latestAttempt.score >= 60 && latestAttempt.score < 80 && "👍 Cukup bagus! Anda lulus passing grade minimum, namun direkomendasikan mereview pembahasan di bawah."}
            {latestAttempt.score < 60 && "⚠️ Perhatian! Hasil ini di bawah standar kompetensi. Dianjurkan membaca ulang skenario instruksi praktikum anda."}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleGoBackToList}
              className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-extrabold rounded-2xl shadow-3xs transition"
            >
              Daftar Kuis
            </button>
            <button
              onClick={() => handleViewDiscussion(latestAttempt)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md shadow-blue-100/80 transition flex items-center justify-center gap-1.5"
            >
              <span>Kunci Jawaban</span>
            </button>
          </div>

        </div>
      )}

      {/* ==========================================
          SCREEN 5: DISCUSSION / EXPLANATION PAGE
         ========================================== */}
      {screen === 'discussion' && viewingAttempt && selectedQuiz && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" id="quiz-discussion-page">
          
          {/* Diagnostic overview top panel */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9.5px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Materi Review & Pembahasan
              </span>
              <h3 className="text-[15px] font-black text-slate-900 leading-snug mt-1.5">
                {selectedQuiz.title}
              </h3>
            </div>

            <div className="flex items-center gap-4 shrink-0 bg-slate-50 border border-slate-150 p-2.5 rounded-2xl">
              <div className="text-center px-4 border-r border-slate-200">
                <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">DIKERJAKAN</p>
                <p className="text-slate-500 font-extrabold text-[10px] mt-0.5 whitespace-nowrap">{viewingAttempt.completedAt.split(',')[0]}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">SKOR ANDA</p>
                <p className="text-blue-600 font-black text-sm mt-0.5">{viewingAttempt.score} pt</p>
              </div>
            </div>
          </div>

          <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Bedah Kunci Soal Evaluasi</p>

          {/* List of answers */}
          <div className="space-y-6">
            {selectedQuiz.questions.map((question, qIdx) => {
              const studentChoice = viewingAttempt.selectedAnswers[question.id];
              const isCorrect = studentChoice === question.correctOptionIndex;


              return (
                <div 
                  key={question.id}
                  className={`bg-white border rounded-3xl p-6 shadow-3xs space-y-5 transition duration-150 ${
                    isCorrect ? 'border-green-150 bg-green-50/5' : 'border-red-150 bg-red-50/5'
                  }`}
                >
                  {/* Title of Question */}
                  <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-100 pb-3">
                    <span className="font-mono text-xs font-black text-slate-400">PERTANYAAN {qIdx + 1}</span>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-xl shadow-3xs">
                        <Check size={12} strokeWidth={3} />
                        <span>Benar</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-xl shadow-3xs">
                        <X size={12} strokeWidth={3} />
                        <span>Salah</span>
                      </span>
                    )}
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-extrabold text-slate-900 leading-relaxed pl-1">
                    {question.questionText}
                  </p>

                  {/* Display options of current question with correction coloring */}
                  <div className="space-y-2.5">
                    {question.options.map((opt, oIdx) => {
                      const isOptionCorrect = oIdx === question.correctOptionIndex;
                      const isOptionStudentSelected = oIdx === studentChoice;

                      let optClasses = 'border-slate-150 text-slate-705';
                      let labelClasses = 'bg-slate-105 text-slate-500 border border-slate-205';

                      if (isOptionCorrect) {
                        optClasses = 'border-green-600 bg-green-50/50 text-green-900 font-extrabold';
                        labelClasses = 'bg-green-600 text-white';
                      } else if (isOptionStudentSelected) {
                        optClasses = 'border-red-600 bg-red-50/50 text-red-900 font-extrabold';
                        labelClasses = 'bg-red-600 text-white';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-3.5 rounded-2xl border text-xs flex items-start gap-4 ${optClasses}`}
                        >
                          <div className={`w-6.5 h-6.5 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${labelClasses}`}>
                            {String.fromCharCode(65 + oIdx)}
                          </div>
                          <span className="leading-relaxed pt-0.5">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 flex gap-3.5">
                    <Lightbulb size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <h5 className="text-[11px] font-black text-blue-900 uppercase tracking-wider">Kartu Pembahasan Dosen :</h5>
                      <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                        {question.explanation}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleGoBackToList}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md shadow-blue-100/60 transition"
            >
              Selesai Membaca & Kembali
            </button>
          </div>

        </div>
      )}

      {/* ==========================================
          SUBMISSION CONFIRMATION MODAL
         ========================================== */}
      {isSubmitModalOpen && selectedQuiz && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="quiz-submit-modal">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 border border-amber-100 rounded-full flex items-center justify-center shadow-xs">
              <AlertCircle size={24} />
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-slate-900 text-base">Kumpulkan Kuis Anda?</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                Apakah Anda benar-benar yakin ingin mengakhiri sesi kuis ini? Lembar respon yang terkirim bersifat final dan tidak dapat diulang kembali.
              </p>
            </div>

            {/* Answer completion counts counter info */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-xs font-semibold leading-relaxed text-slate-650 space-y-1 border border-slate-100">
              <div className="flex justify-between">
                <span>Total Soal:</span>
                <span className="font-bold text-slate-800">{selectedQuiz.questions.length} Butir</span>
              </div>
              <div className="flex justify-between">
                <span>Terjawab:</span>
                <span className="font-bold text-blue-600">
                  {Object.keys(selectedAnswers).length} dari {selectedQuiz.questions.length}
                </span>
              </div>
              {markedQuestions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-amber-700">Masih Ragu-Ragu:</span>
                  <span className="font-extrabold text-amber-600">{markedQuestions.length} Soal</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-extrabold rounded-xl transition"
              >
                Batalkan
              </button>
              <button
                onClick={submitQuizAnswers}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow-xs transition"
                id="btn-confirm-submit-quiz"
              >
                Selesai & Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
