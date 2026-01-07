import Logo from "./Logo";
import BrandName from "./BrandName";
import XIcon from "./XIcon";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <BrandName />
        </div>
        <XIcon href="https://x.com/bountydotmoney" />
      </div>
    </header>
  );
}
