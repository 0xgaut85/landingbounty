import Header from "@/components/Header";
import ChatBox from "@/components/ChatBox";
import IntroOverlay from "@/components/IntroOverlay";
import VisitorCounter from "@/components/VisitorCounter";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <IntroOverlay />
      <Header />
      
      {/* Centered chat container */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <ChatBox />
      </div>

      {/* Visitor counter */}
      <VisitorCounter />

      {/* Copyright */}
      <footer className="fixed bottom-4 right-4 text-xs text-neutral-600 font-light">
        © 2026 bountydot.money
      </footer>
    </main>
  );
}
