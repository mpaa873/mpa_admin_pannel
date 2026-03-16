"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSubmitReviewMutation } from "../../../../../services/reviewerApi";
import { UploadCloud, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SubmitReviewPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id;
  
  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  const[formData, setFormData] = useState({
    originality: 3, clarity: 3, methodology: 3, contribution: 3,
    commentsToAuthor: "", commentsToEditor: "", recommendation: "",
  });
  const [file, setFile] = useState(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recommendation) return toast.error("Please select a recommendation");

    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
    if (file) payload.append("annotatedFile", file);

    try {
      await submitReview({ reviewId, formData: payload }).unwrap();
      toast.success("Review submitted successfully!");
      router.push("/reviewer/dashboard");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit review");
    }
  };

  const renderRating = (name, label) => (
    <div className="mb-4">
      <label className="block text-sm font-bold text-slate-700 mb-2">{label} (1=Poor, 5=Excellent)</label>
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <label key={num} className="flex flex-col items-center gap-1 cursor-pointer">
            <input type="radio" name={name} value={num} checked={Number(formData[name]) === num} onChange={handleInputChange} className="w-4 h-4 text-indigo-600"/>
            <span className="text-xs text-slate-500 font-bold">{num}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href="/reviewer/dashboard" className="inline-flex items-center text-indigo-600 font-bold mb-6 hover:underline">
        <ArrowLeft className="w-4 h-4 mr-2"/> Back to Dashboard
      </Link>
      
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 border-b pb-4 mb-6">Submit Structured Review</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border">
              <h3 className="font-bold text-slate-800 mb-4">Evaluation Scores</h3>
              {renderRating("originality", "Originality")}
              {renderRating("clarity", "Clarity & Presentation")}
              {renderRating("methodology", "Methodology")}
              {renderRating("contribution", "Contribution to Field")}
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Final Recommendation *</label>
                  <select name="recommendation" required value={formData.recommendation} onChange={handleInputChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">-- Select --</option>
                    <option value="Accept">Accept as is</option>
                    <option value="Minor revisions">Minor Revisions</option>
                    <option value="Major revisions">Major Revisions</option>
                    <option value="Reject">Reject</option>
                  </select>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Annotated File (Optional)</label>
                 <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-slate-50">
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="file" />
                    <label htmlFor="file" className="cursor-pointer flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                      <span className="text-sm font-medium">{file ? file.name : "Click to upload"}</span>
                    </label>
                 </div>
               </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Comments to Author</label>
            <textarea name="commentsToAuthor" rows="4" value={formData.commentsToAuthor} onChange={handleInputChange} className="w-full border p-4 rounded-xl focus:ring-2 outline-none"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Confidential Comments to Editor</label>
            <textarea name="commentsToEditor" rows="3" value={formData.commentsToEditor} onChange={handleInputChange} className="w-full border p-4 rounded-xl focus:ring-2 outline-none"></textarea>
          </div>

          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white p-4 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-70">
            {isLoading ? "Submitting..." : <><CheckCircle className="w-5 h-5"/> Submit Full Review</>}
          </button>
        </form>
      </div>
    </div>
  );
}