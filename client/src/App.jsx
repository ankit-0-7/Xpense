import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, PlusCircle, BarChart3, FileText, Upload, Settings, 
  Bell, Search, LogOut, ChevronRight, ChevronDown, Edit2, Trash2, Loader2, Camera 
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION ---
const API_BASE_URL = "https://probable-waddle-v9xw9q9gxvj24pg-5000.app.github.dev";

// --- REUSABLE COMPONENTS ---

// 1. Matte Card Component
const Card = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`bg-[#1c1c1e] rounded-2xl p-5 border-t border-white/10 shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

// 2. Sidebar Component
const Sidebar = ({ onUploadClick }) => (
  <div className="w-64 bg-[#18181b] h-screen fixed left-0 top-0 flex flex-col p-6 border-r border-white/5 z-50 font-sans">
    {/* Logo */}
    <div className="flex items-center gap-3 mb-10 text-emerald-400">
      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
        <span className="font-bold text-lg">X</span>
      </div>
      <h1 className="text-xl font-bold text-gray-200 tracking-wide">Xpense</h1>
    </div>

    {/* Navigation */}
    <nav className="flex-1 space-y-2">
      <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
      <NavItem icon={<BarChart3 size={20} />} label="Analytics" />
      <NavItem icon={<FileText size={20} />} label="Reports" />
      {/* This button now triggers the file upload */}
      <div onClick={onUploadClick}>
        <NavItem icon={<Upload size={20} />} label="Upload Receipt" />
      </div>
      <NavItem icon={<Settings size={20} />} label="Settings" />
    </nav>

    {/* Profile Section */}
    <div className="mt-auto bg-[#27272a] rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-500/30">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20" /> 
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Elite User</h4>
          <p className="text-xs text-gray-400">Pro Member</p>
        </div>
      </div>
      <button className="w-full bg-[#18181b] hover:bg-black text-gray-400 text-xs font-medium py-2 rounded-lg border border-white/5 transition-colors">
        Log Out
      </button>
    </div>
  </div>
);

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
    active 
      ? 'bg-[#27272a] text-emerald-400 border-l-4 border-emerald-400' 
      : 'text-gray-400 hover:bg-white/5 hover:text-white'
  }`}>
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

