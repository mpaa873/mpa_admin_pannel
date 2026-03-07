"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowRight,
  Calendar
} from "lucide-react";

// --- DUMMY DATA ---
const statsData =[
  { title: "Total Assigned", value: "12", icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-100/50" },
  { title: "Pending Reviews", value: "5", icon: Clock, color: "text-amber-600", bg: "bg-amber-100/50" },
  { title: "Completed", value: "7", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100/50" },
  { title: "Nearing Deadline", value: "2", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100/50" },
];

const dummyPapers =[
  {
    id: "MPA-2026-084",
    title: "The Impact of Artificial Intelligence on Modern Cryptography",
    category: "Computer Science",
    status: "Pending",
    deadline: "Mar 10, 2026",
    urgency: "High",
  },
  {
    id: "MPA-2026-092",
    title: "Sustainable Urban Planning: A Case Study of Smart Cities",
    category: "Architecture",
    status: "In Review",
    deadline: "Mar 14, 2026",
    urgency: "Normal",
  },
  {
    id: "MPA-2026-105",
    title: "Quantum Entanglement in Macroscopic Systems",
    category: "Physics",
    status: "Pending",
    deadline: "Mar 15, 2026",
    urgency: "Normal",
  },
  {
    id: "MPA-2026-042",
    title: "Evolution of Machine Learning Algorithms in Healthcare",
    category: "Medicine & Tech",
    status: "Completed",
    deadline: "Feb 28, 2026",
    urgency: "Low",
  },
];

// --- HELPER COMPONENTS ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Pending": "bg-amber-100 text-amber-700 border-amber-200",
    "In Review": "bg-blue-100 text-blue-700 border-blue-200",
    "Completed": "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default function ReviewerDashboard() {
  const[searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              Reviewer <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Dashboard</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">
              Welcome back! Here is an overview of your assigned manuscripts.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-700">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h2 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
                    {stat.title}
                  </h2>
                  <p className="text-4xl font-extrabold text-slate-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- MAIN CONTENT / TABLE SECTION --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Active Assignments
              <span className="bg-indigo-100 text-indigo-700 text-xs py-0.5 px-2.5 rounded-full">
                {dummyPapers.length}
              </span>
            </h2>

            {/* Search & Filter */}
            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by ID or Title..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Paper Details</th>
                  <th className="px-6 py-4 font-bold hidden md:table-cell">Category</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold hidden sm:table-cell">Deadline</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dummyPapers.map((paper, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* ID & Title */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-indigo-500">{paper.id}</span>
                        <span className="text-sm font-semibold text-slate-800 line-clamp-2 max-w-xs xl:max-w-md">
                          {paper.title}
                        </span>
                        {/* Mobile only elements */}
                        <div className="flex items-center gap-2 mt-2 md:hidden">
                          <span className="text-xs text-slate-500">{paper.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className={`text-xs font-semibold ${paper.urgency === 'High' ? 'text-rose-500' : 'text-slate-500'}`}>
                            {paper.deadline}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category (Hidden on mobile) */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {paper.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge status={paper.status} />
                    </td>

                    {/* Deadline (Hidden on extra small screens) */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{paper.deadline}</span>
                        {paper.urgency === "High" && (
                          <span className="text-xs font-bold text-rose-500 mt-0.5">Urgent</span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="hidden sm:flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-sm font-semibold rounded-xl transition-all duration-300 border border-indigo-100 hover:border-indigo-600 shadow-sm">
                          {paper.status === "Completed" ? "View Review" : "Start Review"}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        {/* Mobile Icon Button */}
                        <button className="sm:hidden p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination / Footer (Dummy) */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center text-sm text-slate-500 font-medium">
            Showing 1 to {dummyPapers.length} of {dummyPapers.length} assigned papers
          </div>
        </div>

      </div>
    </div>
  );
}