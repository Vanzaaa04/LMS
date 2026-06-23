'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store';
import { LabList } from '../../components/LabList';
import { slugify } from '../../utils/slugify';
import { fetchLabsApi } from '../../lib/api/labApi';
import { Lab } from '../../types';

function LabsContent() {
  const { tasks, student } = useAppStore();
  const [labs, setLabs] = React.useState<Lab[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  const handleSelectLab = (labId: string) => {
    const lab = labs.find((l) => l.id === labId);
    if (lab) {
      router.push(`/labs/${slugify(lab.title)}`);
    }
  };

  const handleNavigateToRegister = (labId: string) => {
    const lab = labs.find((l) => l.id === labId);
    if (lab) {
      router.push(`/labs/${slugify(lab.title)}?view=register`);
    }
  };

  const [mode, setMode] = React.useState<'student' | 'lecturer'>('student');

  React.useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'LECTURER') {
          setMode('lecturer');
        }
      } catch (e) {}
    }

    fetchLabsApi(token)
      .then((apiLabs) => {
        const mapped: Lab[] = apiLabs.map((l) => {
          const hasLocalReg = typeof window !== 'undefined' && localStorage.getItem(`lab-reg-${l.id}`);
          return {
            id: l.id,
            title: l.title,
            dosen: l.instructor || 'Dosen',
            semester: 4,
            description: l.instructions || '',
            instructions: l.instructions || '',
            courseName: l.courseName || '',
            syllabus: [],
            thumbnailColor: 'bg-blue-600',
            isRegistered: l.status !== 'available' || Boolean(hasLocalReg),
            category: 'Praktikum',
            labStatus: l.status === 'completed' ? 'Sudah Dinilai' : l.status === 'pending' ? 'Sudah Submit, menunggu penilaian' : 'Belum Submit',
            labGrade: l.score,
            totalModules: 1,
            completedModules: l.status === 'completed' ? 1 : 0,
          };
        });
        setLabs(mapped);
      })
      .catch((err) => {
        console.error('Failed to fetch labs', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  return (
    <LabList
      labs={labs}
      tasks={tasks}
      student={student}
      onSelectLab={handleSelectLab}
      onNavigateToRegister={handleNavigateToRegister}
      mode={mode}
    />
  );
}

export default function LabsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <LabsContent />
    </Suspense>
  );
}
