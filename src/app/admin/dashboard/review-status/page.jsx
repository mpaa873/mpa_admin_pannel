"use client";

import React, { useState, useMemo } from "react";
import { useGetAdminReviewTrackingQuery } from "../../../../services/reviewerApi";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Mail,
  BookOpen,
  Inbox,
  AlertCircle,
} from "lucide-react";

export default function ReviewTrackingPage() {
  // Fetch data from API
  const { data, isLoading, isError } = useGetAdminReviewTrackingQuery();

  // State for Search and Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 1. Flatten the nested JSON structure
  // The API returns manuscripts, and inside them, an array of reviewers.
  // We flatten this so each row in our table represents ONE reviewer's task.
  const allAssignments = useMemo(() => {
    if (!data?.success || !data?.reviews) return [];

    const flattenedList = [];

    data.reviews.forEach((record) => {
      const manuscript = record.manuscript || {};
      const reviewers = record.reviewers || [];

      reviewers.forEach((reviewer) => {
        flattenedList.push({
          // Create a unique ID for the React key
          uniqueId: `${record._id}-${reviewer.reviewerId}`,
          manuscriptId: manuscript.manuscriptId || "N/A",
          title: manuscript.title || "Untitled",
          manuscriptStatus: manuscript.status || "Unknown",
          reviewerName: reviewer.name || "Unknown Reviewer",
          reviewerEmail: reviewer.email || "No email provided",
          invitationStatus: reviewer.invitationStatus || "Pending",
          reviewStatus: reviewer.reviewStatus || "Pending",
          recommendation: reviewer.recommendation || null,
        });
      });
    });

    return flattenedList;
  }, [data]);

  // 2. Filter functionality: Search by Manuscript ID, Title, Reviewer Name, or Email
  const filteredReviews = useMemo(() => {
    if (!searchTerm) return allAssignments;
    const lowerSearch = searchTerm.toLowerCase();

    return allAssignments.filter((item) => {
      return (
        item.manuscriptId.toLowerCase().includes(lowerSearch) ||
        item.title.toLowerCase().includes(lowerSearch) ||
        item.reviewerName.toLowerCase().includes(lowerSearch) ||
        item.reviewerEmail.toLowerCase().includes(lowerSearch)
      );
    });
  }, [allAssignments, searchTerm]);

  // 3. Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

  // Helper function for color-coded status badges
  const getBadgeStyle = (status) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "accepted":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20";
      case "pending":
      case "editor assigned":
        return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
      case "under review":
        return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
      case "minor revisions":
      case "major revisions":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20";
    }
  };

  // Loading State UI
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Loading review records...</p>
      </div>
    );
  }

  // Error State UI
  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 max-w-md text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Connection Error</h3>
          <p className="text-slate-500 text-sm">Failed to load review tracking data. Please check your network or try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">

      {/* Page Header Area */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            Review Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">
            Monitor and manage reviewer invitations, manuscript statuses, and review recommendations in real-time.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
            placeholder="Search manuscript ID, title, reviewer..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Responsive horizontal scroll wrapper */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">

            {/* Table Headings */}
            <thead className="bg-slate-50/80 backdrop-blur-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Manuscript Details
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Reviewer Info
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Statuses
                </th>
                <th scope="col" className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Final Recommendation
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-slate-100">

              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.uniqueId} className="hover:bg-slate-50/60 transition-colors duration-200 group">

                    {/* Manuscript Column */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start">
                        <div className="mt-1 bg-indigo-50 p-2 rounded-lg mr-3 group-hover:bg-indigo-100 transition-colors">
                          <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {item.manuscriptId}
                            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getBadgeStyle(item.manuscriptStatus)}`}>
                              {item.manuscriptStatus}
                            </span>
                          </div>
                          <div className="text-sm text-slate-500 mt-1 line-clamp-2 max-w-[250px] leading-relaxed">
                            {item.title}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reviewer Column */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-start">
                        <div className="mt-1 bg-slate-100 p-2 rounded-full mr-3">
                          <User className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {item.reviewerName}
                          </div>
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Mail className="h-3 w-3 mr-1.5" />
                            {item.reviewerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider w-12">Invite</span>
                          <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${getBadgeStyle(item.invitationStatus)}`}>
                            {item.invitationStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider w-12">Review</span>
                          <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${getBadgeStyle(item.reviewStatus)}`}>
                            {item.reviewStatus}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Recommendation Column */}
                    <td className="px-6 py-5 align-top">
                      {item.recommendation ? (
                        <span className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg border ${getBadgeStyle(item.recommendation)}`}>
                          {item.recommendation}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 text-sm text-slate-400 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                          No decision yet
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                /* Empty State when search yields no results */
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <Inbox className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">No review records found</h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        We couldn't find any assignments matching your search criteria. Try adjusting your filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {filteredReviews.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* Show Results Text */}
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(indexOfLastItem, filteredReviews.length)}
              </span>{" "}
              of <span className="font-semibold text-slate-900">{filteredReviews.length}</span> results
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`inline-flex items-center px-4 py-2 border text-sm font-semibold rounded-lg transition-all
                  ${currentPage === 1
                    ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}
                `}
              >
                <ChevronLeft className="h-4 w-4 mr-1.5 -ml-1" /> Previous
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`inline-flex items-center px-4 py-2 border text-sm font-semibold rounded-lg transition-all
                  ${currentPage === totalPages
                    ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}
                `}
              >
                Next <ChevronRight className="h-4 w-4 ml-1.5 -mr-1" />
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}