// "use client";
// import React, { useState } from "react";
// import {
//   useGetAllSubmissionsQuery,
//   useDeleteManuscriptAdminMutation,
//   useEditManuscriptAdminMutation,
//   useToggleEditorChoiceMutation,
//   useUpdatePublishedPaperIssueMutation
// } from "../../../../services/manuscriptApi";
// import toast from "react-hot-toast";
// import { Star, Route } from "lucide-react";
// import PaperTracking from "../../../../components/PaperTracking";
// import { useGetAvailableIssuesQuery } from "../../../../services/issueApi";

// // --- PROFESSIONAL SVG ICONS ---
// const EditIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//   </svg>
// );
// const TrashIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//   </svg>
// );
// const EyeIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//   </svg>
// );
// const DownloadIcon = () => (
//   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//   </svg>
// );
// const CloseIcon = () => (
//   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//   </svg>
// );

// export default function SubmissionManagement() {
//   // --- STATE MANAGEMENT ---
//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);

//   // Modal visibility states
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [deleteTargetId, setDeleteTargetId] = useState(null);
//   const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

//   const [activeTab, setActiveTab] = useState("details"); // For Edit Modal

//   // Selected Manuscript Data
//   const [selectedManuscript, setSelectedManuscript] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     discipline: "",
//     manuscriptType: "",
//     abstract: "",
//     keywords: "",
//     authors: [],
//   });
//   const [newFiles, setNewFiles] = useState({});

//   // --- API HOOKS ---
//   const { data, isLoading, isError, refetch } = useGetAllSubmissionsQuery({ page, limit });
//   const [deleteManuscript, { isLoading: isDeleting }] = useDeleteManuscriptAdminMutation();
//   const [editManuscript, { isLoading: isEditing }] = useEditManuscriptAdminMutation();
//   const [toggleEditorChoice] = useToggleEditorChoiceMutation();
//   const [updateIssue, { isLoading: isUpdatingIssue }] = useUpdatePublishedPaperIssueMutation();

//   const { data: issueData } = useGetAvailableIssuesQuery();

//   // --- HANDLERS ---

//   //Handle Toogle toggleEditorChoice
//   const handleToggleEditorChoice = async (id, currentState) => {
//     const loadingToast = toast.loading("Updating Editor Choice...");

//     try {
//       await toggleEditorChoice(id).unwrap();

//       toast.dismiss(loadingToast);

//       toast.success(
//         currentState
//           ? "Removed from Editor’s Choice"
//           : "Marked as Editor’s Choice "
//       );

//       refetch();
//     } catch (err) {
//       toast.dismiss(loadingToast);
//       toast.error(err?.data?.message || "Something went wrong");
//     }
//   };

//   // Handle View (Read-Only)
//   const handleOpenView = (manuscript) => {
//     setSelectedManuscript(manuscript);
//     setIsViewModalOpen(true);
//   };

//   const handleOpenTracking = (manuscript) => {
//     setSelectedManuscript(manuscript);
//     setIsTrackingModalOpen(true);
//   };

//   // Handle Edit (Pre-fill Form)
//   const handleOpenEdit = (manuscript) => {
//     setSelectedManuscript(manuscript);
//     setFormData({
//       title: manuscript.title || "",
//       discipline: manuscript.discipline || "",
//       manuscriptType: manuscript.manuscriptType || "Research Article",
//       abstract: manuscript.abstract || "",
//       keywords: Array.isArray(manuscript.keywords) ? manuscript.keywords.join(", ") : "",
//       authors: manuscript.authors || [],
//       volume: manuscript.volume || "",
//       issue: manuscript.issueId?._id || manuscript.issue || "",
//       issueLabel: manuscript.issueLabel || "",
//     });
//     setNewFiles({});
//     setActiveTab("details");
//     setIsEditModalOpen(true);
//   };

//   const handleDelete = async () => {
//     if (!deleteTargetId) return;
//     try {
//       await deleteManuscript(deleteTargetId).unwrap();
//       setDeleteTargetId(null);
//       refetch();
//     } catch (error) {
//       alert("Delete failed: " + (error?.data?.message || "Error"));
//     }
//   };

//   const handleSaveChanges = async (e) => {
//     e.preventDefault();
//     const loadingToast = toast.loading("Processing all updates...");

//     try {
//       // 1. Basic Metadata Update
//       const submitData = new FormData();
//       submitData.append("title", formData.title);
//       submitData.append("discipline", formData.discipline);
//       submitData.append("manuscriptType", formData.manuscriptType);
//       submitData.append("abstract", formData.abstract);
//       submitData.append("keywords", formData.keywords);
//       submitData.append("authors", JSON.stringify(formData.authors));

//       Object.keys(newFiles).forEach((key) => {
//         if (newFiles[key]) submitData.append(key, newFiles[key]);
//       });

//       await editManuscript({
//         id: selectedManuscript._id,
//         formData: submitData,
//       }).unwrap();

//       // 2. Issue/Volume Update 
//       if (selectedManuscript.status === "Published") {
//         await updateIssue({
//           manuscriptId: selectedManuscript._id,
//           issueId: formData.issue,
//         }).unwrap();
//       }

//       toast.success("Manuscript updated successfully", { id: loadingToast });
//       setIsEditModalOpen(false);
//       refetch();
//     } catch (error) {
//       toast.error(error?.data?.message || "Update failed", { id: loadingToast });
//     }
//   };

//   const getStatusColor = (status) => {
//     const s = status?.toLowerCase() || "";
//     if (s.includes("pending") || s.includes("submitted")) return "bg-amber-100 text-amber-700 border-amber-200";
//     if (s.includes("review")) return "bg-blue-100 text-blue-700 border-blue-200";
//     if (s.includes("accept") || s.includes("published")) return "bg-green-100 text-green-700 border-green-200";
//     if (s.includes("reject")) return "bg-red-100 text-red-700 border-red-200";
//     return "bg-gray-100 text-gray-700 border-gray-200";
//   };

