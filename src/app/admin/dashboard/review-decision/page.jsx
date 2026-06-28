// "use client";

// import React, { useState, useEffect } from "react";
// import { useGetAdminReviewTrackingQuery, useGetEligibleReviewersQuery } from "../../../../services/reviewerApi";
// import { useUpdateSubmissionStatusMutation, useAssignReviewersMutation } from "../../../../services/manuscriptApi";
// import * as Icons from "lucide-react";
// import { Loader2 } from "lucide-react";
// import { useGetAvailableIssuesQuery } from "../../../../services/issueApi";
// import toast from "react-hot-toast";

// export default function AdminReviewTracking() {
//   // 1. States to handle Modal and Form Data
//   const [selectedManuscript, setSelectedManuscript] = useState(null);
//   const [actionData, setActionData] = useState({ status: "", feedback: "", file: null, publishDate: "" });
//   const [selectedReviewers, setSelectedReviewers] = useState([]);

//   const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
//   const [publishPreview, setPublishPreview] = useState({ vol: 0, iss: 0, label: "" });

//   const [selectedIssueId, setSelectedIssueId] = useState("");

//   // Check if the current paper is already Published or Rejected to lock editing
//   const isFinalized = ["Published", "Rejected"].includes(selectedManuscript?.manuscript?.status);

//   // 2. Fetch tracking data from backend
//   const { data, isLoading, refetch } = useGetAdminReviewTrackingQuery();


//   const {
//     data: reviewerOptionsData,
//     isLoading: isReviewersLoading,
//   } = useGetEligibleReviewersQuery(selectedManuscript?.manuscript?._id, {
//     skip: !selectedManuscript?.manuscript?._id,
//   });

//   const {
//     data: availableIssuesData,
//   } = useGetAvailableIssuesQuery();

//   // 3. Mutations for actions
//   const [updateStatus, { isLoading: isUpdating }] = useUpdateSubmissionStatusMutation();
//   const [assignReviewers, { isLoading: isAssigning }] = useAssignReviewersMutation();

//   // 4. Keep the selected manuscript updated automatically when data refreshes
//   useEffect(() => {
//     if (selectedManuscript && data?.reviews) {
//       const updatedItem = data.reviews.find(
//         (item) => item.manuscript._id === selectedManuscript.manuscript._id
//       );
//       if (updatedItem) setSelectedManuscript(updatedItem);
//     }
//   }, [data]);

//   useEffect(() => {
//     setSelectedReviewers([]);
//   }, [selectedManuscript?.manuscript?._id]);

//   // Show loading screen while fetching data
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
//         <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
//         <p className="font-medium text-lg">Loading Review Details...</p>
//       </div>
//     );
//   }

//   // 5. Calculate if Admin is allowed to Accept/Publish (Minimum 2 "Accept" Recommendations)
//   const totalCompletedReviews = selectedManuscript
//     ? selectedManuscript.reviewers.filter((r) => r.reviewStatus === "Completed").length
//     : 0;

//   const acceptedRecommendationCount = selectedManuscript
//     ? selectedManuscript.reviewers.filter(
//       (r) => r.reviewStatus === "Completed" && r.recommendation === "Accept"
//     ).length
//     : 0;

//   const canAcceptOrPublish = acceptedRecommendationCount >= 2;

//   // 6. Handle Assigning a New Reviewer Action
//   const handleAssignNewReviewer = async () => {
//     if (selectedReviewers.length < 2) {
//       return toast.error("Minimum 2 reviewers required");
//     }

//     try {
//       await assignReviewers({
//         manuscriptId: selectedManuscript.manuscript._id,
//         reviewerIds: selectedReviewers,
//       }).unwrap();
//       setSelectedReviewers([]);
//       toast.success("New reviewer successfully assigned!");
//       refetch();
//     } catch (error) {
//       toast.error(error?.data?.message || "Failed to assign new reviewer.");
//     }
//   };

//   // 7. Handle Final Editorial Decision Action
//   const handleActionSubmit = async (e) => {
//     e.preventDefault();
//     if (!actionData.status) return toast.error("Please select a status first.");

//     if (actionData.status === "Published") {
//       if (selectedManuscript.manuscript.status !== "Final Author Approved") {
//         return toast.error("Action Blocked: Author must approve the Final Script first.");
//       }

//       setSelectedIssueId("");
//       setIsPublishModalOpen(true);
//       return;

//     }

//     if (["Accepted", "Published"].includes(actionData.status) && selectedManuscript.manuscript.status !== "Final Author Approved") {
//       return toast.error("Action Blocked: Author must approve the Final Script before you can Publish.");
//     }

//     const formData = new FormData();
//     formData.append("manuscriptId", selectedManuscript.manuscript._id);
//     formData.append("status", actionData.status);

//     if (actionData.status === "Accepted") {
//       if (!actionData.publishDate) {
//         return toast.error("Please select a date and time to schedule publication.");
//       }
//       const selectedDate = new Date(actionData.publishDate);
//       if (selectedDate <= new Date()) {
//         return toast.error("Publication date and time must be in the future.");
//       }
//       formData.append("publishDate", actionData.publishDate);
//     }

//     if (actionData.feedback) formData.append("feedback", actionData.feedback);
//     if (actionData.file) formData.append("feedbackFile", actionData.file);

//     try {
//       await updateStatus(formData).unwrap();
//       toast.success(`Manuscript status successfully updated to ${actionData.status}`);
//       setSelectedManuscript(null);
//       setActionData({ status: "", feedback: "", file: null, publishDate: "" });
//       refetch();
//     } catch (error) {
//       toast.error(error?.data?.message || "Failed to update manuscript status.");
//     }
//   };

//   const renderStars = (score) => {
//     return (
//       <div className="flex gap-1">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Icons.Star
//             key={star}
//             size={16}
//             className={star <= (score || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}
//           />
//         ))}
//       </div>
//     );
//   };

//   const generateRevisionFeedback = () => {
//     if (!selectedManuscript?.reviewers) return "";

//     const feedbacks = selectedManuscript.reviewers
//       .filter(
//         (reviewer) =>
//           reviewer.reviewStatus === "Completed" &&
//           reviewer.commentsToAuthor &&
//           ["Minor revisions", "Major revisions"].includes(
//             reviewer.recommendation
//           )
//       )
//       .map(
//         (reviewer, index) =>
//           `Reviewer ${index + 1}
// ${reviewer.commentsToAuthor
//             .split("\n")
//             .filter(Boolean)
//             .map(item => `• ${item}`)
//             .join("\n")}`
//       );

//     return `Dear Author,

// Based on reviewer evaluations, please address the following comments:

// ${feedbacks.join("\n\n")}

// After completing all revisions, please upload:
// • Revised Manuscript
// • Point-by-Point Response Sheet

// Regards,
// Editorial Office`;
//   };

//   return (
//     <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen">

//       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Review And Decision Dashboard</h1>
//           <p className="text-slate-500 text-sm mt-1">
//             Compare reviewer feedback, assign backup reviewers, and take final editorial decisions.
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-5">
//         {data?.reviews?.map((item) => {
//           const compCount = item.reviewers.filter((r) => r.reviewStatus === "Completed").length;
//           const totalReviewers = item.reviewers.length;
//           const isPaperDone = ["Published", "Rejected"].includes(item.manuscript.status);

