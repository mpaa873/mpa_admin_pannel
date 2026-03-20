"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    MoreVertical,
    ShieldAlert,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    UserCog,
    Mail,
    Building,
    Calendar,
    AlertTriangle,
    Info
} from "lucide-react";

import {
    useGetAllUsersQuery,
    useToggleBlockMutation,
    useAssignRoleMutation,
} from "../../../../services/userApi";
import toast from "react-hot-toast";

export default function ResearcherManagement() {
    // --- API HOOKS ---
    const { data, isLoading, isError, refetch } = useGetAllUsersQuery();
    const [toggleBlock] = useToggleBlockMutation();
    const [assignRole] = useAssignRoleMutation();

    // --- LOCAL STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'blocked'
    const [currentPage, setCurrentPage] = useState(1);
    const [actionMenuOpen, setActionMenuOpen] = useState(null);

    // --- MODAL STATE ---
    // Controls the visibility and content of our custom confirmation modal
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // "block" or "promote"
        user: null, // the selected user object
    });

    const itemsPerPage = 10;

    // --- DATA PROCESSING (Filtering & Pagination) ---
    const researchers = useMemo(() => {
        if (!data?.user) return [];
        return data.user.filter((u) => u.role === "researcher");
    }, [data]);

    const filteredResearchers = useMemo(() => {
        return researchers.filter((researcher) => {
            const matchesSearch =
                researcher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                researcher.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "all"
                    ? true
                    : statusFilter === "blocked"
                        ? researcher.isBlocked
                        : !researcher.isBlocked;

            return matchesSearch && matchesStatus;
        });
    }, [researchers, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredResearchers.length / itemsPerPage);

    const paginatedResearchers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredResearchers.slice(start, start + itemsPerPage);
    }, [filteredResearchers, currentPage]);


    // --- ACTION HANDLERS ---

    // 1. Open Modal for Toggle Block
    const handleOpenBlockModal = (user) => {
        setActionMenuOpen(null); // Close dropdown
        setModalConfig({ isOpen: true, type: "block", user });
    };

    // 2. Open Modal for Promote
    const handleOpenPromoteModal = (user) => {
        setActionMenuOpen(null); // Close dropdown
        setModalConfig({ isOpen: true, type: "promote", user });
    };

    // 3. Close Modal Handler
    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, user: null });
    };

    // 4. Actual Confirmation Execution (API Calls)
    const handleConfirmAction = async () => {
        const { type, user } = modalConfig;
        if (!user) return;

        const toastId = toast.loading("Processing your request...");

        try {
            if (type === "block") {
                // Execute Block/Unblock API
                await toggleBlock(user._id).unwrap();
                toast.success(
                    user.isBlocked ? "User unblocked successfully ✅" : "User blocked successfully 🚫",
                    { id: toastId }
                );
            } else if (type === "promote") {
                // Execute Promote API
                await assignRole({ id: user._id, role: "reviewer" }).unwrap();
                toast.success("Promoted to Reviewer 🎉", { id: toastId });
                refetch(); // Refresh data to show role changes
            }
        } catch (error) {
            // Error Handling
            toast.error(
                error?.data?.message || "Action failed. Please try again ❌",
                { id: toastId }
            );
        } finally {
            closeModal(); // Close modal whether it fails or succeeds
        }
    };


    // --- UI COMPONENTS ---
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Researchers...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-sm border border-red-100 flex items-center space-x-3">
                    <ShieldAlert className="w-6 h-6" />
                    <span className="font-semibold">Failed to load data. Please refresh the page.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans relative">

            {/* MAIN CONTENT CONTAINER */}
            <div className="max-w-7xl mx-auto space-y-6">

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Researcher Management</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View, manage, and monitor all registered researchers in the system.
                        </p>
                    </div>

                    {/* STATS CARDS */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                            <div className="bg-indigo-50 p-2 rounded-md">
                                <UserCog className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                                <p className="text-lg font-bold text-gray-900">{researchers.length}</p>
                            </div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                            <div className="bg-red-50 p-2 rounded-md">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Blocked</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {researchers.filter((r) => r.isBlocked).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR: SEARCH & FILTERS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>

                    <div className="flex gap-2">
                        {["all", "active", "blocked"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors duration-200 ${statusFilter === status
                                    ? "bg-indigo-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Researcher Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedResearchers.length > 0 ? (
                                    paginatedResearchers.map((researcher) => (
                                        <tr key={researcher._id} className="hover:bg-gray-50 transition-colors duration-150 group">
                                            {/* Name & Email */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                                        {researcher.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{researcher.name}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail className="w-3 h-3" />
                                                            {researcher.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Verification */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {researcher.isVerified ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        <XCircle className="w-3.5 h-3.5" /> Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {researcher.isBlocked ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                        <ShieldAlert className="w-3.5 h-3.5" /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        <ShieldCheck className="w-3.5 h-3.5" /> Active
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {new Date(researcher.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric", month: "short", day: "numeric",
                                                    })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                                <button
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === researcher._id ? null : researcher._id)}
                                                    className="text-gray-400 hover:text-indigo-600 focus:outline-none p-2 rounded-full hover:bg-indigo-50 transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {actionMenuOpen === researcher._id && (
                                                    <div className="absolute right-8 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-10 overflow-hidden">
                                                        <button
                                                            onClick={() => handleOpenBlockModal(researcher)}
                                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${researcher.isBlocked
                                                                ? "text-green-600 hover:bg-green-50"
                                                                : "text-red-600 hover:bg-red-50"
                                                                }`}
                                                        >
                                                            {researcher.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                                            {researcher.isBlocked ? "Unblock User" : "Block User"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenPromoteModal(researcher)}
                                                            className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                                                        >
                                                            <UserCog className="w-4 h-4" />
                                                            Promote to Reviewer
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Search className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-900">No Researchers Found</p>
                                                <p className="text-sm">We couldn't find anything matching your search criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION SECTION */}
                    {totalPages > 1 && (
                        <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                                        <span className="font-semibold">
                                            {Math.min(currentPage * itemsPerPage, filteredResearchers.length)}
                                        </span>{" "}
                                        of <span className="font-semibold">{filteredResearchers.length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        {[...Array(totalPages)].map((_, index) => (
                                            <button
                                                key={index + 1}
                                                onClick={() => setCurrentPage(index + 1)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${currentPage === index + 1
                                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* OVERLAYS (Closes Dropdown when clicked outside) */}
            {actionMenuOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setActionMenuOpen(null)}
                />
            )}

            {/* ==========================================================
                BEAUTIFUL CUSTOM CONFIRMATION MODAL 
                ========================================================== */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="p-6">
                            {/* Modal Header Icon */}
                            <div className="flex items-center justify-center mb-5">
                                {modalConfig.type === "block" ? (
                                    modalConfig.user.isBlocked ? (
                                        // Unblock Icon (Green)
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <ShieldCheck className="w-8 h-8 text-green-600" />
                                        </div>
                                    ) : (
                                        // Block Icon (Red)
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-8 h-8 text-red-600" />
                                        </div>
                                    )
                                ) : (
                                    // Promote Icon (Indigo)
                                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <UserCog className="w-8 h-8 text-indigo-600" />
                                    </div>
                                )}
                            </div>

                            {/* Modal Text Content */}
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {modalConfig.type === "block"
                                        ? modalConfig.user.isBlocked
                                            ? "Unblock Researcher?"
                                            : "Block Researcher?"
                                        : "Promote to Reviewer?"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {modalConfig.type === "block"
                                        ? modalConfig.user.isBlocked
                                            ? `Are you sure you want to unblock ${modalConfig.user.name}? They will regain access to the platform.`
                                            : `Are you sure you want to block ${modalConfig.user.name}? They will lose access to the platform.`
                                        : `Are you sure you want to promote ${modalConfig.user.name} to a Reviewer? They will get higher permissions.`}
                                </p>

                                {/* Info Box */}
                                <div className="mt-4 flex items-center justify-center gap-2 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">{modalConfig.user.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / Buttons */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-4 py-2 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${modalConfig.type === "block"
                                    ? modalConfig.user.isBlocked
                                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-500" // Unblock Button
                                        : "bg-red-600 hover:bg-red-700 focus:ring-red-500"       // Block Button
                                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"  // Promote Button
                                    }`}
                            >
                                {modalConfig.type === "block"
                                    ? modalConfig.user.isBlocked
                                        ? "Yes, Unblock"
                                        : "Yes, Block"
                                    : "Yes, Promote"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}