//   if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
//   if (isError) return <div className="p-10 text-center text-red-500 font-semibold">Error loading data.</div>;

//   const submissions = data?.submissions || [];
//   const totalPages = data?.pages || 1;

//   return (
//     <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">

//       {/* Header */}
//       <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Submission Management</h1>
//           <p className="text-slate-500 mt-1">Review, manage, and edit manuscript submissions professionally.</p>
//         </div>
//         <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
//           <span className="text-sm text-slate-500">Total Submissions:</span>
//           <span className="ml-2 font-bold text-indigo-600">{data?.total || 0}</span>
//         </div>
//       </div>

//       {/* Main Table */}
//       <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
//                 <th className="px-6 py-4">Manuscript ID</th>
//                 <th className="px-6 py-4">Title</th>
//                 <th className="px-6 py-4">Submitted By</th>
//                 <th className="px-6 py-4 text-center">Status</th>
//                 <th className="px-6 py-4 text-center text-amber-600">Choice</th>
//                 <th className="px-6 py-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {submissions.map((sub) => (
//                 <tr key={sub._id} className="hover:bg-indigo-50/30 transition-colors">
//                   <td className="px-6 py-4 text-sm font-bold text-indigo-600 uppercase">{sub.manuscriptId}</td>
//                   <td className="px-6 py-4 text-sm text-slate-800 font-medium max-w-xs truncate" title={sub.title}>{sub.title}</td>
//                   <td className="px-6 py-4 text-sm text-slate-600">{sub.submittedBy?.name || "N/A"}</td>
//                   <td className="px-6 py-4 text-center">
//                     <span className={`flex items-center justify-center flex-wrap  px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(sub.status)}`}>
//                       {sub.status}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4 text-center">
//                     <button
//                       onClick={() => handleToggleEditorChoice(sub._id, sub.isEditorChoice)}
//                       disabled={sub.status !== "Published"}
//                       className={`
//       relative group inline-flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-500
//       ${sub.status !== "Published" ? "opacity-20 cursor-not-allowed" : "cursor-pointer"}
//       ${sub.isEditorChoice
//                           ? "bg-amber-50 border-amber-200 shadow-sm"
//                           : "bg-slate-50 border-transparent hover:border-slate-200"}
//       border-2
//     `}
//                       title={sub.status !== "Published" ? "Only Published manuscripts can be Editor's Choice" : "Toggle Choice"}
//                     >
//                       <Star
//                         size={18}
//                         className={`transition-all duration-500 ${sub.isEditorChoice
//                           ? "fill-amber-500 text-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
//                           : "text-slate-300 group-hover:text-slate-400"
//                           }`}
//                       />

//                       {/* Chota sa Indicator Text */}
//                       <span className={`text-[8px] mt-1 font-bold uppercase tracking-widest transition-colors ${sub.isEditorChoice ? "text-amber-700" : "text-slate-400"
//                         }`}>
//                         {sub.isEditorChoice ? "Editor's Choice" : "Mark Choice"}
//                       </span>

//                       {/* Soft Glow effect for active items */}
//                       {sub.isEditorChoice && (
//                         <span className="absolute inset-0 rounded-xl border-amber-400 animate-pulse opacity-40"></span>
//                       )}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4 text-right flex justify-end gap-2">
//                     <button
//                       onClick={() => handleOpenTracking(sub)}
//                       className="p-2 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg border border-transparent hover:border-slate-200 transition"
//                       title="Paper Tracking"
//                     >
//                       <Route size={18} />
//                     </button>
//                     <button onClick={() => handleOpenView(sub)} className="p-2 text-slate-600 hover:bg-white hover:text-indigo-600 rounded-lg border border-transparent hover:border-slate-200 transition" title="View Details">
//                       <EyeIcon />
//                     </button>
//                     <button onClick={() => handleOpenEdit(sub)} className="p-2 text-slate-600 hover:bg-white hover:text-amber-600 rounded-lg border border-transparent hover:border-slate-200 transition" title="Edit">
//                       <EditIcon />
//                     </button>
//                     <button onClick={() => setDeleteTargetId(sub._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
//                       <TrashIcon />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
//           <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
//           <div className="flex gap-2">
//             <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition">Previous</button>
//             <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-slate-100 disabled:opacity-50 transition">Next</button>
//           </div>
//         </div>
//       </div>

//       {/* --- VIEW DETAILS MODAL (READ ONLY) --- */}
//       {isViewModalOpen && selectedManuscript && (
//         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
//           <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
//             {/* Modal Header */}
//             <div className="p-6 border-b flex justify-between items-start bg-slate-50">
//               <div>
//                 <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">{selectedManuscript.manuscriptType}</span>
//                 <h2 className="text-2xl font-extrabold text-slate-800 mt-2">{selectedManuscript.title}</h2>
//                 <p className="text-sm text-slate-500 mt-1">Manuscript ID: <span className="text-indigo-600 font-mono font-bold">{selectedManuscript.manuscriptId}</span></p>
//               </div>
//               <button onClick={() => setIsViewModalOpen(false)} className="bg-white p-2 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition border border-slate-200"><CloseIcon /></button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-8 space-y-10">
//               {/* Section 1: Overview */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="md:col-span-2 space-y-6">
//                   <div>
//                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Abstract</h4>
//                     <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedManuscript.abstract}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Keywords</h4>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedManuscript.keywords?.map((kw, i) => (
//                         <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
//                           {kw.replace(/[\[\]"]/g, '')}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-6">
//                   <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
//                     <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3">Submission Info</h4>
//                     <div className="space-y-3">
//                       <div className="flex justify-between text-sm"><span className="text-slate-500">Discipline:</span><span className="font-bold text-slate-800">{selectedManuscript.discipline}</span></div>
//                       <div className="flex justify-between text-sm"><span className="text-slate-500">Status:</span><span className={`font-bold ${getStatusColor(selectedManuscript.status)} px-2 rounded`}>{selectedManuscript.status}</span></div>
//                       <div className="flex justify-between text-sm"><span className="text-slate-500">Submitted:</span><span className="text-slate-800 font-medium">{new Date(selectedManuscript.createdAt).toLocaleDateString()}</span></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Section 2: Authors */}
//               <div>
//                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Authors ({selectedManuscript.authors?.length} / 15)</h4>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {selectedManuscript.authors?.map((author, idx) => (
//                     <div key={idx} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition">
//                       <span className="text-indigo-600 font-bold text-sm">{author.name}</span>
//                       <span className="text-slate-500 text-xs">{author.email}</span>
//                       <span className="text-slate-400 text-[11px] mt-2 italic">{author.affiliation || "No Affiliation"}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Section 3: Documents */}
//               <div>
//                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Manuscript Documents</h4>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {Object.entries(selectedManuscript.files || {}).map(([key, fileData]) => {
//                     if (!fileData) return null;

//                     if (Array.isArray(fileData)) {
//                       return (
//                         <div key={key} className="col-span-full">
//                           <h3 className="text-sm font-bold text-slate-700 mb-3 capitalize">{key}</h3>
//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             {fileData.map((imgObj, index) => {
//                               const currentUrl = imgObj.url || "";
//                               const clean = currentUrl.replace(".webp.webp", ".webp").replace(".jpeg.jpg", ".jpg");

//                               return (
//                                 <div key={index} className="group relative rounded-xl overflow-hidden border shadow-sm">
//                                   <img
//                                     src={clean}
//                                     className="w-full h-32 object-cover cursor-pointer group-hover:scale-105 transition"
//                                     onClick={() => window.open(clean, "_blank")}
//                                   />
//                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-3 transition">
//                                     <a href={clean} target="_blank" className="bg-white p-2 rounded-full">👁</a>
//                                     <a href={clean} download className="bg-white p-2 rounded-full">⬇</a>
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       );
//                     }
//                     const finalUrl = fileData?.url || fileData;
//                     if (typeof finalUrl !== 'string') return null;

//                     return (
//                       <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
//                         <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
//                         <a href={finalUrl} target="_blank" className="p-2 bg-white border rounded-lg hover:text-indigo-600 transition">
//                           👁 View File
//                         </a>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 border-t bg-white flex justify-end">
//               <button onClick={() => setIsViewModalOpen(false)} className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition shadow-lg shadow-slate-200">Close Viewer</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isEditModalOpen && selectedManuscript && (
//         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-center p-4 z-50 font-sans">
//           <div className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">

//             {/* Modern Header */}
//             <div className="p-6 border-b flex justify-between items-center bg-white">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
//                   <EditIcon />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-extrabold text-slate-800">Review & Edit Submission</h2>
//                   <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-[0.2em]">{selectedManuscript.manuscriptId}</p>
//                 </div>
//               </div>
//               <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100">
//                 <CloseIcon />
//               </button>
//             </div>

//             {/* Professional Tab Bar */}
//             <div className="flex bg-slate-50/50 px-8 border-b gap-4">
//               {[
//                 { id: 'details', label: '1. Core Details' },
//                 { id: 'publication', label: '2. Archive info', show: selectedManuscript.status === "Published" },
//                 { id: 'authors', label: '3. Authors List' },
//                 { id: 'documents', label: '4. File Assets' }
//               ].map(t => (
//                 (t.show !== false) && (
//                   <button
//                     key={t.id}
//                     onClick={() => setActiveTab(t.id)}
//                     className={`px-4 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === t.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
//                       }`}
//                   >
//                     {t.label}
//                     {activeTab === t.id && <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></span>}
//                   </button>
//                 )
//               ))}
//             </div>

//             <form id="editForm" onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">

//               {/* TAB: CORE DETAILS */}
//               {activeTab === 'details' && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
//                   <div className="md:col-span-2">
//                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Full Research Title</label>
//                     <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700 shadow-sm" />
//                   </div>
//                   <div>
//                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Academic Discipline</label>
//                     <input type="text" required value={formData.discipline} onChange={e => setFormData({ ...formData, discipline: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-semibold" />
//                   </div>
//                   <div>
//                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Article Format</label>
//                     <select value={formData.manuscriptType} onChange={e => setFormData({ ...formData, manuscriptType: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-semibold appearance-none">
//                       <option value="Research Article">Research Article</option>
//                       <option value="Review Article">Review Article</option>
//                       <option value="Mini Review">Mini Review</option>
//                       <option value="Systematic Review">Systematic Review</option>
//                       <option value="Short Communication">Short Communication</option>
//                       <option value="Case Report">Case Report</option>
//                       <option value="Editorial">Editorial</option>
//                     </select>
//                   </div>
//                   <div className="md:col-span-2">
//                     <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Abstract Summary</label>
//                     <textarea rows="6" value={formData.abstract} onChange={e => setFormData({ ...formData, abstract: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium text-slate-600 leading-relaxed resize-none shadow-sm" />
//                   </div>
//                 </div>
//               )}

