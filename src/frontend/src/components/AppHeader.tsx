import { Menu, Radio, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface AppHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navLinks = [
  { id: "home", label: "Home" },
  { id: "compass", label: "Compass" },
  { id: "map", label: "Map" },
  { id: "guidance", label: "Guidance" },
  { id: "ar", label: "AR Mode" },
];

export function AppHeader({ activeTab, onTabChange }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-xs sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Radio className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-primary font-bold text-lg leading-none font-display">
              airtel
            </span>
            <span className="text-foreground font-semibold text-sm leading-none">
              Antenna Finder
            </span>
          </div>
        </div>

        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onTabChange(link.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === link.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          data-ocid="header.hamburger.button"
          className="md:hidden p-2 rounded-md hover:bg-secondary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-2 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.id}
                  data-ocid={`nav.mobile.${link.id}.link`}
                  onClick={() => {
                    onTabChange(link.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === link.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
