"use client";
import React, { useState } from "react";
import {
    Search,
    ShieldCheck,
    Key,
    User as UserIcon,
    Mail,
    Loader2,
    RefreshCcw,
    AlertCircle,
    Eye,
    EyeOff,
    UserCheck,
    UserCog,
    ChevronRight,
    Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAllUsersQuery, useChangeUserPasswordMutation } from "../../../../services/userApi";
import { toast, Toaster } from "react-hot-toast";

const CredentialManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // RTK Query hooks
    const { data, isLoading, isError, refetch } = useGetAllUsersQuery();
    const [changePassword, { isLoading: isUpdating }] = useChangeUserPasswordMutation();

    const filteredUsers = data?.user?.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const isTargetRole = ["editor", "reviewer"].includes(user.role);
        return matchesSearch && isTargetRole;
    });

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }

        try {
            await changePassword({ id: selectedUser._id, newPassword }).unwrap();
            toast.success(`Password updated for ${selectedUser.name}`);
            setIsModalOpen(false);
            setNewPassword("");
            setSelectedUser(null);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update password");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] p-4 md:p-8">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto">
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Credential Manager
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            System-wide access control for Editors and Reviewers.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Staff</p>
                            <p className="text-xl font-bold text-slate-800 leading-none">{filteredUsers?.length || 0}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
                        >
                            <RefreshCcw className={`w-5 h-5 text-slate-600 group-hover:text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* --- SEARCH & ACTIONS --- */}
                <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm mb-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, email or role..."
                            className="block w-full pl-12 pr-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- TABLE CONTENT --- */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-bottom border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Designation</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence mode="popLayout">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center">
                                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                                                <p className="mt-2 text-slate-400 font-medium">Fetching secure records...</p>
                                            </td>
                                        </tr>
                                    ) : filteredUsers?.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 leading-none mb-1">{user.name}</p>
                                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                                                                <Mail className="w-3 h-3" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-tight ${user.role === 'editor'
                                                            ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}>
                                                        {user.role === 'editor' ? <UserCog className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                        <span className="text-xs font-semibold text-slate-600">
                                                            {user.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group/btn"
                                                    >
                                                        <Key className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                                                        Reset Password
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center text-slate-400">
                                                <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                                <p className="font-medium">No matching records found</p>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- PASSWORD RESET MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative bg-white rounded-[1.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
                        >
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 leading-none">Access Control</h2>
                                        <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider">User ID: {selectedUser?._id.slice(-8)}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                                    <p className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-tight">Updating credentials for</p>
                                    <p className="text-slate-900 font-bold">{selectedUser?.name}</p>
                                    <p className="text-slate-500 text-xs font-medium">{selectedUser?.email}</p>
                                </div>

                                <form onSubmit={handlePasswordUpdate} className="space-y-5">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                                            Assign New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                autoFocus
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter at least 8 characters"
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-semibold text-sm"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 px-4 py-3.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdating}
                                            className="flex-[2] px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                                        >
                                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Change"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CredentialManagement;