import { useState,useEffect } from "react";
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
  FaChevronDown,
  FaBell,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", icon: FaHome, route: "/" },
  { label: "Transactions", icon: FaExchangeAlt, route: "/transactions" },
  { label: "Add Expense", icon: FaPlusCircle, route: "/addexpense" },
  { label: "Reports", icon: FaChartBar, route: "/reports" },
  { label: "Budget", icon: FaWallet, route: "/budget" },
  { label: "Settings", icon: FaCog, route: "/settings" },
];
 
const CATEGORIES = [
  { label: "Food & Dining", icon: "🍽", amount: "$717.50", max: "$800", percent: "90%", color: "#10b981" },
  { label: "Transport", icon: "🚗", amount: "$430.50", max: "$600", percent: "72%", color: "#f59e0b" },
  { label: "Shopping", icon: "🛍", amount: "$1,004.50", max: "$1,500", percent: "67%", color: "#6366f1" },
  { label: "Entertainment", icon: "🎬", amount: "$287.00", max: "$400", percent: "72%", color: "#a855f7" },
  { label: "Health", icon: "💊", amount: "$0.00", max: "$200", percent: "0%", color: "#ef4444" },
  { label: "Utilities", icon: "💡", amount: "$250.00", max: "$300", percent: "83%", color: "#3b82f6" },
];


type Transaction = {
   title: string;
  amount: number;
  date: string;
  category: string;
  type? : "credit" | "debit"
}
export default function Dashboard() {
  const nav = useNavigate();
    const [dark, setDark] = useState<boolean>(
        localStorage.getItem("darktheme") === "true"
  );
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance_savings, setbalance] = useState(0);
  const [total_income, settotal_income] = useState(0);
  const [total_expense, settotal_expense ] = useState(0);
  const [timeframe, setTimeframe] = useState("Daily");
  const [foodDining, setFoodDining] = useState(0);
