export const STATS_DATA = [
  { label: "Total Users", value: 1200, color: "text-blue-600" },
  { label: "Editors", value: 35, color: "text-purple-600" },
  { label: "Reviewers", value: 80, color: "text-orange-600" },
  { label: "Researchers", value: 1085, color: "text-green-600" },
  { label: "Total Submissions", value: 310, color: "text-indigo-600" },
  { label: "Pending Papers", value: 52, color: "text-yellow-600" },
  { label: "Approved Papers", value: 190, color: "text-emerald-600" },
  { label: "Rejected Papers", value: 68, color: "text-red-600" },
];

export const RECENT_SUBMISSIONS = [
  { id: 1, title: "AI in Medical Diagnosis", author: "Dr. Rahul Sharma", status: "Under Review", date: "2023-10-01" },
  { id: 2, title: "Cybersecurity in Blockchain", author: "Prof. Mehta", status: "Approved", date: "2023-10-05" },
  { id: 3, title: "Quantum Networks", author: "Dr. Patel", status: "Minor Revision", date: "2023-10-08" },
  { id: 4, title: "Deep Learning for Climate", author: "Sarah Jones", status: "Proofreading", date: "2023-10-10" },
];

export const SIDEBAR_LINKS = [
  { name: "Overview", href: "/dashboard", icon: "LayoutDashboard" },
  { name: "User Management", href: "/dashboard/users", icon: "Users" },
  { name: "Journal Settings", href: "/dashboard/journals", icon: "BookOpen" },
  { name: "Submissions", href: "/dashboard/submissions", icon: "FileText" },
  { name: "Board Management", href: "/dashboard/boards", icon: "ShieldCheck" },
];