// --- MAIN APPLICATION ---
export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food' });
  const fileInputRef = useRef(null); // Ref to trigger file upload from Sidebar

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  // 2. Logic Functions
  const handleManualSubmit = async () => {
    if (!formData.title || !formData.amount) return alert("Please enter title and amount");
    const payload = {
      title: formData.title,
      amount: Number(formData.amount),
      category: formData.category,
      date: new Date().toISOString(),
      isAIProcessed: false
    };

    try {
      await axios.post(`${API_BASE_URL}/api/expenses`, payload);
      setFormData({ title: '', amount: '', category: 'Food' });
      fetchExpenses();
    } catch (err) {
      alert("Failed to add expense.");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return alert("File too large (Max 1MB)");

    setLoading(true);
    const data = new FormData();
    data.append('receipt', file);

    try {
      await axios.post(`${API_BASE_URL}/api/scan`, data);
      alert("Receipt Scanned Successfully!");
      fetchExpenses();
    } catch (err) {
      alert("Scan Failed. Check server logs.");
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // 3. Dynamic Data Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const monthlySpent = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  // Prepare Graph Data from Real Expenses
  const chartData = useMemo(() => {
    // Group expenses by Month (Basic implementation)
    const dataMap = {};
    expenses.forEach(exp => {
       const month = new Date(exp.date).toLocaleDateString('en-US', { month: 'short' });
       if (!dataMap[month]) dataMap[month] = { name: month, expense: 0, income: 4000 };
       dataMap[month].expense += exp.amount;
    });
    // Return last 6 months or default mock if empty
    const result = Object.values(dataMap);
    return result.length > 0 ? result : [
      { name: 'Jan', income: 26199, expense: 20000 },
      { name: 'Feb', income: 17000, expense: 100 },
      { name: 'Mar', income: 30000, expense: 15000 }
    ];
  }, [expenses]);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      {/* FIXED SIDEBAR */}
      <Sidebar onUploadClick={() => fileInputRef.current.click()} />

      {/* MAIN CONTENT AREA */}
      <div className="pl-64"> 
        
        {/* Header */}
        <header className="flex justify-end items-center p-6 gap-4">
          <button className="p-3 bg-[#1c1c1e] rounded-xl border border-white/5 text-gray-400 hover:text-white">
            <Bell size={20} />
          </button>
          
          {/* Hidden File Input for Logic */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileUpload} 
            accept="image/*,application/pdf"
            disabled={loading} 
          />
          
          <button 
            onClick={() => fileInputRef.current.click()}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-white/5 transition-all ${loading ? 'bg-emerald-600' : 'bg-[#1c1c1e] hover:bg-zinc-800'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <Camera size={20}/>}
            <span className="text-sm font-medium">{loading ? "Scanning..." : "Quick Scan"}</span>
          </button>
        </header>

        <main className="p-8 pt-0 grid grid-cols-12 gap-6">
          
          {/* === ROW 1: TOP STATS === */}
          <Card className="col-span-4 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Total Balance</h3>
                <div className="w-32 h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="w-[70%] h-full bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Remaining: ${Math.max(12450 - totalSpent, 0).toFixed(0)}</p>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-white">$12,450</h2>
                <p className="text-xs text-red-400 mt-1">Spent: ${totalSpent.toFixed(0)}</p>
              </div>
            </div>
          </Card>

          <Card className="col-span-4">
            <h3 className="text-gray-400 text-sm font-medium">Monthly Expenses</h3>
            <h2 className="text-3xl font-bold text-white mt-2">${monthlySpent.toFixed(2)}</h2>
          </Card>

          <Card className="col-span-4">
            <h3 className="text-gray-400 text-sm font-medium">Items Tracked</h3>
            <h2 className="text-3xl font-bold text-white mt-2">{expenses.length}</h2>
          </Card>

          {/* === ROW 2: GRAPH & QUICK ADD === */}
          <Card className="col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Expenses Overview</h3>
              
              {/* Quick Add Form inside Header */}
              <div className="flex gap-2">
                <input 
                   className="bg-zinc-800 border-none rounded-lg px-3 py-1 text-sm outline-none w-32 text-white placeholder-gray-500" 
                   placeholder="Title" 
                   value={formData.title} 
                   onChange={e => setFormData({...formData, title: e.target.value})} 
                />
                <input 
                   className="bg-zinc-800 border-none rounded-lg px-3 py-1 text-sm outline-none w-20 text-white placeholder-gray-500" 
                   placeholder="$" 
                   type="number" 
                   value={formData.amount} 
                   onChange={e => setFormData({...formData, amount: e.target.value})} 
                />
                <button onClick={handleManualSubmit} className="bg-emerald-600 px-3 rounded-lg hover:bg-emerald-500 transition">
                  <PlusCircle size={18} color="white" />
                </button>
              </div>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="expense" barSize={20} fillOpacity={0.6}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#52525b' : '#3f3f46'} />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Analytics Panel */}
          <div className="col-span-4 flex flex-col gap-6">
             <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                   <p className="text-xs text-gray-400">Daily Average</p>
                   <h2 className="text-2xl font-bold mt-1">${(monthlySpent / 30).toFixed(0)}</h2>
                </Card>
                <Card className="p-4 relative">
                   <p className="text-xs text-gray-400">Top Category:</p>
                   <h2 className="text-md font-bold mt-1 text-white">Food</h2>
                   <ChevronRight size={16} className="absolute right-3 top-4 text-gray-600" />
                </Card>
                <Card className="p-4 col-span-2 relative overflow-hidden">
                   <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold text-white">$1,200</h2>
                      <span className="text-xs text-gray-500">Rent &gt;</span>
                   </div>
                   <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2">
                      <div className="w-[80%] h-full bg-[#5a6b4c] rounded-full"></div>
                   </div>
                </Card>
             </div>
          </div>

          {/* === ROW 3: TRANSACTIONS & ACTION === */}
          <Card className="col-span-8">
            <h3 className="text-lg font-semibold mb-4">Transactions</h3>
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="text-xs text-gray-500 border-b border-white/5">
                     <th className="py-2 font-medium">Name</th>
                     <th className="py-2 font-medium">Date</th>
                     <th className="py-2 font-medium">Amount</th>
                     <th className="py-2 font-medium text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   <AnimatePresence>
                     {expenses.map((t) => (
                       <motion.tr 
                         key={t._id} 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                         className="border-b border-white/5 text-sm group hover:bg-white/5 transition-colors"
                       >
                         <td className="py-4 font-medium">{t.title}</td>
                         <td className="py-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                         <td className="py-4 font-bold text-emerald-400">${t.amount.toFixed(2)}</td>
                         <td className="py-4 text-right flex justify-end gap-2">
                           <button onClick={() => deleteExpense(t._id)} className="p-1.5 rounded bg-[#27272a] text-gray-400 hover:text-red-400 transition">
                             <Trash2 size={14}/>
                           </button>
                         </td>
                       </motion.tr>
                     ))}
                   </AnimatePresence>
                 </tbody>
               </table>
            </div>
          </Card>

          <div className="col-span-4 flex flex-col gap-6">
             <Card>
                <h3 className="text-sm font-semibold mb-4">Monthly Budget</h3>
                <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${Math.min((monthlySpent / 4000) * 100, 100)}%` }}
                     className="h-full bg-[#5a6b4c]" 
                   />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                   <span className="text-white font-bold">{Math.min((monthlySpent / 4000) * 100, 100).toFixed(0)}%</span> of $4,000 Budget Used
                </p>
             </Card>

             {/* Large Upload Button Triggering Logic */}
             <button 
                onClick={() => fileInputRef.current.click()}
                className="w-full py-4 bg-[#27272a] hover:bg-[#3f3f46] rounded-2xl border border-white/10 shadow-lg flex items-center justify-center gap-3 transition-all group"
             >
                <Upload size={20} className="text-gray-400 group-hover:text-white" />
                <span className="font-semibold text-gray-200">Upload Receipt</span>
                <ChevronRight size={16} className="text-gray-500 absolute right-8" />
             </button>
          </div>
        </main>
      </div>
    </div>
  );
}