//           return (
//             <div key={item._id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 mb-3">
//                   <span className="bg-slate-900 text-white px-3 py-1 rounded-md text-xs font-bold tracking-wider">
//                     {item.manuscript.manuscriptId}
//                   </span>
//                   <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider 
//                     ${item.manuscript.status === "Published" ? "bg-emerald-100 text-emerald-700" :
//                       item.manuscript.status === "Rejected" ? "bg-rose-100 text-rose-700" :
//                         "bg-blue-100 text-blue-700"
//                     }`}>
//                     {item.manuscript.status}
//                   </span>
//                 </div>
//                 <h3 className="font-bold text-slate-800 text-xl leading-tight">{item.manuscript.title}</h3>
//               </div>

//               <div className="flex items-center gap-6 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
//                 <div className="flex flex-col items-end">
//                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Reviews Done</p>
//                   <div className="flex items-center gap-2">
//                     <span className="text-lg font-black text-slate-700">{compCount}/{totalReviewers}</span>
//                     <div className="flex -space-x-3">
//                       {item.reviewers.map((r, idx) => (
//                         <div key={idx} title={`${r.name} - ${r.invitationStatus}`} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm
//                           ${r.reviewStatus === 'Completed' ? 'bg-emerald-500' : r.invitationStatus === 'Declined' ? 'bg-rose-500' : 'bg-amber-400'}`}>
//                           {r.name.charAt(0).toUpperCase()}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => setSelectedManuscript(item)}
//                   className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 
//                     ${isPaperDone
//                       ? "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
//                       : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"}`}
//                 >
//                   {isPaperDone ? <Icons.FileSearch size={18} /> : <Icons.LayoutDashboard size={18} />}
//                   {isPaperDone ? "View Record" : "Evaluate & Act"}
//                 </button>
//               </div>
//             </div>
//           );
//         })}

//         {data?.reviews?.length === 0 && (
//           <div className="text-center py-20 text-slate-500">
//             <Icons.FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
//             <p className="text-lg font-medium">No reviews tracking data available right now.</p>
//           </div>
//         )}
//       </div>

//       {selectedManuscript && (
//         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex justify-center items-center p-4 md:p-6">
//           <div className="bg-white w-full max-w-[1500px] h-full max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

//             <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
//               <div className="text-white">
//                 <p className="text-xs font-bold text-blue-400 mb-1 tracking-wider uppercase">Evaluating Manuscript</p>
//                 <h2 className="text-lg font-bold line-clamp-1">{selectedManuscript.manuscript.title}</h2>
//               </div>
//               <button onClick={() => {
//                 setSelectedManuscript(null);
//                 setActionData({ status: "", feedback: "", file: null, publishDate: "" });
//               }} className="p-2 bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white rounded-full transition-colors">
//                 <Icons.X size={20} />
//               </button>
//             </div>

//             <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-slate-50">

//               <div className="flex-1 overflow-y-auto p-6 space-y-8">

//                 {/* EDITOR'S RECOMMENDATION SUMMARY */}
//                 {selectedManuscript?.manuscript?.feedbackFile && (
//                   <div className="mt-4">
//                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
//                       Editor Attachment
//                     </p>

//                     <a
//                       href={selectedManuscript?.manuscript?.feedbackFile}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm font-bold transition-all border border-indigo-100"
//                     >
//                       <Icons.Download size={16} />
//                       Download Editor Document
//                     </a>
//                   </div>
//                 )}
//                 <div className="bg-white border-l-4 border-indigo-500 rounded-2xl shadow-sm p-6">
//                   <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">
//                     <Icons.UserCog size={22} className="text-indigo-600" /> Editor's Preliminary Recommendation
//                   </h3>

//                   <div className="flex flex-col md:flex-row gap-6">
//                     <div className="shrink-0">
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Suggested Status</p>
//                       <div className={`px-4 py-2 rounded-xl text-sm font-black inline-block
//                             ${selectedManuscript.manuscript.editorRecommendation ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-500 italic font-medium'}`}>
//                         {selectedManuscript.manuscript.editorRecommendation || "No recommendation submitted yet"}
//                       </div>
//                     </div>

//                     <div className="flex-1">
//                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Editor's Internal Comments</p>
//                       <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 font-medium border border-slate-100 italic leading-relaxed">
//                         {selectedManuscript.manuscript.editorInternalComments ? (
//                           `"${selectedManuscript.manuscript.editorInternalComments}"`
//                         ) : (
//                           "Editor has not provided any internal notes for the admin yet."
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* REVIEWERS GRID */}
//                 <div>
//                   <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
//                     <Icons.Users size={20} className="text-blue-600" /> Reviewers Feedback Comparison
//                   </h3>

//                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//                     {selectedManuscript.reviewers.map((reviewer) => (
//                       <div key={reviewer.reviewerId} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
//                         <div className="bg-slate-100/50 p-5 border-b border-slate-100 flex items-start justify-between">
//                           <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-inner">
//                               {reviewer.name.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <h4 className="font-bold text-slate-800 text-base">{reviewer.name}</h4>
//                               <p className="text-xs text-slate-500 font-medium">{reviewer.email}</p>
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider 
//                               ${reviewer.reviewStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
//                                 reviewer.invitationStatus === 'Declined' ? 'bg-rose-100 text-rose-700' :
//                                   'bg-amber-100 text-amber-700'
//                               }`}>
//                               {reviewer.reviewStatus === 'Completed' ? 'Completed' : reviewer.invitationStatus}
//                             </span>
//                           </div>
//                         </div>

//                         <div className="p-5 flex-1 flex flex-col gap-5">
//                           {reviewer.invitationStatus === "Declined" && (
//                             <div className="flex flex-col items-center justify-center py-10 text-rose-500 text-center bg-rose-50 rounded-xl border border-rose-100">
//                               <Icons.UserX size={48} className="mb-3 opacity-60" />
//                               <p className="font-black text-lg">Invitation Declined</p>
//                               <p className="text-sm text-rose-600/80 mt-1">This reviewer rejected the request.</p>
//                             </div>
//                           )}

//                           {reviewer.invitationStatus !== "Declined" && reviewer.reviewStatus !== "Completed" && (
//                             <div className="flex flex-col items-center justify-center py-10 text-amber-500 text-center bg-amber-50 rounded-xl border border-amber-100">
//                               <Icons.Clock size={48} className="mb-3 opacity-60" />
//                               <p className="font-black text-lg">Awaiting Feedback</p>
//                               <p className="text-sm text-amber-600/80 mt-1">
//                                 {reviewer.invitationStatus === "Pending" ? "Invitation not accepted yet." : "Review is in progress."}
//                               </p>
//                             </div>
//                           )}

//                           {reviewer.reviewStatus === "Completed" && (
//                             <>
//                               <div className={`p-4 rounded-xl border flex items-center justify-between 
//                                 ${reviewer.recommendation === 'Accept' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
//                                   reviewer.recommendation === 'Reject' ? 'bg-rose-50 border-rose-100 text-rose-800' :
//                                     'bg-amber-50 border-amber-100 text-amber-800'
//                                 }`}>
//                                 <span className="text-xs font-black uppercase tracking-wider opacity-70">Recommendation</span>
//                                 <span className="font-black text-lg">{reviewer.recommendation || 'None'}</span>
//                               </div>

//                               <div>
//                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Evaluation Scores</p>
//                                 <div className="grid grid-cols-2 gap-3">
//                                   {['originality', 'clarity', 'methodology', 'contribution'].map((crit) => (
//                                     <div key={crit} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
//                                       <span className="capitalize text-xs font-bold text-slate-600">{crit}</span>
//                                       {renderStars(reviewer.scores?.[crit])}
//                                     </div>
//                                   ))}
//                                 </div>
//                               </div>

//                               <div className="space-y-4">
//                                 <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
//                                   <p className="text-xs flex items-center gap-1 uppercase font-black text-rose-600 mb-2 tracking-wider">
//                                     <Icons.Lock size={14} /> Confidential (For Admin)
//                                   </p>
//                                   <p className="text-sm text-slate-700 leading-relaxed font-medium">
//                                     {reviewer.commentsToEditor || <span className="text-slate-400 italic">No confidential comments provided.</span>}
//                                   </p>
//                                 </div>

//                                 <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
//                                   <p className="text-xs flex items-center gap-1 uppercase font-black text-blue-600 mb-2 tracking-wider">
//                                     <Icons.MessageSquare size={14} /> Feedback For Author
//                                   </p>
//                                   <div className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar pr-2">
//                                     {reviewer.commentsToAuthor || <span className="text-slate-400 italic">No feedback provided for the author.</span>}
//                                   </div>
//                                 </div>
//                               </div>

//                               {reviewer.annotatedFile && (
//                                 <a href={reviewer.annotatedFile} target="_blank" rel="noreferrer"
//                                   className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
//                                   <Icons.DownloadCloud size={18} /> Download Annotated File
//                                 </a>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* RIGHT SIDE ADMINISTRATIVE PANEL */}
//               <div className="w-full lg:w-[450px] bg-slate-100 border-l border-slate-200 flex flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.03)] z-10">
//                 <div className="p-6 border-b border-slate-200 bg-white">
//                   <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
//                     <Icons.Gavel size={24} className="text-blue-600" /> Administrative Panel
//                   </h3>
//                 </div>

//                 <div className="p-6 flex-1 overflow-y-auto space-y-6">

//                   {/* LOCKED VIEW: Shows when paper is already Published or Rejected */}
//                   {isFinalized ? (
//                     <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
//                       <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center space-y-3
//                         ${selectedManuscript.manuscript.status === 'Published'
//                           ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
//                           : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
//                         <div className={`p-4 rounded-full ${selectedManuscript.manuscript.status === 'Published' ? 'bg-emerald-500' : 'bg-rose-500'} text-white shadow-xl ring-8 ring-white`}>
//                           {selectedManuscript.manuscript.status === 'Published' ? <Icons.ShieldCheck size={40} /> : <Icons.Archive size={40} />}
//                         </div>
//                         <div>
//                           <h4 className="text-2xl font-black uppercase tracking-tight italic">Case Closed</h4>
//                           <p className="text-sm font-bold opacity-80 mt-1">
//                             Final Decision: {selectedManuscript.manuscript.status}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
//                         <h5 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
//                           <Icons.History size={18} className="text-slate-500" /> Decision Record
//                         </h5>

//                         <div className="space-y-4 text-sm">
//                           <div className="flex justify-between">
//                             <span className="text-slate-400 font-bold uppercase text-[10px]">Reference ID</span>
//                             <span className="font-bold text-slate-700">{selectedManuscript.manuscript.manuscriptId}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-slate-400 font-bold uppercase text-[10px]">Decision Date</span>
//                             <span className="font-bold text-slate-700">
//                               {new Date(selectedManuscript.manuscript.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
//                             </span>
//                           </div>
//                           <div className="pt-4 border-t border-slate-100">
//                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Summary</p>
//                             <p className="p-3 bg-slate-50 rounded-lg text-slate-600 italic border border-slate-100">
//                               {selectedManuscript.manuscript.editorInternalComments || "Process complete. This record is archived."}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="mt-6">
//                           <button disabled className="w-full py-4 bg-slate-100 text-slate-400 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-not-allowed border-2 border-dashed border-slate-200">
//                             <Icons.Lock size={18} /> RECORD LOCKED
//                           </button>
//                           <p className="text-[10px] text-center text-slate-400 mt-3 leading-tight">
//                             Published or rejected papers cannot be modified.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     /* EDITABLE VIEW: Shows when paper is still in progress */
//                     <>
//                       {!canAcceptOrPublish && (
//                         <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex gap-3 shadow-sm items-start">
//                           <Icons.ShieldAlert size={20} className="shrink-0 text-rose-600 mt-0.5" />
//                           <div>
//                             <p className="text-sm font-bold text-rose-700">Action Restricted</p>
//                             <p className="text-xs text-rose-600 mt-1">
//                               You need at least <strong>2 'Accept' recommendations</strong> to Accept or Publish. <br />
//                               Currently: <strong>{acceptedRecommendationCount}</strong> 'Accept'.
//                             </p>
//                           </div>
//                         </div>
//                       )}

//                       <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
//                         <h4 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
//                           <Icons.CheckCircle size={18} className="text-slate-600" /> Final Decision
//                         </h4>

//                         <form onSubmit={handleActionSubmit} className="space-y-4">
//                           <div>
//                             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Status</label>
//                             <select
//                               required
//                               value={actionData.status}
//                               onChange={(e) => {
//                                 const status = e.target.value;

//                                 if (status === "Revision Required") {
//                                   setActionData({
//                                     ...actionData,
//                                     status,
//                                     feedback: generateRevisionFeedback(),
//                                   });
//                                 } else {
//                                   setActionData({
//                                     ...actionData,
//                                     status,
//                                   });
//                                 }
//                               }}
//                               className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
//                             >
//                               <option value="">-- Select Decision --</option>
//                               <option value="Revision Required">Request Revision (Minor/Major)</option>
//                               <option value="Rejected">Reject Manuscript</option>
//                               <option value="Approved">Approve Manuscript</option>

//                               {/* NEW: Show this only if currently Approved */}
//                               {selectedManuscript.manuscript.status === "Approved" && (
//                                 <option value="Final Script Sent">Send Final Script to Author</option>
//                               )}

//                               {/* LOCK: Show publish options only if Author Approved the script */}
//                               {selectedManuscript.manuscript.status === "Final Author Approved" ? (
//                                 <>
//                                   <option value="Accepted">Schedule Manuscript (Schedule Publish)</option>
//                                   <option value="Published">Publish Now (Immediate)</option>
//                                 </>
//                               ) : (
//                                 <optgroup label="Needs Final Script Approval">
//                                   <option value="Accepted" disabled>Schedule (Locked)</option>
//                                   <option value="Published" disabled>Publish Now (Locked)</option>
//                                 </optgroup>
//                               )}
//                             </select>
//                           </div>

//                           {actionData.status === "Accepted" && (
//                             <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
//                               <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
//                                 <Icons.CalendarClock size={16} /> Schedule Publication Date
//                               </label>
//                               <input
//                                 type="datetime-local"
//                                 required
//                                 value={actionData.publishDate}
//                                 onChange={(e) => setActionData({ ...actionData, publishDate: e.target.value })}
//                                 className="w-full bg-emerald-50/50 border border-emerald-200 text-slate-700 font-medium rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
//                               />
//                             </div>
//                           )}

//                           {/* Change this line to include 'Final Script Sent' */}
//                           {['Revision Required', 'Rejected', 'Final Script Sent'].includes(actionData.status) && (
//                             <div className="space-y-4 animate-in fade-in duration-300">
//                               {/* Message to Author Area */}
//                               <div>
//                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
//                                   {actionData.status === "Final Script Sent" ? "Instructions for Author" : "Message to Author"}
//                                 </label>
//                                 <textarea
//                                   required
//                                   rows={5}
//                                   value={actionData.feedback}
//                                   onChange={(e) => setActionData({ ...actionData, feedback: e.target.value })}
//                                   placeholder={actionData.status === "Final Script Sent" ? "Tell author to review the attached template..." : "Paste the final summarized feedback here..."}
//                                   className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
//                                 />
//                               </div>

//                               {/* File Upload Area */}
//                               <div>
//                                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
//                                   {actionData.status === "Final Script Sent" ? "Attach Final Template (Required)" : "Attach File (Optional)"}
//                                 </label>
//                                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer relative">
//                                   <input
//                                     type="file"
//                                     required={actionData.status === "Final Script Sent"} // Final script ke liye required
//                                     onChange={(e) => setActionData({ ...actionData, file: e.target.files[0] })}
//                                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                                   />
//                                   <div className="flex flex-col items-center gap-1">
//                                     <Icons.UploadCloud size={20} className="text-slate-400" />
//                                     <span className="text-xs font-bold text-slate-600">
//                                       {actionData.file ? actionData.file.name : "Click to upload file"}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                           <button
//                             disabled={isUpdating}
//                             type="submit"
//                             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-sm mt-2 shadow-md hover:shadow-lg hover:shadow-blue-500/30"
//                           >
//                             {isUpdating ? <Icons.Loader2 size={18} className="animate-spin" /> : <Icons.Check size={18} />}
//                             {isUpdating ? "Processing..." :
//                               actionData.status === "Accepted" ? "Accept & Schedule Publish" :
//                                 actionData.status === "Approved" ? "Approve Manuscript" :
//                                   actionData.status === "Final Script Sent" ? "Send to Author" : // Added this
//                                     "Submit Decision"
//                             }
//                           </button>
//                         </form>
//                       </div>

//                       <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mt-4">
//                         <h4 className="font-bold text-slate-800 mb-2 border-b pb-2 flex items-center gap-2">
//                           <Icons.UserPlus size={18} className="text-indigo-600" /> Assign Reviewer
//                         </h4>
//                         <div className="flex flex-col gap-3">
//                           <div className="space-y-3">
//                             <div className="flex flex-wrap gap-2 min-h-[40px]">
//                               {selectedReviewers.map((id) => {
//                                 const reviewer = reviewerOptionsData?.reviewers.find(r => r._id === id);
//                                 return (
//                                   <div key={id} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
//                                     {reviewer?.name}
//                                     <button onClick={() => setSelectedReviewers(prev => prev.filter(r => r !== id))} className="hover:text-red-500">
//                                       <Icons.X size={12} />
//                                     </button>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                             <select
//                               onChange={(e) => {
//                                 const value = e.target.value;
//                                 if (!value) return;
//                                 if (selectedReviewers.includes(value)) return toast.error("Already selected");
//                                 setSelectedReviewers([...selectedReviewers, value]);
//                               }}
//                               className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                             >
//                               <option value="">{isReviewersLoading ? "Loading..." : "Add Reviewer"}</option>
//                               {reviewerOptionsData?.reviewers?.map((reviewer) => (
//                                 <option key={reviewer._id} value={reviewer._id}>{reviewer.name}</option>
//                               ))}
//                             </select>
//                           </div>

//                           <button
//                             onClick={handleAssignNewReviewer}
//                             disabled={isAssigning || selectedReviewers.length < 2 || isReviewersLoading}
//                             className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 flex justify-center gap-2 text-sm"
//                           >
//                             {isAssigning ? <Icons.Loader2 size={16} className="animate-spin" /> : "Send Invitation"}
//                           </button>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//             </div>
//           </div>


//         </div>
//       )}

//       {isPublishModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
//           <div className="bg-white w-full max-w-2xl rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">

//             {/* Header - Clean Slate Theme */}
//             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
//               <div>
//                 <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
//                   <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
//                     <Icons.Globe size={20} />
//                   </div>
//                   Final Publication Review
//                 </h2>
//                 <p className="text-slate-500 text-xs font-medium mt-1">
//                   Assigning official journal metadata and archiving the manuscript.
//                 </p>
//               </div>
//               <button
//                 onClick={() => setIsPublishModalOpen(false)}
//                 className="p-2 hover:bg-slate-100 text-slate-400 hover:text-rose-500 rounded-full transition-all"
//               >
//                 <Icons.X size={20} />
//               </button>
//             </div>

//             <div className="p-2 space-y-2 bg-slate-50/50">

//               {/* Publication Metadata Grid */}
//               <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
//                 <div className="mb-2 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
//                   <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
//                     Current Journal Volume
//                   </p>
//                   <div className=" flex items-end gap-2">
//                     <h2 className="text-3xl font-black text-slate-900">
//                       Volume {availableIssuesData?.volume}
//                     </h2>

//                     <span className="mb-1 text-sm font-medium text-slate-500">
//                       ({new Date().getFullYear()})
//                     </span>
//                   </div>

//                   <p className="mt-2 text-sm text-slate-600">
//                     All manuscripts published during this year will automatically be archived under this volume.
//                   </p>
//                 </div>
//                 <label className="block text-xs font-bold text-slate-500 mb-3">
//                   Select Journal Issue
//                 </label>

//                 <select
//                   value={selectedIssueId}
//                   onChange={(e) => setSelectedIssueId(e.target.value)}
//                   className="w-full border border-slate-300 rounded-xl px-4 py-3"
//                 >

//                   <option value="">
//                     Select Issue
//                   </option>

//                   {availableIssuesData?.regularIssues?.map((item) => (
//                     <option
//                       key={item.issueNumber}
//                       value={item.issueNumber}
//                     >
//                       Issue {item.issueNumber} ({item.label})
//                     </option>
//                   ))}

//                   {availableIssuesData?.adHocIssues?.map((item) => (
//                     <option
//                       key={item._id}
//                       value={item._id}
//                     >
//                       {item.label}
//                     </option>
//                   ))}

//                 </select>

//               </div>

//               {/* Final File Upload Section */}
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between ml-1">
//                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Final Layout Document (PDF)</label>
//                   {actionData.file && (
//                     <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
//                       File Ready
//                     </span>
//                   )}
//                 </div>

//                 <div className="relative group">
//                   <input
//                     type="file"
//                     required
//                     accept=".pdf"
//                     onChange={(e) => setActionData({ ...actionData, file: e.target.files[0] })}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
//                   />
//                   <div className={`border-2 border-dashed transition-all rounded-2xl p-10 text-center flex flex-col items-center justify-center
//               ${actionData.file
//                       ? 'border-blue-500 bg-blue-50/30'
//                       : 'border-slate-200 bg-white group-hover:border-blue-400 group-hover:bg-slate-50'}`}>

//                     <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors
//                 ${actionData.file ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
//                       <Icons.FileText size={28} />
//                     </div>

//                     <p className="text-sm font-black text-slate-700">
//                       {actionData.file ? actionData.file.name : "Click to select the final formatted PDF"}
//                     </p>
//                     <p className="text-xs text-slate-400 mt-1 font-medium">
//                       Ensure this version includes Volume, Issue, and Journal headers.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Footer Actions */}
//             <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center gap-4">
//               <button
//                 onClick={() => setIsPublishModalOpen(false)}
//                 className="px-6 py-4 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 disabled={isUpdating}
//                 onClick={async () => {
//                   if (!actionData.file) return toast.error("Please upload the final PDF paper.");
//                   const formData = new FormData();
//                   formData.append("manuscriptId", selectedManuscript.manuscript._id);
//                   formData.append("status", "Published");
//                   formData.append("feedbackFile", actionData.file);

//                   if (!selectedIssueId) {
//                     return toast.error("Please select an issue");
//                   }

//                   formData.append("issueId", selectedIssueId);
//                   try {
//                     await updateStatus(formData).unwrap();
//                     toast.success("Article has been successfully published!");
//                     setIsPublishModalOpen(false);
//                     setSelectedManuscript(null);
//                     refetch();
//                   } catch (err) { toast.error(err?.data?.message || "Publishing failed"); }
//                 }}
//                 className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-3 text-base active:scale-[0.98]"
//               >
//                 {isUpdating ? <Icons.Loader2 size={20} className="animate-spin" /> : <Icons.Globe size={20} />}
//                 {isUpdating ? "ARCHIVING..." : "CONFIRM & PUBLISH LIVE"}
//               </button>
//             </div>

//           </div>
//         </div>
//       )}
//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//       `}</style>
//     </div>
//   );
// }



























"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGetAdminReviewTrackingQuery, useGetEligibleReviewersQuery } from "../../../../services/reviewerApi";
import { useUpdateSubmissionStatusMutation, useAssignReviewersMutation } from "../../../../services/manuscriptApi";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";
import { useGetAvailableIssuesQuery } from "../../../../services/issueApi";
import toast from "react-hot-toast";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Given an issueId string (either a MongoDB ObjectId or a plain number 1-4),
 * resolve the matching issue object from the available-issues API response.
 * Returns: { volume, issueNumber, label, isAdHoc, _id? }
 */
const resolveIssue = (issueId, availableIssuesData) => {
  if (!issueId || !availableIssuesData) return null;

  // Ad-Hoc (MongoDB ObjectId — 24 hex chars)
  const isObjectId = /^[a-f\d]{24}$/i.test(issueId);
  if (isObjectId) {
    return availableIssuesData.adHocIssues?.find((i) => i._id === issueId) || null;
  }

  // Regular issue (1-4)
  const num = Number(issueId);
  return availableIssuesData.regularIssues?.find((i) => i.issueNumber === num) || null;
};

/**
 * Calculate what paper number WOULD be assigned for a given volume+issue.
 * We derive this from the tracking data (papers already published in that issue).
 */
const previewPaperNumber = (volume, issueNumber, reviewsData) => {
  if (!volume || !issueNumber || !reviewsData?.reviews) return null;

  const published = reviewsData.reviews.filter(
    (r) =>
      r.manuscript.status === "Published" &&
      r.manuscript.volume === volume &&
      r.manuscript.issue === issueNumber
  ).length;

  const next = published + 1;
  return `${volume}.${issueNumber}.${next}`;
};

// ─── STATUS COLOR ─────────────────────────────────────────────────────────────
const statusClass = (status) => {
  if (status === "Published") return "bg-emerald-100 text-emerald-700";
  if (status === "Rejected") return "bg-rose-100 text-rose-700";
  return "bg-blue-100 text-blue-700";
};

// ─── STAR RENDERER ────────────────────────────────────────────────────────────
const renderStars = (score) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Icons.Star
        key={s}
        size={14}
        className={s <= (score || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"}
      />
    ))}
  </div>
);

// ─── PUBLISH MODAL ────────────────────────────────────────────────────────────
function PublishModal({ manuscript, availableIssuesData, reviewsData, onClose, onConfirm, isUpdating }) {
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [actionFile, setActionFile] = useState(null);
  const [issueTab, setIssueTab] = useState("regular"); // "regular" | "adhoc"

  // Resolve selected issue object
  const resolvedIssue = useMemo(
    () => resolveIssue(selectedIssueId, availableIssuesData),
    [selectedIssueId, availableIssuesData]
  );

  const volume = availableIssuesData?.volume || 1;
  const issueNumber = resolvedIssue?.issueNumber || null;
  const issueLabel = resolvedIssue?.label || "";

  // Preview paper number
  const paperPreview = useMemo(
    () => (issueNumber ? previewPaperNumber(volume, issueNumber, reviewsData) : null),
    [volume, issueNumber, reviewsData]
  );

  const handleConfirm = () => {
    if (!actionFile) return toast.error("Please upload the final formatted PDF.");
    if (!selectedIssueId) return toast.error("Please select a journal issue.");
    onConfirm({ file: actionFile, issueId: selectedIssueId, volume, issueNumber, issueLabel });
  };

  const regularIssues = availableIssuesData?.regularIssues || [];
  const adHocIssues = availableIssuesData?.adHocIssues || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Icons.Globe size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Final Publication Review</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Assign journal metadata and publish the manuscript.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5 bg-slate-50/50">

          {/* Volume Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-400 rounded-2xl p-5 text-white">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-75 mb-1">Current Journal Volume</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black">Vol. {volume}</span>
              <span className="text-base opacity-80 mb-1">· {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs opacity-75 mt-2 leading-relaxed">
              All manuscripts published this year are archived under Volume {volume}.
            </p>
          </div>

          {/* Issue Selection */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => { setIssueTab("regular"); setSelectedIssueId(""); }}
                className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition ${issueTab === "regular"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"}`}
              >
                Regular Issues
              </button>
              <button
                onClick={() => { setIssueTab("adhoc"); setSelectedIssueId(""); }}
                className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest transition ${issueTab === "adhoc"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:bg-slate-50"}`}
              >
                Special Issues ({adHocIssues.length})
              </button>
            </div>

            <div className="p-5">
              {issueTab === "regular" ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                    Select Quarterly Issue
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {regularIssues.map((item) => {
                      const isSelected = selectedIssueId === String(item.issueNumber);
                      return (
                        <button
                          key={item.issueNumber}
                          type="button"
                          onClick={() => setSelectedIssueId(String(item.issueNumber))}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left transition-all ${isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/40"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                              {item.issueNumber}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-700"}`}>
                                Issue {item.issueNumber}
                              </p>
                              <p className={`text-xs font-medium ${isSelected ? "text-indigo-500" : "text-slate-400"}`}>
                                {item.label}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Icons.Check size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {regularIssues.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No regular issues available.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                    Select Special / Ad-Hoc Issue
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {adHocIssues.map((item) => {
                      const isSelected = selectedIssueId === item._id;
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => setSelectedIssueId(item._id)}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 text-left transition-all ${isSelected
                            ? "border-violet-500 bg-violet-50"
                            : "border-slate-100 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/40"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isSelected ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                              S{item.issueNumber}
                            </div>
                            <div>
                              <p className={`text-sm font-bold ${isSelected ? "text-violet-700" : "text-slate-700"}`}>
                                {item.label}
                              </p>
                              <p className={`text-xs font-medium ${isSelected ? "text-violet-500" : "text-slate-400"}`}>
                                Vol. {item.volume} · Special Issue #{item.issueNumber}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                              <Icons.Check size={12} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                    {adHocIssues.length === 0 && (
                      <div className="py-6 text-center text-slate-400">
                        <Icons.FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No special issues created yet.</p>
                        <p className="text-xs mt-1">Create one from the Issue Management panel.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resolved Metadata Preview */}
          {resolvedIssue && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                <Icons.CheckCircle size={14} /> Issue Confirmed — Publication Metadata
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Volume</p>
                  <p className="text-xl font-black text-slate-800">{volume}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Issue</p>
                  <p className="text-xl font-black text-slate-800">{resolvedIssue.issueNumber}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-emerald-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Period</p>
                  <p className="text-sm font-black text-slate-800">{resolvedIssue.label}</p>
                </div>
              </div>

              {/* Paper Number Preview */}
              {paperPreview && (
                <div className="bg-white border border-emerald-200 rounded-xl px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                      Assigned Paper Number
                    </p>
                    <p className="text-2xl font-black text-indigo-600 tracking-tight">{paperPreview}</p>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Icons.Hash size={20} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final PDF Upload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Final Layout PDF <span className="text-red-500">*</span>
              </label>
              {actionFile && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  ✓ File Ready
                </span>
              )}
            </div>

            <div className="relative group">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setActionFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center transition-all
                ${actionFile
                  ? "border-emerald-400 bg-emerald-50/30"
                  : "border-slate-200 bg-white group-hover:border-indigo-300 group-hover:bg-indigo-50/20"}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all
                  ${actionFile ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"}`}>
                  <Icons.FileText size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700">
                  {actionFile ? actionFile.name : "Click to upload final formatted PDF"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {actionFile
                    ? `${(actionFile.size / 1024).toFixed(1)} KB · PDF ready`
                    : "Ensure this version includes Vol, Issue, and Journal headers"}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-white border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUpdating || !selectedIssueId || !actionFile}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isUpdating
              ? <><Icons.Loader2 size={18} className="animate-spin" /> Archiving…</>
              : <><Icons.Globe size={18} /> Confirm & Publish Live</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminReviewTracking() {
  const [selectedManuscript, setSelectedManuscript] = useState(null);
  const [actionData, setActionData] = useState({ status: "", feedback: "", file: null, publishDate: "" });
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const isFinalized = ["Published", "Rejected"].includes(selectedManuscript?.manuscript?.status);

  const { data, isLoading, refetch } = useGetAdminReviewTrackingQuery();

  const { data: reviewerOptionsData, isLoading: isReviewersLoading } = useGetEligibleReviewersQuery(
    selectedManuscript?.manuscript?._id,
    { skip: !selectedManuscript?.manuscript?._id }
  );

  const { data: availableIssuesData } = useGetAvailableIssuesQuery();

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSubmissionStatusMutation();
  const [assignReviewers, { isLoading: isAssigning }] = useAssignReviewersMutation();

  // Keep selectedManuscript in sync with fresh data
  useEffect(() => {
    if (selectedManuscript && data?.reviews) {
      const updated = data.reviews.find(
        (item) => item.manuscript._id === selectedManuscript.manuscript._id
      );
      if (updated) setSelectedManuscript(updated);
    }
  }, [data]);

  useEffect(() => {
    setSelectedReviewers([]);
  }, [selectedManuscript?.manuscript?._id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="font-medium text-lg">Loading Review Details…</p>
      </div>
    );
  }

  const totalCompleted = selectedManuscript
    ? selectedManuscript.reviewers.filter((r) => r.reviewStatus === "Completed").length
    : 0;
  const acceptCount = selectedManuscript
    ? selectedManuscript.reviewers.filter(
      (r) => r.reviewStatus === "Completed" && r.recommendation === "Accept"
    ).length
    : 0;
  const canAcceptOrPublish = acceptCount >= 2;

  const handleAssignNewReviewer = async () => {
    if (selectedReviewers.length < 2) return toast.error("Minimum 2 reviewers required");
    const tid = toast.loading("Assigning reviewers…");
    try {
      await assignReviewers({
        manuscriptId: selectedManuscript.manuscript._id,
        reviewerIds: selectedReviewers,
      }).unwrap();
      toast.success("Reviewers assigned and notified!", { id: tid });
      setSelectedReviewers([]);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign reviewers.", { id: tid });
    }
  };

  const generateRevisionFeedback = () => {
    if (!selectedManuscript?.reviewers) return "";
    const feedbacks = selectedManuscript.reviewers
      .filter(
        (r) =>
          r.reviewStatus === "Completed" &&
          r.commentsToAuthor &&
          ["Minor revisions", "Major revisions"].includes(r.recommendation)
      )
      .map(
        (r, i) =>
          `Reviewer ${i + 1}\n${r.commentsToAuthor
            .split("\n")
            .filter(Boolean)
            .map((l) => `• ${l}`)
            .join("\n")}`
      );

    return `Dear Author,\n\nBased on reviewer evaluations, please address the following comments:\n\n${feedbacks.join("\n\n")}\n\nAfter completing all revisions, please upload:\n• Revised Manuscript\n• Point-by-Point Response Sheet\n\nRegards,\nEditorial Office`;
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionData.status) return toast.error("Please select a status first.");

    // Guard: publish requires final author approval
    if (actionData.status === "Published") {
      if (selectedManuscript.manuscript.status !== "Final Author Approved") {
        return toast.error("Action Blocked: Author must approve the Final Script before publishing.");
      }
      setIsPublishModalOpen(true);
      return;
    }

    if (actionData.status === "Accepted" && selectedManuscript.manuscript.status !== "Final Author Approved") {
      return toast.error("Action Blocked: Author must approve the Final Script first.");
    }

    const formData = new FormData();
    formData.append("manuscriptId", selectedManuscript.manuscript._id);
    formData.append("status", actionData.status);

    if (actionData.status === "Accepted") {
      if (!actionData.publishDate) return toast.error("Please select a publication date and time.");
      if (new Date(actionData.publishDate) <= new Date()) return toast.error("Publication date must be in the future.");
      formData.append("publishDate", actionData.publishDate);
    }

    if (actionData.status === "Final Script Sent" && !actionData.file) {
      return toast.error("Please attach the final template file.");
    }

    if (actionData.feedback) formData.append("feedback", actionData.feedback);
    if (actionData.file) formData.append("feedbackFile", actionData.file);

    const tid = toast.loading("Processing…");
    try {
      await updateStatus(formData).unwrap();
      toast.success(`Status updated to "${actionData.status}"`, { id: tid });
      setSelectedManuscript(null);
      setActionData({ status: "", feedback: "", file: null, publishDate: "" });
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update status.", { id: tid });
    }
  };

  const handlePublishConfirm = async ({ file, issueId, volume, issueNumber, issueLabel }) => {
    const formData = new FormData();
    formData.append("manuscriptId", selectedManuscript.manuscript._id);
    formData.append("status", "Published");
    formData.append("feedbackFile", file);
    formData.append("issueId", issueId);

    const tid = toast.loading("Publishing manuscript…");
    try {
      await updateStatus(formData).unwrap();
      toast.success(
        `Published successfully! Paper will be Vol. ${volume}, Issue ${issueNumber} (${issueLabel})`,
        { id: tid, duration: 5000 }
      );
      setIsPublishModalOpen(false);
      setSelectedManuscript(null);
      setActionData({ status: "", feedback: "", file: null, publishDate: "" });
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Publishing failed.", { id: tid });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 bg-slate-50 min-h-screen">

      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Review & Decision Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Compare reviewer feedback, assign backup reviewers, and take final editorial decisions.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Under Review</span>
          <span className="text-lg font-black text-indigo-600">{data?.reviews?.length || 0}</span>
        </div>
      </div>

      {/* Manuscript Cards */}
      <div className="grid grid-cols-1 gap-4">
        {data?.reviews?.map((item) => {
          const compCount = item.reviewers.filter((r) => r.reviewStatus === "Completed").length;
          const totalReviewers = item.reviewers.length;
          const isPaperDone = ["Published", "Rejected"].includes(item.manuscript.status);

          return (
            <div
              key={item._id}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black tracking-wider font-mono">
                    {item.manuscript.manuscriptId}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${statusClass(item.manuscript.status)}`}>
                    {item.manuscript.status}
                  </span>
                  {item.manuscript.paperNumber && (
                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg text-xs font-black tracking-wider">
                      #{item.manuscript.paperNumber}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">{item.manuscript.title}</h3>
              </div>

              <div className="flex items-center gap-5 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                <div className="flex flex-col items-end shrink-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Reviews</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-700">{compCount}/{totalReviewers}</span>
                    <div className="flex -space-x-2">
                      {item.reviewers.map((r, idx) => (
                        <div
                          key={idx}
                          title={`${r.name} — ${r.invitationStatus}`}
                          className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm
                            ${r.reviewStatus === "Completed" ? "bg-emerald-500" : r.invitationStatus === "Declined" ? "bg-rose-500" : "bg-amber-400"}`}
                        >
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedManuscript(item)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap
                    ${isPaperDone
                      ? "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20"}`}
                >
                  {isPaperDone ? <Icons.FileSearch size={16} /> : <Icons.LayoutDashboard size={16} />}
                  {isPaperDone ? "View Record" : "Evaluate & Act"}
                </button>
              </div>
            </div>
          );
        })}

        {data?.reviews?.length === 0 && (
          <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Icons.FolderOpen size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold">No manuscripts under review.</p>
            <p className="text-sm mt-1">Papers assigned to reviewers will appear here.</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          EVALUATION MODAL
      ══════════════════════════════════════════ */}
      {selectedManuscript && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex justify-center items-center p-4 md:p-6">
          <div className="bg-white w-full max-w-[1500px] h-full max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="text-white min-w-0">
                <p className="text-[10px] font-bold text-blue-400 mb-1 tracking-widest uppercase">Evaluating Manuscript</p>
                <h2 className="text-base font-bold truncate">{selectedManuscript.manuscript.title}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedManuscript(null);
                  setActionData({ status: "", feedback: "", file: null, publishDate: "" });
                }}
                className="p-2 bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white rounded-full transition-colors shrink-0 ml-4"
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-slate-50">

              {/* ── LEFT: Reviewer Cards ── */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Editor Attachment */}
                {selectedManuscript?.manuscript?.feedbackFile && (
                  <a
                    href={selectedManuscript.manuscript.feedbackFile}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm font-bold transition border border-indigo-100"
                  >
                    <Icons.Download size={16} />
                    Download Editor's Attachment
                  </a>
                )}

                {/* Editor Recommendation */}
                <div className="bg-white border-l-4 border-indigo-500 rounded-2xl shadow-sm p-6">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
                    <Icons.UserCog size={20} className="text-indigo-600" /> Editor's Preliminary Recommendation
                  </h3>
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="shrink-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Suggested Status</p>
                      <div className={`px-4 py-2 rounded-xl text-sm font-black inline-block
                        ${selectedManuscript.manuscript.editorRecommendation
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : "bg-slate-100 text-slate-500 italic font-medium"}`}
                      >
                        {selectedManuscript.manuscript.editorRecommendation || "No recommendation yet"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Comments</p>
                      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-100 italic leading-relaxed">
                        {selectedManuscript.manuscript.editorInternalComments
                          ? `"${selectedManuscript.manuscript.editorInternalComments}"`
                          : "No internal notes provided."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviewer Cards */}
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                    <Icons.Users size={18} className="text-blue-600" /> Reviewer Feedback Comparison
                    <span className="ml-auto text-xs font-medium text-slate-400">
                      {totalCompleted} of {selectedManuscript.reviewers.length} complete
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {selectedManuscript.reviewers.map((reviewer) => (
                      <div
                        key={reviewer.reviewerId}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
                      >
                        <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-base shadow-inner">
                              {reviewer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{reviewer.name}</h4>
                              <p className="text-xs text-slate-500">{reviewer.email}</p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                            ${reviewer.reviewStatus === "Completed" ? "bg-emerald-100 text-emerald-700" :
                              reviewer.invitationStatus === "Declined" ? "bg-rose-100 text-rose-700" :
                                "bg-amber-100 text-amber-700"}`}
                          >
                            {reviewer.reviewStatus === "Completed" ? "Completed" : reviewer.invitationStatus}
                          </span>
                        </div>

                        <div className="p-5 flex-1 flex flex-col gap-4">
                          {reviewer.invitationStatus === "Declined" && (
                            <div className="flex flex-col items-center justify-center py-8 text-rose-500 text-center bg-rose-50 rounded-xl border border-rose-100">
                              <Icons.UserX size={36} className="mb-2 opacity-60" />
                              <p className="font-black text-base">Invitation Declined</p>
                              <p className="text-xs text-rose-500/80 mt-1">This reviewer rejected the request.</p>
                            </div>
                          )}

                          {reviewer.invitationStatus !== "Declined" && reviewer.reviewStatus !== "Completed" && (
                            <div className="flex flex-col items-center justify-center py-8 text-amber-500 text-center bg-amber-50 rounded-xl border border-amber-100">
                              <Icons.Clock size={36} className="mb-2 opacity-60" />
                              <p className="font-black text-base">Awaiting Feedback</p>
                              <p className="text-xs text-amber-500/80 mt-1">
                                {reviewer.invitationStatus === "Pending" ? "Invitation not accepted yet." : "Review in progress."}
                              </p>
                            </div>
                          )}

                          {reviewer.reviewStatus === "Completed" && (
                            <>
                              <div className={`p-4 rounded-xl border flex items-center justify-between
                                ${reviewer.recommendation === "Accept" ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                                  reviewer.recommendation === "Reject" ? "bg-rose-50 border-rose-100 text-rose-800" :
                                    "bg-amber-50 border-amber-100 text-amber-800"}`}
                              >
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Recommendation</span>
                                <span className="font-black text-base">{reviewer.recommendation || "None"}</span>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluation Scores</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {["originality", "clarity", "methodology", "contribution"].map((crit) => (
                                    <div key={crit} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                                      <span className="capitalize text-[10px] font-bold text-slate-500">{crit}</span>
                                      {renderStars(reviewer.scores?.[crit])}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
                                  <p className="text-[10px] flex items-center gap-1 uppercase font-black text-rose-600 mb-2 tracking-wider">
                                    <Icons.Lock size={12} /> Confidential (Admin Only)
                                  </p>
                                  <p className="text-sm text-slate-700 leading-relaxed">
                                    {reviewer.commentsToEditor || <span className="text-slate-400 italic">No confidential comments.</span>}
                                  </p>
                                </div>
                                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                  <p className="text-[10px] flex items-center gap-1 uppercase font-black text-blue-600 mb-2 tracking-wider">
                                    <Icons.MessageSquare size={12} /> Feedback for Author
                                  </p>
                                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap max-h-28 overflow-y-auto custom-scrollbar pr-1">
                                    {reviewer.commentsToAuthor || <span className="text-slate-400 italic">No feedback provided.</span>}
                                  </div>
                                </div>
                              </div>

                              {reviewer.annotatedFile && (
                                <a
                                  href={reviewer.annotatedFile}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition shadow"
                                >
                                  <Icons.DownloadCloud size={16} /> Download Annotated File
                                </a>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Admin Panel ── */}
              <div className="w-full lg:w-[420px] bg-white border-l border-slate-200 flex flex-col shadow-[-8px_0_20px_rgba(0,0,0,0.03)] z-10">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Icons.Gavel size={20} className="text-blue-600" /> Administrative Panel
                  </h3>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-5">

                  {/* LOCKED: Published or Rejected */}
                  {isFinalized ? (
                    <div className="space-y-5">
                      <div className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center space-y-3
                        ${selectedManuscript.manuscript.status === "Published"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"}`}
                      >
                        <div className={`p-4 rounded-full text-white shadow-xl ring-8 ring-white
                          ${selectedManuscript.manuscript.status === "Published" ? "bg-emerald-500" : "bg-rose-500"}`}>
                          {selectedManuscript.manuscript.status === "Published"
                            ? <Icons.ShieldCheck size={36} />
                            : <Icons.Archive size={36} />}
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tight italic">Case Closed</h4>
                          <p className="text-sm font-bold opacity-75 mt-1">
                            Final Decision: {selectedManuscript.manuscript.status}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                        <h5 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2 text-sm">
                          <Icons.History size={16} className="text-slate-400" /> Decision Record
                        </h5>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Reference ID</span>
                            <span className="font-black text-slate-700 font-mono">{selectedManuscript.manuscript.manuscriptId}</span>
                          </div>
                          {selectedManuscript.manuscript.paperNumber && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Paper Number</span>
                              <span className="font-black text-indigo-600">{selectedManuscript.manuscript.paperNumber}</span>
                            </div>
                          )}
                          {selectedManuscript.manuscript.issueLabel && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Issue Period</span>
                              <span className="font-bold text-slate-600">{selectedManuscript.manuscript.issueLabel}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Decision Date</span>
                            <span className="font-bold text-slate-600">
                              {new Date(selectedManuscript.manuscript.updatedAt).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "long", year: "numeric"
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Summary</p>
                          <p className="p-3 bg-white rounded-lg text-slate-500 italic border border-slate-100 text-sm">
                            {selectedManuscript.manuscript.editorInternalComments || "Process complete. Record is archived."}
                          </p>
                        </div>
                        <button disabled className="w-full mt-2 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed border-2 border-dashed border-slate-200">
                          <Icons.Lock size={14} /> RECORD LOCKED
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Reviewer requirement warning */}
                      {!canAcceptOrPublish && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 items-start">
                          <Icons.ShieldAlert size={18} className="shrink-0 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-amber-700">Action Restricted</p>
                            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                              Need at least <strong>2 "Accept"</strong> recommendations to proceed.<br />
                              Current: <strong>{acceptCount}</strong> Accept recommendation(s).
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Decision Form */}
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                        <h4 className="font-black text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2 text-sm">
                          <Icons.Gavel size={16} className="text-slate-500" /> Final Decision
                        </h4>

                        <form onSubmit={handleActionSubmit} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                              Decision Status
                            </label>
                            <select
                              required
                              value={actionData.status}
                              onChange={(e) => {
                                const status = e.target.value;
                                setActionData({
                                  ...actionData,
                                  status,
                                  feedback: status === "Revision Required" ? generateRevisionFeedback() : actionData.feedback,
                                });
                              }}
                              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer appearance-none"
                            >
                              <option value="">— Select Decision —</option>
                              <option value="Revision Required">Request Revision</option>
                              <option value="Rejected">Reject Manuscript</option>
                              <option value="Approved">Approve Manuscript</option>
                              {selectedManuscript.manuscript.status === "Approved" && (
                                <option value="Final Script Sent">Send Final Script to Author</option>
                              )}
                              {selectedManuscript.manuscript.status === "Final Author Approved" ? (
                                <>
                                  <option value="Accepted">Schedule Publication</option>
                                  <option value="Published">Publish Now (Immediate)</option>
                                </>
                              ) : (
                                <optgroup label="⟨ Requires Final Script Approval ⟩">
                                  <option value="Accepted" disabled>Schedule (Locked)</option>
                                  <option value="Published" disabled>Publish Now (Locked)</option>
                                </optgroup>
                              )}
                            </select>
                          </div>

                          {/* Schedule date */}
                          {actionData.status === "Accepted" && (
                            <div>
                              <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <Icons.CalendarClock size={12} /> Schedule Publication Date
                              </label>
                              <input
                                type="datetime-local"
                                required
                                value={actionData.publishDate}
                                onChange={(e) => setActionData({ ...actionData, publishDate: e.target.value })}
                                className="w-full bg-white border border-emerald-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          )}

                          {/* Feedback + file for revision/rejection/final-script */}
                          {["Revision Required", "Rejected", "Final Script Sent"].includes(actionData.status) && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                  {actionData.status === "Final Script Sent" ? "Instructions for Author" : "Message to Author"}
                                </label>
                                <textarea
                                  required
                                  rows={5}
                                  value={actionData.feedback}
                                  onChange={(e) => setActionData({ ...actionData, feedback: e.target.value })}
                                  placeholder={actionData.status === "Final Script Sent"
                                    ? "Instruct author to review and return the attached template…"
                                    : "Summarize reviewer comments and action items…"}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                  {actionData.status === "Final Script Sent" ? "Final Template (Required)" : "Attachment (Optional)"}
                                </label>
                                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white text-center hover:border-blue-300 hover:bg-blue-50/20 transition cursor-pointer">
                                  <input
                                    type="file"
                                    required={actionData.status === "Final Script Sent"}
                                    onChange={(e) => setActionData({ ...actionData, file: e.target.files[0] })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="flex flex-col items-center gap-1">
                                    <Icons.UploadCloud size={18} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">
                                      {actionData.file ? actionData.file.name : "Click to upload"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2 text-sm shadow-md hover:shadow-lg hover:shadow-blue-500/20"
                          >
                            {isUpdating
                              ? <><Icons.Loader2 size={16} className="animate-spin" /> Processing…</>
                              : actionData.status === "Accepted" ? "Accept & Schedule Publish"
                                : actionData.status === "Approved" ? "Approve Manuscript"
                                  : actionData.status === "Final Script Sent" ? "Send to Author"
                                    : actionData.status === "Published" ? "Open Publish Modal"
                                      : "Submit Decision"
                            }
                          </button>
                        </form>
                      </div>

                      {/* Assign Reviewer */}
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                        <h4 className="font-black text-slate-800 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2 text-sm">
                          <Icons.UserPlus size={16} className="text-indigo-600" /> Assign Reviewer
                        </h4>
                        <div className="space-y-3">
                          {/* Selected reviewer chips */}
                          {selectedReviewers.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedReviewers.map((id) => {
                                const reviewer = reviewerOptionsData?.reviewers?.find((r) => r._id === id);
                                return (
                                  <div key={id} className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {reviewer?.name || id}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedReviewers((prev) => prev.filter((r) => r !== id))}
                                      className="hover:text-red-500 transition"
                                    >
                                      <Icons.X size={11} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;
                              if (selectedReviewers.includes(val)) return toast.error("Already selected");
                              setSelectedReviewers((prev) => [...prev, val]);
                              e.target.value = "";
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="">{isReviewersLoading ? "Loading…" : "Add Reviewer"}</option>
                            {reviewerOptionsData?.reviewers?.map((r) => (
                              <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                          </select>

                          {selectedReviewers.length > 0 && selectedReviewers.length < 2 && (
                            <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                              <Icons.AlertCircle size={11} /> Select at least 2 reviewers
                            </p>
                          )}

                          <button
                            onClick={handleAssignNewReviewer}
                            disabled={isAssigning || selectedReviewers.length < 2}
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition disabled:opacity-40 flex justify-center items-center gap-2 text-sm"
                          >
                            {isAssigning
                              ? <><Icons.Loader2 size={14} className="animate-spin" /> Assigning…</>
                              : "Send Invitations"
                            }
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PUBLISH MODAL
      ══════════════════════════════════════════ */}
      {isPublishModalOpen && selectedManuscript && (
        <PublishModal
          manuscript={selectedManuscript.manuscript}
          availableIssuesData={availableIssuesData}
          reviewsData={data}
          onClose={() => setIsPublishModalOpen(false)}
          onConfirm={handlePublishConfirm}
          isUpdating={isUpdating}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}