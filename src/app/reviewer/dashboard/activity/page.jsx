"use client";
import React, { useState } from "react";
// Import API hooks from the service
import {
    useGetReviewerAssignmentsQuery,
    useRespondToInvitationMutation
} from "../../../../services/reviewerApi";
// Import icons for the UI
import {
    Bell,
    FileText,
    Clock,
    ChevronRight,
    CheckCircle,
    XCircle,
    Info,
    Calendar,
    Tag
} from "lucide-react";
import { toast } from "react-hot-toast";

const ActivityCenter = () => {
    // Fetch data from RTK Query
    const { data, isLoading } = useGetReviewerAssignmentsQuery();
    const [respondToInvitation] = useRespondToInvitationMutation();

    // State for Modal and Selection
    const [selectedManuscript, setSelectedManuscript] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const reviews = data?.reviews || [];

    // Native JS Function to show "36 mins ago" style text
    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;

        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval === 1 ? "1 min ago" : `${interval} mins ago`;

        return "Just now";
    };

    // Native JS Function to format full date
    const formatFullDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Open details modal
    const handleOpenDetails = (review) => {
        setSelectedManuscript(review);
        setIsModalOpen(true);
    };

    // Handle Accept or Decline buttons
    const handleResponse = async (reviewId, status) => {
        try {
            await respondToInvitation({ reviewId, status }).unwrap();
            toast.success(`Invitation ${status} successfully`);
            setIsModalOpen(false);
        } catch (err) {
            toast.error(err?.data?.message || "Something went wrong");
        }
    };

    // Show loading state
    if (isLoading) return <div className="p-10 text-center font-medium">Loading Activities...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/50">

            {/* Page Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Bell className="text-orange-500 w-8 h-8" />
                        Activity Center
                    </h1>
                    <p className="text-slate-500 mt-1">Stay updated with your latest peer-review assignments.</p>
                </div>
                <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                    Mark all as read
                </button>
            </div>

            {/* List of Activities/Notifications */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <Info className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">No recent activities found.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div
                            key={review._id}
                            onClick={() => handleOpenDetails(review)}
                            className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer flex items-start gap-5 relative overflow-hidden"
                        >
                            {/* Status Color Bar (Orange for Pending, Green for Accepted) */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${review.invitationStatus === 'Pending' ? 'bg-orange-500' : 'bg-green-500'}`} />

                            <div className="bg-slate-100 p-3 rounded-xl group-hover:bg-orange-50 transition-colors">
                                <FileText className="w-6 h-6 text-slate-600 group-hover:text-orange-600" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                        {review.manuscriptId?.manuscriptId || "N/A"}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {formatTimeAgo(review.createdAt)}
                                    </span>
                                </div>

                                <h3 className="font-semibold text-slate-800 text-lg group-hover:text-orange-700 transition-colors">
                                    New Assignment: {review.manuscriptId?.title}
                                </h3>

                                <p className="text-slate-500 text-sm line-clamp-1 mt-1">
                                    Invitation Status: <span className={`font-medium ${review.invitationStatus === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>
                                        {review.invitationStatus}
                                    </span>
                                </p>
                            </div>

                            <div className="self-center">
                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Popup Modal */}
            {isModalOpen && selectedManuscript && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-orange-500 p-2 rounded-lg text-white">
                                        <FileText size={20} />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        Full Submission Details
                                    </h2>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 leading-tight">
                                    {selectedManuscript.manuscriptId?.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Modal Scrollable Body Content */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Quick Info Grid (Date and ID) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                                        <Calendar size={14} /> Submission Date
                                    </div>
                                    <p className="text-slate-800 font-semibold">
                                        {formatFullDate(selectedManuscript.createdAt)}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase mb-2">
                                        <Tag size={14} /> Manuscript ID
                                    </div>
                                    <p className="text-slate-800 font-semibold">{selectedManuscript.manuscriptId?.manuscriptId}</p>
                                </div>
                            </div>

                            {/* Manuscript Abstract Section */}
                            <div>
                                <h4 className="text-slate-400 text-xs font-bold uppercase mb-3 tracking-widest flex items-center gap-2">
                                    <Info size={14} /> Abstract
                                </h4>
                                <div className="bg-orange-50/30 p-5 rounded-2xl border border-orange-100 text-slate-700 leading-relaxed italic">
                                    {selectedManuscript.manuscriptId?.abstract}
                                </div>
                            </div>

                            {/* Keywords Section (If any) */}
                            {selectedManuscript.manuscriptId?.keywords?.length > 0 && (
                                <div>
                                    <h4 className="text-slate-400 text-xs font-bold uppercase mb-3 tracking-widest flex items-center gap-2">
                                        <Tag size={14} /> Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedManuscript.manuscriptId.keywords.map((k, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Bottom Action Buttons */}
                        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3">
                            {selectedManuscript.invitationStatus === "Pending" ? (
                                <>
                                    <button
                                        onClick={() => handleResponse(selectedManuscript._id, "Accepted")}
                                        className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} /> Accept Review Invitation
                                    </button>
                                    <button
                                        onClick={() => handleResponse(selectedManuscript._id, "Declined")}
                                        className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Decline
                                    </button>
                                </>
                            ) : (
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-green-600 font-bold">
                                        <CheckCircle size={20} /> You have accepted this invitation.
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityCenter;