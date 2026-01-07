import Header from "@/components/Header";
import ChatBox from "@/components/ChatBox";
import IntroOverlay from "@/components/IntroOverlay";
import VisitorCounter from "@/components/VisitorCounter";

export default function Home() {
  return (
    <main className="h-[100dvh] bg-background relative flex flex-col overflow-hidden">
      <IntroOverlay />
      
      {/* Header - only visible on desktop */}
      <div className="hidden sm:block">
        <Header />
      </div>
      
      {/* Chat container - full screen on mobile, centered card on desktop */}
      <div className="flex-1 flex items-stretch sm:items-center justify-center sm:px-6 sm:py-8 min-h-0">
        <ChatBox />
      </div>

      {/* Footer elements - only on desktop */}
      <div className="hidden sm:block">
        <VisitorCounter />
        <footer className="fixed bottom-4 right-4 text-xs text-neutral-600 font-light z-10">
          © 2026 bountydot.money
        </footer>
      </div>
    </main>
  );
}
