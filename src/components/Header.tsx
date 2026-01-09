import Logo from "./Logo";
import BrandName from "./BrandName";
import XIcon from "./XIcon";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full p-4 sm:p-6 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <Logo />
          <BrandName />
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://app.bountydot.money/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-black text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
          >
            App
          </a>
          <XIcon href="https://x.com/bountydotmoney" />
        </div>
      </div>
    </header>
  );
}
