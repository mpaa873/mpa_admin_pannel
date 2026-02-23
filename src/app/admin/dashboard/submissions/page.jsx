"use client";
import React, { useState } from "react";
import { 
  useGetAllSubmissionsQuery, 
  useUpdateStatusMutation, 
  useAssignEditorMutation 
} from "../../../../services/manuscriptApi";
import { 
  FileText, 
  UserCheck, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";

const AllSubmissions = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useGetAllSubmissionsQuery({ page, limit });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateStatusMutation();

  // Status colors helper
  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Under Review": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Submitted": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateStatus({ manuscriptId: id, status: newStatus }).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500">Loading Manuscripts...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manuscript Submissions</h1>
            <p className="text-gray-500 text-sm">Manage and review all submitted research papers</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Total: {data?.total || 0}</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-bottom border-gray-200">
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Manuscript ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title & Author</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Editor</th>
                  <th className="p-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Files</th>
      
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.submissions?.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm font-bold text-indigo-600">{item.manuscriptId}</span>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-semibold text-gray-800 truncate" title={item.title}>{item.title}</p>
                        <p className="text-xs text-gray-500">{item.submittedBy?.name || "Unknown Author"}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {item.assignedEditor ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                            {item.assignedEditor.name.charAt(0)}
                          </div>
                          <span>{item.assignedEditor.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not Assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <a 
                          href={item.files.manuscriptFile} 
                          target="_blank" 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Manuscript"
                        >
                          <FileText size={18} />
                        </a>
                        {item.files.coverLetter && (
                          <a 
                            href={item.files.coverLetter} 
                            target="_blank" 
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            title="Cover Letter"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing Page <span className="font-semibold">{data?.page}</span> of <span className="font-semibold">{data?.pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data?.pages, p + 1))}
                disabled={page === data?.pages}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSubmissions;