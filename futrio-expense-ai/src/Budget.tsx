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
FaCalendarAlt,
FaTrashAlt,
FaExclamationTriangle,
FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface BudgetLimit {
id: string;
category: string;
icon: string;
amount: number;
}

const NAV_ITEMS = [
{ label: "Dashboard", icon: FaHome, route: "/" },
{ label: "Transactions", icon: FaExchangeAlt, route: "/transactions" },
{ label: "Add Expense", icon: FaPlusCircle, route: "/addexpense" },
{ label: "Reports", icon: FaChartBar, route: "/reports" },
{ label: "Budget", icon: FaWallet, route: "/budget" },
{ label: "Settings", icon: FaCog, route: "/settings" },
];



export default function Budget() {
const nav = useNavigate();

 const [dark, setDark] = useState<boolean>(
        localStorage.getItem("darktheme") === "true"
  );
const [sidebarOpen, setSidebarOpen] = useState(false);
const [submitted,setsubmit] = useState(false)
const [weeklylimit, setweeklylimit] = useState<number | "">("");
const [dailylimit , setdailylimit] = useState<number | "">("");
const [inputAmount, setInputAmount] =useState<number | "">("");

const closeSidebar = () =>
setSidebarOpen(false);

return (
<div className={dark ? "dark" : ""}> <div className="app-shell">


    {sidebarOpen && (
      <div
        className="sidebar-overlay"
        onClick={closeSidebar}
      />
    )}

    {/* Sidebar */}
    <aside
      className={`sidebar ${
        sidebarOpen
          ? "sidebar--open"
          : ""
      }`}
    >
      <div className="sidebar-logo">
        <div className="logo-icon-wrapper">
          <span className="logo-icon">
            F
          </span>

          <span className="logo-text">
            Futrio Expense Tracker
          </span>
        </div>

        <button
          className="sidebar-close"
          onClick={closeSidebar}
        >
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(
          ({
            label,
            icon: Icon,
            route,
          }) => (
            <button
              key={label}
              className={"nav-item"}
              onClick={() => {
                nav(route);
                closeSidebar();
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        )}
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

    {/* Main Content */}
    <main className="main-content">

      <div className="topbar">
        <button
          className="menu-btn"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          <FaBars />
        </button>
      </div>

      <div className="budget-page-container">

        <div className="budget-header-block">
          <div>
            <h1 className="budget-view-title">
              Budget Planner
            </h1>

            <p className="budget-view-subtitle">
              Manage your
              spending limits.
            </p>
          </div>

        </div>
        <div className="budget-summary-grid">
          <div className="b-summary-card primary">
            <div className="card-lbl-row">
              <span>
                Monthly Limit
              </span>
              <FaWallet />
            </div>
               <h2>
                    ₹ {
                        localStorage.getItem("monthly-limit")
                    }
              </h2>
           
          </div>

          <div className="b-summary-card check">
            <div className="card-lbl-row">
              <span>
                Daily Limit
              </span>

              <FaCalendarAlt />
            </div>
            <h2>
                    ₹ {
                        localStorage.getItem("daily-limit")
                    }
              </h2>
           
          </div>
          <div className="b-summary-card check">
            <div className="card-lbl-row">
              <span>
                Weekly Limit
              </span>

              <FaCalendarAlt />
            </div>
            <h2>
                    ₹ {
                        localStorage.getItem("weekly-limit")
                    }
              </h2>
           
          </div>
        </div>
        

        <div className="budget-workspace-split">

          <div className="budget-card form-wrapper-card">

            <div className="card-headline">
              <h3>
                Set Budget
              </h3>
            </div>

            <form
  className="budget-setup-form"
  onSubmit={(e) => {
    e.preventDefault();

    setsubmit(true);

    if (
      inputAmount !== "" &&
      dailylimit !== "" &&
      weeklylimit !== ""
    ) {
      localStorage.setItem("monthly-limit", String(inputAmount));
      localStorage.setItem("daily-limit", String(dailylimit));
      localStorage.setItem("weekly-limit", String(weeklylimit));
    }
  }}
>
              <div className="form-field-group">
                <label style={{marginTop : 10}}>
                  Set your Monthly Budget Amount
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={
                    inputAmount
                  }
                  onChange={(e) =>
                    setInputAmount(
                      e.target
                        .value ===
                        ""
                        ? ""
                        : Number(
                            e.target
                              .value
                          )
                    )
                  }
                  className="budget-amount-input"
                  placeholder="Enter amount"
                />
                 <label>
                  Set Your Daily Limit
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={
                    dailylimit
                  }
                  onChange={(e) =>
                    setdailylimit(
                      e.target
                        .value ===
                        ""
                        ? ""
                        : Number(
                            e.target
                              .value
                          )
                    )
                  }
                  className="budget-amount-input"
                  placeholder="Enter amount"
                />
                  <label>
                  Set Your weekly Limit
                </label>

                <input
                  type="number"
                  min="1"
                  required
                  value={
                    weeklylimit
                  }
                  onChange={(e) =>
                    setweeklylimit(
                      e.target
                        .value ===
                        ""
                        ? ""
                        : Number(
                            e.target
                              .value
                          )
                    )
                  }
                  className="budget-amount-input"
                  placeholder="Enter amount"
                />
              </div>

              <button
  type="submit"
  className="budget-submit-action-btn"
>
  <FaPlusCircle />
  Save Budget
</button>
            </form>

            <div className="budget-info-alert-box">
              <FaExclamationTriangle />

              <div>
                <h5>
                  Budget Tip
                </h5>

                <p>
                  Set realistic
                  spending
                  limits to
                  improve
                  financial
                  discipline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

);
}
