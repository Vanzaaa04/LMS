'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CourseContentItem, CourseDetail, CourseModule } from '@/lib/types/course';
import { useAppShell } from '@/components/layout/AppShell';
import type { CourseSource } from '@/lib/courseNavigation';
import {
  buildCourseDetailHref,
  buildMaterialHref,
  COURSE_CATALOG_HREF,
  getCourseBreadcrumbParent,
  getCourseSource,
} from '@/lib/courseNavigation';
import { DocumentIcon, getCourseContentVisualConfig } from './courseContentPresentation';

const RIGHT_SIDEBAR_WIDTH_PX = 340;
const RIGHT_PANEL_WIDTH_PX = 300;
const TOP_NAV_HEIGHT_PX = 73;
const RIGHT_PANEL_VERTICAL_INSET_PX = 16;

interface MaterialReaderViewProps {
  course: CourseDetail;
  currentModule: CourseModule;
  currentMaterial: CourseContentItem;
}

export function MaterialReaderView({
  course,
  currentModule,
  currentMaterial,
}: MaterialReaderViewProps) {
  const searchParams = useSearchParams();
  const source = getCourseSource(searchParams.get('from'));
  const { isMobile, rightSidebarOpen, toggleRightSidebar } = useAppShell();
  const desktopRightSidebarWidth = rightSidebarOpen ? RIGHT_SIDEBAR_WIDTH_PX : 0;
  const breadcrumbParent = getCourseBreadcrumbParent(source);

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <nav className="flex flex-wrap items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <Link href="/dashboard_mahasiswa" className="transition-opacity hover:opacity-70">
            Home
          </Link>
          <span>›</span>
          <Link href={COURSE_CATALOG_HREF} className="transition-opacity hover:opacity-70">
            Courses
          </Link>
          {source === 'my-courses' ? (
            <>
              <span>›</span>
              <Link href={breadcrumbParent.href} className="transition-opacity hover:opacity-70">
                {breadcrumbParent.label}
              </Link>
            </>
          ) : null}
          <span>›</span>
          <Link href={buildCourseDetailHref(course.id, source)} className="transition-opacity hover:opacity-70">
            {course.title}
          </Link>
          <span>›</span>
          <span>{currentModule.title}</span>
          <span>›</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{currentMaterial.title}</span>
        </nav>

        <div className="h-10 w-10 shrink-0" />
      </div>

      <div
        className="flex w-full transition-[column-gap] duration-300"
        style={{ columnGap: rightSidebarOpen && !isMobile ? '24px' : '0px' }}
      >
        <div className="min-w-0 flex-1">
          <header className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-brand-primary)' }}>
              {currentModule.title}
            </p>
            <h1 className="text-[28px] font-bold leading-tight sm:text-[44px]" style={{ color: 'var(--color-text-primary)' }}>
              {currentMaterial.title}
            </h1>
          </header>

          <div className="space-y-6">
            <MaterialHero material={currentMaterial} />

            {currentMaterial.type === 'article' ? (
              <MarkdownArticle content={currentMaterial.content?.markdown ?? ''} />
            ) : null}

            {currentMaterial.type === 'document' ? (
              <DocumentDownloadCard material={currentMaterial} />
            ) : null}
          </div>
        </div>

        {!isMobile ? (
          <aside
            className="sticky flex shrink-0 items-start overflow-hidden transition-[width] duration-300"
            style={{
              top: `${TOP_NAV_HEIGHT_PX}px`,
              height: `calc(100vh - ${TOP_NAV_HEIGHT_PX}px - ${RIGHT_PANEL_VERTICAL_INSET_PX}px)`,
              width: `${desktopRightSidebarWidth}px`,
            }}
            aria-hidden={!rightSidebarOpen}
          >
            <div
              className="flex h-full shrink-0 items-start"
              style={{ width: `${RIGHT_SIDEBAR_WIDTH_PX}px` }}
            >
              <button
                type="button"
                onClick={toggleRightSidebar}
                aria-label="Hide course content"
                className="mt-[calc(50vh-95px)] flex h-11 w-8 items-center justify-center rounded-l-full bg-[#1684E8] text-white shadow-[0_8px_24px_rgba(22,132,232,0.35)]"
              >
                <RightSidebarChevronIcon open={rightSidebarOpen} />
              </button>
              <div
                className="h-full overflow-hidden"
                style={{
                  width: `${RIGHT_PANEL_WIDTH_PX}px`,
                }}
              >
                <CourseContentPanel
                  course={course}
                  currentMaterialId={currentMaterial.id}
                  source={source}
                />
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      <CourseContentRightSidebar
        course={course}
        currentMaterialId={currentMaterial.id}
        source={source}
        open={rightSidebarOpen}
        isMobile={isMobile}
        onToggle={toggleRightSidebar}
      />
    </div>
  );
}

