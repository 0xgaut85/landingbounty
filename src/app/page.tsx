import Header from "@/components/Header";
import ChatBox from "@/components/ChatBox";
import IntroOverlay from "@/components/IntroOverlay";
import VisitorCounter from "@/components/VisitorCounter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <IntroOverlay />
      <Header />
      
      {/* Centered chat container - responsive padding */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 md:px-6 pt-20 pb-16 sm:py-20">
        <ChatBox />
      </div>

      {/* Visitor counter - hidden on very small screens */}
      <VisitorCounter />

      {/* Copyright - responsive positioning */}
      <footer className="fixed bottom-2 right-3 sm:bottom-4 sm:right-4 text-[10px] sm:text-xs text-neutral-600 font-light">
        © 2026 bountydot.money
      </footer>
    </main>
  );
}
