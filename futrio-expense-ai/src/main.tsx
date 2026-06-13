import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Expense from './Expense.tsx';
import './index.css'
import App from './App.tsx'
import Dashboard from './Dashboard.tsx';
import Budget from './Budget.tsx';
import { Login } from './Login.tsx';
import { Register } from './Register.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
            <Routes>
                  <Route path='/addexpense' element={<App/>}/>
                  <Route path='/transactions' element={<Expense/>}/>
                  <Route path='/' element={<Login/>}/>
                  <Route path='/budget' element={<Budget/>}/>
                  <Route path='/dashboard' element={<Dashboard/>}/>
                  <Route path='/register' element={<Register/>}/>
            </Routes>
  </BrowserRouter>
  
)