const [transport, setTransport] = useState(0);
const [utilities, setUtilities] = useState(0);
const [shopping, setShopping] = useState(0);
const [total_category, setTotalcategory] = useState(0);
const [entertainment, setEntertainment] = useState(0);
const [health, setHealth] = useState(0);
  const [tfOpen, setTfOpen] = useState(false);
  const [transactions_history, setTransactions_history] = useState<Transaction[]>([]);
  const closeSidebar = () => setSidebarOpen(false);
  const get_history_transactions = async () =>{
          const response =   await fetch(
            `http://127.0.0.1:8000/transactions/history/${encodeURIComponent("hello@gmail.com")}`
          )
  
        if (!response.ok) {
                console.error("API Error:", response.status);
                setTransactions_history([]);
                return;
              }

              const result = await response.json();
              const food = result["Food & dinner"] || 0;
              const transport_ = result["Transport"] || 0;
              const utilities_ = result["Utilites"] || 0;
              const shopping_ = result["Shopping"] || 0;
              const entertainment_ = result["entertainment"] || 0;
              const health_ = result["health"] || 0;
              setTransactions_history(result?.transactions || []);
              settotal_income(result["Credited"]);
              // localStorage.setItem("Credited",String(total_income))
              setFoodDining(result["Food & dinner"]);
              setTransport(result["Transport"]);
              setUtilities(result["Utilites"]);
              setShopping(result["Shopping"]);
              setEntertainment(result["entertainment"]);
              setHealth(result["health"]);
              settotal_expense(result["Debited"]);
              // localStorage.setItem("Debited",String(total_expense))
              setbalance(result["Balance"]);
              // localStorage.setItem("Balance",String(balance_savings))
              setTotalcategory(food + transport_ + utilities_ + shopping_ + entertainment_ + health_)
              console.log(total_category)
              
                  }   
    useEffect(()=>{
      get_history_transactions();
    },[])
    const shoppingPct = total_category ? (shopping / total_category) * 100 : 0;
    const foodPct = total_category ? (foodDining / total_category) * 100 : 0;
    const transportPct = total_category ? (transport / total_category) * 100 : 0;
    const entertainmentPct = total_category ? (entertainment / total_category) * 100 : 0;
    const utilitiesPct = total_category ? (utilities / total_category) * 100 : 0;
    const healthPct = total_category ? (health / total_category) * 100 : 0;
  return (
    <div className={dark ? "dark" : ""}>
      <div className="app-shell">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}

        {/* Sidebar Navigation */}
        <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-icon-wrapper">
              <span className="logo-icon">E</span>
              <span className="logo-text">Expense Tracker</span>
            </div>
            <button className="sidebar-close" onClick={closeSidebar}>✕</button>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                className={`nav-item ${activeNav === label ? "active" : ""}`}
                onClick={() => {
                  setActiveNav(label);  
                  closeSidebar();
                  nav(route)
                }}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>        

          <div className="sidebar-footer">
            <span className="dark-label">
              <FaMoon /> Dark Mode
            </span>
             <button
              className={`toggle ${dark ? "toggle--on" : ""}`}
              onClick={() =>{setDark(!dark);localStorage.setItem("darktheme",String(!dark))}}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </aside>

        {/* Main Content Workspace Layout */}
        <main className="main-content">
          
          {/* Topbar Layout */}
          <div className="topbar">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>

            <div className="topbar-actions">
              <button className="notification-btn">
                <FaBell />
                <span className="badge-dot"></span>
              </button>
            </div>
          </div>

          {/* Core Dashboard Content Space */}
          <div className="dashboard-view">
            
            {/* Summary Row */}
            <div className="overview-header">
              <h1 className="overview-title">Overview</h1>
              <p className="overview-subtitle">Track your spending and take control of your finances.</p>
            </div>

            {/* 4 KPI Metrics Row Cards Grid */}
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-label">Total Budget</span>
                <h2 className="metric-value">{localStorage.getItem("monthly-limit")}</h2>
                <span className="trend positive">+12.5% <span className="trend-text">from last month</span></span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Total Income</span>
                <h2 className="metric-value">{total_income}</h2>
                <span className="trend positive">+8.2% <span className="trend-text">from last month</span></span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Total Expenses</span>
                <h2 className="metric-value">{total_expense}</h2>
                <span className="trend negative">-3.4% <span className="trend-text">from last month</span></span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Savings</span>
                <h2 className="metric-value">{balance_savings}</h2>
                <span className="trend positive">+15.3% <span className="trend-text">from last month</span></span>
              </div>
            </div>

            {/* Split Visual Analytics Section Grid */}
            <div className="analytics-split-row">
              
              {/* Left Side: Chart Container Display */}
              <div className="chart-card-wrapper">
                <div className="card-inner-header">
                  <h3>Expenses Overview</h3>
                  <div className="dropdown-inline" onClick={() => setTfOpen(!tfOpen)}>
                    <span>{timeframe}</span> <FaChevronDown />
                    {tfOpen && (
                      <div className="inline-menu">
                        <div onClick={() => setTimeframe("Daily")}>Daily</div>
                        <div onClick={() => setTimeframe("Weekly")}>Weekly</div>
                        <div onClick={() => setTimeframe("Monthly")}>Monthly</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="legend-indicators">
                  <span className="legend-item"><span className="dot primary-dot"></span> Expenses</span>
                  <span className="legend-item"><span className="dot secondary-dot"></span> Income</span>
                </div>

                {/* Simulated Wave-Line Chart using stylized standard HTML/CSS scaling paths */}
                <div className="chart-drawing-area">
                  <div className="y-axis-labels">
                    <span>$2.5k</span><span>$2k</span><span>$1.5k</span><span>$1k</span><span>$500</span><span>$0</span>
                  </div>
                  <div className="chart-grid-canvas">
                    {/* Simulated SVG Path vectors mapping out curves matching dashboard ui photo.png */}
                    <svg className="chart-svg" viewBox="0 0 500 150">
                      <path d="M10,90 Q50,70 90,50 T170,60 T250,40 T330,30 T410,70 T490,45" fill="none" stroke="#6366f1" strokeWidth="3" />
                      <path d="M10,120 Q50,115 90,130 T170,110 T250,120 T330,105 T410,125 T490,100" fill="none" stroke="#10b981" strokeWidth="3" />
                    </svg>
                    <div className="x-axis-labels">
                      <span>May 1</span><span>May 8</span><span>May 15</span><span>May 22</span><span>May 31</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Circular Category Pie Proportions */}
              <div className="pie-card-wrapper">
                <div className="card-inner-header">
                  <h3>Top Categories</h3>
                </div>
                
                <div className="pie-flex-layout">
                 <div
                  className="donut-chart-container"
                  style={{
                    background: `conic-gradient(
                      #6366f1 0% ${shoppingPct}%,
                      #10b981 ${shoppingPct}% ${shoppingPct + foodPct}%,
                      #f59e0b ${shoppingPct + foodPct}% ${shoppingPct + foodPct + transportPct}%,
                      #a855f7 ${shoppingPct + foodPct + transportPct}% ${shoppingPct + foodPct + transportPct + entertainmentPct}%,
                      #94a3b8 ${shoppingPct + foodPct + transportPct + entertainmentPct}% ${shoppingPct + foodPct + transportPct + entertainmentPct + utilitiesPct}%,
                      #ef4444 ${shoppingPct + foodPct + transportPct + entertainmentPct + utilitiesPct}% 100%
                    )`
                  }}
                >
                  <div className="donut-center">
                    <span className="donut-number">₹{total_expense}</span>
                    <span className="donut-lbl">Expenses</span>
                  </div>
                </div>

                  <div className="pie-legends-list">
                    <div className="pie-legend-row">
                      <span className="p-label"><span className="legend-sq" style={{backgroundColor: '#6366f1'}}></span> Shopping</span>
                      <span className="p-val">{((shopping/total_category)*100).toFixed(1)}% <span className="p-amt">{shopping}</span></span>
                    </div>
                    <div className="pie-legend-row">
                      <span className="p-label"><span className="legend-sq" style={{backgroundColor: '#10b981'}}></span> Food</span>
                      <span className="p-val">{((foodDining/total_category)*100).toFixed(1)}% <span className="p-amt">Rs.{foodDining}</span></span>
                    </div>
                    <div className="pie-legend-row">
                      <span className="p-label"><span className="legend-sq" style={{backgroundColor: '#f59e0b'}}></span> Transport</span>
                      <span className="p-val">{((transport/total_category)*100).toFixed(1)}% <span className="p-amt">{transport}</span></span>
                    </div>
                    <div className="pie-legend-row">
                      <span className="p-label"><span className="legend-sq" style={{backgroundColor: '#a855f7'}}></span> Entertainment</span>
                      <span className="p-val">{((entertainment/total_category)*100).toFixed(1)}% <span className="p-amt">{entertainment}</span></span>
                    </div>
                    <div className="pie-legend-row">
                      <span className="p-label"><span className="legend-sq" style={{backgroundColor: '#94a3b8'}}></span> Utilities</span>
                      <span className="p-val">{((utilities/total_category)*100).toFixed(1)}% <span className="p-amt">{utilities}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Blocks */}
            <div className="bottom-split-row">
              
              {/* Recent Transactions List Feed Container */}
              <div className="dashboard-list-card">
                <div className="card-inner-header">
                  <h3>Recent Transactions</h3>
                  <button onClick={()=>{nav("/transactions")}} className="action-view-all">View all</button>
                </div>
                     {/* ─── FULL INTERVAL SECTION ─── */}
            <div className="timelineSection">
              <div className="list">
                {transactions_history.map((obj, index) => (
                  <div key={`monthly-${index}`} className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className={`icon ${(obj.type ?? "credit")}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', borderRadius: '50%', background: (obj.type ?? "credit") === 'credit' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: (obj.type ?? "credit") === 'credit' ? '#22c55e' : '#ef4444' }}>
                        {(obj.type ?? "credit") === "credit" ? <FaArrowDown /> : <FaArrowUp />}
                      </div>
                      <div className="metaInfo">
                        <h3 className="rowTitle" style={{ margin: 0, fontSize: '20px' }}>{obj.title}</h3>
                        <span className="date" style={{ fontSize: '15px', opacity: 0.6 }}>{new Date(obj.date + "Z").toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})}</span>
                        <span className="badge" style={{fontSize: '15px', background: 'rgba(0,0,0,0.05)' }}>{obj.category}</span>
                      </div>
                    </div>
                    <div className={`amount ${(obj.type ?? "credit")}`} style={{ fontWeight: 'bold', color: (obj.type ?? "credit") === 'credit' ? '#22c55e' : 'inherit' }}>
                      {(obj.type ?? "credit") === "credit" ? "+" : "-"}₹{obj.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

              </div>

              {/* Targets Budget Line Progress Bars Container */}
              <div className="dashboard-list-card">
                <div className="card-inner-header">
                  <h3>Budget Progress</h3>
                  <button className="action-view-all">View all</button>
                </div>

                <div className="budget-list-stack">
                  {CATEGORIES.slice(0, 5).map((cat) => (
                    <div key={cat.label} className="budget-list-item">
                      <div className="budget-item-labels">
                        <span className="b-title">{cat.label}</span>
                        <span className="b-values">{cat.amount} / <span className="b-max">{cat.max}</span></span>
                      </div>
                      <div className="budget-bar-track">
                        <div className="budget-bar-fill" style={{ width: cat.percent, backgroundColor: cat.color }}></div>
                      </div>
                      <span className="budget-item-pct">{cat.percent}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </main>

      </div>
    </div>
  );
}