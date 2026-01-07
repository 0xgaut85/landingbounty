import Header from "@/components/Header";
import ChatBox from "@/components/ChatBox";
import IntroOverlay from "@/components/IntroOverlay";
import VisitorCounter from "@/components/VisitorCounter";

export default function Home() {
  return (
    <main className="h-screen bg-background relative overflow-hidden flex flex-col">
      <IntroOverlay />
      <Header />
      
      {/* Chat container - fixed position on mobile, centered on desktop */}
      <div className="flex-1 flex items-center justify-center px-0 sm:px-4 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <ChatBox />
      </div>

      {/* Visitor counter */}
      <VisitorCounter />

      {/* Copyright */}
      <footer className="fixed bottom-2 right-3 sm:bottom-4 sm:right-4 text-[10px] sm:text-xs text-neutral-600 font-light z-10">
        © 2026 bountydot.money
      </footer>
    </main>
  );
}
