"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Calendar, X, AlertCircle } from "lucide-react";
import { fetchCourses, fetchMyCourses, fetchCourseDetail } from "@/lib/api/courseApi";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dateStr: string; // Format: YYYY-MM-DD
  color: "blue" | "purple" | "green" | "yellow" | "red";
}

const COLOR_MAP = {
  blue: { bg: "rgba(59, 130, 246, 0.1)", text: "#1d4ed8", border: "rgba(59, 130, 246, 0.3)", hex: "#3b82f6" },
  purple: { bg: "rgba(139, 92, 246, 0.1)", text: "#6d28d9", border: "rgba(139, 92, 246, 0.3)", hex: "#8b5cf6" },
  green: { bg: "rgba(16, 185, 129, 0.1)", text: "#047857", border: "rgba(16, 185, 129, 0.3)", hex: "#10b981" },
  yellow: { bg: "rgba(245, 158, 11, 0.1)", text: "#b45309", border: "rgba(245, 158, 11, 0.3)", hex: "#f59e0b" },
  red: { bg: "rgba(239, 68, 68, 0.1)", text: "#b91c1c", border: "rgba(239, 68, 68, 0.3)", hex: "#ef4444" },
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAY_NAMES = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function CalendarWorkspace() {
  const [userId, setUserId] = useState<string>("anonymous");
  const [userRole, setUserRole] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [assignmentEvents, setAssignmentEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const events = useMemo(() => {
    return [...customEvents, ...assignmentEvents];
  }, [customEvents, assignmentEvents]);
  
  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState<keyof typeof COLOR_MAP>("blue");
  const [errorMsg, setErrorMsg] = useState("");

  // Get User ID from session storage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id) setUserId(parsed.id);
        if (parsed?.role) setUserRole(parsed.role);
      }
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (e) {
      console.error("Failed to read user session", e);
    }
  }, []);

  // Load events from LocalStorage
  useEffect(() => {
    if (!userId || userId === "anonymous") return;
    try {
      const storedEvents = localStorage.getItem(`calendar-events-${userId}`);
      if (storedEvents) {
        setCustomEvents(JSON.parse(storedEvents));
      } else {
        // Seed some initial demo events so it doesn't look empty at first
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, "0");
        const d1 = String(now.getDate()).padStart(2, "0");
        const d2 = String(now.getDate() + 2).padStart(2, "0");
        
        const demo: CalendarEvent[] = [
          { id: "demo-1", title: "Praktikum Web Lanjut", description: "Modul 1: Setup React & Next.js", dateStr: `${y}-${m}-${d1}`, color: "blue" },
          { id: "demo-2", title: "Kuis Dasar Pemrograman", description: "Pilihan Ganda 15 Menit", dateStr: `${y}-${m}-${d2}`, color: "purple" }
        ];
        setCustomEvents(demo);
        localStorage.setItem(`calendar-events-${userId}`, JSON.stringify(demo));
      }
    } catch (e) {
      console.error("Failed to load events", e);
    }
  }, [userId]);

  // Load dynamic course assignment deadlines
  useEffect(() => {
    if (!token || !userRole) return;
    const currentToken = token;

    async function loadDynamicEvents() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/calendar/events`, {
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch calendar events');
        
        const apiEvents = await res.json();
        const loadedEvents: CalendarEvent[] = [];
        
        apiEvents.forEach((assignment: any) => {
          if (assignment.start) {
            const date = new Date(assignment.start);
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            const dateStr = `${y}-${m}-${d}`;

            loadedEvents.push({
              id: `assignment-${assignment.id}`,
              title: `Tugas: ${assignment.title}`,
              description: `Deadline: ${new Date(assignment.start).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} • Mata Kuliah: ${assignment.courseName}`,
              dateStr,
              color: "red", 
            });
          }
        });

        setAssignmentEvents(loadedEvents);
      } catch (err) {
        console.error("Failed to load academic calendar events from API", err);
      }
    }

    loadDynamicEvents();
  }, [token, userRole]);

  // Save events helper
  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setCustomEvents(updatedEvents);
    try {
      localStorage.setItem(`calendar-events-${userId}`, JSON.stringify(updatedEvents));
    } catch (e) {
      console.error("Failed to save events to storage", e);
    }
  };

  // Date parsing logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const startDayIndex = useMemo(() => {
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want 0 for Monday, 6 for Sunday.
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  }, [year, month]);

  const daysOfPrevMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (dayNum: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return; // Only allow event edits on current month view
    const formattedDay = String(dayNum).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    setSelectedDateStr(`${year}-${formattedMonth}-${formattedDay}`);
    setNewTitle("");
    setNewDesc("");
    setNewColor("blue");
    setErrorMsg("");
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("Judul agenda tidak boleh kosong.");
      return;
    }
    if (!selectedDateStr) return;

    const newEvent: CalendarEvent = {
      id: "event-" + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      dateStr: selectedDateStr,
      color: newColor,
    };

    saveEvents([...customEvents, newEvent]);
    setNewTitle("");
    setNewDesc("");
    setErrorMsg("");
  };

  const handleDeleteEvent = (id: string) => {
    saveEvents(customEvents.filter(ev => ev.id !== id));
  };

  // Group events by date string for rendering performance
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(ev => {
      if (!map[ev.dateStr]) map[ev.dateStr] = [];
      map[ev.dateStr].push(ev);
    });
    return map;
  }, [events]);

  // Generate grid cells
  const gridCells = useMemo(() => {
    const cells: { dayNum: number; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Fill prev month days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const dayVal = daysOfPrevMonth - i;
      cells.push({ dayNum: dayVal, isCurrentMonth: false, dateKey: `prev-${dayVal}` });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const formattedDay = String(i).padStart(2, "0");
      const formattedMonth = String(month + 1).padStart(2, "0");
      cells.push({ dayNum: i, isCurrentMonth: true, dateKey: `${year}-${formattedMonth}-${formattedDay}` });
    }

    // Fill next month days to complete 42 grid cells
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({ dayNum: i, isCurrentMonth: false, dateKey: `next-${i}` });
    }

    return cells;
  }, [daysInMonth, startDayIndex, daysOfPrevMonth, year, month]);

  const todayStr = useMemo(() => {
    const t = new Date();
    const ty = t.getFullYear();
    const tm = String(t.getMonth() + 1).padStart(2, "0");
    const td = String(t.getDate()).padStart(2, "0");
    return `${ty}-${tm}-${td}`;
  }, []);

  const activeDayEvents = selectedDateStr ? (eventsByDate[selectedDateStr] ?? []) : [];

  return (
    <div className="calendar-wrapper-card">
      <style>{`
        .calendar-wrapper-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(15, 33, 74, 0.03);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .calendar-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .calendar-month-title {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .calendar-nav-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .calendar-nav-btn {
          height: 38px;
          width: 38px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calendar-nav-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .calendar-today-btn {
          padding: 0 16px;
          font-size: 13px;
          font-weight: 700;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          color: #475569;
          height: 38px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .calendar-today-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .calendar-grid-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          margin-bottom: 12px;
          text-align: center;
        }
        .calendar-day-label {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 0;
        }
        .calendar-grid-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
        }
        .calendar-day-cell {
          min-height: 100px;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 10px;
          background: #fff;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .calendar-day-cell:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
          border-color: #3b82f6;
        }
        .calendar-day-cell.dimmed {
          background: #f8fafc;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .calendar-day-cell.dimmed:hover {
          transform: none;
          box-shadow: none;
          border-color: #f1f5f9;
        }
        .calendar-day-cell.today {
          border: 2px solid #3b82f6;
          background: linear-gradient(to bottom right, #fff, #eff6ff);
        }
        .calendar-day-number {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          align-self: flex-end;
        }
        .calendar-day-cell.dimmed .calendar-day-number {
          color: #94a3b8;
          font-weight: 500;
        }
        .calendar-cell-events {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
          overflow: hidden;
        }
        .calendar-event-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 6px;
          border-radius: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border-left: 3px solid transparent;
        }
        .calendar-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.3);
          backdrop-blur: 4px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: fadeIn 0.2s ease-out;
        }
        .calendar-modal-card {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          overflow: hidden;
          border: 1px solid #e2e8f0;
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .calendar-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
        }
        .calendar-modal-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }
        .calendar-modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .calendar-modal-close:hover {
          background: #f1f5f9;
          color: #475569;
        }
        .calendar-modal-body {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
        }
        .event-list-section {
          margin-bottom: 24px;
        }
        .event-list-title {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .event-item-card {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 14px;
          border: 1px solid transparent;
          margin-bottom: 8px;
        }
        .event-item-info {
          flex: 1;
          margin-right: 12px;
        }
        .event-item-title {
          font-size: 14px;
          font-weight: 700;
        }
        .event-item-desc {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }
        .event-item-delete {
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .event-item-delete:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .empty-events-text {
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
          padding: 12px 0;
          font-style: italic;
        }
        .add-event-form {
          border-top: 1px solid #f1f5f9;
          padding-top: 20px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 6px;
        }
        .form-input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .color-selector-row {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-top: 4px;
        }
        .color-dot-btn {
          height: 28px;
          width: 28px;
          border-radius: 50%;
          border: 2px solid white;
          cursor: pointer;
          transition: transform 0.2s;
          position: relative;
        }
        .color-dot-btn:hover {
          transform: scale(1.15);
        }
        .color-dot-btn.selected {
          transform: scale(1.15);
          box-shadow: 0 0 0 2px #3b82f6;
        }
        .btn-submit-event {
          width: 100%;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 14px;
          padding: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.2s;
        }
        .btn-submit-event:hover {
          background: #2563eb;
        }
        .error-message-banner {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 12px;
          margin-bottom: 16px;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Header bar */}
      <div className="calendar-header-bar">
        <h2 className="calendar-month-title">
          <Calendar className="h-6 w-6 text-blue-600" />
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="calendar-nav-buttons">
          <button className="calendar-today-btn" onClick={handleToday}>Today</button>
          <button className="calendar-nav-btn" onClick={handlePrevMonth} aria-label="Bulan sebelumnya">
            <ChevronLeft size={18} />
          </button>
          <button className="calendar-nav-btn" onClick={handleNextMonth} aria-label="Bulan berikutnya">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="calendar-grid-header">
        {DAY_NAMES.map(day => (
          <div key={day} className="calendar-day-label">{day}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="calendar-grid-body">
        {gridCells.map(cell => {
          const isToday = cell.isCurrentMonth && cell.dateKey === todayStr;
          const dayEvents = cell.isCurrentMonth ? (eventsByDate[cell.dateKey] ?? []) : [];
          
          return (
            <div
              key={cell.dateKey}
              onClick={() => handleDayClick(cell.dayNum, cell.isCurrentMonth)}
              className={`calendar-day-cell ${!cell.isCurrentMonth ? "dimmed" : ""} ${isToday ? "today" : ""}`}
            >
              <span className="calendar-day-number">{cell.dayNum}</span>
              <div className="calendar-cell-events">
                {dayEvents.slice(0, 3).map(ev => {
                  const style = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                  return (
                    <div
                      key={ev.id}
                      className="calendar-event-pill"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        borderColor: style.border,
                        borderLeftColor: style.hex,
                      }}
                      title={`${ev.title}${ev.description ? `: ${ev.description}` : ""}`}
                    >
                      {ev.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="calendar-event-pill" style={{ color: "#64748b", background: "#f1f5f9", textAlign: "center", fontWeight: 700 }}>
                    +{dayEvents.length - 3} agenda
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal dialog */}
      {selectedDateStr && (
        <div className="calendar-modal-overlay" onClick={() => setSelectedDateStr(null)}>
          <div className="calendar-modal-card" onClick={e => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3 className="calendar-modal-title">
                Agenda Tanggal: {selectedDateStr.split("-").reverse().join("/") }
              </h3>
              <button className="calendar-modal-close" onClick={() => setSelectedDateStr(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="calendar-modal-body">
              {/* Event list */}
              <div className="event-list-section">
                <p className="event-list-title">Agenda Terjadwal</p>
                {activeDayEvents.length === 0 ? (
                  <p className="empty-events-text">Belum ada agenda terdaftar pada hari ini.</p>
                ) : (
                  activeDayEvents.map(ev => {
                    const style = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                    return (
                      <div
                        key={ev.id}
                        className="event-item-card"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                          color: style.text
                        }}
                      >
                        <div className="event-item-info">
                          <h4 className="event-item-title">{ev.title}</h4>
                          {ev.description && <p className="event-item-desc">{ev.description}</p>}
                        </div>
                        {!ev.id.startsWith("assignment-") && (
                          <button
                            type="button"
                            className="event-item-delete"
                            onClick={() => handleDeleteEvent(ev.id)}
                            title="Hapus Agenda"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add event form */}
              <form className="add-event-form" onSubmit={handleAddEvent}>
                {errorMsg && (
                  <div className="error-message-banner">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Judul Agenda</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kuis Pertemuan 4, Rapat Asisten..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi / Catatan (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Contoh: Materi Git Branching, Ruang Lab 3..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warna Label</label>
                  <div className="color-selector-row">
                    {(Object.keys(COLOR_MAP) as Array<keyof typeof COLOR_MAP>).map(c => {
                      const colorStyle = COLOR_MAP[c];
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`color-dot-btn ${newColor === c ? "selected" : ""}`}
                          style={{ backgroundColor: colorStyle.hex }}
                          onClick={() => setNewColor(c)}
                          title={`Label warna ${c}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-submit-event">
                  <Plus size={16} />
                  Tambah Agenda Baru
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
