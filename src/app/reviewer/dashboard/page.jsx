"use client";
import React, { useState } from "react";
import { useGetReviewerAssignmentsQuery, useRespondToInvitationMutation } from "../../../services/reviewerApi";
import { BookOpen, Clock, CheckCircle2, AlertCircle, Search, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const StatusBadge = ({ invitationStatus, reviewStatus }) => {
  if (invitationStatus === "Declined") return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">Declined</span>;
  if (invitationStatus === "Pending") return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Pending Invitation</span>;
  if (reviewStatus === "Completed") return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Completed</span>;
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">In Review</span>;
};

export default function ReviewerDashboard() {
  const[searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useGetReviewerAssignmentsQuery();
  const [respondInvitation] = useRespondToInvitationMutation();

  const reviews = data?.reviews ||[];
  const filteredReviews = reviews.filter(r => 
    r.manuscriptId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.manuscriptId?.manuscriptId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statsData =[
    { title: "Total Assigned", value: reviews.length, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-100/50" },
    { title: "Pending Invites", value: reviews.filter(r => r.invitationStatus === "Pending").length, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100/50" },
    { title: "Active Reviews", value: reviews.filter(r => r.invitationStatus === "Accepted" && r.reviewStatus === "Pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-100/50" },
    { title: "Completed", value: reviews.filter(r => r.reviewStatus === "Completed").length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100/50" },
  ];

  const handleResponse = async (reviewId, status) => {
    try {
      await respondInvitation({ reviewId, status }).unwrap();
      toast.success(`Invitation ${status}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to respond");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Assignments...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Reviewer <span className="text-indigo-600">Dashboard</span></h1>
            <p className="text-slate-500 font-medium">Manage your assigned manuscripts and track pending reviews.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</h2>
                <p className="text-4xl font-extrabold text-slate-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
             <h2 className="text-xl font-bold text-slate-800">Assigned Manuscripts</h2>
             <div className="relative w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" placeholder="Search..." 
                 className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm outline-none focus:border-indigo-500"
                 value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
          
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase">
                <th className="px-6 py-4">Paper Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviews.length === 0 && (
                <tr><td colSpan="3" className="text-center py-6 text-slate-500">No papers assigned yet.</td></tr>
              )}
              {filteredReviews.map((review) => (
                <tr key={review._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-indigo-500 block">{review.manuscriptId?.manuscriptId}</span>
                    <span className="text-sm font-semibold text-slate-800">{review.manuscriptId?.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge invitationStatus={review.invitationStatus} reviewStatus={review.reviewStatus} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Accept/Decline Logic */}
                      {review.invitationStatus === "Pending" && (
                        <>
                          <button onClick={() => handleResponse(review._id, "Accepted")} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold rounded-lg border border-emerald-200">Accept</button>
                          <button onClick={() => handleResponse(review._id, "Declined")} className="px-3 py-1.5 bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-200">Decline</button>
                        </>
                      )}
                      {/* Start Review Logic */}
                      {review.invitationStatus === "Accepted" && review.reviewStatus === "Pending" && (
                        <Link href={`/reviewer/dashboard/reviews/${review._id}`}>
                          <button className="flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold rounded-xl border border-indigo-100 transition-colors">
                            Start Review <ArrowRight className="w-4 h-4" />
                          </button>
                        </Link>
                      )}
                      {/* Completed Status Logic */}
                      {review.reviewStatus === "Completed" && (
                        <span className="text-emerald-500 font-bold flex items-center justify-end gap-1 text-sm"><CheckCircle2 className="w-4 h-4"/> Submitted</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}