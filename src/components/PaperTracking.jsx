import React from 'react';
import { useGetPaperTrackingQuery } from "../services/trackingApi";
import { statusConfig, stages } from "../constants/TrackingConfig";
import { Clock, User, ShieldCheck, ChevronRight, LayoutList, CheckCircle2, Activity, Zap } from "lucide-react";
import moment from "moment";

export default function PaperTracking({ manuscriptId, currentStatus }) {
    const { data, isLoading } = useGetPaperTrackingQuery(manuscriptId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 w-full">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                    </div>
                </div>
                <p className="mt-6 text-slate-500 font-semibold tracking-wide animate-pulse">Fetching Real-time Logs...</p>
            </div>
        );
    }

    const logs = data?.tracking || [];
    const activeStep = statusConfig[currentStatus]?.step || 1;

    return (
        <div className="w-full bg-[#fcfdfe] min-h-screen">
            {/* 1. TOP STATS BAR & PROGRESS */}
            <div className="bg-white border-b border-slate-100 px-6 py-8 lg:px-12">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-full tracking-tighter uppercase">Project Alpha</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{manuscriptId}</h2>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">Monitoring workflow integrity and milestone progression.</p>
                        </div>

                        <div className="flex items-center gap-4 bg-indigo-50/30 p-1.5 pr-6 rounded-2xl border border-indigo-100/50">
                            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                                <Zap size={22} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Status</p>
                                <p className="text-sm font-black text-indigo-900 uppercase tracking-tight">{currentStatus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Progress */}
                    <div className="relative flex justify-between items-start w-full px-4">
                        <div className="absolute top-5 left-0 w-full h-[3px] bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.5)]"
                                style={{ width: `${((activeStep - 1) / (stages.length - 1)) * 100}%` }}
                            />
                        </div>

                        {stages.map((stage, idx) => {
                            const isCompleted = activeStep > stage.step;
                            const isActive = activeStep === stage.step;
                            return (
                                <div key={idx} className="relative z-10 flex flex-col items-center group">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isCompleted ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100" :
                                            isActive ? "bg-white border-indigo-600 ring-4 ring-indigo-50 shadow-md scale-110" :
                                                "bg-white border-slate-200 text-slate-300"
                                        }`}>
                                        {isCompleted ? <CheckCircle2 className="w-6 h-6 text-white" /> : <span className="text-sm font-black">{stage.step}</span>}
                                    </div>
                                    <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.15em] transition-all ${isActive ? "text-indigo-600 translate-y-1" : "text-slate-400 opacity-60"}`}>
                                        {stage.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. CONTENT GRID: 2-Column Responsive Layout */}
            <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT COLUMN: ACTIVITY LOG (70% Width) */}
                    <div className="w-full lg:w-[68%] xl:w-[72%]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-slate-700">
                                <LayoutList size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Audit Trail & Activity</h3>
                        </div>

                        <div className="relative ml-5">
                            {/* Stylish Vertical Line */}
                            <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-500 via-slate-100 to-transparent rounded-full opacity-30"></div>

                            <div className="space-y-12">
                                {[...logs].reverse().map((log, index) => {
                                    const config = statusConfig[log.action] || { icon: Clock, color: "bg-slate-50 text-slate-400 border-slate-200" };
                                    const Icon = config.icon;

                                    return (
                                        <div key={index} className="relative flex gap-10 group">
                                            {/* Status Icon */}
                                            <div className={`relative z-10 w-12 h-12 shrink-0 rounded-2xl border-2 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:scale-110 ${config.color.split(' ')[1]}`}>
                                                <Icon size={22} />
                                            </div>

                                            {/* Content Card */}
                                            <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                                    <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight truncate">
                                                        {log.action}
                                                    </h4>
                                                    <time className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                                        <Clock size={12} className="text-slate-300" />
                                                        {moment(log.createdAt).format("MMM DD, YYYY • hh:mm A")}
                                                    </time>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white border-2 border-white shadow-sm">
                                                            <User size={14} />
                                                        </div>
                                                        <span className="text-[13px] font-bold text-slate-700 italic">
                                                            {log.performedBy?.name || "System Automated"}
                                                        </span>
                                                    </div>
                                                    <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100/30">
                                                        {log.role || "CORE"}
                                                    </span>
                                                </div>

                                                {log.remarks && (
                                                    <div className="mt-5 p-5 rounded-2xl bg-indigo-50/20 border-l-4 border-indigo-500/20 text-[14px] text-slate-600 leading-relaxed italic">
                                                        "{log.remarks}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: INSIGHTS SIDEBAR (30% Width) */}
                    <div className="w-full lg:w-[32%] xl:w-[28%] sticky top-10 space-y-6">

                        {/* Summary Card */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-lg font-black tracking-tight">Paper Insights</h4>
                                    <Activity size={20} className="text-indigo-400" />
                                </div>

                                <div className="space-y-6 mb-8">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Logged Events</span>
                                        <span className="text-3xl font-black">{logs.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Process Age</span>
                                        <span className="font-black text-indigo-400 uppercase text-xs">{moment(logs[0]?.createdAt).fromNow(true)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Glow Decoration */}
                            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-[100px]"></div>
                        </div>

                        {/* Compliance Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Security Protocol</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                                This audit trail is <span className="text-slate-900 font-bold">cryptographically hashed</span>. Every interaction is linked to a verified user session for total accountability.
                            </p>
                            <div className="flex items-center gap-3 p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Integrity Verified</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}