//               {/* TAB: PUBLICATION (ISSUE/VOLUME) */}
//               {/* TAB: PUBLICATION (ISSUE/VOLUME) */}
//               {activeTab === 'publication' && (
//                 <div className="max-w-2xl space-y-6 animate-fade-in">
//                   <div className="p-8 bg-slate-50 border border-slate-200 rounded-[32px] shadow-sm">
//                     <div className="mb-8">
//                       <h4 className="text-lg font-bold text-slate-800 mb-1">Citation Settings</h4>
//                       <p className="text-xs text-slate-500 leading-relaxed">
//                         Manually override the volume and issue details below. These changes will update the article's live metadata and indexing information.
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Volume Number</label>
//                         <input
//                           type="number"
//                           value={formData.volume}
//                           onChange={e => setFormData({ ...formData, volume: e.target.value })}
//                           className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700 shadow-sm"
//                           placeholder="e.g. 1"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">
//                           Issue Number
//                         </label>

//                         <select
//                           value={formData.issue}
//                           onChange={(e) => {
//                             const selectedValue = e.target.value;

//                             const selectedIssue =
//                               issueData?.regularIssues?.find(
//                                 (item) => String(item.issueNumber) === selectedValue
//                               ) ||
//                               issueData?.adHocIssues?.find(
//                                 (item) => item._id === selectedValue
//                               );

//                             setFormData({
//                               ...formData,
//                               issue: selectedValue,
//                               issueLabel: selectedIssue?.label || "",
//                             });
//                           }}
//                           className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700 shadow-sm"
//                         >
//                           <option value="">Select Issue</option>

//                           {issueData?.regularIssues?.map((item) => (
//                             <option
//                               key={item.issueNumber}
//                               value={item.issueNumber}
//                             >
//                               Issue {item.issueNumber} ({item.label})
//                             </option>
//                           ))}

//                           {issueData?.adHocIssues?.map((item) => (
//                             <option
//                               key={item._id}
//                               value={item._id}
//                             >
//                               Special Issue {item.issueNumber} ({item.label})
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div className="md:col-span-2">
//                         <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Issue Label (Period)</label>
//                         <input
//                           type="text"
//                           value={formData.issueLabel}
//                           readOnly
//                           className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-semibold text-slate-700 shadow-sm"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* TAB: AUTHORS */}
//               {activeTab === 'authors' && (
//                 <div className="space-y-6 animate-fade-in">
//                   <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
//                     <h3 className="text-slate-800 font-extrabold px-2">Author Registry</h3>
//                     <button type="button" onClick={() => setFormData({ ...formData, authors: [...formData.authors, { name: '', email: '', affiliation: '' }] })} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900 transition">+ Add Author</button>
//                   </div>
//                   <div className="grid grid-cols-1 gap-4">
//                     {formData.authors.map((auth, idx) => (
//                       <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col md:flex-row gap-4 relative shadow-sm hover:shadow-md transition-shadow group">
//                         <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                           <input type="text" placeholder="Full Name" value={auth.name} onChange={e => {
//                             const updated = formData.authors.map((a, i) => i === idx ? { ...a, name: e.target.value } : a);
//                             setFormData({ ...formData, authors: updated });
//                           }} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition" />

//                           <input type="email" placeholder="Email" value={auth.email} onChange={e => {
//                             const updated = formData.authors.map((a, i) => i === idx ? { ...a, email: e.target.value } : a);
//                             setFormData({ ...formData, authors: updated });
//                           }} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition" />

//                           <input type="text" placeholder="Affiliation" value={auth.affiliation} onChange={e => {
//                             const updated = formData.authors.map((a, i) => i === idx ? { ...a, affiliation: e.target.value } : a);
//                             setFormData({ ...formData, authors: updated });
//                           }} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none transition" />
//                         </div>
//                         <button type="button" onClick={() => setFormData({ ...formData, authors: formData.authors.filter((_, i) => i !== idx) })} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition self-center"><TrashIcon /></button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* TAB: DOCUMENTS */}
//               {activeTab === 'documents' && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
//                   {["manuscriptFile", "coverLetter", "ethicalDeclaration", "aiReport", "figures", "tables"].map((fileKey) => (
//                     <div key={fileKey} className="p-8 border border-slate-100 rounded-[32px] bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
//                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{fileKey.replace(/([A-Z])/g, ' $1')}</label>
//                       <div className="flex flex-col gap-4">
//                         <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-4 py-2 rounded-lg flex items-center justify-between">
//                           <span className="truncate max-w-[200px]">
//                             {(() => {
//                               const f = selectedManuscript.files?.[fileKey];
//                               if (!f) return "No file selected";
//                               return Array.isArray(f) ? `${f.length} attachments` : "Current file active";
//                             })()}
//                           </span>
//                           <span className="uppercase text-[9px] tracking-tighter">Current</span>
//                         </div>
//                         <input type="file" onChange={e => setNewFiles({ ...newFiles, [fileKey]: e.target.files[0] })} className="text-[11px] file:bg-white file:text-indigo-600 file:border file:border-indigo-100 file:px-5 file:py-2.5 file:rounded-xl file:font-black hover:file:bg-indigo-600 hover:file:text-white cursor-pointer transition-all" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </form>

//             {/* Modern Footer */}
//             <div className="p-8 border-t flex justify-end gap-4 bg-slate-50/80 backdrop-blur-md">
//               <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-10 py-4 rounded-2xl border border-slate-200 font-bold text-slate-400 hover:bg-white hover:text-slate-600 transition active:scale-95">Discard Changes</button>
//               <button type="submit" form="editForm" disabled={isEditing || isUpdatingIssue} className="px-12 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wider text-xs hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-3">
//                 {isEditing || isUpdatingIssue ? (
//                   <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> Finalizing...</>
//                 ) : "Confirm & Save Updates"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isTrackingModalOpen && selectedManuscript && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4">

//           <div className="bg-white w-full max-w-7xl h-[95vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">

//             {/* Header */}
//             <div className=" p-6 border-b flex justify-between items-center">

//               <div>
//                 <h2 className="text-2xl font-bold text-slate-800">
//                   Paper Tracking
//                 </h2>

//                 <p className="text-slate-500 text-sm">
//                   {selectedManuscript.manuscriptId}
//                 </p>
//               </div>

