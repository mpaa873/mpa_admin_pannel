"use client";
import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Layers, 
  Calendar, 
  CheckCircle, 
  Archive,
  Loader2,
  X
} from "lucide-react";
import { 
  useGetAdHocIssuesQuery, 
  useCreateAdHocIssueMutation, 
  useUpdateAdHocIssueMutation, 
  useDeleteAdHocIssueMutation 
} from "../../../../services/issueApi.js";
import toast from "react-hot-toast"; 

const AddHocIssue = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: "", label: "", status: "Active" });
  const [searchTerm, setSearchTerm] = useState("");

  // RTK Query hooks
  const { data, isLoading, isError } = useGetAdHocIssuesQuery();
  const [createIssue, { isLoading: isCreating }] = useCreateAdHocIssueMutation();
  const [updateIssue, { isLoading: isUpdating }] = useUpdateAdHocIssueMutation();
  const [deleteIssue] = useDeleteAdHocIssueMutation();

  const handleOpenModal = (issue = null) => {
    if (issue) {
      setIsEditMode(true);
      setFormData({ id: issue._id, label: issue.label, status: issue.status });
    } else {
      setIsEditMode(false);
      setFormData({ id: "", label: "", status: "Active" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateIssue(formData).unwrap();
        toast.success("Issue updated successfully");
      } else {
        await createIssue({ label: formData.label }).unwrap();
        toast.success("New issue created");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await deleteIssue(id).unwrap();
        toast.success("Issue deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const filteredIssues = data?.issues?.filter(issue => 
    issue.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600" /> Ad-Hoc Issues
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage and organize your journal publication issues.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200 font-medium"
        >
          <Plus size={18} /> Add New Issue
        </button>
      </div>

      {/* Stats/Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Issues</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{data?.count || 0}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Layers size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Status</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">
                {data?.issues?.filter(i => i.status === "Active").length || 0}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={20}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Archived</p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">
              {data?.issues?.filter(i => i.status === "Archived").length || 0}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><Archive size={20}/></div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by label..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Volume & Issue</th>
                <th className="px-6 py-4 font-semibold">Label</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={32}/></td></tr>
              ) : filteredIssues?.length > 0 ? (
                filteredIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">Vol {issue.volume}</span>
                        <span className="text-xs text-slate-500 font-medium tracking-wide">Issue #{issue.issueNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{issue.label}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        issue.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${issue.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(issue)}
                          className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(issue._id)}
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400">No issues found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isEditMode ? "Edit Issue" : "Create Ad-Hoc Issue"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Issue Label / Title</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Special Issue on AI 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  value={formData.label}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                />
              </div>

              {isEditMode && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {(isCreating || isUpdating) && <Loader2 size={18} className="animate-spin" />}
                  {isEditMode ? "Update Changes" : "Create Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddHocIssue;