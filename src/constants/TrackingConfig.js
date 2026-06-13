
import {
  FileText,
  UserCheck,
  Search,
  RefreshCw,
  CheckCircle,
  Send,
  AlertCircle,
  Bookmark,
  Archive,
  Clock,
} from "lucide-react";

export const statusConfig = {
  // ===== ACTUAL MANUSCRIPT STATUS =====
  Submitted: {
    color: "bg-blue-100 text-blue-700",
    icon: FileText,
    step: 1,
  },

  "Editor Assigned": {
    color: "bg-purple-100 text-purple-700",
    icon: UserCheck,
    step: 2,
  },

  "Under Review": {
    color: "bg-amber-100 text-amber-700",
    icon: Search,
    step: 3,
  },

  "Revision Required": {
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
    step: 3,
  },

  "Revision Submitted": {
    color: "bg-cyan-100 text-cyan-700",
    icon: RefreshCw,
    step: 3,
  },

  "Awaiting Admin Decision": {
    color: "bg-orange-100 text-orange-700",
    icon: Clock,
    step: 4,
  },

  Approved: {
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
    step: 4,
  },

  "Final Script Sent": {
    color: "bg-indigo-100 text-indigo-700",
    icon: Send,
    step: 5,
  },

  "Final Author Approved": {
    color: "bg-teal-100 text-teal-700",
    icon: Bookmark,
    step: 5,
  },

  Accepted: {
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    step: 5,
  },

  Published: {
    color: "bg-green-600 text-white",
    icon: Archive,
    step: 6,
  },

  Rejected: {
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
    step: 6,
  },

  // ===== AUDIT TRAIL ACTIONS =====
  "Paper Submitted": {
    color: "bg-blue-100 text-blue-700",
    icon: FileText,
    step: 1,
  },

  "Reviewers Assigned": {
    color: "bg-amber-100 text-amber-700",
    icon: Search,
    step: 3,
  },

  "Invitation Accepted": {
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    step: 3,
  },

  "Invitation Declined": {
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
    step: 3,
  },

  "Review Submitted": {
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    step: 3,
  },

  "Paper Accepted": {
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
    step: 5,
  },

  "Paper Published": {
    color: "bg-green-600 text-white",
    icon: Archive,
    step: 6,
  },
};

export const stages = [
  {
    label: "Submission",
    step: 1,
  },
  {
    label: "Editorial",
    step: 2,
  },
  {
    label: "Peer Review",
    step: 3,
  },
  {
    label: "Decision",
    step: 4,
  },
  {
    label: "Production",
    step: 5,
  },
  {
    label: "Publication",
    step: 6,
  },
];

