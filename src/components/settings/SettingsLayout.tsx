
import React from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

interface SettingsLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function SettingsLayout({ title, description, children }: SettingsLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-16">
        <Header />
        <main className="page-container">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl p-6 mb-8 shadow-md">
            <h1 className="font-bold text-3xl mb-2">{title}</h1>
            <p className="text-violet-100">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
