import { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaExchangeAlt,
  FaPlusCircle,
  FaArrowDown,
  FaArrowUp,
  FaChartBar,
  FaWallet,
  FaCog,
  FaMoon,
  FaBars,
  FaBell,
  FaSun,
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

type Transaction = {
  title: string;
  amount: number;
  date: string;
  category: string;
  type?: "credit" | "debit";
};

type Star = { x: number; y: number; z: number; size: number };

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f97316",
  Transport: "#3b82f6",
  Shopping: "#a855f7",
  Health: "#22c55e",
  Entertainment: "#ec4899",
  Utilities: "#06b6d4",
  Other: "#94a3b8",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"];
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

export default function Dashboard() {
  const nav = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const animRef = useRef<number>(0);

  const [dark, setDark] = useState(localStorage.getItem("darktheme") !== "false");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/dashboard");

  const [total_income, setTotalIncome] = useState(0);
  const [total_expense, setTotalExpense] = useState(0);
  const [balance_savings, setBalance] = useState(0);
  const [transactions_history, setTransactionsHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const isDarkRef = useRef(dark);

  useEffect(() => {
    isDarkRef.current = dark;
  }, [dark]);

  useEffect(() => {
    setActiveRoute(window.location.pathname);
  }, []);

  const get_history_transactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transactions/history/${encodeURIComponent("hello@gmail.com")}`
      );
      if (!response.ok) return;
      const result = await response.json();
      setTransactionsHistory(result?.transactions || []);
      setTotalIncome(result["Credited"]);
      setTotalExpense(result["Debited"]);
      setBalance(result["Balance"]);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_history_transactions();
  }, []);

  // Space background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const stars: Star[] = Array.from({ length: 180 }).map(() => ({
      x: (Math.random() - 0.5) * w,
      y: (Math.random() - 0.5) * h,
      z: Math.random() * w,
      size: Math.random() * 1.2 + 0.3,
    }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const move = (e: MouseEvent) => {
      mouseRef.current.tx = (e.clientX - w / 2) / (w / 2);
      mouseRef.current.ty = (e.clientY - h / 2) / (h / 2);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", move);

    const loop = () => {
      const isDark = isDarkRef.current;
      ctx.fillStyle = isDark ? "rgba(3, 7, 18, 0.2)" : "rgba(241, 245, 249, 0.25)";
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
        ctx.fillStyle = isDark ? "white" : "#6366f1";
        ctx.globalAlpha = alpha;
        ctx.fill();

        const dx = x - (w / 2 + mx * 80);
        const dy = y - (h / 2 + my * 80);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.strokeStyle = isDark ? "#818cf8" : "#4f46e5";
          ctx.lineWidth = 0.5;
          ctx.globalAlpha = isDark ? 0.15 : 0.1;
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

  const savingsRate =
    total_income > 0 ? Math.round((balance_savings / total_income) * 100) : 0;

  return (
    <div className={dark ? "theme-dark" : "theme-light"}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* THEME VARIABLES ROOT */
        .theme-dark {
          --bg-color: #030712;
          --card-bg: rgba(15, 15, 40, 0.75);
          --sidebar-bg: rgba(10, 10, 30, 0.72);
          --border-color: rgba(99, 102, 241, 0.16);
          --text-main: #f1f5f9;
          --text-muted: rgba(148, 163, 184, 0.7);
          --topbar-bg: rgba(10, 10, 30, 0.5);
          --btn-bg: rgba(99, 102, 241, 0.08);
          --btn-border: rgba(99, 102, 241, 0.2);
          --text-nav: rgba(148, 163, 184, 0.85);
          --nav-hover: rgba(99, 102, 241, 0.12);
          --bar-track: rgba(99, 102, 241, 0.12);
          --tx-title-color: #cbd5e1;
        }

        .theme-light {
          --bg-color: #f8fafc;
          --card-bg: rgba(255, 255, 255, 0.75);
          --sidebar-bg: rgba(255, 255, 255, 0.8);
          --border-color: rgba(99, 102, 241, 0.18);
          --text-main: #0f172a;
          --text-muted: #475569;
          --topbar-bg: rgba(255, 255, 255, 0.5);
          --btn-bg: rgba(99, 102, 241, 0.06);
          --btn-border: rgba(99, 102, 241, 0.15);
          --text-nav: #475569;
          --nav-hover: rgba(99, 102, 241, 0.08);
          --bar-track: rgba(99, 102, 241, 0.08);
          --tx-title-color: #1e293b;
        }

        .shell {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          background: transparent;
        }

        /* SIDEBAR */
        .sidebar {
          width: 240px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 0;
          background: var(--sidebar-bg);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border-color);
          flex-shrink: 0;
          z-index: 10;
          transition: transform 0.25s ease, background 0.25s, border-color 0.25s;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 20px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .sidebar-logo-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .sidebar-section {
          padding: 16px 12px 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 14px;
          margin: 1px 8px;
          width: calc(100% - 16px);
          border-radius: 8px;
          border: none;
          background: transparent;
          color: var(--text-nav);
          font-size: 13.5px;
          font-weight: 450;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-align: left;
        }

        .nav-btn:hover {
          background: var(--nav-hover);
          color: var(--text-main);
        }

        .nav-btn.active {
          background: rgba(99,102,241,0.2);
          color: #818cf8;
          font-weight: 500;
        }

        .nav-btn .nav-icon {
          font-size: 14px;
          opacity: 0.8;
          flex-shrink: 0;
        }

        .sidebar-bottom {
          margin-top: auto;
          padding: 12px;
          border-top: 1px solid var(--border-color);
        }

        .dark-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-nav);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .dark-toggle:hover {
          background: rgba(99,102,241,0.15);
          color: var(--text-main);
        }

        /* MAIN */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: transparent;
        }

        /* TOPBAR */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          background: var(--topbar-bg);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 5;
          transition: background 0.25s, border-color 0.25s;
        }

        .topbar-left { display: flex; align-items: center; gap: 14px; }

        .menu-btn {
          display: none;
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-muted);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .page-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .topbar-right { display: flex; align-items: center; gap: 10px; }

        .icon-btn {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1px solid var(--btn-border);
          background: var(--btn-bg);
          color: var(--text-muted);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px;
          position: relative;
          transition: background 0.15s, border-color 0.15s;
        }
        .icon-btn:hover { background: rgba(99,102,241,0.18); color: var(--text-main); }

        .notif-dot {
          position: absolute;
          top: 7px; right: 7px;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #818cf8;
        }

        .avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 600;
          color: white;
          cursor: pointer;
          border: 2px solid rgba(99,102,241,0.35);
        }

        /* CONTENT */
        .content {
          padding: 28px;
          overflow-y: auto;
          flex: 1;
        }

        .greeting {
          margin-bottom: 8px;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-main);
          letter-spacing: -0.03em;
        }

        .greeting span { color: #818cf8; }

        .subtitle {
          font-size: 13.5px;
          color: var(--text-muted);
          margin-bottom: 28px;
        }

        /* METRICS GRID */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 28px;
        }

        .metric-card {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 18px 20px;
          position: relative;
          overflow: hidden;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 14px 14px 0 0;
        }

        .metric-card.income::before { background: linear-gradient(90deg, #22c55e, #4ade80); }
        .metric-card.expense::before { background: linear-gradient(90deg, #f97316, #fb923c); }
        .metric-card.savings::before { background: linear-gradient(90deg, #818cf8, #a78bfa); }

        .metric-label {
          font-size: 11.5px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .metric-icon {
          width: 22px; height: 22px;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
        }

        .metric-icon.income { background: rgba(34,197,94,0.15); color: #4ade80; }
        .metric-icon.expense { background: rgba(249,115,22,0.15); color: #fb923c; }
        .metric-icon.savings { background: rgba(129,140,248,0.15); color: #a78bfa; }

        .metric-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.04em;
          margin-bottom: 6px;
        }

        .metric-value.income { color: #4ade80; }
        .metric-value.expense { color: #fb923c; }
        .metric-value.savings { color: #a78bfa; }

        .metric-sub {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* LOWER GRID */
        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 14px;
        }

        /* TRANSACTIONS PANEL */
        .panel {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          overflow: hidden;
          transition: background 0.25s, border-color 0.25s;
        }

        .panel-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .panel-action {
          font-size: 12px;
          color: #818cf8;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          padding: 0;
        }
        .panel-action:hover { color: #a5b4fc; text-decoration: underline; }

        .tx-list { padding: 8px 0; }

        .tx-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 20px;
          transition: background 0.12s;
        }
        .tx-item:hover { background: rgba(99,102,241,0.07); }

        .tx-dot {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          color: white;
        }

        .tx-info { flex: 1; min-width: 0; }

        .tx-title {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--tx-title-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 2px;
        }

        .tx-meta {
          font-size: 11.5px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        
        .tx-category {
          padding: 1px 7px;
          border-radius: 20px;
          font-size: 10.5px;
          font-weight: 500;
        }

        .tx-amount {
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .tx-amount.credit { color: #4ade80; }
        .tx-amount.debit { color: #fb923c; }

        /* SUMMARY PANEL */
        .summary-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .savings-bar-panel {
          background: var(--card-bg);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 18px 20px;
          transition: background 0.25s, border-color 0.25s;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .bar-label-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
        }

        .bar-pct {
          font-size: 22px;
          font-weight: 700;
          color: #a78bfa;
          letter-spacing: -0.03em;
        }

        .bar-track {
          height: 6px;
          background: var(--bar-track);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .bar-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #6366f1, #a78bfa);
          animation: barFillIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .bar-sub {
          font-size: 11.5px;
          color: var(--text-muted);
        }

        .quick-add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1px dashed rgba(99,102,241,0.35);
          background: rgba(99,102,241,0.06);
          color: #818cf8;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.25s;
          font-family: inherit;
        }

        .quick-add-btn:hover {
          background: rgba(99,102,241,0.12);
          border-color: rgba(99,102,241,0.55);
        }

        /* SKELETON */
        .skeleton {
          background: rgba(99,102,241,0.1);
          border-radius: 6px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* OVERLAY */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 9;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            transform: translateX(-100%);
            z-index: 20;
          }
          .sidebar.open { transform: translateX(0); }
          .overlay.open { display: block; }
          .menu-btn { display: flex; }
          .lower-grid { grid-template-columns: 1fr; }
          .metrics-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
          .content { padding: 16px; }
          .topbar { padding: 12px 16px; }
        }
      `}</style>

      {/* Space canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          background: dark ? "#030712" : "#f8fafc",
        }}
      />

      {/* Overlay for mobile sidebar */}
      <div
        className={`overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="shell" style={{ position: "relative", zIndex: 1 }}>
        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">💸</div>
            <span className="sidebar-logo-text">Futrio</span>
          </div>

          <div className="sidebar-section">Menu</div>

          <nav style={{ padding: "4px 0" }}>
            {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                className={`nav-btn ${activeRoute === route ? "active" : ""}`}
                onClick={() => handleNav(route)}
              >
                <Icon className="nav-icon" />
                {label}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <button className="dark-toggle" onClick={toggleDark}>
              {dark ? <FaSun size={13} /> : <FaMoon size={13} />}
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar anim-fadeInDown">
            <div className="topbar-left">
              <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <FaBars />
              </button>
              <span className="page-title">Overview</span>
            </div>

            <div className="topbar-right">
              <button className="icon-btn">
                <FaBell />
                <span className="notif-dot" />
              </button>
              <div className="avatar">HI</div>
            </div>
          </div>

          {/* Content */}
          <div className="content">
            <h1 className="greeting anim-fadeInUp anim-stagger-1">
              Good day, <span>Hello</span> 👋
            </h1>
            <p className="subtitle anim-fadeInUp anim-stagger-2">Here's your financial summary for today.</p>

            {/* Metrics */}
            <div className="metrics-grid">
              <div className="metric-card income anim-fadeInUp anim-stagger-2 hover-lift hover-glow">
                <div className="metric-label">
                  <span className="metric-icon income"><FaArrowDown /></span>
                  Total income
                </div>
                {loading ? (
                  <div className="skeleton" style={{ height: 34, width: "80%", marginBottom: 8 }} />
                ) : (
                  <div className="metric-value income">{formatINR(total_income)}</div>
                )}
                <div className="metric-sub">All credited transactions</div>
              </div>

              <div className="metric-card expense anim-fadeInUp anim-stagger-3 hover-lift hover-glow">
                <div className="metric-label">
                  <span className="metric-icon expense"><FaArrowUp /></span>
                  Total expenses
                </div>
                {loading ? (
                  <div className="skeleton" style={{ height: 34, width: "80%", marginBottom: 8 }} />
                ) : (
                  <div className="metric-value expense">{formatINR(total_expense)}</div>
                )}
                <div className="metric-sub">All debited transactions</div>
              </div>

              <div className="metric-card savings anim-fadeInUp anim-stagger-4 hover-lift hover-glow">
                <div className="metric-label">
                  <span className="metric-icon savings"><FaWallet /></span>
                  Savings
                </div>
                {loading ? (
                  <div className="skeleton" style={{ height: 34, width: "80%", marginBottom: 8 }} />
                ) : (
                  <div className="metric-value savings">{formatINR(balance_savings)}</div>
                )}
                <div className="metric-sub">Balance remaining</div>
              </div>
            </div>

            {/* Lower grid */}
            <div className="lower-grid">
              {/* Transactions panel */}
              <div className="panel anim-fadeInScale anim-stagger-4 hover-glow">
                <div className="panel-header">
                  <span className="panel-title">Recent transactions</span>
                  <button className="panel-action" onClick={() => nav("/transactions")}>
                    View all →
                  </button>
                </div>

                <div className="tx-list">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="tx-item">
                        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton" style={{ height: 13, width: "60%", marginBottom: 6 }} />
                          <div className="skeleton" style={{ height: 11, width: "35%" }} />
                        </div>
                        <div className="skeleton" style={{ height: 14, width: 60 }} />
                      </div>
                    ))
                  ) : transactions_history.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: "rgba(148,163,184,0.45)", fontSize: 13 }}>
                      No transactions yet. Add your first one!
                    </div>
                  ) : (
                    transactions_history.slice(0, 8).map((t, i) => {
                      const isCredit = t.type === "credit";
                      const color = getCategoryColor(t.category);
                      const initials = t.title.slice(0, 2).toUpperCase();
                      return (
                        <div key={i} className={`tx-item anim-fadeInUp anim-stagger-${Math.min(i + 4, 10)}`}>
                          <div
                            className="tx-dot"
                            style={{ background: color + "28", color }}
                          >
                            {initials}
                          </div>
                          <div className="tx-info">
                            <div className="tx-title">{t.title}</div>
                            <div className="tx-meta">
                              <span>{formatDate(t.date)}</span>
                              {t.category && (
                                <span
                                  className="tx-category"
                                  style={{
                                    background: color + "20",
                                    color,
                                  }}
                                >
                                  {t.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`tx-amount ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "+" : "−"}{formatINR(t.amount)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Summary panel */}
              <div className="summary-panel">
                {/* Savings rate */}
                <div className="savings-bar-panel anim-fadeInScale anim-stagger-5 hover-glow">
                  <div className="bar-label">
                    <span className="bar-label-text">Savings rate</span>
                    <span className="bar-pct">{savingsRate}%</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.min(100, savingsRate)}%` }}
                    />
                  </div>
                  <div className="bar-sub">
                    {savingsRate >= 20
                      ? "Great job! You're saving well."
                      : savingsRate > 0
                      ? "Try to save at least 20% of income."
                      : "Track your income and expenses to see savings."}
                  </div>
                </div>

                {/* Expense breakdown */}
                {!loading && transactions_history.length > 0 && (
                  <div className="panel anim-fadeInScale anim-stagger-6 hover-glow">
                    <div className="panel-header">
                      <span className="panel-title">Spending by category</span>
                    </div>
                    <div style={{ padding: "12px 20px 16px" }}>
                      {(() => {
                        const byCategory: Record<string, number> = {};
                        for (const t of transactions_history) {
                          if (t.type !== "credit" && t.category) {
                            byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
                          }
                        }
                        const total = Object.values(byCategory).reduce((a, b) => a + b, 0);
                        const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

                        if (sorted.length === 0) {
                          return (
                            <div style={{ fontSize: 13, color: "rgba(148,163,184,0.45)", textAlign: "center", padding: "12px 0" }}>
                              No expense data yet.
                            </div>
                          );
                        }

                        return sorted.map(([cat, amt], index) => {
                          const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
                          const color = getCategoryColor(cat);
                          return (
                            <div key={cat} style={{ marginBottom: 12 }} className={`anim-fadeInUp anim-stagger-${Math.min(index + 6, 10)}`}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                                <span style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                                  {cat}
                                </span>
                                <span style={{ fontSize: 12.5, color, fontWeight: 600 }}>{pct}%</span>
                              </div>
                              <div style={{ height: 4, background: "rgba(99,102,241,0.1)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {/* Quick add */}
                <button className="quick-add-btn anim-fadeInUp anim-stagger-7 hover-scale" onClick={() => nav("/addexpense")}>
                  <FaPlusCircle size={14} />
                  Add a transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}