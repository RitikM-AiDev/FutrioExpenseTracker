
import { useEffect, useState } from "react";

import {
  FaHome,
  FaExchangeAlt,
  FaPlusCircle,
  FaChartBar,
  FaWallet,
  FaSpinner,
  FaCog,
  FaMoon,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";
import { useNavigate} from "react-router-dom";
const NAV_ITEMS = [
  { label: "Dashboard", icon: FaHome, route : "/" },
  { label: "Transactions", icon: FaExchangeAlt, route : "/transactions" },
  { label: "Add Expense", icon: FaPlusCircle, route : "/addexpense" },
  { label: "Reports", icon: FaChartBar, route : "/reports" },
  { label: "Budget", icon: FaWallet , route : "/budget" },
  { label: "Settings", icon: FaCog, route :"/settings" },
];
const CATEGORIES = [
  { label: "Food & Dining", icon: "🍽" },
  { label: "Transport", icon: "🚗" },
  { label: "Shopping", icon: "🛍" },
  { label: "Entertainment", icon: "🎬" },
  { label: "Health", icon: "💊" },
  { label: "Utilities", icon: "💡" },
  {label: "Credit", icon: "🚗"}
];
const TYPE = [
  { label: "credit" as const },
  { label: "debit" as const },
];

export default function App() {
  const nav = useNavigate();
  const [dark, setDark] = useState<boolean>(
        localStorage.getItem("darktheme") === "true"
  );
  const [isPending, setIsPending] = useState(false);
  const [category, setCategory] = useState("Food & Dining");
  const [catOpen, setCatOpen] = useState(false);
  const [Image,setImage] = useState<File | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [type, settype] = useState<"credit" | "debit">("debit");
  const [note,setNote] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const Idata = {
        "amount" : amount,
        "title" : title.charAt(0).toUpperCase() + title.slice(1),
        "type" : type,
        "date" : new Date().toISOString(),
        "category" : category,
        "email" : "hello@gmail.com"
  }
  const handle_addexpense = async()=>{
         if (
  !type||
  amount === "" ||
  title === "" ||
  category === ""
) {
  return;
}
          if (isPending) return;
          setIsPending(true);
          try{
          
          const response = await fetch(
            "http://127.0.0.1:8000/addExpense",
            {
              headers : {"Content-Type" : "application/json"},
              method : "POST",
              body : JSON.stringify(Idata)
            }
          )
          if(response.ok){
            const data =await response.json();
            console.log(data.result)
          }
        }
        catch(err){
          console.error("Network infrastructure error:", err);
        }
        finally{
          setIsPending(false);
        }
  }
  const closeSidebar =  () => setSidebarOpen(false);
  const handle_image = async(e : React.ChangeEvent<HTMLInputElement>) =>{
        const file = e.target.files?.[0]
        if (!file) return;

        if (file){setImage(file)}
        console.log("handle image called")
        console.log(file)
        const formdata = new FormData();
        formdata.append("image",file)
        const response = await fetch(
          "http://127.0.0.1:8000/upload/image",
          {
            method : "POST",
            body : formdata
          }
        )
        const data = await response.json();
        console.log(data)
  }
  return (
    <div className={dark ? "dark" : ""}>
      <div className="app-shell">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}

        {/* Sidebar */}
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
          
          {/* Topbar Layout - Now Aligns FaBars on the Far Left */}
          <div className="topbar">
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <FaBars />
            </button>
          </div>

          {/* Core Input Container */}
          <div className="form-card">

            <div className="form-header">
            
              <div>
                <h1 className="form-title">Add New Expense</h1>
                <p className="form-subtitle">
                  Fill in the details to add a new expense
                </p>
              </div>
            </div>
            <h1 className="image-h1">Upload Your Bill or Fill The Form Below</h1>
            <input type="file" accept="image/*" className="file-input" onChange={handle_image}></input>
            <h1 className="image-h1">OR</h1>
            {/* Title Item input */}
            <div className="field-group">
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

            {/* Categories Context */}
            <div className="field-group">
              <label className="field-label">Category</label>

              <div
                className="select-wrapper"
                onClick={() => setCatOpen(!catOpen)}
              >
                <div className="select-left">
                  <span className="select-icon">
                    {CATEGORIES.find(c => c.label === category)?.icon}
                  </span>
                  <span className="select-value">{category}</span>
                </div>

                <FaChevronDown className="select-chevron" />

                {catOpen && (
                  <div className="dropdown">
                    {CATEGORIES.map((c) => (
                      <div
                        key={c.label}
                        className={`dropdown-item ${
                          category === c.label ? "active" : ""
                        }`}
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
            
            {/* type Context */}
            <div className="field-group">
  <label className="field-label">Credit or Debit</label>

  <div
    className="select-wrapper"
    onClick={() => setTypeOpen(!typeOpen)}
  >
    <div className="select-left">
      <span className="select-value">{type}</span>
    </div>

    <FaChevronDown className="select-chevron" />

    {typeOpen && (
      <div className="dropdown">
        {TYPE.map((c) => (
          <div
            key={c.label}
            className={`dropdown-item ${
              type === c.label ? "active" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              settype(c.label);
              setTypeOpen(false);
            }}
          >
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
            {/* Amount Field */}
            <div className="field-group">
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

            {/* Supplementary Notes */}
            <div className="field-group">
              <label className="field-label">Notes</label>
              <textarea
                className="field-textarea"
                placeholder="Add notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Interaction Buttons */}
           <button 
  className={`btn-primary ${isPending ? "loading" : ""}`} 
  onClick={(e)=>{e.preventDefault();handle_addexpense();}}
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
        </main>

      </div>
    </div>
  );
}