//               <button
//                 onClick={() => setIsTrackingModalOpen(false)}
//                 className="p-2 rounded-full hover:bg-red-50 hover:text-red-500"
//               >
//                 <CloseIcon />
//               </button>

//             </div>

//             {/* Body */}
//             <div className="flex-1 overflow-y-auto p-8 bg-slate-50">

//               <PaperTracking
//                 manuscriptId={selectedManuscript._id}
//                 currentStatus={selectedManuscript.status}
//               />

//             </div>

//           </div>

//         </div>
//       )}

//       {/* --- DELETE CONFIRMATION --- */}
//       {deleteTargetId && (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[70]">
//           <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
//             <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><TrashIcon /></div>
//             <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Manuscript?</h3>
//             <p className="text-slate-500 text-sm mb-6">This will permanently remove the submission and all uploaded files. This action is irreversible.</p>
//             <div className="flex gap-3">
//               <button onClick={() => setDeleteTargetId(null)} className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
//               <button
//                 onClick={handleDelete}
//                 disabled={isDeleting}
//                 className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {isDeleting ? (
//                   <>
//                     <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
//                     Deleting...
//                   </>
//                 ) : (
//                   "Delete"
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




























































"use client";
import React, { useState } from "react";
import {
  useGetAllSubmissionsQuery,
  useDeleteManuscriptAdminMutation,
  useEditManuscriptAdminMutation,
  useToggleEditorChoiceMutation,
  useUpdatePublishedPaperIssueMutation,
} from "../../../../services/manuscriptApi";
import toast from "react-hot-toast";
import { Star, Route } from "lucide-react";
import PaperTracking from "../../../../components/PaperTracking";
import { useGetAvailableIssuesQuery } from "../../../../services/issueApi";

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);
const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ─── FILE LABEL MAP ───────────────────────────────────────────────────────────
const FILE_LABELS = {
  manuscriptFile: "Manuscript File",
  coverLetter: "Cover Letter",
  ethicalDeclaration: "Ethical Declaration",
  aiReport: "AI Report",
  figures: "Figures",
  tables: "Tables",
  reviewChecklist: "Review Checklist",
};

const FILE_ICONS = {
  manuscriptFile: "📄",
  coverLetter: "✉️",
  ethicalDeclaration: "📋",
  aiReport: "🤖",
  figures: "🖼️",
  tables: "📊",
  reviewChecklist: "✅",
};

// ─── FILE VIEWER MODAL ────────────────────────────────────────────────────────
const FileViewerModal = ({ url, label, onClose }) => {
  const isPdf = url?.toLowerCase().includes(".pdf") || url?.includes("cloudinary") && !url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isImage = url?.match(/\.(jpg|jpeg|png|gif|webp)/i) || url?.includes("/image/upload/");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col z-[200]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <FileIcon />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{label}</p>
            <p className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">{url?.split("/").pop()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
          >
            <ExternalLinkIcon />
            Open in Tab
          </a>
          <a
            href={url}
            download
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition"
          >
            ⬇ Download
          </a>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-slate-950">
        {isImage ? (
          <div className="h-full flex items-center justify-center p-8">
            <img
              src={url}
              alt={label}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        ) : (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-full border-none"
            title={label}
          />
        )}
      </div>
    </div>
  );
};

