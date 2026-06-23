"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createLabApi } from "@/lib/api/labApi";
import { fetchCourseDetail, uploadFileApi } from "@/lib/api/courseApi";
import { LecturerBreadcrumbs } from "@/components/lecturer/LecturerBreadcrumbs";

export default function LecturerCreateLabPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = params.courseId as string;
  const moduleId = params.moduleId as string;
  
  const [courseTitle, setCourseTitle] = useState("Course");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Fetch course details to show correct breadcrumbs
    fetchCourseDetail(courseId, token)
      .then((data) => {
        if (data && data.title) {
          setCourseTitle(data.title);
        }
      })
      .catch((err) => console.error("Failed to fetch course details", err));
  }, [courseId, router]);

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

      let uploadedFileUrl = "";
      let uploadedFileName = "";

      if (selectedFile) {
        try {
          const uploadRes = await uploadFileApi(selectedFile, token);
          uploadedFileUrl = uploadRes.url;
          uploadedFileName = uploadRes.fileName;
        } catch (uploadErr) {
          throw new Error("Gagal mengunggah file panduan praktikum.");
        }
      }

      await createLabApi(
        {
          title,
          instructions,
          moduleId,
          fileUrl: uploadedFileUrl || undefined,
          fileName: uploadedFileName || undefined,
        },
        token
      );
      
      // Navigate back to course management
      router.push(`/dosen/courses/${courseId}`);
    } catch (err: any) {
      setError(err.message || "Gagal membuat praktikum baru.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto min-h-full w-full max-w-[800px] px-4 py-7 sm:px-6 lg:px-8">
      <LecturerBreadcrumbs
        items={[
          { label: "Home", href: "/dashboard_dosen" },
          { label: "Courses", href: "/dosen/courses" },
          { label: courseTitle, href: `/dosen/courses/${courseId}` },
          { label: "Create Lab" },
        ]}
      />

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Buat Praktikum Baru</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambahkan tugas praktikum (Practical Lab) baru untuk modul ini.
          </p>
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

          <div className="border-t border-slate-100 pt-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Modul / Panduan Praktikum (Opsional)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Unggah modul atau file panduan praktikum (PDF, ZIP, dll.) agar mahasiswa dapat mengunduhnya.
            </p>
            
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
                    <p className="text-xs font-bold text-slate-700">Pilih berkas panduan praktikum</p>
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
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 shadow-md shadow-blue-100 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? "Menyimpan..." : "Buat Praktikum"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
