"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

interface PagesLayoutProps {
  children: React.ReactNode;
}

export default function PagesLayout({
  children,
}: Readonly<PagesLayoutProps>) {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sm:px-6 md:hidden">
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