// ─── FILE CARD (used in Edit Modal) ──────────────────────────────────────────
const FileCard = ({ fileKey, fileData, newFile, onFileChange }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const label = FILE_LABELS[fileKey] || fileKey;
  const emoji = FILE_ICONS[fileKey] || "📎";

  const hasExisting = fileData && (fileData.url || typeof fileData === "string");
  const existingUrl = typeof fileData === "string" ? fileData : fileData?.url;
  const isArray = Array.isArray(fileData);

  return (
    <>
      {viewerOpen && existingUrl && (
        <FileViewerModal url={existingUrl} label={label} onClose={() => setViewerOpen(false)} />
      )}

      <div className="group relative p-6 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-lg border border-slate-100">
              {emoji}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{label}</p>
              {isArray ? (
                <p className="text-[11px] text-slate-400 mt-0.5">{fileData.length} file(s) uploaded</p>
              ) : hasExisting ? (
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <CheckIcon /> File present
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">No file uploaded</p>
              )}
            </div>
          </div>

          {/* View existing file */}
          {hasExisting && !isArray && existingUrl && (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-wider transition"
            >
              <EyeIcon /> View
            </button>
          )}
        </div>

        {/* Array files (figures) */}
        {isArray && fileData.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {fileData.map((fig, i) => {
              const fUrl = fig?.url || fig;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => window.open(fUrl, "_blank")}
                  className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 hover:border-indigo-300 transition group/fig"
                >
                  <img src={fUrl} alt={`Figure ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/fig:opacity-100 flex items-center justify-center transition">
                    <EyeIcon />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Replace file zone */}
        <div className={`relative border-2 border-dashed rounded-2xl transition-all ${newFile ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30"}`}>
          <input
            type="file"
            onChange={(e) => onFileChange(fileKey, e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />
          <div className="flex flex-col items-center justify-center py-5 px-4 pointer-events-none">
            {newFile ? (
              <>
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckIcon />
                </div>
                <p className="text-emerald-700 text-xs font-bold text-center truncate max-w-full">{newFile.name}</p>
                <p className="text-emerald-500 text-[10px] mt-0.5">{(newFile.size / 1024).toFixed(1)} KB · Ready to upload</p>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mb-2 text-slate-500">
                  <UploadIcon />
                </div>
                <p className="text-slate-500 text-xs font-semibold">{hasExisting ? "Replace file" : "Upload file"}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">Click or drag & drop</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── STATUS COLOR ─────────────────────────────────────────────────────────────
const getStatusColor = (status) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("pending") || s.includes("submitted")) return "bg-amber-100 text-amber-700 border-amber-200";
  if (s.includes("review")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("accept") || s.includes("published")) return "bg-green-100 text-green-700 border-green-200";
  if (s.includes("reject")) return "bg-red-100 text-red-700 border-red-200";
  if (s.includes("revision")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (s.includes("approved")) return "bg-teal-100 text-teal-700 border-teal-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SubmissionManagement() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [formData, setFormData] = useState({
    title: "", discipline: "", manuscriptType: "", abstract: "",
    keywords: "", authors: [], volume: "", issue: "", issueLabel: "",
  });
  const [newFiles, setNewFiles] = useState({});

  // API hooks
  const { data, isLoading, isError, refetch } = useGetAllSubmissionsQuery({ page, limit });
  const [deleteManuscript, { isLoading: isDeleting }] = useDeleteManuscriptAdminMutation();
  const [editManuscript, { isLoading: isEditing }] = useEditManuscriptAdminMutation();
  const [toggleEditorChoice] = useToggleEditorChoiceMutation();
  const [updateIssue, { isLoading: isUpdatingIssue }] = useUpdatePublishedPaperIssueMutation();
  const { data: issueData } = useGetAvailableIssuesQuery();

  // ─── HANDLERS ───────────────────────────────────────────────────────────────
  const handleToggleEditorChoice = async (id, currentState) => {
    const tid = toast.loading("Updating editor choice…");
    try {
      await toggleEditorChoice(id).unwrap();
      toast.success(
        currentState ? "Removed from Editor's Choice" : "Marked as Editor's Choice ⭐",
        { id: tid }
      );
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong", { id: tid });
    }
  };

  const handleOpenView = (manuscript) => {
    setSelectedManuscript(manuscript);
    setIsViewModalOpen(true);
  };

  const handleOpenTracking = (manuscript) => {
    setSelectedManuscript(manuscript);
    setIsTrackingModalOpen(true);
  };

  const handleOpenEdit = (manuscript) => {
    setSelectedManuscript(manuscript);
    setFormData({
      title: manuscript.title || "",
      discipline: manuscript.discipline || "",
      manuscriptType: manuscript.manuscriptType || "Research Article",
      abstract: manuscript.abstract || "",
      keywords: Array.isArray(manuscript.keywords)
        ? manuscript.keywords.map((k) => k.replace(/[\[\]"]/g, "")).join(", ")
        : "",
      authors: manuscript.authors || [],
      volume: manuscript.volume || "",
      issue: manuscript.issueId?._id || manuscript.issue || "",
      issueLabel: manuscript.issueLabel || "",
    });
    setNewFiles({});
    setActiveTab("details");
    setIsEditModalOpen(true);
  };

  const handleFileChange = (key, file) => {
    setNewFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const tid = toast.loading("Deleting manuscript…");
    try {
      await deleteManuscript(deleteTargetId).unwrap();
      toast.success("Manuscript deleted permanently", { id: tid });
      setDeleteTargetId(null);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Delete failed", { id: tid });
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Title is required");
    if (!formData.discipline.trim()) return toast.error("Discipline is required");
    if (formData.authors.length === 0) return toast.error("At least one author is required");

    const tid = toast.loading("Saving all changes…");
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("discipline", formData.discipline);
      submitData.append("manuscriptType", formData.manuscriptType);
      submitData.append("abstract", formData.abstract);
      submitData.append("keywords", formData.keywords);
      submitData.append("authors", JSON.stringify(formData.authors));

      Object.keys(newFiles).forEach((key) => {
        if (newFiles[key]) submitData.append(key, newFiles[key]);
      });

      await editManuscript({ id: selectedManuscript._id, formData: submitData }).unwrap();

      if (selectedManuscript.status === "Published" && formData.issue) {
        await updateIssue({
          manuscriptId: selectedManuscript._id,
          issueId: formData.issue,
        }).unwrap();
      }

      toast.success("Manuscript updated successfully", { id: tid });
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Update failed", { id: tid });
    }
  };

  // ─── LOADING / ERROR ─────────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="text-slate-500 text-sm font-medium">Loading submissions…</p>
      </div>
    );
  if (isError)
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-semibold text-lg">Failed to load submissions</p>
        <button onClick={refetch} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition">
          Retry
        </button>
      </div>
    );

  const submissions = data?.submissions || [];
  const totalPages = data?.pages || 1;

  // ─── TAB CONFIG ──────────────────────────────────────────────────────────────
  const tabs = [
    { id: "details", label: "Core Details" },
    ...(selectedManuscript?.status === "Published" ? [{ id: "publication", label: "Archive Info" }] : []),
    { id: "authors", label: "Authors" },
    { id: "documents", label: "File Assets" },
  ];

  return (
    <div className="p-6 md:p-10 bg-slate-50 min-h-screen font-sans">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Submission Management</h1>
          <p className="text-slate-500 mt-1">Review, manage, and edit manuscript submissions.</p>
        </div>
        <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
          <span className="text-sm text-slate-500">Total Submissions</span>
          <span className="font-black text-indigo-600 text-lg">{data?.total || 0}</span>
        </div>
      </div>

      {/* ── Main Table ── */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Manuscript ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Submitted By</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center text-amber-500">Choice</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-indigo-600 uppercase font-mono">{sub.manuscriptId}</td>
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium max-w-xs truncate" title={sub.title}>{sub.title}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sub.submittedBy?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleEditorChoice(sub._id, sub.isEditorChoice)}
                        disabled={sub.status !== "Published"}
                        title={sub.status !== "Published" ? "Only published papers can be Editor's Choice" : "Toggle Editor's Choice"}
                        className={`relative group inline-flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 border-2
                          ${sub.status !== "Published" ? "opacity-25 cursor-not-allowed border-transparent" : "cursor-pointer"}
                          ${sub.isEditorChoice ? "bg-amber-50 border-amber-200 shadow-sm" : "bg-slate-50 border-transparent hover:border-slate-200"}`}
                      >
                        <Star
                          size={18}
                          className={`transition-all duration-300 ${sub.isEditorChoice
                            ? "fill-amber-500 text-amber-500 scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                            : "text-slate-300 group-hover:text-slate-400"}`}
                        />
                        <span className={`text-[8px] mt-1 font-black uppercase tracking-widest ${sub.isEditorChoice ? "text-amber-700" : "text-slate-400"}`}>
                          {sub.isEditorChoice ? "Choice" : "Mark"}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenTracking(sub)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Track Paper"
                        >
                          <Route size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenView(sub)}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Details"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(sub._id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-bold text-slate-700">{page}</span> of{" "}
            <span className="font-bold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          VIEW MODAL
      ══════════════════════════════════════════ */}
      {isViewModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-start bg-slate-50">
              <div>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">
                  {selectedManuscript.manuscriptType}
                </span>
                <h2 className="text-xl font-extrabold text-slate-800 mt-2 leading-snug max-w-2xl">
                  {selectedManuscript.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  ID: <span className="text-indigo-600 font-mono font-bold">{selectedManuscript.manuscriptId}</span>
                </p>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition border border-slate-200"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Abstract</h4>
                    <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedManuscript.abstract}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedManuscript.keywords?.map((kw, i) => (
                        <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                          {kw.replace(/[\[\]"]/g, "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 h-fit">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3">Submission Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Discipline</span>
                      <span className="font-bold text-slate-800">{selectedManuscript.discipline}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Status</span>
                      <span className={`font-bold px-2 rounded text-xs ${getStatusColor(selectedManuscript.status)}`}>
                        {selectedManuscript.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Submitted</span>
                      <span className="text-slate-800 font-medium">
                        {new Date(selectedManuscript.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedManuscript.volume && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Vol/Issue</span>
                        <span className="text-slate-800 font-bold">{selectedManuscript.volume}.{selectedManuscript.issue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Authors */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Authors ({selectedManuscript.authors?.length} / 15)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedManuscript.authors?.map((author, idx) => (
                    <div key={idx} className="flex flex-col p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition">
                      <span className="text-indigo-600 font-bold text-sm">{author.name}</span>
                      <span className="text-slate-500 text-xs mt-0.5">{author.email}</span>
                      <span className="text-slate-400 text-[11px] mt-2 italic">{author.affiliation || "No affiliation"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Manuscript Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedManuscript.files || {}).map(([key, fileData]) => {
                    if (!fileData) return null;
                    if (Array.isArray(fileData)) {
                      return (
                        <div key={key} className="col-span-full">
                          <p className="text-sm font-bold text-slate-700 mb-3 capitalize">{FILE_LABELS[key] || key}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {fileData.map((imgObj, index) => {
                              const fUrl = (imgObj?.url || imgObj || "").replace(".webp.webp", ".webp");
                              return (
                                <div key={index} className="group relative rounded-xl overflow-hidden border shadow-sm aspect-square">
                                  <img src={fUrl} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-3 transition">
                                    <a href={fUrl} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-full text-sm">👁</a>
                                    <a href={fUrl} download className="bg-white p-2 rounded-full text-sm">⬇</a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    const finalUrl = fileData?.url || (typeof fileData === "string" ? fileData : null);
                    if (!finalUrl) return null;
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{FILE_ICONS[key] || "📎"}</span>
                          <span className="text-sm font-semibold text-slate-700">{FILE_LABELS[key] || key}</span>
                        </div>
                        <a href={finalUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition">
                          <EyeIcon /> View
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════ */}
      {isEditModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex justify-center items-center p-4 z-50">
          <div className="bg-white w-full max-w-5xl rounded-[28px] shadow-2xl h-[92vh] flex flex-col overflow-hidden border border-slate-100">

            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                  <EditIcon />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">Edit Manuscript</h2>
                  <p className="text-[11px] text-slate-400 font-mono font-bold tracking-[0.2em] uppercase">
                    {selectedManuscript.manuscriptId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex bg-slate-50 border-b border-slate-100 px-6 gap-1 overflow-x-auto">
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`relative flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all
                    ${activeTab === t.id ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black
                    ${activeTab === t.id ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {i + 1}
                  </span>
                  {t.label}
                  {activeTab === t.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Form */}
            <form id="editForm" onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto bg-white">
              <div className="p-8 space-y-8">

                {/* ── TAB: CORE DETAILS ── */}
                {activeTab === "details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Research Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold text-slate-700"
                        placeholder="Enter full research title…"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Discipline *</label>
                      <input
                        type="text"
                        required
                        value={formData.discipline}
                        onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold text-slate-700"
                        placeholder="e.g. Pharmacology"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Article Type *</label>
                      <select
                        value={formData.manuscriptType}
                        onChange={(e) => setFormData({ ...formData, manuscriptType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold text-slate-700 appearance-none"
                      >
                        {["Research Article", "Review Article", "Mini Review", "Systematic Review", "Short Communication", "Case Report", "Editorial"].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Abstract</label>
                      <textarea
                        rows={7}
                        value={formData.abstract}
                        onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium text-slate-600 leading-relaxed resize-none"
                        placeholder="Enter abstract…"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Keywords</label>
                      <input
                        type="text"
                        value={formData.keywords}
                        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-medium text-slate-700"
                        placeholder="Comma-separated keywords…"
                      />
                      <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Separate keywords with commas</p>
                    </div>
                  </div>
                )}

                {/* ── TAB: PUBLICATION ── */}
                {activeTab === "publication" && (
                  <div className="max-w-2xl space-y-6">
                    <div className="p-7 bg-slate-50 border border-slate-200 rounded-3xl">
                      <h4 className="text-base font-extrabold text-slate-800 mb-1">Citation Settings</h4>
                      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                        Override volume and issue assignment for this published article. Changes update live metadata.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume Number</label>
                          <input
                            type="number"
                            value={formData.volume}
                            onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold text-slate-700"
                            placeholder="e.g. 1"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue</label>
                          <select
                            value={formData.issue}
                            onChange={(e) => {
                              const val = e.target.value;
                              const found =
                                issueData?.regularIssues?.find((i) => String(i.issueNumber) === val) ||
                                issueData?.adHocIssues?.find((i) => i._id === val);
                              setFormData({ ...formData, issue: val, issueLabel: found?.label || "" });
                            }}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition font-semibold text-slate-700 appearance-none"
                          >
                            <option value="">Select Issue</option>
                            {issueData?.regularIssues?.map((item) => (
                              <option key={item.issueNumber} value={item.issueNumber}>
                                Issue {item.issueNumber} ({item.label})
                              </option>
                            ))}
                            {issueData?.adHocIssues?.map((item) => (
                              <option key={item._id} value={item._id}>
                                Special Issue {item.issueNumber} ({item.label})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue Period Label</label>
                          <input
                            type="text"
                            readOnly
                            value={formData.issueLabel}
                            className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 outline-none font-semibold text-slate-500 cursor-not-allowed"
                            placeholder="Auto-filled when issue is selected"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB: AUTHORS ── */}
                {activeTab === "authors" && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-slate-800 font-extrabold">Author Registry</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{formData.authors.length} of 15 authors</p>
                      </div>
                      <button
                        type="button"
                        disabled={formData.authors.length >= 15}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            authors: [...formData.authors, { name: "", email: "", affiliation: "" }],
                          })
                        }
                        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900 transition disabled:opacity-40"
                      >
                        + Add Author
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.authors.map((auth, idx) => (
                        <div
                          key={idx}
                          className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row gap-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="w-7 h-7 shrink-0 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-black">
                            {idx + 1}
                          </div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Full Name"
                              value={auth.name}
                              onChange={(e) => {
                                const updated = formData.authors.map((a, i) => i === idx ? { ...a, name: e.target.value } : a);
                                setFormData({ ...formData, authors: updated });
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-400 outline-none transition"
                            />
                            <input
                              type="email"
                              placeholder="Email"
                              value={auth.email}
                              onChange={(e) => {
                                const updated = formData.authors.map((a, i) => i === idx ? { ...a, email: e.target.value } : a);
                                setFormData({ ...formData, authors: updated });
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-400 outline-none transition"
                            />
                            <input
                              type="text"
                              placeholder="Affiliation"
                              value={auth.affiliation}
                              onChange={(e) => {
                                const updated = formData.authors.map((a, i) => i === idx ? { ...a, affiliation: e.target.value } : a);
                                setFormData({ ...formData, authors: updated });
                              }}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-indigo-400 outline-none transition"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, authors: formData.authors.filter((_, i) => i !== idx) })
                            }
                            className="p-2.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition self-start md:self-center"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ))}
                      {formData.authors.length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl">
                          No authors added yet. Click "Add Author" to begin.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB: DOCUMENTS (with inline viewer) ── */}
                {activeTab === "documents" && (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-slate-800 font-extrabold">File Assets</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Click <span className="font-bold text-indigo-600">View</span> to preview existing files, or upload a replacement.
                        </p>
                      </div>
                      {Object.keys(newFiles).filter((k) => newFiles[k]).length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <CheckIcon />
                          <span className="text-xs font-bold text-emerald-700">
                            {Object.keys(newFiles).filter((k) => newFiles[k]).length} file(s) queued
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["manuscriptFile", "coverLetter", "ethicalDeclaration", "aiReport", "figures", "tables"].map((fileKey) => (
                        <FileCard
                          key={fileKey}
                          fileKey={fileKey}
                          fileData={selectedManuscript.files?.[fileKey]}
                          newFile={newFiles[fileKey]}
                          onFileChange={handleFileChange}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex justify-between items-center bg-slate-50/80">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3 rounded-2xl border border-slate-200 font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition"
              >
                Discard
              </button>
              <div className="flex items-center gap-3">
                {/* Tab navigation helpers */}
                {tabs.findIndex((t) => t.id === activeTab) > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = tabs.findIndex((t) => t.id === activeTab);
                      setActiveTab(tabs[idx - 1].id);
                    }}
                    className="px-5 py-3 rounded-2xl border border-slate-200 font-bold text-slate-500 hover:bg-white transition text-sm"
                  >
                    ← Back
                  </button>
                )}
                {tabs.findIndex((t) => t.id === activeTab) < tabs.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const idx = tabs.findIndex((t) => t.id === activeTab);
                      setActiveTab(tabs[idx + 1].id);
                    }}
                    className="px-8 py-3 rounded-2xl bg-slate-800 text-white font-black uppercase tracking-wider text-xs hover:bg-slate-900 transition"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    form="editForm"
                    disabled={isEditing || isUpdatingIssue}
                    className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-wider text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isEditing || isUpdatingIssue ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TRACKING MODAL
      ══════════════════════════════════════════ */}
      {isTrackingModalOpen && selectedManuscript && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[80] p-4">
          <div className="bg-white w-full max-w-7xl h-[95vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Paper Tracking</h2>
                <p className="text-slate-500 text-sm">{selectedManuscript.manuscriptId}</p>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              <PaperTracking
                manuscriptId={selectedManuscript._id}
                currentStatus={selectedManuscript.status}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════════ */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-[70]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center mx-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrashIcon />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Manuscript?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              This will permanently remove the submission and all associated files. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Deleting…
                  </>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}