import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { ArrowLeft, Calendar, FileText, CheckCircle, Upload, MessageSquare, Award, Clock, RotateCcw, AlertTriangle } from 'lucide-react';

interface TaskDetailAndSubmitProps {
  task: Task;
  labTitle: string;
  onBack: () => void;
  onSubmitTask: (fileName: string, fileSize: string, note: string) => void;
  onCancelSubmission: () => void;
  onGradeTask?: (grade: number, feedback: string) => void;
  mode?: 'student' | 'lecturer';
}

export const TaskDetailAndSubmit: React.FC<TaskDetailAndSubmitProps> = ({
  task,
  labTitle,
  onBack,
  onSubmitTask,
  onCancelSubmission,
  onGradeTask,
  mode = 'student',
}) => {
  const [note, setNote] = useState('');
  const [gradeInput, setGradeInput] = useState<number | ''>('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<{ name: string; size: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  // Calculate high-fidelity time remaining
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date('2026-05-29T14:50:33Z'); // Standardized reference time from metadata
      const deadline = task.deadlineRaw;
      const diffMs = deadline.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeLeft('Selesai / Terlewat');
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let result = '';
      if (days > 0) result += `${days} hari `;
      if (hours > 0) result += `${hours} jam `;
      result += `${minutes} menit`;
      setTimeLeft(result);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, [task]);

  const handleFile = (file: File) => {
    // Validate file extensions based on requirements
    const nameLower = file.name.toLowerCase();
    const isPdfRequired = task.format.some(f => f.toLowerCase().includes('pdf'));
    const isZipRequired = task.format.some(f => f.toLowerCase().includes('zip'));

    if (isPdfRequired && !nameLower.endsWith('.pdf') && !isZipRequired) {
      setErrorMsg('Format file harus berupa PDF sesuai instruksi tugas!');
      return;
    }
    if (isZipRequired && !nameLower.endsWith('.zip') && !nameLower.endsWith('.rar') && !isPdfRequired) {
      setErrorMsg('Format file harus berupa arsip ZIP atau RAR sesuai instruksi!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file melebihi batas maksimal 10MB!');
      return;
    }

    setErrorMsg(null);
    setUploadFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setErrorMsg('Harap pilih atau drag file tugas Anda sebelum mengirim!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitTask(uploadFile.name, uploadFile.size, note);
      setNote('');
      setUploadFile(null);
    }, 1000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Menunggu Penilaian':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Terlambat':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gradeInput === '') {
      setErrorMsg('Harap masukkan nilai numerik!');
      return;
    }
    if (onGradeTask) {
      onGradeTask(Number(gradeInput), feedbackInput);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Breadcrumb & Navigation */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="hover:text-slate-600 cursor-pointer transition" onClick={() => window.location.href = '/labs'}>Labs</span>
          <span className="text-slate-300">/</span>
          <span className="hover:text-slate-600 cursor-pointer transition" onClick={onBack}>{labTitle}</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600 line-clamp-1 max-w-[200px]">{task.title}</span>
        </div>
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition"
          id="btn-back-to-detail-lab"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" /> Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: TASK DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-md uppercase tracking-wide">
              Modul Kuliah Praktikum
            </span>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <h1 className="text-2xl font-extrabold text-slate-900" id="task-detail-title">
                {task.title}
              </h1>
              {task.deadlineRaw.getTime() < new Date('2026-05-29T14:50:33Z').getTime() && !task.submission && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-200 text-red-750 text-xs font-bold uppercase tracking-wider rounded-full animate-pulse shadow-sm">
                  ⚠️ Terlambat
                </span>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-slate-50 py-4 mb-6">
              <div className="flex gap-2.5 items-center">
                <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Batas Waktu</p>
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{task.deadline}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center">
                <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sisa Waktu</p>
                  <p className="text-xs font-semibold text-blue-700 leading-tight">{timeLeft}</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-center col-span-2 sm:col-span-1">
                <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-lg flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Status Tugas</p>
                  <span className={`inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 mt-0.5 rounded-full border ${
                    task.submission ? getStatusStyle(task.submission.status) : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {task.submission ? task.submission.status : 'Belum Dikerjakan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deskripsi Instruksi */}
            <h3 className="font-bold text-slate-900 text-lg mb-3">Instruksi & Skenario Kasus</h3>
            <div className="text-sm text-slate-600 leading-relaxed space-y-4">
              <p>{task.description}</p>
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-4">
                <h4 className="font-bold text-blue-800 text-xs uppercase tracking-wider mb-2">Persyaratan Pengumpulan Tugas</h4>
                <ul className="list-disc pl-5 mt-1 text-xs text-blue-700 space-y-1.5 font-medium">
                  {task.format.map((fmt, i) => (
                    <li key={i}>{fmt}</li>
                  ))}
                  <li>Plagiarisme kode secara masal akan langsung diberikan nilai 0 pada modul ini.</li>
                </ul>
              </div>

              {/* Catatan Koreksi - only shown when graded */}
              {task.submission && task.submission.grade !== null && (
                <div className="mt-4 border border-emerald-100 bg-emerald-50/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare size={14} className="text-emerald-600 shrink-0" />
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                      Catatan Koreksi dari Pengampu / Asisten
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-slate-400 font-medium">
                      Dinilai pada {task.submission.submittedAt}
                    </p>
                    <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-black">
                      <Award size={12} />
                      Nilai: {task.submission.grade}
                    </div>
                  </div>
                  {task.submission.feedback ? (
                    <p className="text-sm italic text-slate-700 leading-relaxed font-medium border-t border-emerald-100 pt-3">
                      &quot;{task.submission.feedback}&quot;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium italic border-t border-emerald-100 pt-3">
                      Belum ada catatan koreksi dari pengampu.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>


        </div>

        {/* RIGHT COLUMN: SUBMISSION FORM OR STATUS DESCRIPTION */}
        <div className="lg:col-span-1">
          {mode === 'lecturer' ? (
            /* LECTURER VIEW */
            task.submission ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">Berikan Penilaian</h3>
                  <p className="text-xs text-slate-400">Mahasiswa telah mengumpulkan tugas ini.</p>
                </div>

                {/* Submitted File Details */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 text-xs truncate" title={task.submission.fileName}>
                        {task.submission.fileName}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{task.submission.fileSize}</p>
                    </div>
                  </div>
                  
                  {task.submission.note && (
                    <div className="mt-4 pt-3 border-t border-slate-200/55">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Komentar Mahasiswa:</p>
                      <p className="text-xs text-slate-600 mt-0.5 italic">&quot;{task.submission.note}&quot;</p>
                    </div>
                  )}
                </div>

                {task.submission.grade !== null ? (
                  <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50">
                    <p className="text-xs text-emerald-800 text-center leading-relaxed font-bold">
                      Tugas telah dinilai dengan nilai {task.submission.grade}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleGradeSubmit} className="space-y-4">
                    {errorMsg && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs leading-relaxed animate-shake">
                        <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                        <p>{errorMsg}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nilai (0-100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={gradeInput}
                        onChange={(e) => setGradeInput(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Catatan Koreksi (Opsional)
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                      <Award size={16} /> Berikan Nilai
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center mt-6">
                <AlertTriangle size={32} className="text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm mb-1">Belum Ada Pengumpulan</h4>
                <p className="text-xs text-slate-500">Mahasiswa belum mengumpulkan tugas ini.</p>
              </div>
            )
          ) : task.submission ? (
            /* STATE 1: ALREADY SUBMITTED VIEW */
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="text-center pb-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} />
                </div>
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3 rounded-xl mb-4 font-extrabold text-xs tracking-wide">
                  ✓ Tugas berhasil dikumpulkan!
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Status: Terkumpul</h4>
                <p className="text-xs text-slate-400 mt-1">Pada {task.submission.submittedAt}</p>
              </div>

              {/* Submitted File Details */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 text-xs truncate" title={task.submission.fileName}>
                      {task.submission.fileName}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{task.submission.fileSize}</p>
                  </div>
                </div>
                
                {task.submission.note && (
                  <div className="mt-4 pt-3 border-t border-slate-200/55">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Komentar Mahasiswa:</p>
                    <p className="text-xs text-slate-600 mt-0.5 italic">&quot;{task.submission.note}&quot;</p>
                  </div>
                )}
              </div>

              {/* Re-submit Button (Active only if not graded yet) */}
              {task.submission.grade === null ? (
                <div>
                  <button
                    onClick={onCancelSubmission}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={14} /> Batalkan & Kumpulkan Ulang
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                    Tugas belum dinilai dosen. Anda masih diperbolehkan memperbarui berkas jawaban.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/50">
                  <p className="text-xs text-blue-800 text-center leading-relaxed font-medium">
                    Tugas telah dinilai secara permanen oleh dosen. Fitur edit pengumpulan dikunci.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: FORM SUBMIT TUGAS (UPLOAD FILE FORM) */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-1" id="submut-form-heading">Pengumpulan Tugas</h3>
              <p className="text-xs text-slate-400 mb-4">Silahkan unggah form respon asisten sesuai petunjuk.</p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-xs leading-relaxed animate-shake">
                    <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                    <p>{errorMsg}</p>
                  </div>
                )}

                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('taskFileInput')?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50/70'
                      : uploadFile
                      ? 'border-green-300 bg-green-50/20'
                      : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/20'
                  }`}
                >
                  <input
                    type="file"
                    id="taskFileInput"
                    className="hidden"
                    onChange={handleChange}
                  />

                  {uploadFile ? (
                    <div className="animate-fade-in text-center">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle size={20} />
                      </div>
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[180px] mx-auto">{uploadFile.name}</p>
                      <p className="text-[10px] text-green-600 mt-0.5 font-semibold">Tersimpan ({uploadFile.size})</p>
                      <p className="text-[10px] text-slate-400 mt-3 underline hover:text-blue-600">Klik untuk ubah berkas</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Upload size={18} />
                      </div>
                      <p className="font-bold text-slate-700 text-xs">Klik / Tarik Jawaban</p>
                      <p className="text-[10px] text-slate-400 mt-1">PDF atau ZIP max 10MB</p>
                    </div>
                  )}
                </div>

                {/* Notes Input for Lecturer */}
                <div>
                  <label htmlFor="studentNote" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Catatan untuk Dosen (Opsional)
                  </label>
                  <textarea
                    id="studentNote"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tuliskan link github cadangan atau kesulitan khusus pengerjaan jika ada..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                    maxLength={200}
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !uploadFile}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin"></div>
                      Mengunggah Berkas...
                    </>
                  ) : (
                    'Kumpulkan Tugas'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
