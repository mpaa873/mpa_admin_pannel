"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const getDashboardByRole = (role) => {
  if (role === "masterAdmin") return "/admin/dashboard";
  if (role === "editor") return "/editor/dashboard";
  if (role === "reviewer") return "/reviewer/dashboard";
  return "/login";
};

export default function useRoleGuard(requiredRole) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    //  Not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    //  Wrong role 
    if (user.role !== requiredRole) {
      router.replace(getDashboardByRole(user.role));
      return;
    }

    //  Correct role
    setAuthorized(true);
  }, [requiredRole, router]);

  return authorized;
}