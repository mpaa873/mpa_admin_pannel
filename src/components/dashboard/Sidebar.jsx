"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Icons from "lucide-react";
import { SIDEBAR_LINKS } from "../../constants/dummyData";
import { useGetMeQuery } from "../../services/userApi"; 

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const { data: user, isLoading } = useGetMeQuery();
  console.log("Response here  :-- ",user);

  // Handle Logout function
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    router.push("/login"); 
  };

  return (
    <div className="w-72 bg-slate-950 text-white h-screen p-6 flex flex-col justify-between border-r border-slate-800 sticky top-0">
      
      {/* --- TOP SECTION: Logo & Brand --- */}
      <div>
        <div className="mb-10 px-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icons.LayoutDashboard size={20} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Journal <span className="text-blue-500">Admin</span>
            </h2>
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Management System
          </p>
        </div>

        {/* --- MIDDLE SECTION: Navigation Links --- */}
        <nav className="space-y-1">
          {SIDEBAR_LINKS.map((link) => {
            const IconComponent = Icons[link.icon] || Icons.HelpCircle;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-500 border border-blue-600/20" 
                    : "hover:bg-slate-900 text-slate-400 hover:text-slate-100"
                }`}
              >
                <IconComponent size={18} className={`${isActive ? "text-blue-500" : "group-hover:scale-110 transition-transform"}`} />
                <span className="font-medium text-sm">{link.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- BOTTOM SECTION: Profile & Logout --- */}
      <div className="border-t border-slate-800 pt-6">
        {/* Profile Card */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center font-bold text-white ring-2 ring-slate-800">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate uppercase tracking-wide">
              {isLoading ? "Loading..." : user?.user?.name || "Admin User"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.user?.email || "admin@journal.com"}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
        >
          <Icons.LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}