function MaterialHero({ material }: { material: CourseContentItem }) {
  if (material.type === 'video') {
    const videoUrl = material.content?.videoUrl ?? '';
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    let embedUrl = videoUrl;
    if (isYoutube) {
      if (videoUrl.includes('watch?v=')) {
        const videoId = new URL(videoUrl).searchParams.get('v');
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (videoUrl.includes('youtu.be/')) {
        const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return (
      <section
        className="overflow-hidden rounded-[24px] border bg-[#243451] shadow-[0_14px_36px_rgba(15,33,74,0.12)]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="aspect-video w-full">
          {isYoutube ? (
            <iframe
              className="h-full w-full"
              src={embedUrl}
              title={material.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video className="h-full w-full" controls src={videoUrl} />
          )}
        </div>
      </section>
    );
  }

  if (material.type === 'document') {
    return (
      <section
        className="rounded-[24px] border bg-white p-6 shadow-[0_14px_36px_rgba(15,33,74,0.05)]"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF1FF] text-[#004AC6]">
            <DocumentIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-2 inline-flex rounded-full bg-[#F3F6FB] px-3 py-1 text-xs font-bold uppercase tracking-[0.05em]" style={{ color: 'var(--color-text-secondary)' }}>
              PDF Document
            </p>
            <h2 className="text-[32px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              {material.title}
            </h2>
            <p className="mt-3 text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
              {material.summary ?? material.content?.previewText}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-[24px] border bg-white p-6 shadow-[0_14px_36px_rgba(15,33,74,0.05)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="mb-4 inline-flex rounded-full bg-[#FFF3F0] px-3 py-1 text-xs font-bold uppercase tracking-[0.05em]" style={{ color: '#E5523F' }}>
        Reading Material
      </div>
      <h2 className="text-[24px] font-bold sm:text-[34px]" style={{ color: 'var(--color-text-primary)' }}>
        {material.title}
      </h2>
      <p className="mt-4 text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
        {material.summary ?? material.content?.previewText}
      </p>
    </section>
  );
}

import { getApiBaseUrl } from '@/lib/api/apiConfig';

const resolveFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

function DocumentDownloadCard({ material }: { material: CourseContentItem }) {
  return (
    <section
      className="rounded-[24px] border bg-white p-6 shadow-[0_14px_36px_rgba(15,33,74,0.05)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Download Document
          </h3>
          <p className="mt-2 text-base leading-7" style={{ color: 'var(--color-text-secondary)' }}>
            {material.content?.previewText ?? 'The supporting file can be downloaded for offline reading.'}
          </p>
        </div>
        <a
          href={resolveFileUrl(material.content?.downloadUrl || '')}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-[16px] bg-[#0F4BB6] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {material.content?.downloadLabel ?? 'Download File'}
        </a>
      </div>
    </section>
  );
}

function CourseContentPanel({
  course,
  currentMaterialId,
  source,
}: {
  course: CourseDetail;
  currentMaterialId: string;
  source: CourseSource;
}) {
  const [openModules, setOpenModules] = React.useState<Record<string, boolean>>(
    Object.fromEntries(course.tabs.materials.map((module) => [module.id, true]))
  );

  return (
    <aside
      className="flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_14px_34px_rgba(15,33,74,0.06)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="border-b px-3 py-3" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Course Content
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {course.tabs.materials.map((module) => {
          const moduleOpen = openModules[module.id] ?? true;
          return (
            <div key={module.id} className="mb-3 last:mb-0">
              <button
                type="button"
                onClick={() =>
                  setOpenModules((prev) => ({
                    ...prev,
                    [module.id]: !moduleOpen,
                  }))
                }
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left"
              >
                <span className="text-sm font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                  {module.title}
                </span>
                <PanelChevronIcon open={moduleOpen} />
              </button>

              {moduleOpen ? (
                <div className="mt-1 space-y-1 pl-1">
                  {module.items.map((item) => {
                    const active = item.id === currentMaterialId;
                    return (
                      <Link
                        key={item.id}
                        href={buildMaterialHref(course.id, item.id, source)}
                        className="flex items-start gap-2 rounded-md px-2 py-2 no-underline transition-colors hover:bg-[#F5F8FF]"
                        style={{
                          background: active ? '#EAF1FF' : 'transparent',
                          color: active ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)',
                        }}
                      >
                        <span className="mt-0.5 shrink-0">{getCourseContentVisualConfig(item.type).miniIcon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold leading-snug">
                            {item.title}
                          </div>
                          <div className="mt-0.5 text-[11px] opacity-80">{item.meta}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function CourseContentRightSidebar({
  course,
  currentMaterialId,
  source,
  open,
  isMobile,
  onToggle,
}: {
  course: CourseDetail;
  currentMaterialId: string;
  source: CourseSource;
  open: boolean;
  isMobile: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {isMobile && open ? (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={onToggle}
        />
      ) : null}

      {isMobile || !open ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? 'Hide course content' : 'Show course content'}
          className="fixed top-1/2 z-50 flex h-11 w-8 -translate-y-1/2 items-center justify-center rounded-l-full bg-[#1684E8] text-white shadow-[0_8px_24px_rgba(22,132,232,0.35)] transition-[right] duration-300"
          style={{ right: isMobile && open ? 'min(86vw, 300px)' : '0px' }}
        >
          <RightSidebarChevronIcon open={open} />
        </button>
      ) : null}

      {isMobile ? (
        <aside
          className="fixed right-0 top-[73px] z-40 h-[calc(100vh-73px)] w-[300px] max-w-[86vw] overflow-y-auto border-l bg-white shadow-[-10px_0_30px_rgba(16,33,67,0.18)] transition-transform duration-300"
          style={{
            borderColor: 'var(--color-border)',
            transform: open ? 'translateX(0)' : 'translateX(100%)',
          }}
        >
          <div className="p-3">
            <CourseContentPanel
              course={course}
              currentMaterialId={currentMaterialId}
              source={source}
            />
          </div>
        </aside>
      ) : null}
    </>
  );
}

function MarkdownArticle({ content }: { content: string }) {
  const blocks = content.split('\n\n').filter(Boolean);

  return (
    <section
      className="rounded-[24px] border bg-white p-6 shadow-[0_14px_36px_rgba(15,33,74,0.05)]"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="space-y-5">
        {blocks.map((block) => {
          if (block.startsWith('## ')) {
            return (
              <h3 key={block} className="text-[20px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {block.replace(/^## /, '')}
              </h3>
            );
          }

          if (block.startsWith('```') && block.endsWith('```')) {
            const code = block.replace(/^```/, '').replace(/```$/, '').trim();
            return (
              <pre
                key={block}
                className="overflow-x-auto rounded-2xl border bg-[#F6F8FB] p-4 text-sm leading-7"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                <code>{code}</code>
              </pre>
            );
          }

          if (block.split('\n').every((line) => line.startsWith('- '))) {
            return (
              <ul
                key={block}
                className="space-y-2 pl-5 text-base leading-8"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {block.split('\n').map((line) => (
                  <li key={line}>{line.replace(/^- /, '')}</li>
                ))}
              </ul>
            );
          }

          return (
            <p key={block} className="text-base leading-8" style={{ color: 'var(--color-text-secondary)' }}>
              {block}
            </p>
          );
        })}
      </div>
    </section>
  );
}

function PanelChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
    >
      <path d="M4 6 8 10 12 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RightSidebarChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 22 22"
      fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
    >
      <path d="M14 4 8 11l6 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

