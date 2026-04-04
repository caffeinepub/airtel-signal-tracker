import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PROFILES_KEY = "antenna_profiles";

interface AntennaProfile {
  name: string;
  latitude: number;
  longitude: number;
  bearing: number;
  rssi: number;
  savedAt: number;
}

function loadProfiles(): AntennaProfile[] {
  try {
    const stored = localStorage.getItem(PROFILES_KEY);
    return stored ? (JSON.parse(stored) as AntennaProfile[]) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: AntennaProfile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

interface SavedProfilesProps {
  latitude: number;
  longitude: number;
  bearing: number;
  rssi: number;
}

export function SavedProfiles({
  latitude,
  longitude,
  bearing,
  rssi,
}: SavedProfilesProps) {
  const [profiles, setProfiles] = useState<AntennaProfile[]>(loadProfiles);
  const [profileName, setProfileName] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<AntennaProfile | null>(
    null,
  );

  const saveProfile = () => {
    if (!profileName.trim()) {
      toast.error("Enter a profile name");
      return;
    }
    const newProfile: AntennaProfile = {
      name: profileName.trim(),
      latitude,
      longitude,
      bearing,
      rssi,
      savedAt: Date.now(),
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    setProfileName("");
    toast.success(`Profile "${newProfile.name}" saved`);
  };

  const deleteProfile = (idx: number) => {
    const updated = profiles.filter((_, i) => i !== idx);
    setProfiles(updated);
    saveProfiles(updated);
    if (selectedProfile === profiles[idx]) setSelectedProfile(null);
  };

  const loadProfile = (profile: AntennaProfile) => {
    setSelectedProfile(profile);
    toast.success(`Loaded profile: ${profile.name}`);
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border shadow-card">
      <h4 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
        📌 Saved Antenna Profiles
      </h4>

      {/* Save current */}
      <div className="flex gap-2 mb-4">
        <Input
          data-ocid="profiles.name.input"
          placeholder="Home / Office / Rooftop..."
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveProfile()}
          className="flex-1 h-9 text-sm"
        />
        <Button
          data-ocid="profiles.save.button"
          onClick={saveProfile}
          size="sm"
          className="btn-airtel h-9 rounded-lg text-xs font-bold shrink-0"
        >
          Save
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div
          data-ocid="profiles.empty_state"
          className="text-xs text-muted-foreground text-center py-3"
        >
          No profiles saved yet
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile, i) => (
            <div
              key={`${profile.name}-${profile.savedAt}`}
              data-ocid={`profiles.item.${i + 1}`}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm ${
                selectedProfile?.savedAt === profile.savedAt
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-background"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile.bearing.toFixed(0)}° · {profile.rssi.toFixed(0)} dBm
                </p>
              </div>
              <Button
                data-ocid={`profiles.load.button.${i + 1}`}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-primary"
                onClick={() => loadProfile(profile)}
              >
                <Download className="w-3 h-3 mr-1" />
                Load
              </Button>
              <Button
                data-ocid={`profiles.delete.button.${i + 1}`}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-destructive"
                onClick={() => deleteProfile(i)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Show loaded profile details */}
      {selectedProfile && (
        <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-primary">
              {selectedProfile.name}
            </p>
            <Badge className="text-xs bg-primary text-primary-foreground">
              Loaded
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Bearing: {selectedProfile.bearing.toFixed(0)}° · Signal:{" "}
            {selectedProfile.rssi.toFixed(0)} dBm
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedProfile.latitude.toFixed(4)},{" "}
            {selectedProfile.longitude.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
}
