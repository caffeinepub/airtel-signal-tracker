import {
  BookOpen,
  Camera,
  Compass,
  HelpCircle,
  Home,
  Lightbulb,
  MapPin,
  Navigation,
  ShieldAlert,
  Smartphone,
  Wifi,
} from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  elderMode?: boolean;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "compass", label: "Compass", icon: Compass },
  { id: "gps", label: "GPS Dir", icon: Navigation },
  { id: "map", label: "Map", icon: MapPin },
  { id: "guidance", label: "Guide", icon: Lightbulb },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
  { id: "ussd", label: "USSD", icon: Smartphone },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "ar", label: "AR", icon: Camera },
  { id: "history", label: "History", icon: BookOpen },
  { id: "safety", label: "Safety", icon: ShieldAlert },
];

export function BottomNav({
  activeTab,
  onTabChange,
  elderMode,
}: BottomNavProps) {
  if (elderMode) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 bottom-nav-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch overflow-x-auto scrollbar-none">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            data-ocid={`bottom.${id}.tab`}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center py-1.5 gap-0.5 min-h-[52px] min-w-[52px] flex-shrink-0 px-2 text-[10px] font-medium transition-colors ${
              activeTab === id ? "text-primary" : "text-muted-foreground"
            }`}
            aria-current={activeTab === id ? "page" : undefined}
          >
            <Icon
              className={`w-4 h-4 ${
                activeTab === id ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
