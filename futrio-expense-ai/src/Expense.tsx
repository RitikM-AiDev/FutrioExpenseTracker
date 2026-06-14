import { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaExchangeAlt,
  FaPlusCircle,
  FaChartBar,
  FaWallet,
  FaCog,
  FaMoon,
  FaBars,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaSun
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

export default function Expense() {
  const nav = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const animRef = useRef<number>(0);

  const [dark, setDark] = useState<boolean>(
    localStorage.getItem("darktheme") !== "false"
  );
  
  const [transactions_daily, setTransactions_daily] = useState<Transaction[]>([]);
  const [transactions_monthly, setTransactions_monthly] = useState<Transaction[]>([]);
  const [transactions_weekly, setTransactions_weekly] = useState<Transaction[]>([]);
  const [transactions_history, setTransactions_history] = useState<Transaction[]>([]);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoute, setActiveRoute] = useState("/transactions");

  const isDarkRef = useRef(dark);

  useEffect(() => {
    isDarkRef.current = dark;
  }, [dark]);

  useEffect(() => {
    setActiveRoute(window.location.pathname);
  }, []);

  const get_daily_transactions = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transactions/daily/${encodeURIComponent("hello@gmail.com")}`
      );
      if (!response.ok) {
        console.error("API Error:", response.status);
        setTransactions_daily([]);
        return;
      }
      const transaction_array = await response.json();
      setTransactions_daily(transaction_array?.transactions || []);
    } catch(err) {
      console.error(err);
    }
  };

  const get_weekly_transactions = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transactions/weekly/${encodeURIComponent("hello@gmail.com")}`
      );
      if (!response.ok) {
        console.error("API Error:", response.status);
        setTransactions_weekly([]);
        return;
      }
      const transaction_array = await response.json();
      setTransactions_weekly(transaction_array?.transactions || []);
    } catch(err) {
      console.error(err);
    }
  };

  const get_monthly_transactions = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transactions/monthly/${encodeURIComponent("hello@gmail.com")}`
      );
      if (!response.ok) {
        console.error("API Error:", response.status);
        setTransactions_monthly([]);
        return;
      }
      const transaction_array = await response.json();
      setTransactions_monthly(transaction_array?.transactions || []);
    } catch(err) {
      console.error(err);
    }
  };

  const get_history_transactions = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/transactions/history/${encodeURIComponent("hello@gmail.com")}`
      );
      if (!response.ok) {
        console.error("API Error:", response.status);
        setTransactions_history([]);
        return;
      }
      const transaction_array = await response.json();
      setTransactions_history(transaction_array?.transactions || []);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    get_daily_transactions();
    get_monthly_transactions();
    get_weekly_transactions();
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

  const closeSidebar = () => setSidebarOpen(false);

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

  const filterQuery = (list: Transaction[]) => {
    return list.filter(t => {
      const matchTitle = t.title ? t.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const matchCat = t.category ? t.category.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return matchTitle || matchCat;
    });
  };

  const filteredDaily = filterQuery(transactions_daily);
  const filteredWeekly = filterQuery(transactions_weekly);
  const filteredMonthly = filterQuery(transactions_monthly);
  const filteredHistory = filterQuery(transactions_history);

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
          --bg-input: rgba(99, 102, 241, 0.07);
          --tx-title-color: #cbd5e1;
        }

        .theme-light {
          --bg-color: #f8fafc;
          --card-bg: rgba(255, 255, 255, 0.75);
          --sidebar-bg: rgba(255, 255, 255, 0.85);
          --border-color: rgba(99, 102, 241, 0.18);
          --text-main: #0f172a;
          --text-muted: #475569;
          --topbar-bg: rgba(255, 255, 255, 0.5);
          --btn-bg: rgba(99, 102, 241, 0.06);
          --btn-border: rgba(99, 102, 241, 0.15);
          --text-nav: #475569;
          --nav-hover: rgba(99, 102, 241, 0.08);
          --bg-input: #f8fafc;
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

        /* MAIN & TOPBAR CONTENT */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: transparent;
        }

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

        /* FORM CARD UI */
        .form-card {
          max-width: 800px; width: 100%; margin: 40px auto 20px;
          background: var(--card-bg); backdrop-filter: blur(16px);
          border: 1px solid var(--border-color); border-radius: 16px;
          padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .form-header { margin-bottom: 24px; }
        .form-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); }
        .form-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
        
        /* SEARCH BAR */
        .field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
        .input-wrapper { position: relative; width: 100%; }
        
        .field-input {
          width: 100%; padding: 12px 14px 12px 42px; background: var(--bg-input);
          border: 1px solid var(--border-color); border-radius: 10px;
          color: var(--text-main); font-size: 15px; font-family: inherit;
          outline: none; transition: all 0.2s;
        }
        .field-input:focus { border-color: #6366f1; background: var(--card-bg); box-shadow: 0 0 15px rgba(99, 102, 241, 0.1); }
        
        .input-prefix-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none; }

        .tableHeader {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
        }

        .timelineSection {
          margin-top: 24px;
        }

        .timelineTitle {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 12px;
          padding-left: 4px;
          border-left: 3px solid #818cf8;
          padding-left: 8px;
        }

        /* GLASSROW CARD STYLES */
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 8px;
          border: 1px solid var(--border-color);
          background: rgba(99, 102, 241, 0.02);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .row:hover {
          background: rgba(99, 102, 241, 0.08);
          transform: translateX(4px);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .row-left { display: flex; align-items: center; gap: 14px; }
        
        .row-icon {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          font-size: 12px;
        }
        .row-icon.credit { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .row-icon.debit { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

        .metaInfo { display: flex; flex-direction: column; gap: 4px; }
        .rowTitle { font-size: 15px; font-weight: 600; color: var(--tx-title-color); margin: 0; }
        
        .row-details { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-muted); }
        .badge {
          padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
        }

        .amount { font-size: 15px; font-weight: 700; }
        .amount.credit { color: #22c55e; }
        .amount.debit { color: var(--text-main); }

        /* RESPONSIVE */
        .overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 9;
        }

        @media (max-width: 900px) {
          .sidebar { position: fixed; top: 0; left: 0; height: 100vh; transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .overlay.open { display: block; }
          .menu-btn { display: flex; }
        }
        @media (max-width: 550px) { .form-card { padding: 18px; margin-top: 20px; } }
      `}</style>

      {/* Space background canvas */}
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
        onClick={closeSidebar}
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
              <span className="page-title">Transactions</span>
            </div>

            <div className="avatar" style={{ marginRight: 28 }}>HI</div>
          </div>

          {/* Main Frame content */}
          <div style={{ padding: "0 24px 24px" }}>
            <div className="form-card anim-fadeInScale hover-glow">
              
              {/* Header block */}
              <div className="form-header anim-fadeInDown">
                <h1 className="form-title">Transaction History</h1>
                <p className="form-subtitle">Track and analyze your cash flows</p>
              </div>

              {/* Filtering Block */}
              <div className="field-group anim-fadeInUp anim-stagger-1">
                <div className="input-wrapper">
                  <span className="input-prefix-icon">
                    <FaSearch />
                  </span>
                  <input 
                    type="text" 
                    className="field-input" 
                    placeholder="Search by title or category..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Table Column Headers */}
              <div className="tableHeader anim-fadeInUp anim-stagger-2">
                <div>Transaction / Title</div>
                <div>Amount</div>
              </div>

              {/* DAILY SECTION */}
              {filteredDaily.length > 0 && (
                <div className="timelineSection">
                  <h2 className="timelineTitle anim-fadeInUp anim-stagger-3">Daily</h2>
                  <div className="list">
                    {filteredDaily.map((obj, index) => {
                      const isCredit = (obj.type ?? "credit") === "credit";
                      const color = getCategoryColor(obj.category);
                      return (
                        <div key={`daily-${index}`} className={`row anim-fadeInUp anim-stagger-${Math.min(index + 3, 10)}`}>
                          <div className="row-left">
                            <div className={`row-icon ${isCredit ? "credit" : "debit"}`}>
                              {isCredit ? <FaArrowDown /> : <FaArrowUp />}
                            </div>
                            <div className="metaInfo">
                              <h3 className="rowTitle">{obj.title}</h3>
                              <div className="row-details">
                                <span>{new Date(obj.date + "Z").toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}</span>
                                <span className="badge" style={{ background: color + "20", color }}>{obj.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`amount ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "+" : "-"}₹{obj.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MONTHLY SECTION */}
              {filteredMonthly.length > 0 && (
                <div className="timelineSection">
                  <h2 className="timelineTitle anim-fadeInUp anim-stagger-4">Monthly</h2>
                  <div className="list">
                    {filteredMonthly.map((obj, index) => {
                      const isCredit = (obj.type ?? "credit") === "credit";
                      const color = getCategoryColor(obj.category);
                      return (
                        <div key={`monthly-${index}`} className={`row anim-fadeInUp anim-stagger-${Math.min(index + 4, 10)}`}>
                          <div className="row-left">
                            <div className={`row-icon ${isCredit ? "credit" : "debit"}`}>
                              {isCredit ? <FaArrowDown /> : <FaArrowUp />}
                            </div>
                            <div className="metaInfo">
                              <h3 className="rowTitle">{obj.title}</h3>
                              <div className="row-details">
                                <span>{new Date(obj.date + "Z").toLocaleString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  timeZone: "Asia/Kolkata",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}</span>
                                <span className="badge" style={{ background: color + "20", color }}>{obj.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`amount ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "+" : "-"}₹{obj.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEKLY SECTION */}
              {filteredWeekly.length > 0 && (
                <div className="timelineSection">
                  <h2 className="timelineTitle anim-fadeInUp anim-stagger-5">Weekly</h2>
                  <div className="list">
                    {filteredWeekly.map((obj, index) => {
                      const isCredit = (obj.type ?? "credit") === "credit";
                      const color = getCategoryColor(obj.category);
                      return (
                        <div key={`weekly-${index}`} className={`row anim-fadeInUp anim-stagger-${Math.min(index + 5, 10)}`}>
                          <div className="row-left">
                            <div className={`row-icon ${isCredit ? "credit" : "debit"}`}>
                              {isCredit ? <FaArrowDown /> : <FaArrowUp />}
                            </div>
                            <div className="metaInfo">
                              <h3 className="rowTitle">{obj.title}</h3>
                              <div className="row-details">
                                <span>{new Date(obj.date + "Z").toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}</span>
                                <span className="badge" style={{ background: color + "20", color }}>{obj.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`amount ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "+" : "-"}₹{obj.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TRANSACTION HISTORY SECTION */}
              {filteredHistory.length > 0 && (
                <div className="timelineSection">
                  <h2 className="timelineTitle anim-fadeInUp anim-stagger-6">Transaction History</h2>
                  <div className="list">
                    {filteredHistory.map((obj, index) => {
                      const isCredit = (obj.type ?? "credit") === "credit";
                      const color = getCategoryColor(obj.category);
                      return (
                        <div key={`history-${index}`} className={`row anim-fadeInUp anim-stagger-${Math.min(index + 6, 10)}`}>
                          <div className="row-left">
                            <div className={`row-icon ${isCredit ? "credit" : "debit"}`}>
                              {isCredit ? <FaArrowDown /> : <FaArrowUp />}
                            </div>
                            <div className="metaInfo">
                              <h3 className="rowTitle">{obj.title}</h3>
                              <div className="row-details">
                                <span>{new Date(obj.date + "Z").toLocaleString("en-IN", {
                                  timeZone: "Asia/Kolkata",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}</span>
                                <span className="badge" style={{ background: color + "20", color }}>{obj.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`amount ${isCredit ? "credit" : "debit"}`}>
                            {isCredit ? "+" : "-"}₹{obj.amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredDaily.length === 0 && filteredWeekly.length === 0 && filteredMonthly.length === 0 && filteredHistory.length === 0 && (
                <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }} className="anim-fadeInUp anim-stagger-3">
                  No transactions found matching your query.
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}