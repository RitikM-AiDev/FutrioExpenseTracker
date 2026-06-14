import { useEffect, useState, useRef } from "react";
import {
  FaHome,
  FaExchangeAlt,
  FaPlusCircle,
  FaChartBar,
  FaWallet,
  FaSpinner,
  FaCog,
  FaMoon,
  FaSun,
  FaBars,
  FaChevronDown,
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

const CATEGORIES = [
  { label: "Food & Dining", icon: "🍽" },
  { label: "Transport", icon: "🚗" },
  { label: "Shopping", icon: "🛍" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Health", icon: "💊" },
  { label: "Utilities", icon: "💡" },
  { label: "Credit", icon: "💳" },
];

const TYPE = [
  { label: "credit" as const },
  { label: "debit" as const },
];

type Star = { x: number; y: number; z: number; size: number };

export default function App() {
  const nav = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const animRef = useRef<number>(0);

  const [dark, setDark] = useState<boolean>(
    localStorage.getItem("darktheme") !== "false"
  );
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("Food & Dining");
  const [catOpen, setCatOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [type, settype] = useState<"credit" | "debit">("debit");
  const [note, setNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState("/addexpense");

  const isDarkRef = useRef(dark);

  useEffect(() => {
    isDarkRef.current = dark;
  }, [dark]);

  useEffect(() => {
    setActiveRoute(window.location.pathname);
  }, []);

  const Idata = {
    amount: amount,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    type: type,
    date: new Date().toISOString(),
    category: category,
    email: "hello@gmail.com",
    notes: note,
  };

  const handle_addexpense = async () => {
    if (!type || amount === "" || title === "" || category === "") {
      return;
    }
    if (isPending) return;
    setIsPending(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/addExpense", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(Idata),
      });
      if (response.ok) {
        // clear form on success
        setAmount("");
        setTitle("");
        setNote("");
      }
    } catch (err) {
      console.error("Network infrastructure error:", err);
    } finally {
      setIsPending(false);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

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

  const handle_image = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    const formdata = new FormData();
    formdata.append("image", file);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/upload/image", {
        method: "POST",
        body: formdata,
      });
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error("Image upload failed:", err);
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
          --text-sub: rgba(148, 163, 184, 0.6);
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
          --text-sub: #64748b;
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

        .topbar-right { display: flex; align-items: center; gap: 10px; }

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

        /* FORM CARD UI */
        .form-card {
          max-width: 680px; width: 100%; margin: 40px auto 20px;
          background: var(--card-bg); backdrop-filter: blur(16px);
          border: 1px solid var(--border-color); border-radius: 16px;
          padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
          transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
        .form-header { margin-bottom: 24px; }
        .form-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); }
        .form-subtitle { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
        
        .image-h1 { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-sub); text-align: center; margin: 20px 0; }
        
        /* INPUT FIELDS */
        .field-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .field-label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        
        .file-input {
          width: 100%; padding: 12px; border-radius: 10px;
          border: 1px dashed var(--border-color); background: var(--bg-input);
          color: var(--text-muted); cursor: pointer; outline: none;
        }
        .input-wrapper, .select-wrapper { position: relative; width: 100%; }
        
        .field-input, .amount-input, .field-textarea {
          width: 100%; padding: 12px 14px; background: var(--bg-input);
          border: 1px solid var(--border-color); border-radius: 10px;
          color: var(--text-main); font-size: 15px; font-family: inherit;
          outline: none; transition: border-color 0.15s, background 0.15s;
        }
        .field-input:focus, .amount-input:focus, .field-textarea:focus { border-color: #6366f1; background: var(--card-bg); }
        .field-textarea { min-height: 100px; resize: vertical; }
        
        .input-prefix { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none; }
        .amount-input { padding-left: 44px; }

        /* SELECT DROPDOWNS */
        .select-wrapper {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px; background: var(--bg-input);
          border: 1px solid var(--border-color); border-radius: 10px; cursor: pointer;
        }
        .select-left { display: flex; align-items: center; gap: 10px; }
        .select-icon { font-size: 16px; }
        .select-value { font-size: 15px; color: var(--text-main); text-transform: capitalize; }
        .select-chevron { color: var(--text-muted); font-size: 12px; }

        .dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: var(--card-bg); backdrop-filter: blur(25px);
          border: 1px solid var(--border-color); border-radius: 10px;
          max-height: 240px; overflow-y: auto; z-index: 30;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 10px; padding: 11px 14px;
          font-size: 14.5px; color: var(--text-muted); cursor: pointer; text-transform: capitalize;
        }
        .dropdown-item:hover { background: var(--nav-hover); color: var(--text-main); }
        .dropdown-item.active { background: var(--nav-hover); color: #818cf8; font-weight: 500; }

        /* SUBMIT BUTTON STYLES */
        .btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 14px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; font-size: 15px; font-weight: 600; cursor: pointer;
          transition: opacity 0.15s, transform 0.1s; margin-top: 10px;
        }
        .btn-primary:hover { opacity: 0.95; }
        .btn-primary:active { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .icon-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* RESPONSIVE SUB-OVERLAYS */
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
        @media (max-width: 550px) { .form-card { padding: 20px; margin-top: 20px; } }
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
              <span className="page-title">Add Expense</span>
            </div>

            <div className="avatar" style={{ marginRight: 28 }}>HI</div>
          </div>

          <div className="main-content">
            <div className="form-card anim-fadeInScale hover-glow">
              <div className="form-header anim-fadeInDown">
                <h1 className="form-title">Add New Expense</h1>
                <p className="form-subtitle">Fill in the details to add a new transaction</p>
              </div>

              <h1 className="image-h1 anim-fadeInUp anim-stagger-1">Upload Your Bill or Fill The Form Below</h1>
              <div className="anim-fadeInUp anim-stagger-2">
                <input type="file" accept="image/*" className="file-input" onChange={handle_image} />
              </div>
              <h1 className="image-h1 anim-fadeInUp anim-stagger-3">OR</h1>

              {/* Title Element */}
              <div className="field-group anim-fadeInUp anim-stagger-4">
                <label className="field-label">Title / Item name</label>
                <div className="input-wrapper">
                  <input
                    minLength={2}
                    type="text"
                    className="field-input"
                    placeholder="Enter item name"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories Menu Selector */}
              <div className="field-group anim-fadeInUp anim-stagger-5">
                <label className="field-label">Category</label>
                <div className="select-wrapper" onClick={() => setCatOpen(!catOpen)}>
                  <div className="select-left">
                    <span className="select-icon">
                      {CATEGORIES.find((c) => c.label === category)?.icon || "💰"}
                    </span>
                    <span className="select-value">{category}</span>
                  </div>
                  <FaChevronDown className="select-chevron" />

                  {catOpen && (
                    <div className="dropdown">
                      {CATEGORIES.map((c) => (
                        <div
                          key={c.label}
                          className={`dropdown-item ${category === c.label ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategory(c.label);
                            setCatOpen(false);
                          }}
                        >
                          <span>{c.icon}</span>
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Entry Financial Type Context */}
              <div className="field-group anim-fadeInUp anim-stagger-6">
                <label className="field-label">Credit or Debit</label>
                <div className="select-wrapper" onClick={() => setTypeOpen(!typeOpen)}>
                  <div className="select-left">
                    <span className="select-value">{type}</span>
                  </div>
                  <FaChevronDown className="select-chevron" />

                  {typeOpen && (
                    <div className="dropdown">
                      {TYPE.map((c) => (
                        <div
                          key={c.label}
                          className={`dropdown-item ${type === c.label ? "active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            settype(c.label);
                            setTypeOpen(false);
                          }}
                        >
                          <span style={{ textTransform: "capitalize" }}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Field Input */}
              <div className="field-group anim-fadeInUp anim-stagger-7">
                <label className="field-label">Amount</label>
                <div className="input-wrapper">
                  <span className="input-prefix">Rs.</span>
                  <input
                    type="number"
                    className="amount-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Notes Structural Context */}
              <div className="field-group anim-fadeInUp anim-stagger-8">
                <label className="field-label">Notes</label>
                <textarea
                  className="field-textarea"
                  placeholder="Add notes here..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {/* Execution Trigger Button */}
              <button
                className={`btn-primary btn-shimmer anim-fadeInUp anim-stagger-9`}
                onClick={(e) => {
                  e.preventDefault();
                  handle_addexpense();
                }}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <FaSpinner className="icon-spin" />
                    Saving Expense...
                  </>
                ) : (
                  <>
                    <FaPlusCircle />
                    Add Expense
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}