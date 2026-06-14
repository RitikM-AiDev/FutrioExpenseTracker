import { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaExchangeAlt,
  FaPlusCircle,
  FaChartBar,
  FaWallet,
  FaCog,
  FaMoon,
  FaSun,
  FaBars,
  FaCalendarAlt,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", icon: FaHome, route: "/dashboard" },
  { label: "Transactions", icon: FaExchangeAlt, route: "/transactions" },
  { label: "Add Expense", icon: FaPlusCircle, route: "/addexpense" },
  { label: "Reports", icon: FaChartBar, route: "/reports" },
  { label: "Budget", icon: FaWallet, route: "/budget" },
  { label: "Settings", icon: FaCog, route: "/settings" },
];

function formatINR(val: string | number | null) {
  if (!val) return "—";
  const n = Number(val);
  return isNaN(n)
    ? "—"
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);
}

type Star = { x: number; y: number; z: number; size: number };

export default function Budget() {
  const nav = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const animRef = useRef<number>(0);

  const [dark, setDark] = useState(localStorage.getItem("darktheme") !== "false");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/budget");

  const [monthly, setMonthly] = useState<number | "">("");
  const [daily, setDaily] = useState<number | "">("");
  const [weekly, setWeekly] = useState<number | "">("");
  const [saved, setSaved] = useState(false);

  const [storedMonthly, setStoredMonthly] = useState<string | null>(null);
  const [storedDaily, setStoredDaily] = useState<string | null>(null);
  const [storedWeekly, setStoredWeekly] = useState<string | null>(null);

  const isDarkRef = useRef(dark);
  useEffect(() => {
    isDarkRef.current = dark;
  }, [dark]);

  useEffect(() => {
    setActiveRoute(window.location.pathname);
    const m = localStorage.getItem("monthly-limit");
    const d = localStorage.getItem("daily-limit");
    const w = localStorage.getItem("weekly-limit");

    setStoredMonthly(m);
    setStoredDaily(d);
    setStoredWeekly(w);

    if (m) setMonthly(Number(m));
    if (d) setDaily(Number(d));
    if (w) setWeekly(Number(w));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (monthly !== "" && daily !== "" && weekly !== "") {
      localStorage.setItem("monthly-limit", String(monthly));
      localStorage.setItem("daily-limit", String(daily));
      localStorage.setItem("weekly-limit", String(weekly));
      
      setStoredMonthly(String(monthly));
      setStoredDaily(String(daily));
      setStoredWeekly(String(weekly));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleNav = (route: string) => {
    setActiveRoute(route);
    nav(route);
    setSidebarOpen(false);
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("darktheme", String(next));
  };

  // Space background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    let stars: Star[] = Array.from({ length: 180 }).map(() => ({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
      size: Math.random() * 1.2 + 0.3,
    }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      stars.forEach(s => { s.z = Math.random() * w; });
    };

    const move = (e: MouseEvent) => {
      mouseRef.current.tx = (e.clientX - w / 2) / (w / 2);
      mouseRef.current.ty = (e.clientY - h / 2) / (h / 2);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", move);

    const loop = () => {
      if (isDarkRef.current) {
        ctx.fillStyle = "rgba(3, 7, 18, 0.2)";
      } else {
        ctx.fillStyle = "rgba(241, 245, 249, 0.25)";
      }
      ctx.fillRect(0, 0, w, h);

      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const s of stars) {
        s.z -= 1.5;
        if (s.z <= 0) s.z = w;
        const k = 128 / s.z;
        const x = s.x * k + w / 2;
        const y = s.y * k + h / 2;
        const alpha = 1 - s.z / w;

        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        
        ctx.fillStyle = isDarkRef.current ? "white" : "#6366f1";
        ctx.globalAlpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
        ctx.fill();

        const dx = x - (w / 2 + mx * 80);
        const dy = y - (h / 2 + my * 80);
        const d = Math.sqrt(dx * dx + dy * dy);
        
        if (d < 100) {
          ctx.strokeStyle = isDarkRef.current ? "#818cf8" : "#4f46e5";
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = isDarkRef.current ? 0.15 : 0.08;
          ctx.beginPath();
          ctx.moveTo(w / 2 + mx * 80, h / 2 + my * 80);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  const summaryCards = [
    {
      label: "Monthly limit",
      value: formatINR(storedMonthly),
      icon: FaWallet,
      accent: "var(--accent-primary)",
      bg: "var(--accent-primary-dim)",
      tip: "per month",
    },
    {
      label: "Weekly limit",
      value: formatINR(storedWeekly),
      icon: FaCalendarAlt,
      accent: "var(--accent-warning)",
      bg: "var(--accent-warning-dim)",
      tip: "per week",
    },
    {
      label: "Daily limit",
      value: formatINR(storedDaily),
      icon: FaCalendarAlt,
      accent: "var(--accent-success)",
      bg: "var(--accent-success-dim)",
      tip: "per day",
    },
  ];

  return (
    <div className={dark ? "theme-dark" : "theme-light"}>
      <style>{`
        /* THEME VARIABLES */
        .theme-dark {
          --bg-canvas: #030712;
          --bg-sidebar: rgba(10, 10, 30, 0.72);
          --bg-panel: rgba(15, 15, 40, 0.75);
          --bg-input: rgba(99, 102, 241, 0.07);
          --border-main: rgba(99, 102, 241, 0.16);
          --border-subtle: rgba(99, 102, 241, 0.1);
          --text-main: #f1f5f9;
          --text-muted: rgba(148, 163, 184, 0.7);
          --text-sub: rgba(148, 163, 184, 0.6);
          
          --accent-primary: #818cf8;
          --accent-primary-dim: rgba(129, 140, 248, 0.12);
          --accent-success: #34d399;
          --accent-success-dim: rgba(52, 211, 153, 0.12);
          --accent-warning: #f97316;
          --accent-warning-dim: rgba(249, 115, 22, 0.12);
          --shadow-panel: none;
        }

        .theme-light {
          --bg-canvas: #f8fafc;
          --bg-sidebar: rgba(255, 255, 255, 0.85);
          --bg-panel: rgba(255, 255, 255, 0.85);
          --bg-input: #f8fafc;
          --border-main: rgba(99, 102, 241, 0.18);
          --border-subtle: rgba(99, 102, 241, 0.08);
          --text-main: #0f172a;
          --text-muted: #475569;
          --text-sub: #64748b;
          
          --accent-primary: #4f46e5;
          --accent-primary-dim: rgba(79, 70, 229, 0.1);
          --accent-success: #059669;
          --accent-success-dim: rgba(5, 150, 105, 0.1);
          --accent-warning: #ea580c;
          --accent-warning-dim: rgba(234, 88, 12, 0.1);
          --shadow-panel: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .b-shell { display: flex; min-height: 100vh; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background: transparent; }

        .b-sidebar {
          width: 240px; min-height: 100vh;
          display: flex; flex-direction: column;
          background: var(--bg-sidebar);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border-main);
          flex-shrink: 0; z-index: 10;
          transition: transform 0.25s ease, background 0.3s, border-color 0.3s;
        }
        .b-sidebar-logo {
          display: flex; align-items: center; gap: 10px;
          padding: 22px 20px 20px;
          border-bottom: 1px solid var(--border-main);
        }
        .b-logo-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .b-logo-text { font-size: 15px; font-weight: 600; color: var(--text-main); letter-spacing: -0.02em; }
        .b-nav-section {
          padding: 16px 12px 8px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
          color: var(--text-muted); text-transform: uppercase;
        }
        .b-nav-btn {
          display: flex; align-items: center; gap: 10px;
          width: calc(100% - 16px); margin: 1px 8px;
          padding: 9px 14px; border-radius: 8px;
          border: none; background: transparent;
          color: var(--text-muted);
          font-size: 13.5px; font-weight: 450;
          cursor: pointer; transition: background 0.15s, color 0.15s;
          text-align: left;
        }
        .b-nav-btn:hover { background: rgba(99,102,241,0.12); color: var(--text-main); }
        .b-nav-btn.active { background: rgba(99,102,241,0.2); color: #818cf8; font-weight: 500; }
        .b-sidebar-bottom { margin-top: auto; padding: 12px; border-top: 1px solid var(--border-main); }
        
        .b-dark-toggle {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 8px 12px;
          border-radius: 8px; border: 1px solid var(--border-main);
          background: rgba(99,102,241,0.08);
          color: var(--text-muted); font-size: 13px;
          cursor: pointer; transition: background 0.15s, color 0.15s; font-family: inherit;
        }
        .b-dark-toggle:hover { background: rgba(99,102,241,0.15); color: var(--text-main); }

        .b-main { flex: 1; display: flex; flex-direction: column; min-width: 0; background: transparent; }

        .b-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 28px;
          background: var(--bg-sidebar); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-main);
          position: sticky; top: 0; z-index: 5;
          transition: background 0.3s, border-color 0.3s;
        }
        .b-menu-btn {
          display: none; width: 36px; height: 36px;
          border-radius: 8px; border: 1px solid var(--border-main);
          background: rgba(99,102,241,0.08); color: var(--text-muted);
          cursor: pointer; align-items: center; justify-content: center; font-size: 15px;
        }
        .b-page-title { font-size: 16px; font-weight: 600; color: var(--text-main); letter-spacing: -0.01em; }
        .b-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600; color: white;
          border: 2px solid var(--border-main);
        }

        .b-content { padding: 28px; overflow-y: auto; flex: 1; position: relative; z-index: 1; }

        .b-heading { font-size: 22px; font-weight: 700; color: var(--text-main); letter-spacing: -0.03em; margin-bottom: 4px; }
        .b-heading span { color: #818cf8; }
        .b-subheading { font-size: 13.5px; color: var(--text-muted); margin-bottom: 28px; }

        .b-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }

        .b-summary-card {
          background: var(--bg-panel); backdrop-filter: blur(16px);
          border: 1px solid var(--border-main); border-radius: 14px;
          padding: 18px 20px; position: relative; overflow: hidden;
          box-shadow: var(--shadow-panel);
          transition: background 0.3s, border-color 0.3s, transform 0.25s;
        }
        .b-summary-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .b-summary-label { font-size: 11.5px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-sub); }
        .b-summary-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .b-summary-value { font-size: 24px; font-weight: 700; letter-spacing: -0.04em; margin-bottom: 4px; }
        .b-summary-tip { font-size: 11.5px; color: var(--text-sub); opacity: 0.8; }

        .b-split { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }

        .b-panel {
          background: var(--bg-panel); backdrop-filter: blur(16px);
          border: 1px solid var(--border-main); border-radius: 14px;
          overflow: hidden; box-shadow: var(--shadow-panel);
          transition: background 0.3s, border-color 0.3s;
        }
        .b-panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); }
        .b-panel-title { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .b-panel-sub { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
        .b-panel-body { padding: 20px; }

        .b-form { display: flex; flex-direction: column; gap: 18px; }
        .b-field { display: flex; flex-direction: column; gap: 7px; }
        .b-label { font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
        .b-label-icon { width: 18px; height: 18px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
        
        .b-input {
          width: 100%; padding: 11px 14px;
          background: var(--bg-input);
          border: 1px solid var(--border-main);
          border-radius: 10px;
          color: var(--text-main); font-size: 15px; font-family: inherit;
          outline: none; transition: border-color 0.15s, background 0.15s;
          -moz-appearance: textfield;
        }
        .b-input::-webkit-outer-spin-button, .b-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .b-input::placeholder { color: var(--text-sub); opacity: 0.5; }
        .b-input:focus { border-color: #6366f1; background: var(--bg-panel); }
        .b-input-prefix { position: relative; }
        .b-input-prefix::before { content: '₹'; position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none; }
        .b-input-prefix .b-input { padding-left: 28px; }

        .b-save-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 13px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
          transition: opacity 0.15s, transform 0.1s; margin-top: 4px;
        }
        .b-save-btn:hover { opacity: 0.9; }
        .b-save-btn:active { transform: scale(0.98); }
        .b-save-btn.saved { background: linear-gradient(135deg, #059669, #34d399); }

        .b-right { display: flex; flex-direction: column; gap: 14px; }
        
        .b-rule-panel {
          background: var(--bg-panel); backdrop-filter: blur(16px);
          border: 1px solid var(--border-main); border-radius: 14px;
          padding: 18px 20px; box-shadow: var(--shadow-panel);
          transition: background 0.3s, border-color 0.3s;
        }
        .b-rule-title { font-size: 13px; font-weight: 600; color: var(--text-main); margin-bottom: 12px; }
        .b-rule-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid var(--border-subtle); font-size: 12.5px; }
        .b-rule-row:last-child { border-bottom: none; padding-bottom: 0; }
        .b-rule-key { color: var(--text-muted); }
        .b-rule-val { color: var(--text-main); font-weight: 500; }

        .b-tip-panel {
          background: var(--bg-panel); backdrop-filter: blur(16px);
          border: 1px solid var(--border-main); border-radius: 14px;
          padding: 18px 20px; box-shadow: var(--shadow-panel);
          transition: background 0.3s, border-color 0.3s;
        }
        .b-tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .b-tip-icon { width: 30px; height: 30px; border-radius: 8px; background: rgba(251,191,36,0.15); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fbbf24; }
        .b-tip-title { font-size: 13.5px; font-weight: 600; color: var(--text-main); }
        .b-tip-list { display: flex; flex-direction: column; gap: 10px; }
        .b-tip-item { display: flex; align-items: flex-start; gap: 10px; font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
        .b-tip-bullet { width: 18px; height: 18px; border-radius: 5px; background: rgba(129,140,248,0.15); display: flex; align-items: center; justify-content: center; font-size: 9px; color: #6366f1; flex-shrink: 0; margin-top: 1px; }

        .b-toast {
          position: fixed; bottom: 24px; right: 24px; display: flex; align-items: center; gap: 10px;
          background: rgba(5, 150, 105, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(52,211,153,0.3);
          border-radius: 12px; padding: 12px 18px; color: #d1fae5; font-size: 13.5px; font-weight: 500; z-index: 100;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        
        .b-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 9; }
        .b-overlay.open { display: block; }

        @media (max-width: 960px) {
          .b-sidebar { position: fixed; top: 0; left: 0; height: 100vh; transform: translateX(-100%); z-index: 20; }
          .b-sidebar.open { transform: translateX(0); }
          .b-menu-btn { display: flex; }
          .b-split { grid-template-columns: 1fr; }
          .b-summary-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) { .b-content { padding: 16px; } .b-topbar { padding: 12px 16px; } }
      `}</style>

      {/* Dynamic Native Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          background: "var(--bg-canvas)",
          transition: "background 0.3s",
        }}
      />

      <div className={`b-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="b-shell" style={{ position: "relative", zIndex: 1 }}>
        {/* SIDEBAR */}
        <aside className={`b-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="b-sidebar-logo">
            <div className="b-logo-icon">💸</div>
            <span className="b-logo-text">Futrio</span>
          </div>
          <div className="b-nav-section">Menu</div>
          <nav style={{ padding: "4px 0" }}>
            {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                className={`b-nav-btn ${activeRoute === route ? "active" : ""}`}
                onClick={() => handleNav(route)}
              >
                <Icon style={{ fontSize: 14, opacity: 0.8 }} />
                {label}
              </button>
            ))}
          </nav>
          <div className="b-sidebar-bottom">
            <button className="b-dark-toggle" onClick={toggleDark}>
              {dark ? <FaSun size={12} /> : <FaMoon size={12} />}
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </aside>

        {/* MAIN DISPLAY */}
        <div className="b-main">
          {/* Topbar */}
          <div className="b-topbar anim-fadeInDown">
            <div className="b-topbar-left">
              <button className="b-menu-btn" onClick={() => setSidebarOpen(true)}>
                <FaBars />
              </button>
              <span className="b-page-title">Budget planner</span>
            </div>
            <div className="b-topbar-right">
              <div className="b-avatar">HI</div>
            </div>
          </div>

          {/* Core Content Area */}
          <div className="b-content">
            <h1 className="b-heading anim-fadeInUp anim-stagger-1">
              Your <span>spending limits</span>
            </h1>
            <p className="b-subheading anim-fadeInUp anim-stagger-2">Set and track your budget across daily, weekly, and monthly horizons.</p>

            {/* Summary metrics cards */}
            <div className="b-summary-grid">
              {summaryCards.map(({ label, value, icon: Icon, accent, bg, tip }, index) => (
                <div className={`b-summary-card anim-fadeInUp anim-stagger-${index + 2} hover-lift hover-glow`} key={label}>
                  <div className="b-summary-card-top">
                    <span className="b-summary-label">{label}</span>
                    <div className="b-summary-icon" style={{ background: bg, color: accent }}>
                      <Icon />
                    </div>
                  </div>
                  <div className="b-summary-value" style={{ color: accent }}>{value}</div>
                  <div className="b-summary-tip">{tip}</div>
                </div>
              ))}
            </div>

            {/* Two Column Layout split */}
            <div className="b-split">
              {/* Form Input Container */}
              <div className="b-panel anim-fadeInScale anim-stagger-5 hover-glow">
                <div className="b-panel-header">
                  <div className="b-panel-title">Set your budget</div>
                  <div className="b-panel-sub">All limits are saved locally on your device.</div>
                </div>
                <div className="b-panel-body">
                  <form className="b-form" onSubmit={handleSave}>
                    {[
                      { label: "Monthly budget", state: monthly, set: setMonthly, icon: FaWallet, color: "#818cf8", stagger: 6 },
                      { label: "Weekly limit", state: weekly, set: setWeekly, icon: FaCalendarAlt, color: "#f97316", stagger: 7 },
                      { label: "Daily limit", state: daily, set: setDaily, icon: FaCalendarAlt, color: "#34d399", stagger: 8 },
                    ].map(({ label, state, set, icon: Icon, color, stagger }) => (
                      <div className={`b-field anim-fadeInUp anim-stagger-${stagger}`} key={label}>
                        <label className="b-label">
                          <span className="b-label-icon" style={{ background: color + "20", color }}>
                            <Icon />
                          </span>
                          {label}
                        </label>
                        <div className="b-input-prefix">
                          <input
                            type="number"
                            min="1"
                            required
                            className="b-input"
                            placeholder="0"
                            value={state}
                            onChange={(e) =>
                              set(e.target.value === "" ? "" : Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <button type="submit" className={`b-save-btn btn-shimmer anim-fadeInUp anim-stagger-9 ${saved ? "saved" : ""}`}>
                      {saved ? <FaCheckCircle size={13} /> : <FaPlusCircle size={13} />}
                      {saved ? "Saved!" : "Save budget"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Informative Side Panel */}
              <div className="b-right">
                <div className="b-rule-panel anim-fadeInScale anim-stagger-6 hover-glow">
                  <div className="b-rule-title">Current limits</div>
                  {[
                    { key: "Monthly", val: formatINR(storedMonthly) },
                    { key: "Weekly", val: formatINR(storedWeekly) },
                    { key: "Daily", val: formatINR(storedDaily) },
                  ].map(({ key, val }) => (
                    <div className="b-rule-row" key={key}>
                      <span className="b-rule-key">{key}</span>
                      <span className="b-rule-val">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="b-tip-panel anim-fadeInScale anim-stagger-7 hover-glow">
                  <div className="b-tip-header">
                    <div className="b-tip-icon"><FaLightbulb /></div>
                    <span className="b-tip-title">Budget tips</span>
                  </div>
                  <div className="b-tip-list">
                    {[
                      "Aim to save at least 20% of your monthly income.",
                      "Break big expenses into smaller daily budgets to stay in control.",
                      "Review your limits every month as income or costs change.",
                      "Use the 50/30/20 rule: needs, wants, savings.",
                    ].map((tip, i) => (
                      <div className={`b-tip-item anim-fadeInUp anim-stagger-${Math.min(i + 8, 10)}`} key={i}>
                        <div className="b-tip-bullet">{i + 1}</div>
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="b-toast">
          <FaCheckCircle size={16} />
          Budget saved successfully!
        </div>
      )}
    </div>
  );
}