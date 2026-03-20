"use client";

import { useState } from "react";
import { Starfield } from "@/components/starfield";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { SubjectSelector } from "@/components/subject-selector";
import { Dashboard } from "@/components/dashboard";
import { ClassroomView } from "@/components/classroom-view";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { currentView } = useAppStore();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <div className="relative z-10">
        {currentView === "home" && (
          <>
            <HeroSection />
            <SubjectSelector />
          </>
        )}
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "classroom" && <ClassroomView />}
      </div>
    </main>
  );
}
