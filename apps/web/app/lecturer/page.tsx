'use client';

import React, { Suspense } from 'react';
import { useAppStore } from '../../store';
import { DosenWorkspace } from '../../components/DosenWorkspace';

import { AppShell } from '../../components/layout/AppShell';
export default function LecturerPage() {
  const { 
    labs, 
    tasks, 
    handleAddLab,
    handleUpdateLab,
    handleDeleteLab,
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,
    handleGradeTask,
    handleGradeLabSubmission,
    setToast
  } = useAppStore();

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>}>
      <AppShell mode="lecturer">
        <DosenWorkspace
          labs={labs}
          tasks={tasks}
          onAddLab={handleAddLab}
          onUpdateLab={handleUpdateLab}
          onDeleteLab={handleDeleteLab}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onGradeTask={handleGradeTask}
          onGradeLabSubmission={handleGradeLabSubmission}
          setToast={setToast}
        />
      </AppShell>
    </Suspense>
  );
}
