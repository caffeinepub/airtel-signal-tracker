import {
  Camera,
  Compass,
  History,
  Home,
  Lightbulb,
  MapPin,
} from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "compass", label: "Compass", icon: Compass },
  { id: "map", label: "Map", icon: MapPin },
  { id: "guidance", label: "Guide", icon: Lightbulb },
  { id: "ar", label: "AR", icon: Camera },
  { id: "history", label: "History", icon: History },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 bottom-nav-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-stretch">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            data-ocid={`bottom.${id}.tab`}
            onClick={() => onTabChange(id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 min-h-[56px] text-xs font-medium transition-colors ${
              activeTab === id ? "text-primary" : "text-muted-foreground"
            }`}
            aria-current={activeTab === id ? "page" : undefined}
          >
            <Icon
              className={`w-5 h-5 ${
                activeTab === id ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
