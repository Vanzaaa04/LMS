"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "../../../store";
import { LabSubmitForm } from "../../../components/LabSubmitForm";
import { QuizWorkspace } from "../../../components/QuizWorkspace";
import { slugify } from "../../../utils/slugify";
import { INITIAL_QUIZZES, INITIAL_QUIZ_ATTEMPTS } from "../../../data";
import { StudentQuizAttempt, Lab, StudentProfile } from "../../../types";
import {
  fetchLabsApi,
  fetchLabDetailApi,
  fetchLabSubmissionsApi,
  fetchMyLabSubmissionApi,
  submitLabApi,
  gradeLabSubmissionApi,
} from "../../../lib/api/labApi";
import { uploadFileApi, enrollInCourse } from "../../../lib/api/courseApi";
import { getApiBaseUrl } from "../../../lib/api/apiConfig";
import {
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  Upload,
  MessageSquare,
  Award,
  Clock,
  RotateCcw,
  AlertTriangle,
  Monitor,
  Cpu,
  ShieldCheck,
  BookOpen,
  User,
  GraduationCap
} from "lucide-react";

function LabDynamicContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const slug = params.slug as string;
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  const [loading, setLoading] = useState(true);
  const [lab, setLab] = useState<any>(null);
  const [userRole, setUserRole] = useState<"student" | "lecturer">("student");
  const [activeTab, setActiveTab] = useState<"tugas" | "demo">("tugas");
  
  const resolveFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };
  
  // Student submission state
  const [mySubmission, setMySubmission] = useState<any>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [studentNote, setStudentNote] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Lecturer submissions list
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState<number | "">("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [gradingLoading, setGradingLoading] = useState(false);

  // Demo quizzes states
  const [attempts, setAttempts] = useState<StudentQuizAttempt[]>(INITIAL_QUIZ_ATTEMPTS);
  const [expandedDemoId, setExpandedDemoId] = useState<number | null>(null);

  // Load user profile from store
  const { student } = useAppStore();

  const loadPageData = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      
      // Resolve user role
      const userStr = sessionStorage.getItem("user");
      let role: "student" | "lecturer" = "student";
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed.role === "LECTURER" || parsed.role === "ADMIN") {
          role = "lecturer";
          setUserRole("lecturer");
        }
      }

      // Fetch labs to find by slug
      const apiLabs = await fetchLabsApi(token);
      const matchedApiLab = apiLabs.find((l: any) => slugify(l.title) === slug);
      
      if (!matchedApiLab) {
        setLab(null);
        setLoading(false);
        return;
      }

      // Fetch detailed lab info from backend to get moduleId & courseId
      const detailLab = await fetchLabDetailApi(matchedApiLab.id, token);
      
      const localReg = typeof window !== 'undefined' ? localStorage.getItem(`lab-reg-${matchedApiLab.id}`) : null;
      const mappedLab = {
        ...matchedApiLab,
        moduleId: detailLab.moduleId,
        courseId: (detailLab as any).module?.courseId || "",
        instructions: detailLab.instructions || matchedApiLab.instructions || "",
        isRegistered: matchedApiLab.status !== "available" || Boolean(localReg),
      };

      setLab(mappedLab);

      // Load submissions depending on role
      if (mappedLab.isRegistered) {
        if (role === "student") {
          const sub = await fetchMyLabSubmissionApi(mappedLab.id, token);
          setMySubmission(sub);
        } else {
          const subs = await fetchLabSubmissionsApi(mappedLab.id, token);
          setSubmissionsList(subs);
        }
      }
    } catch (err) {
      console.error("Error loading lab page data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [slug, token, router]);

  const viewQuery = searchParams.get("view");
  const tabQuery = searchParams.get("tab");

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Memuat data praktikum...</div>;
  }

  if (!lab) {
    return (
      <div className="p-8 text-center text-slate-400">
        <h2 className="text-xl font-bold mb-2">Laboratorium Tidak Ditemukan</h2>
        <button onClick={() => router.push("/labs")} className="text-blue-600 hover:underline">
          Kembali ke Daftar Laboratorium
        </button>
      </div>
    );
  }

  // --- SEAT REGISTRATION FLOW ---
  if (viewQuery === "register") {
    return (
      <LabSubmitForm
        lab={{
          ...lab,
          dosen: lab.instructor || "Dosen",
        }}
        student={student}
        onBack={() => router.replace(`/labs/${slug}`)}
        onSubmitSuccess={async (notes: string) => {
          if (!token || !lab.courseId) return;
          try {
            if (typeof window !== 'undefined') {
              localStorage.setItem(`lab-reg-${lab.id}`, notes);
            }
            try {
              await enrollInCourse(lab.courseId, token);
            } catch (err: any) {
              // 409 Conflict/Already enrolled is perfectly fine
              if (err.status !== 409 && err.message?.indexOf('already enrolled') === -1) {
                throw err;
              }
            }
            await loadPageData();
            router.replace(`/labs/${slug}`);
          } catch (err) {
            console.error("Failed to register for lab:", err);
          }
        }}
      />
    );
  }

  // --- DEMO QUIZ FLOW ---
  if (tabQuery?.startsWith("demo/") && tabQuery.length > 5) {
    const demoTitle = tabQuery.split("demo/")[1] || "";
    let quizId = "quiz-web-01";
    if (demoTitle.includes("Demo ke-2")) quizId = "quiz-web-02";
    if (demoTitle.includes("Demo ke-3")) quizId = "quiz-web-03";

    return (
      <QuizWorkspace
        quizzes={INITIAL_QUIZZES}
        attempts={attempts}
        labs={[]}
        student={student}
        initialQuizId={quizId}
        onAddAttempt={(attempt) => setAttempts([...attempts, attempt])}
        onBackToLab={() => router.push(`/labs/${slug}?tab=demo`)}
      />
    );
  }

  // --- STUDENT SUBMISSION HANDLERS ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      const isZip = file.name.toLowerCase().endsWith(".zip") || file.name.toLowerCase().endsWith(".rar");

      if (!isPdf && !isZip) {
        setSubmissionError("Format file harus berupa PDF atau ZIP/RAR!");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setSubmissionError("Ukuran file maksimal adalah 15MB!");
        return;
      }

      setSubmissionError(null);
      setUploadFile(file);
    }
  };

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !token) {
      setSubmissionError("Harap pilih file terlebih dahulu.");
      return;
    }

    try {
      setUploadProgress(true);
      setSubmissionError(null);

      // 1. Upload file to backend
      const uploadRes = await uploadFileApi(uploadFile, token);
      
      // 2. Submit lab with the uploaded file url
      await submitLabApi(lab.id, { fileUrl: uploadRes.url, note: studentNote }, token);

      // 3. Reload page data
      setUploadFile(null);
      setStudentNote("");
      await loadPageData();
    } catch (err: any) {
      setSubmissionError(err.message || "Gagal mengunggah pengumpulan praktikum.");
    } finally {
      setUploadProgress(false);
    }
  };

  // --- LECTURER GRADING HANDLERS ---
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmissionId || gradeScore === "" || !token) {
      setGradingError("Nilai tidak boleh kosong.");
      return;
    }

    try {
      setGradingLoading(true);
      setGradingError(null);

      await gradeLabSubmissionApi(
        gradingSubmissionId,
        { score: Number(gradeScore), feedback: gradeFeedback },
        token
      );

      setGradingSubmissionId(null);
      setGradeScore("");
      setGradeFeedback("");
      await loadPageData();
    } catch (err: any) {
      setGradingError(err.message || "Gagal menyimpan penilaian.");
    } finally {
      setGradingLoading(false);
    }
  };

  // Dummy demos removed
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 text-slate-800 space-y-6">
      {/* Header Breadcrumb */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="hover:text-slate-600 cursor-pointer transition" onClick={() => router.push("/labs")}>Labs</span>
          <span className="text-slate-300">/</span>
          <span className="text-blue-600">{lab.title}</span>
        </div>

        <button
          onClick={() => router.push("/labs")}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 transition"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" /> Kembali
        </button>
      </div>

      {/* Main Lab Banner */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-blue-600" />
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pt-2">
          <div className="space-y-2">
            <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-md uppercase tracking-wider border border-blue-100">
              Praktikum
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {lab.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Course Terkait: <strong className="text-slate-800 font-semibold">{lab.courseName}</strong>
            </p>
            <div className="flex items-center gap-3 pt-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold rounded-full flex items-center justify-center text-sm shadow-sm">
                {(lab.instructor || "D").charAt(0)}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Dosen Pengampu</p>
                <p className="font-extrabold text-slate-800 text-sm">{lab.instructor || "Dosen"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="font-bold text-slate-400 text-sm mb-1 uppercase tracking-wider">Instruksi Praktikum</h3>
          <p className="text-sm text-slate-650 leading-relaxed max-w-4xl whitespace-pre-wrap">
            {lab.instructions}
          </p>
          {lab.fileUrl && (
            <div className="mt-4 pt-4 border-t border-slate-100/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Modul / File Panduan Praktikum:
              </span>
              <a
                href={resolveFileUrl(lab.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3.5 py-2 rounded-xl text-xs text-blue-700 font-bold transition-all shadow-xs"
              >
                <FileText size={14} />
                <span>{lab.fileName || "Unduh Panduan Praktikum"}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Tabs & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm">
            <div className="border-b border-slate-150 pb-3 mb-6">
              <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Calendar size={16} className="text-blue-600" /> Tugas & Pengumpulan
              </h2>
            </div>

            {/* Access locked for unregistered students */}
            {!lab.isRegistered && userRole === "student" ? (
              <div className="py-10 flex flex-col items-center gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                  <Monitor size={24} className="text-slate-400" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-700 text-base">Akses Terkunci</p>
                  <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs mx-auto">
                    Daftarkan diri Anda terlebih dahulu untuk menempati meja praktikum.
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/labs/${slug}?view=register`)}
                  className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-blue-100 uppercase tracking-wider"
                >
                  Daftar Lab & Pilih Meja
                </button>
              </div>
            ) : (
              <>
                {/* --- TUGAS & PENGUMPULAN TAB --- */}
                {activeTab === "tugas" && (
                  <div className="space-y-6">
                    {userRole === "student" ? (
                      mySubmission ? (
                        /* Student Submitted View */
                        <div className="space-y-6">
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex items-start gap-4">
                            <CheckCircle className="shrink-0 text-emerald-600" size={24} />
                            <div>
                              <h4 className="font-extrabold text-sm">Laporan berhasil dikumpulkan!</h4>
                              <p className="text-xs text-emerald-700 mt-1">
                                Dikirim pada: {new Date(mySubmission.createdAt).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Berkas Terlampir:</span>
                              <a
                                href={resolveFileUrl(mySubmission.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 mt-1.5 text-xs text-blue-600 font-bold hover:underline"
                              >
                                <FileText size={16} />
                                {mySubmission.fileUrl.split("/").pop()}
                              </a>
                            </div>

                            {mySubmission.note && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Anda:</span>
                                <p className="text-xs text-slate-650 mt-1 italic">&quot;{mySubmission.note}&quot;</p>
                              </div>
                            )}
                          </div>

                          {/* Grade info */}
                          {mySubmission.status === "GRADED" ? (
                            <div className="bg-blue-50 border border-blue-150 rounded-2xl p-5 flex items-start gap-4">
                              <Award className="shrink-0 text-blue-600" size={24} />
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900">Hasil Evaluasi Praktikum</h4>
                                <div className="mt-2 inline-block bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg">
                                  Nilai: {mySubmission.score} / 100
                                </div>
                                {mySubmission.feedback && (
                                  <p className="text-xs text-slate-600 mt-3 border-t border-blue-100 pt-3 italic leading-relaxed">
                                    Feedback: &quot;{mySubmission.feedback}&quot;
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold text-center">
                              Menunggu proses penilaian oleh dosen pengampu.
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Student Submit Form */
                        <form onSubmit={handleSubmissionSubmit} className="space-y-6">
                          <h4 className="font-extrabold text-slate-900 text-base">Kumpulkan Laporan Praktikum</h4>
                          <p className="text-xs text-slate-500 -mt-4">Kumpulkan berkas laporan praktikum Anda dalam format PDF atau ZIP.</p>

                          {submissionError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                              {submissionError}
                            </div>
                          )}

                          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition relative">
                            <input
                              type="file"
                              id="labFile"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleFileChange}
                            />
                            <div className="space-y-2">
                              <Upload className="mx-auto text-blue-500" size={32} />
                              {uploadFile ? (
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{uploadFile.name}</p>
                                  <p className="text-xs text-slate-400">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xs font-bold text-slate-700">Pilih berkas atau tarik di sini</p>
                                  <p className="text-[10px] text-slate-400 mt-1">PDF atau ZIP/RAR (Maksimal 15MB)</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Catatan Tambahan (Opsional)
                            </label>
                            <textarea
                              rows={4}
                              value={studentNote}
                              onChange={(e) => setStudentNote(e.target.value)}
                              placeholder="Tuliskan catatan tambahan mengenai tugas praktikum Anda di sini..."
                              className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={uploadProgress || !uploadFile}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-blue-100"
                          >
                            {uploadProgress ? "Mengunggah Laporan..." : "Kumpulkan Laporan"}
                          </button>
                        </form>
                      )
                    ) : (
                      /* Lecturer Submissions List View */
                      <div className="space-y-6">
                        <h4 className="font-extrabold text-slate-900 text-base">Evaluasi Penyerahan Laporan</h4>
                        <p className="text-xs text-slate-500 -mt-4">Berikut adalah laporan praktikum yang telah diserahkan mahasiswa.</p>

                        {submissionsList.length === 0 ? (
                          <div className="p-10 border border-slate-200 border-dashed rounded-2xl text-center text-slate-400 font-semibold text-xs">
                            Belum ada mahasiswa yang mengumpulkan laporan praktikum.
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  <th className="p-4">Mahasiswa</th>
                                  <th className="p-4">Berkas</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-center">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {submissionsList.map((sub) => (
                                  <tr key={sub.id} className="hover:bg-slate-50/50">
                                    <td className="p-4">
                                      <p className="font-bold text-slate-900">{sub.student?.name || "Mahasiswa"}</p>
                                      <p className="text-[10px] text-slate-400">{sub.student?.email || "-"}</p>
                                    </td>
                                    <td className="p-4">
                                      <a
                                        href={resolveFileUrl(sub.fileUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline font-semibold block truncate max-w-[150px]"
                                      >
                                        {sub.fileUrl.split("/").pop()}
                                      </a>
                                      <span className="text-[9px] text-slate-400 font-medium">
                                        {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      {sub.status === "GRADED" ? (
                                        <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                          Nilai: {sub.score}
                                        </span>
                                      ) : (
                                        <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-md text-[10px]">
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => {
                                          setGradingSubmissionId(sub.id);
                                          setGradeScore(sub.score || "");
                                          setGradeFeedback(sub.feedback || "");
                                        }}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-100 text-[10px] transition"
                                      >
                                        {sub.status === "GRADED" ? "Ubah Nilai" : "Beri Nilai"}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Grading Form Modal/Overlay when clicked */}
                        {gradingSubmissionId && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-200 shadow-2xl animate-scale-up">
                              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Penilaian Praktikum</h3>
                              <p className="text-xs text-slate-400 mb-6">Input nilai numerik dan feedback pengerjaan praktikum mahasiswa.</p>

                              {gradingError && (
                                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                                  {gradingError}
                                </div>
                              )}

                              <form onSubmit={handleGradeSubmit} className="space-y-4">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Nilai (0-100)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gradeScore}
                                    onChange={(e) => setGradeScore(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Feedback / Koreksi
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={gradeFeedback}
                                    onChange={(e) => setGradeFeedback(e.target.value)}
                                    placeholder="Tuliskan komentar koreksi pengerjaan berkas di sini..."
                                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                  />
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => setGradingSubmissionId(null)}
                                    className="px-4 py-2 border border-slate-200 text-slate-650 font-bold rounded-xl text-xs hover:bg-slate-50"
                                    disabled={gradingLoading}
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-100"
                                    disabled={gradingLoading}
                                  >
                                    {gradingLoading ? "Menyimpan..." : "Simpan Penilaian"}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Demo tab removed */}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar: Regulasi Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm">
            <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-3">Regulasi Praktikum</h4>
            <div className="text-slate-550 text-xs space-y-2.5 leading-relaxed font-semibold">
              <p>
                1. Batas keterlambatan pengumpulan laporan adalah <strong className="text-slate-850">3 hari kerja</strong> setelah deadline.
              </p>
              <p>
                2. Dilarang keras melakukan kecurangan atau penjiplakan (plagiarisme) kode. Berkas yang terindikasi plagiat akan langsung mendapat nilai 0.
              </p>
              <p>
                3. Berkas laporan wajib diunggah dalam format <strong className="text-slate-850">ZIP atau PDF</strong> dengan ukuran file maksimum 15MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LabDynamicPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat data laboratorium...</div>}>
      <LabDynamicContent />
    </Suspense>
  );
}
