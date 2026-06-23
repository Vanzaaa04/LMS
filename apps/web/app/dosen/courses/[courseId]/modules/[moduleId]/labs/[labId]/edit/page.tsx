"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchLabDetailApi, updateLabApi, deleteLabApi } from "@/lib/api/labApi";
import { fetchCourseDetail, uploadFileApi } from "@/lib/api/courseApi";
import { LecturerBreadcrumbs } from "@/components/lecturer/LecturerBreadcrumbs";

export default function LecturerEditLabPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  const labId = params.labId as string;
  
  const [courseTitle, setCourseTitle] = useState("Course");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [gradingMethod, setGradingMethod] = useState<string>("LATEST");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Fetch course details
    fetchCourseDetail(courseId, token)
      .then((data) => {
        if (data && data.title) {
          setCourseTitle(data.title);
        }
      })
      .catch((err) => console.error("Failed to fetch course details", err));

    // Fetch existing lab details
    fetchLabDetailApi(labId, token)
      .then((data) => {
        if (data) {
          setTitle(data.title);
          setInstructions(data.instructions);
          if (data.fileName) {
            setExistingFileName(data.fileName);
          }
          if (data.maxAttempts) {
            setMaxAttempts(data.maxAttempts);
          }
          if (data.gradingMethod) {
            setGradingMethod(data.gradingMethod);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch lab details", err);
        setError("Gagal memuat data praktikum.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId, labId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      setError("Judul dan instruksi praktikum tidak boleh kosong.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      let uploadedFileUrl;
      let uploadedFileName;

      if (selectedFile) {
        try {
          const uploadRes = await uploadFileApi(selectedFile, token);
          uploadedFileUrl = uploadRes.url;
          uploadedFileName = uploadRes.fileName;
        } catch (uploadErr) {
          throw new Error("Gagal mengunggah file panduan praktikum.");
        }
      }

      await updateLabApi(
        labId,
        {
          title,
          instructions,
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
          maxAttempts: maxAttempts,
          gradingMethod: gradingMethod,
        },
        token
      );
      
      // Navigate back to course management
      router.push(`/dosen/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui praktikum.");
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus praktikum "${title}"? Data tidak dapat dikembalikan.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      await deleteLabApi(labId, token);
      router.push(`/dosen/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus praktikum.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-sm font-semibold text-slate-500 animate-pulse">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-[800px] px-4 py-7 sm:px-6 lg:px-8">
      <LecturerBreadcrumbs
        items={[
          { label: "Home", href: "/dashboard_dosen" },
          { label: "Courses", href: "/dosen/courses" },
          { label: courseTitle, href: `/dosen/courses/${courseId}` },
          { label: "Edit Lab" },
        ]}
      />

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Praktikum</h1>
            <p className="text-sm text-slate-500 mt-1">
              Perbarui modul praktikum atau unggah file panduan baru.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || submitting}
            className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold text-xs hover:bg-red-100 transition shadow-sm disabled:opacity-50"
          >
            {deleting ? "Menghapus..." : "Hapus Praktikum"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="lab-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Judul Praktikum
            </label>
            <input
              type="text"
              id="lab-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Modul 1 - Pemrograman Dasar"
              className="w-full text-sm border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              required
            />
          </div>

          <div>
            <label htmlFor="lab-instructions" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Instruksi / Detail Tugas
            </label>
            <textarea
              id="lab-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Tuliskan instruksi pengerjaan praktikum di sini..."
              rows={8}
              className="w-full text-sm border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Max Attempts</label>
              <input
                type="number"
                value={maxAttempts}
                min={1}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full text-sm border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Grading Method</label>
              <select
                value={gradingMethod}
                onChange={(e) => setGradingMethod(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              >
                <option value="LATEST">Latest Attempt</option>
                <option value="HIGHEST">Highest Score</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Modul / Panduan Praktikum (Opsional)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Unggah modul atau file panduan praktikum (PDF, ZIP, dll.) agar mahasiswa dapat mengunduhnya.
            </p>
            
            {existingFileName && !selectedFile && (
              <div className="mb-4 p-3 border border-blue-100 bg-blue-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">File Saat Ini</p>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">{existingFileName}</p>
                </div>
              </div>
            )}
            
            {selectedFile ? (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <span className="text-blue-600">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[300px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition"
                  aria-label="Remove selected file"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition relative cursor-pointer">
                <input
                  type="file"
                  id="moduleFile"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="space-y-2">
                  <svg className="mx-auto text-blue-500" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {existingFileName ? "Pilih berkas baru untuk menggantikan yang lama" : "Pilih berkas panduan praktikum"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">PDF, ZIP, RAR, DOCX, dll. (Maksimal 50MB)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push(`/dosen/courses/${courseId}`)}
              className="px-5 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              disabled={submitting || deleting}
            >
              Kembali ke Kelas
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 shadow-md shadow-blue-100 disabled:opacity-50"
              disabled={submitting || deleting}
            >
              {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
