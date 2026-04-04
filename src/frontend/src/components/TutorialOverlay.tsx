import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const TUTORIAL_KEY = "tutorial_shown";

const STEPS = [
  {
    title: "Welcome to Airtel Signal Tracker",
    emoji: "📡",
    desc: "Find the strongest 4G signal direction for your antenna in Moroto & Kosiroi, Uganda.",
  },
  {
    title: "Use the Compass",
    emoji: "🧭",
    desc: "The Compass tab shows you exactly which direction to point your antenna for the best signal.",
  },
  {
    title: "See Your Location on the Map",
    emoji: "🗺️",
    desc: "The Map tab shows your GPS location, all nearby towers, and a line to the nearest one.",
  },
  {
    title: "Get Mounting Guidance",
    emoji: "📐",
    desc: "Check the Guidance tab for wind conditions, sun position, tilt angle, and installation tips.",
  },
  {
    title: "Help Your Community",
    emoji: "🤝",
    desc: "Tap 'Report Signal' on the Map to share signal quality with nearby users. Together we improve coverage!",
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const finish = () => {
    localStorage.setItem(TUTORIAL_KEY, "true");
    onComplete();
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        key="tutorial-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.75)" }}
      >
        {/* Skip button */}
        <button
          type="button"
          data-ocid="tutorial.skip.button"
          className="absolute top-6 right-6 text-white/70 text-sm font-medium hover:text-white"
          onClick={finish}
        >
          Skip
        </button>

        {/* Step dots */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5">
          {STEPS.map((stepItem, i) => (
            <div
              key={stepItem.title}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          data-ocid="tutorial.dialog"
          className="w-full max-w-sm mx-4 mb-12 bg-card rounded-3xl p-6 shadow-2xl"
        >
          <div className="text-center">
            {/* Glowing emoji circle */}
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.24 24.5), oklch(0.38 0.2 24.5))",
                boxShadow: "0 0 30px rgba(225,11,11,0.4)",
              }}
            >
              {current.emoji}
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              {current.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {current.desc}
            </p>

            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  data-ocid="tutorial.back.button"
                  variant="outline"
                  className="flex-1 h-12 rounded-full"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                data-ocid="tutorial.next.button"
                className="btn-airtel flex-1 h-12 rounded-full text-base font-bold"
                onClick={next}
              >
                {step === STEPS.length - 1 ? "Get Started! 🚀" : "Next →"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
