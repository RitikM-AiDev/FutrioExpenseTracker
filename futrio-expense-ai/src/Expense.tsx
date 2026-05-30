import { useState,useEffect } from "react";
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
  FaArrowDown
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", icon: FaHome, route : "/" },
  { label: "Transactions", icon: FaExchangeAlt, route : "/transactions" },
  { label: "Add Expense", icon: FaPlusCircle, route : "/addexpense" },
  { label: "Reports", icon: FaChartBar, route : "/reports" },
  { label: "Budget", icon: FaWallet , route : "/budget" },
  { label: "Settings", icon: FaCog, route :"/settings" },
];
type Transaction = {
   title: string;
  amount: number;
  date: string;
  category: string;
  type? : "credit" | "debit"
}
export default function Expense() {
  const nav = useNavigate();
   const [dark, setDark] = useState<boolean>(
        localStorage.getItem("darktheme") === "true"
  );
  useEffect(() => {
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, [dark]);
  const [transactions_daily, setTransactions_daily] = useState<Transaction[]>([]);
  const [transactions_monthly, setTransactions_monthly] = useState<Transaction[]>([]);
  const [transactions_weekly, setTransactions_weekly] = useState<Transaction[]>([]);
  const [transactions_history, setTransactions_history] = useState<Transaction[]>([]);
  const [activeNav, setActiveNav] = useState("Transactions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const get_daily_transactions = async () =>{
        const response =   await fetch(
            `http://127.0.0.1:8000/transactions/daily/${encodeURIComponent("hello@gmail.com")}`
          )
  
        if (!response.ok) {
                console.error("API Error:", response.status);
                setTransactions_daily([]);
                return;
              }

              const transaction_array = await response.json();
              setTransactions_daily(transaction_array?.transactions || []);
    }   
    const get_weekly_transactions = async () =>{
          const response =   await fetch(
            `http://127.0.0.1:8000/transactions/weekly/${encodeURIComponent("hello@gmail.com")}`
          )
  
        if (!response.ok) {
                console.error("API Error:", response.status);
                setTransactions_weekly([]);
                return;
              }

              const transaction_array = await response.json();
              setTransactions_weekly(transaction_array?.transactions || []);
    }   
    const get_monthly_transactions = async () =>{
          const response =   await fetch(
            `http://127.0.0.1:8000/transactions/monthly/${encodeURIComponent("hello@gmail.com")}`
          )
  
        if (!response.ok) {
                console.error("API Error:", response.status);
                setTransactions_monthly([]);
                return;
              }

              const transaction_array = await response.json();
              setTransactions_monthly(transaction_array?.transactions || []);
    }   
     const get_history_transactions = async () =>{
          const response =   await fetch(
            `http://127.0.0.1:8000/transactions/history/${encodeURIComponent("hello@gmail.com")}`
          )
  
        if (!response.ok) {
                console.error("API Error:", response.status);
                setTransactions_history([]);
                return;
              }

              const transaction_array = await response.json();
              setTransactions_history(transaction_array?.transactions || []);
    }   

  useEffect(()=>{
          get_daily_transactions();
          get_monthly_transactions();
          get_weekly_transactions();
          get_history_transactions();
    },[])
  const closeSidebar = () => setSidebarOpen(false);



  return (
    
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
            <button className="sidebar-close" onClick={closeSidebar}>
              ✕
            </button>
          </div>

         <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ label, icon: Icon, route }) => (
              <button
                key={label}
                className="nav-item"
                onClick={() => {
                  nav(route);
                  setActiveNav(label);  
                  closeSidebar();
                }}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </nav>


          <div className="sidebar-footer">
            <span className="dark-label">
              <FaMoon />
              Dark Mode
            </span>

             <button
              className={`toggle ${dark ? "toggle--on" : ""}`}
              onClick={() =>{setDark(!dark);localStorage.setItem("darktheme",String(!dark))}}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          
          {/* Topbar Layout */}
          <div className="topbar">
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <FaBars />
            </button>
          </div>

          {/* Form Card wrapper matching the style theme layout */}
          <div className="form-card">
            
            {/* Header Block */}
            <div className="form-header">
              <div>
                <h1 className="form-title">Transaction History</h1>
                <p className="form-subtitle">Track your recent expenses</p>
              </div>
            </div>

            {/* Input Text Filtering Unit */}
            <div className="field-group">
              <div className="input-wrapper">
                <span className="input-prefix-icon">
                  <FaSearch />
                </span>
                <input 
                  type="text" 
                  className="field-input" 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Standard Three Column Headers / Layout Layout */}
            <div className="tableHeader" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 'bold', opacity: 0.7, fontSize: '0.9rem' }}>
              <div>Shopping / Title</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
            </div>

            {/* ─── DAILY INTERVAL SECTION ─── */}
            <div className="timelineSection">
              <h2 className="timelineTitle" style={{ margin: '15px 0 10px 0', fontSize: '1.2rem' }}>Daily</h2>
              <div className="list">
                {transactions_daily.map((obj, index) => (
                  <div key={`monthly-${index}`} className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className={`icon ${(obj.type ?? "credit")}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', borderRadius: '50%', background: (obj.type ?? "credit") === 'credit' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: (obj.type ?? "credit") === 'credit' ? '#22c55e' : '#ef4444' }}>
                        {(obj.type ?? "credit") === "credit" ? <FaArrowDown /> : <FaArrowUp />}
                      </div>
                      <div className="metaInfo">
                        <h3 className="rowTitle" style={{ margin: 0,fontSize: '20px' }}>{obj.title}</h3>
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

            {/* ─── WEEKLY INTERVAL SECTION ─── */}
            <div className="timelineSection">
              <h2 className="timelineTitle" style={{ margin: '25px 0 10px 0', fontSize: '1.2rem' }}>Monthly</h2>
              <div className="list">
                {transactions_monthly.map((obj, index) => (
                  <div key={`monthly-${index}`} className="row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className={`icon ${(obj.type ?? "credit")}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', borderRadius: '50%', background: (obj.type ?? "credit") === 'credit' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: (obj.type ?? "credit") === 'credit' ? '#22c55e' : '#ef4444' }}>
                        {(obj.type ?? "credit") === "credit" ? <FaArrowDown /> : <FaArrowUp />}
                      </div>
                      <div className="metaInfo">
                        <h3 className="rowTitle" style={{ margin: 0, fontSize: '20px' }}>{obj.title}</h3>
                        <span className="date" style={{ fontSize: '15px', opacity: 0.6 }}>{new Date(obj.date + "Z").toLocaleString("en-IN", {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
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

            {/* ─── MONTHLY INTERVAL SECTION ─── */}
            <div className="timelineSection">
              <h2 className="timelineTitle" style={{ margin: '25px 0 10px 0', fontSize: '1.2rem' }}>Weekly</h2>
              <div className="list">
                {transactions_weekly.map((obj, index) => (
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
            {/* ─── FULL INTERVAL SECTION ─── */}
            <div className="timelineSection">
              <h2 className="timelineTitle" style={{ margin: '25px 0 10px 0', fontSize: '15px' }}>Transaction History</h2>
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
  day: "numeric",
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
        </main>

      </div>
  );
}