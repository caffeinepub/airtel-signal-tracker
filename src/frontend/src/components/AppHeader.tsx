import { Menu, Radio, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { LangCode } from "../utils/i18n";

interface AppHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  lang: LangCode;
  onLangChange: (lang: LangCode) => void;
  lowBandwidth: boolean;
}

const LANGS: { code: LangCode; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
  { code: "at", label: "AT" },
  { code: "kj", label: "KJ" },
];

const navLinks = [
  { id: "home", label: "Home" },
  { id: "compass", label: "Compass" },
  { id: "map", label: "Map" },
  { id: "guidance", label: "Guidance" },
  { id: "ussd", label: "USSD" },
  { id: "help", label: "Help" },
  { id: "ar", label: "AR Mode" },
];

export function AppHeader({
  activeTab,
  onTabChange,
  lang,
  onLangChange,
  lowBandwidth,
}: AppHeaderProps) {
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
          {lowBandwidth && (
            <span className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-full px-2 py-0.5 ml-1">
              ⚡ Low-BW
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle — EN / SW / AT / KJ */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                data-ocid={`header.lang.${code}.toggle`}
                onClick={() => onLangChange(code)}
                className={`px-2 py-1 font-semibold transition-colors ${
                  lang === code
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
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
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
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
