import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const KEY = "installer_jobs";

interface Job {
  id: string;
  name: string;
  village: string;
  workType: string;
  phone: string;
  date: string;
}

function loadJobs(): Job[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function InstallerJobBoard() {
  const [jobs, setJobs] = useState<Job[]>(loadJobs);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    village: "",
    workType: "antenna install",
    phone: "",
  });

  const postJob = () => {
    if (!form.name.trim() || !form.village.trim()) {
      toast.error("Name and village required");
      return;
    }
    const job: Job = {
      id: Date.now().toString(),
      ...form,
      date: new Date().toLocaleDateString(),
    };
    const updated = [job, ...jobs].slice(0, 20);
    setJobs(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setForm({ name: "", village: "", workType: "antenna install", phone: "" });
    setShowForm(false);
    toast.success("Job posted!");
  };

  const contactJob = (job: Job) => {
    if (job.phone) {
      window.location.href = `sms:${job.phone}?body=${encodeURIComponent(`Hello ${job.name}, I saw your job posting on Airtel Signal Tracker. I am available for ${job.workType} in ${job.village}.`)}`;
    } else toast.info("No phone number provided");
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase className="w-4 h-4 text-primary" />
        <h4 className="font-bold text-sm text-foreground">
          Installer Job Board
        </h4>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] ml-auto"
          onClick={() => setShowForm((f) => !f)}
          data-ocid="job_board.post.button"
        >
          <Plus className="w-3 h-3 mr-1" />
          Post Job
        </Button>
      </div>
      {showForm && (
        <div className="bg-secondary/40 rounded-lg p-3 mb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Your Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="h-8 text-xs mt-1"
                data-ocid="job_board.name.input"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">
                Village
              </Label>
              <Input
                value={form.village}
                onChange={(e) =>
                  setForm((f) => ({ ...f, village: e.target.value }))
                }
                className="h-8 text-xs mt-1"
                data-ocid="job_board.village.input"
              />
            </div>
          </div>
          <Input
            value={form.workType}
            onChange={(e) =>
              setForm((f) => ({ ...f, workType: e.target.value }))
            }
            placeholder="Type of work"
            className="h-8 text-xs"
            data-ocid="job_board.work_type.input"
          />
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone (optional)"
            className="h-8 text-xs"
            data-ocid="job_board.phone.input"
          />
          <Button
            size="sm"
            className="h-7 text-xs w-full btn-airtel"
            onClick={postJob}
            data-ocid="job_board.submit.button"
          >
            Post Job
          </Button>
        </div>
      )}
      {jobs.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">
          No jobs posted yet. Post the first one!
        </p>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              data-ocid={`job_board.item.${i + 1}`}
              className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2"
            >
              <div className="flex-1">
                <p className="text-xs font-semibold">
                  {job.name} — {job.village}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {job.workType} • {job.date}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] shrink-0"
                onClick={() => contactJob(job)}
                data-ocid={`job_board.contact.button.${i + 1}`}
              >
                <MessageSquare className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
