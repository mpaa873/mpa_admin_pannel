"use client";
import Sidebar from "../../../components/dashboard/Sidebar";
import useRoleGuard from "../../../hooks/useRoleGuard";
export default function DashboardLayout({ children }) {

  const authorized = useRoleGuard("masterAdmin");

  //Prevent Flash
  if (!authorized) return null;
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 1. Sidebar Component */}
      <Sidebar role="admin" />

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72">
        {/* --- Content Wrapper --- */}
        <div className="p-4 md:p-6 lg:p-10 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}