"use client";
import React, { useState } from "react";
import { useGetReviewerAssignmentsQuery, useRespondToInvitationMutation } from "../../../../services/reviewerApi";
import { 
  ArrowRight, CheckCircle2, Search, ChevronLeft, ChevronRight, 
  FileText, Users, Eye, Download, Info, X, ExternalLink, Calendar 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AssignedPapers() {
  // API Queries & Mutations
  const { data, isLoading } = useGetReviewerAssignmentsQuery();
  const [respondInvitation] = useRespondToInvitationMutation();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState(null); // State to control Detail Modal
  const itemsPerPage = 5;

  // Handle Accept/Decline Invitation
  const handleResponse = async (reviewId, status) => {
    try {
      await respondInvitation({ reviewId, status }).unwrap();
      toast.success(`Invitation ${status} Successfully`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to respond");
    }
  };

  // Logic: Filter data based on search input (ID or Title)
  const filteredReviews = data?.reviews?.filter((review) =>
    review.manuscriptId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.manuscriptId?.manuscriptId?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Logic: Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reviewer Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Review assigned manuscripts and manage your invitations.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by ID or Title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all shadow-sm" 
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-600 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Manuscript Information</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentItems.length > 0 ? (
                currentItems.map((review) => (
                  <tr key={review._id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Manuscript Info & View Details Trigger */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                          {review.manuscriptId?.manuscriptId}
                        </span>
                        <p className="text-sm font-semibold text-slate-800 leading-snug max-w-md group-hover:text-orange-600 transition-colors">
                          {review.manuscriptId?.title}
                        </p>
                        <button 
                          onClick={() => setSelectedPaper(review.manuscriptId)}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-700 mt-2 transition-colors"
                        >
                          <Eye size={14} /> VIEW FULL DETAILS
                        </button>
                      </div>
                    </td>

                    {/* Status Badges */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        review.invitationStatus === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                        review.reviewStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {review.invitationStatus === 'Accepted' ? review.reviewStatus : review.invitationStatus}
                      </span>
                    </td>

                    {/* Action Buttons Logic */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        {review.invitationStatus === "Pending" && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleResponse(review._id, "Accepted")} 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleResponse(review._id, "Declined")} 
                              className="bg-white hover:bg-rose-50 text-rose-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border border-rose-200"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {review.invitationStatus === "Accepted" && review.reviewStatus === "Pending" && (
                          <Link href={`/reviewer/dashboard/reviews/${review._id}`}>
                            <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all group-hover:translate-x-[-2px]">
                              Submit Review <ArrowRight size={14} />
                            </button>
                          </Link>
                        )}

                        {review.reviewStatus === "Completed" && (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase tracking-tight">
                            <CheckCircle2 size={16} /> Review Finalized
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    No manuscripts matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <p className="text-xs text-slate-500 font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReviews.length)} of {filteredReviews.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    currentPage === idx + 1 ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MANUSCRIPT DETAIL MODAL --- */}
      {selectedPaper && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="space-y-1">
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase">
                  {selectedPaper.manuscriptId}
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight pr-8">
                  {selectedPaper.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedPaper(null)}
                className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* Grid: Type & Discipline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Discipline</p>
                  <p className="text-sm font-semibold text-slate-700">{selectedPaper.discipline}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{selectedPaper.manuscriptType}</p>
                </div>
              </div>

              {/* Abstract Section */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Info size={18} className="text-orange-500" />
                  <h4>Abstract</h4>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100 whitespace-pre-line">
                  {selectedPaper.abstract}
                </div>
              </section>

              {/* Keywords Section */}
              <section className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPaper.keywords?.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 font-medium italic">
                      #{kw.trim()}
                    </span>
                  ))}
                </div>
              </section>

              {/* Authors List */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Users size={18} className="text-orange-500" />
                  <h4>Authors Information</h4>
                </div>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Affiliation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPaper.authors?.map((author, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-semibold text-slate-700">{author.name}</td>
                          <td className="px-4 py-3 text-slate-500 underline decoration-slate-200">{author.email}</td>
                          <td className="px-4 py-3 text-slate-500">{author.affiliation || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Files Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <FileText size={18} className="text-orange-500" />
                  <h4>Manuscript Files</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPaper.files && Object.entries(selectedPaper.files).map(([key, path]) => {
                    if (!path) return null;
                    return (
                      <a 
                        key={key}
                        href={path.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/30 transition-all group shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <Download size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-[10px] text-slate-400">Click to view/download</p>
                          </div>
                        </div>
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500" />
                      </a>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedPaper(null)}
                className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Tailwind CSS for scrollbar styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

    </div>
  );
}