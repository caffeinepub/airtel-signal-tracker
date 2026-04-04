import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function GroupSignalSurveyMode() {
  const [isSurveyMode, setIsSurveyMode] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsSurveyMode(params.get("survey") === "true");
  }, []);

  const shareUrl = () => {
    const url = `${window.location.origin}${window.location.pathname}?survey=true`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Survey link copied!"))
      .catch(() => toast.error("Could not copy"));
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Group Signal Survey
        </h4>
        {isSurveyMode && (
          <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
            👥 Survey Active
          </span>
        )}
      </div>
      {isSurveyMode ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-3">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            👥 You are in Group Survey Mode
          </p>
          <p className="text-[10px] text-muted-foreground">
            Walk around your village and tap “Report Signal” at different spots.
            Share this link with neighbors so they can do the same on their
            devices.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Coordinate with neighbors to map signal across your whole village.
            Share a survey link and collect readings together.
          </p>
          <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside mb-3">
            <li>Tap “Share Survey Link” below</li>
            <li>Send link to 3-5 neighbors via WhatsApp/SMS</li>
            <li>Everyone walks to different spots and taps Report Signal</li>
            <li>All reports appear on the heatmap</li>
          </ol>
          <Button
            size="sm"
            className="h-8 text-xs w-full btn-airtel"
            onClick={shareUrl}
            data-ocid="group_survey.share.button"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" /> Share Survey Link
          </Button>
        </>
      )}
    </div>
  );
}
