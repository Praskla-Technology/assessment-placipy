import React, { useState, useEffect, useRef } from 'react';
import {
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaCalendarAlt
} from 'react-icons/fa';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PTOService from '../../services/pto.service';
// Removed extra CTA nav cards per request

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState({
    totalAssessments: 0,
    activeAssessments: 0,
    totalStudents: 0,
    totalDepartments: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [departmentPerformanceData, setDepartmentPerformanceData] = useState<Array<{ name: string; students: number; avgScore: number; completed: number }>>([]);
  const [assessments, setAssessments] = useState<Array<{ id: string; title: string; subject: string; startTime: string; duration: string; status: 'ongoing' | 'upcoming' }>>([]);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming'>('ongoing');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await PTOService.getDashboard();
      setStats({
        totalAssessments: data.totalAssessments,
        activeAssessments: data.activeAssessments,
        totalStudents: data.totalStudents,
        totalDepartments: data.totalDepartments,
        completedToday: 0
      });
      setDepartmentPerformanceData(
        data.departmentPerformance.map(d => ({ name: d.code || d.name, students: d.students, avgScore: d.avgScore, completed: d.completed }))
      );
      type AssessmentCard = { id: string; title: string; subject: string; startTime: string; duration: string; status: 'ongoing' | 'upcoming' };
      type RawTest = { id: string; name: string; department?: string; date?: string; duration?: number };

      // Merge both lists and reclassify by date on the frontend
      const allTests = [
        ...(data.ongoingTests as RawTest[]),
        ...(data.upcomingTests as RawTest[])
      ];

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const classifiedCards: AssessmentCard[] = allTests
        .filter((t) => {
          // Drop tests with no date or a past date
          if (!t.date) return false;
          const testDay = new Date(t.date);
          testDay.setHours(0, 0, 0, 0);
          return testDay >= todayStart; // keep today + future only
        })
        .map((t) => {
          const testDay = new Date(t.date!);
          testDay.setHours(0, 0, 0, 0);
          const status: 'ongoing' | 'upcoming' =
            testDay.getTime() === todayStart.getTime() ? 'ongoing' : 'upcoming';
          return {
            id: t.id,
            title: t.name,
            subject: t.department || 'All',
            startTime: new Date(t.date!).toLocaleDateString(),
            duration: `${t.duration || 0} mins`,
            status
          };
        });

      setAssessments(classifiedCards);
      setLoading(false);
    };
    load();
  }, []);

  // KPI Cards matching PRD overview
  const kpiCards = [
    {
      label: 'TOTAL STUDENTS',
      value: stats.totalStudents,
      change: 'Across all departments',
      icon: FaUsers
    },
    {
      label: 'DEPARTMENTS',
      value: stats.totalDepartments,
      change: 'Active departments',
      icon: FaBuilding
    },
    {
      label: 'TOTAL ASSESSMENTS',
      value: stats.totalAssessments,
      change: '+4 from last month',
      icon: FaClipboardList
    },
    {
      label: 'ACTIVE ASSESSMENTS',
      value: stats.activeAssessments,
      change: 'Currently running',
      icon: FaCalendarAlt
    },
  ];

  return (
    <div className="pto-dashboard-home">
      <div className="pto-welcome-banner" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.7 }}>
          <FloatingCircles />
        </div>
        <div className="pto-welcome-content" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="pto-welcome-title">Welcome to PTO Dashboard</h1>
          <p className="pto-welcome-subtitle">
            Manage Departments, Staff, Assessments & Student Performance.
          </p>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', right: 24, opacity: 0.15, zIndex: 0 }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.1))'
          }} />
        </div>
      </div>



      {/* KPI Cards - Matching Image Style */}
      {/* KPI Cards - Matching Image Style */}
      <div className="pto-kpi-section">
        <div className="pto-kpi-grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="pto-kpi-card">
                <div className="pto-skeleton pto-skeleton-text" style={{ width: '100px' }}></div>
                <div className="pto-skeleton pto-skeleton-number" style={{ width: '60px', height: '36px', marginTop: '10px' }}></div>
                <div className="pto-skeleton pto-skeleton-text" style={{ width: '120px', marginTop: '5px' }}></div>
              </div>
            ))
          ) : (
            kpiCards.map((card, index) => (
              <div
                key={index}
                className="pto-kpi-card pto-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="pto-kpi-label">{card.label}</div>
                <div className="pto-kpi-value">{card.value}</div>
                <div className="pto-kpi-change">{card.change}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Department Performance Analytics */}
      <div className="pto-analytics-section">
        <h2 className="pto-section-title pto-fade-in">Performance by Department</h2>
        <div className="pto-chart-card pto-slide-in" style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
          {/* Chart */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div className="pto-skeleton" style={{ width: '100%', height: '300px' }}></div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#9768E1" name="Total Students" />
                  <Bar dataKey="avgScore" fill="#E4D5F8" name="Avg Score" />
                  <Bar dataKey="completed" fill="#A4878D" name="Completed Tests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legend — top-right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px', minWidth: '160px' }}>
            {[
              { color: '#9768E1', label: 'Total Students' },
              { color: '#E4D5F8', label: 'Avg Score', border: '1px solid #c8a8f0' },
              { color: '#A4878D', label: 'Completed Tests' },
            ].map(({ color, label, border }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  display: 'inline-block', width: '14px', height: '14px',
                  borderRadius: '3px', background: color,
                  border: border || 'none', flexShrink: 0
                }} />
                <span style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tests Overview — Tabbed */}
      <div className="tests-section" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('ongoing')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem',
              backgroundColor: activeTab === 'ongoing' ? '#9768E1' : 'white',
              color: activeTab === 'ongoing' ? 'white' : '#6b7280',
              boxShadow: activeTab === 'ongoing' ? '0 2px 8px rgba(151,104,225,0.35)' : '0 0 0 1.5px #d1d5db',
              transition: 'all 0.18s ease'
            }}
          >
            🟢 Ongoing
            <span style={{
              background: activeTab === 'ongoing' ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
              color: activeTab === 'ongoing' ? 'white' : '#374151',
              borderRadius: '999px', padding: '1px 8px', fontSize: '0.8rem', fontWeight: 700
            }}>
              {assessments.filter(a => a.status === 'ongoing').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.92rem',
              backgroundColor: activeTab === 'upcoming' ? '#9768E1' : 'white',
              color: activeTab === 'upcoming' ? 'white' : '#6b7280',
              boxShadow: activeTab === 'upcoming' ? '0 2px 8px rgba(151,104,225,0.35)' : '0 0 0 1.5px #d1d5db',
              transition: 'all 0.18s ease'
            }}
          >
            📅 Upcoming
            <span style={{
              background: activeTab === 'upcoming' ? 'rgba(255,255,255,0.25)' : '#e5e7eb',
              color: activeTab === 'upcoming' ? 'white' : '#374151',
              borderRadius: '999px', padding: '1px 8px', fontSize: '0.8rem', fontWeight: 700
            }}>
              {assessments.filter(a => a.status === 'upcoming').length}
            </span>
          </button>
        </div>

        {/* Tab content */}
        <div className="tests-list" style={{ width: '100%' }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className={`test-card ${activeTab === 'ongoing' ? 'ongoing' : ''}`}>
                <div className="pto-skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px', marginRight: '15px' }}></div>
                <div style={{ flex: 1 }}>
                  <div className="pto-skeleton pto-skeleton-text" style={{ width: '150px' }}></div>
                  <div className="pto-skeleton pto-skeleton-text" style={{ width: '100px' }}></div>
                </div>
              </div>
            ))
          ) : assessments.filter(a => a.status === activeTab).length > 0 ? (
            assessments.filter(a => a.status === activeTab).map((test, idx) => (
              <div
                key={test.id}
                className={`test-card ${activeTab === 'ongoing' ? 'ongoing' : ''} pto-fade-in`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="test-icon">
                  <FaCalendarAlt size={18} color="#9768E1" />
                </div>
                <div className="test-content">
                  <div className="test-name">{test.title}</div>
                  <div className="test-detail"><strong>Department:</strong> {test.subject}</div>
                  <div className="test-date">
                    <strong>{activeTab === 'ongoing' ? 'Started:' : 'Starts:'}</strong> {test.startTime}
                  </div>
                  <div className="test-duration"><strong>Duration:</strong> {test.duration}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="pto-empty-state">
              No {activeTab === 'ongoing' ? 'ongoing' : 'upcoming'} tests
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DashboardHome;

const FloatingCircles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const circlesRef = useRef<Array<{ x: number; y: number; r: number; dx: number; dy: number; color: string }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const parent = canvas.parentElement!;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(parent.clientWidth * dpr);
      canvas.height = Math.floor(parent.clientHeight * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const colors = [
      'rgba(151,104,225,0.35)',
      'rgba(228,213,248,0.35)',
      'rgba(255,255,255,0.25)'
    ];

    const init = () => {
      circlesRef.current = [];
      const parent = canvas.parentElement!;
      const count = Math.max(12, Math.min(24, Math.floor(parent.clientWidth / 60)));
      for (let i = 0; i < count; i++) {
        const r = 14 + Math.random() * 36;
        circlesRef.current.push({
          x: Math.random() * parent.clientWidth,
          y: Math.random() * parent.clientHeight,
          r,
          dx: (Math.random() * 0.6 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
          dy: (Math.random() * 0.6 + 0.2) * (Math.random() < 0.5 ? -1 : 1),
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };
    init();

    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(32, t - last);
      last = t;

      const parent = canvas.parentElement!;
      ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight);

      const grd = ctx.createRadialGradient(
        parent.clientWidth * 0.8,
        parent.clientHeight * 0.2,
        20,
        parent.clientWidth * 0.8,
        parent.clientHeight * 0.2,
        Math.max(parent.clientWidth, parent.clientHeight)
      );
      grd.addColorStop(0, 'rgba(255,255,255,0.08)');
      grd.addColorStop(1, 'rgba(255,255,255,0.0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight);

      for (const c of circlesRef.current) {
        c.x += c.dx * (dt / 16);
        c.y += c.dy * (dt / 16);

        if (c.x - c.r > parent.clientWidth) c.x = -c.r;
        if (c.x + c.r < 0) c.x = parent.clientWidth + c.r;
        if (c.y - c.r > parent.clientHeight) c.y = -c.r;
        if (c.y + c.r < 0) c.y = parent.clientHeight + c.r;

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas.parentElement!);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

