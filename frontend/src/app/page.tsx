"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    router.push(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );
}
