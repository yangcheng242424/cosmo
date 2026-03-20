"use client";

import { Starfield } from "@/components/starfield";
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { SubjectSelector } from "@/components/subject-selector";
import { Dashboard } from "@/components/dashboard";
import { ClassroomView } from "@/components/classroom-view";
import { SolveView } from "@/components/solve-view";
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
        {currentView === "solve" && <SolveView />}
      </div>
    </main>
  );
}
