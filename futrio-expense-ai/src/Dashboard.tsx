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
            const total_category_ =
              food + transport_ + utilities_ + shopping_ + entertainment_ + health_;              
              console.log(total_category)
            setTotalcategory(total_category_)
                
                  }   

    useEffect(()=>{
      get_history_transactions();
    },[])
    
  const shoppingPct = total_category ? `${((shopping / total_category) * 100).toFixed(3)}%` : "0%";
const foodPct = total_category ? `${((foodDining / total_category) * 100).toFixed(3)}%` : "0%";
const transportPct = total_category ? `${((transport / total_category) * 100).toFixed(3)}%` : "0%";
const entertainmentPct = total_category ? `${((entertainment / total_category) * 100).toFixed(3)}%` : "0%";
const utilitiesPct = total_category ? `${((utilities / total_category) * 100).toFixed(3)}%` : "0%";
const healthPct = total_category ? `${((health / total_category) * 100).toFixed(3)}%` : "0%";
const shoppingP = total_category ? (shopping / total_category) * 100 : 0;
const foodP = total_category ? (foodDining / total_category) * 100 : 0;
const transportP = total_category ? (transport / total_category) * 100 : 0;
const entertainmentP = total_category ? (entertainment / total_category) * 100 : 0;
const utilitiesP = total_category ? (utilities / total_category) * 100 : 0;
const healthP = total_category ? (health / total_category) * 100 : 0;
console.log(foodPct,transportPct,entertainmentPct,shoppingPct)
     const CATEGORIES = [
  { label: "Food & Dining", icon: "🍽", amount: `Rs.${foodDining}`, max: `Rs.${total_category}`, percent: foodPct, color: "#10b981" },
  { label: "Transport", icon: "🚗", amount: `Rs.${transport}`, max: `Rs.${total_category}`, percent: transportPct,color: "#f59e0b" },
  { label: "Shopping", icon: "🛍",amount: `Rs.${shopping}`, max: `Rs.${total_category}`, percent: shoppingPct,color: "#6366f1" },
  { label: "Entertainment", icon: "🎬",amount: `Rs.${entertainment}`, max: `Rs.${total_category}`,percent: entertainmentPct, color: "#a855f7" },
  { label: "Health", icon: "💊",amount: `Rs.${health}`, max: `Rs.${total_category}`, percent: healthPct,color: "#ef4444" },
  { label: "Utilities", icon: "💡",amount: `Rs.${utilities}`, max: `Rs.${total_category}`,percent: utilities, color: "#3b82f6" },
];
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
    #6366f1 0% ${shoppingP}%,
    #10b981 ${shoppingP}% ${shoppingP + foodP}%,
    #f59e0b ${shoppingP + foodP}% ${shoppingP + foodP + transportP}%,
    #a855f7 ${shoppingP + foodP + transportP}% ${shoppingP + foodP + transportP + entertainmentP}%,
    #94a3b8 ${shoppingP + foodP + transportP + entertainmentP}% ${shoppingP + foodP + transportP + entertainmentP + utilitiesP}%,
    #ef4444 ${shoppingP + foodP + transportP + entertainmentP + utilitiesP}% 100%
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
                  {CATEGORIES.slice(0, 6).map((cat) => (
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