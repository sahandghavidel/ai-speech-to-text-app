"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbPage } from "../ui/breadcrumb";

export default function BreadcrumbPageClient() {
  const path = usePathname();

  const getPageTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/dashboard/create":
        return "Transcribe";
      case "/dashboard/projects":
        return "History";
      case "/dashboard/settings":
        return "Settings";
      default:
        return "Dashboard";
    }
  };

  return (
    <BreadcrumbPage className="text-foreground text-sm font-medium">
      {getPageTitle(path)}
    </BreadcrumbPage>
  );
}