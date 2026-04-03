"use client";

import Sidebar from "../../../components/dashboard/Sidebar";
import useRoleGuard from "../../../hooks/useRoleGuard";

export default function ReviewerDashboardLayout({ children }) {

  const authorized = useRoleGuard("reviewer");

  //Prevent Flash
  if (!authorized) return null;
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
    
      <Sidebar role="reviewer" />
      <main className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
        <div className="lg:hidden h-16 w-full shrink-0" />

        <div className="p-4 md:p-8 lg:p-10">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}