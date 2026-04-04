import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneCall, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { GPSPosition } from "../hooks/useGPS";

const CONTACTS_KEY = "emergency_contacts";

interface Contact {
  id: string;
  name: string;
  phone: string;
}

function load(): Contact[] {
  try {
    const s = localStorage.getItem(CONTACTS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

interface Props {
  userPosition: GPSPosition;
}

export function EmergencyContactBroadcaster({ userPosition }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(load);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const addContact = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Enter name and phone");
      return;
    }
    if (contacts.length >= 3) {
      toast.error("Max 3 contacts");
      return;
    }
    const updated = [
      ...contacts,
      { id: Date.now().toString(), name: name.trim(), phone: phone.trim() },
    ];
    setContacts(updated);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    setName("");
    setPhone("");
    toast.success("Contact saved");
  };

  const remove = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  };

  const broadcast = (c: Contact) => {
    const lat = userPosition.latitude.toFixed(4);
    const lon = userPosition.longitude.toFixed(4);
    const msg = encodeURIComponent(
      `URGENT: Critical signal issue at lat ${lat}, lon ${lon}. Airtel network unreachable. Please assist.`,
    );
    window.location.href = `sms:${c.phone}?body=${msg}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <PhoneCall className="w-4 h-4 text-destructive" />
        <h4 className="font-bold text-sm text-foreground">
          Emergency Contacts
        </h4>
        <span className="text-xs text-muted-foreground ml-auto">
          {contacts.length}/3
        </span>
      </div>
      {contacts.map((c, i) => (
        <div key={c.id} className="flex items-center gap-2 mb-2">
          <div className="flex-1">
            <p className="text-xs font-semibold">{c.name}</p>
            <p className="text-[10px] text-muted-foreground">{c.phone}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] text-destructive border-destructive/30"
            onClick={() => broadcast(c)}
            data-ocid={`emergency.broadcast.button.${i + 1}`}
          >
            SOS
          </Button>
          <button
            type="button"
            onClick={() => remove(c.id)}
            className="text-muted-foreground hover:text-destructive"
            data-ocid={`emergency.delete.button.${i + 1}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {contacts.length < 3 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="h-8 text-xs"
            data-ocid="emergency.name.input"
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+256..."
            className="h-8 text-xs"
            data-ocid="emergency.phone.input"
          />
          <Button
            size="sm"
            className="h-8 text-xs col-span-2 btn-airtel"
            onClick={addContact}
            data-ocid="emergency.add.button"
          >
            Add Contact
          </Button>
        </div>
      )}
    </div>
  );
}
